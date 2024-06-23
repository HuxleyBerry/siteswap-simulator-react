'use client'

import { useEffect, useRef } from 'react';

export default function Juggler({dimension, inputSiteswap, beatLength, gravity, showTwosAsHolds, LHoutsideThrows, RHoutsideThrows}) {
    const WIDTH = dimension;
    const HEIGHT = dimension;
    const canvasRef = useRef(null);
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

    let animationOngoing = false;
    let startingTime;
    let juggler;
    let siteswap;
    let isSync;

    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    function getJuggler(workingHeight) {
        return {
            headSize: workingHeight * 0.13,
            headY: HEIGHT - workingHeight * 0.8,
            shoulderX: WIDTH * 0.5 - workingHeight * 0.2,
            shoulderY: HEIGHT - workingHeight * 0.6,
            hipX: WIDTH * 0.5 - workingHeight * 0.1,
            hipY: HEIGHT - workingHeight * 0.1,
            elbowX: WIDTH * 0.5 - workingHeight * 0.3,
            elbowY: HEIGHT - workingHeight * 0.2,
    
            ballSize: workingHeight * 0.05,
            crossingTravelDist: workingHeight * 0.6,
            sameTravelDist: workingHeight * 0.3,
            armLength: workingHeight * 0.15,
            height: workingHeight,
            handX: (rot) => {
                return WIDTH * 0.5 - workingHeight * (0.3 - 0.15 * Math.cos(rot));
            },
            handY: (rot) => {
                return HEIGHT - workingHeight * (0.2 + Math.sin(rot) * 0.15);
            }
        };
    }

    function drawPerson(ctx, j, leftRotation, rightRotation) {
        // draw head
        ctx.beginPath();
        ctx.arc(WIDTH * 0.5, j.headY, j.headSize, 0, 2 * Math.PI);
        // draw body
        ctx.moveTo(j.shoulderX, j.shoulderY);
        ctx.lineTo(WIDTH - j.shoulderX, j.shoulderY);
        ctx.lineTo(WIDTH - j.hipX, j.hipY);
        ctx.lineTo(j.hipX, j.hipY);
        ctx.closePath();
        // draw arms
        ctx.moveTo(j.shoulderX, j.shoulderY);
        ctx.lineTo(j.elbowX, j.elbowY);
        ctx.lineTo(j.handX(leftRotation), j.handY(leftRotation));
        ctx.moveTo(WIDTH - j.shoulderX, j.shoulderY);
        ctx.lineTo(WIDTH - j.elbowX, j.elbowY);
        ctx.lineTo(WIDTH - j.handX(rightRotation), j.handY(rightRotation));
        ctx.stroke();
    }

    function drawBall(ctx, juggler, startingHand, ballThrow, progress) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        var x, y, travelDist, beats;
        let outsideThrow = startingHand === "right" ? RHoutsideThrows : LHoutsideThrows;
        let otherHandOutside = startingHand === "right" ? LHoutsideThrows : RHoutsideThrows;
        if (ballThrow < 0) { //using negative integers to indicate "forced-crossing" throws
            beats = -ballThrow;
            travelDist = juggler.crossingTravelDist;
            if (outsideThrow && !otherHandOutside) {
                travelDist += juggler.sameTravelDist;
            } else if (!outsideThrow && otherHandOutside) {
                travelDist -= juggler.sameTravelDist;
            }
        } else {
            beats = ballThrow;
            if (beats % 2 == 1) {
                travelDist = juggler.crossingTravelDist;
                if (outsideThrow && !otherHandOutside) {
                    travelDist += juggler.sameTravelDist;
                } else if (!outsideThrow && otherHandOutside) {
                    travelDist -= juggler.sameTravelDist;
                }
            } else {
                travelDist = outsideThrow ? juggler.sameTravelDist : -juggler.sameTravelDist;
            }
        }
        if (progress <= 0.5) {
            let ang = flipAngle(progress * 2 * Math.PI - Math.PI, outsideThrow)
            x = juggler.handX(ang);
            y = juggler.handY(ang);
        }
        else if (showTwosAsHolds && ballThrow == 2) {
            let ang = flipAngle((progress - 0.5) * 2 * Math.PI / 3, outsideThrow)
            x = juggler.handX(ang);
            y = juggler.handY(ang);
        }
        else {
            let outsideThrowShift = outsideThrow ? 2 * juggler.armLength : 0;
            x = juggler.elbowX + juggler.armLength - outsideThrowShift + (progress - 0.5) / (beats - 0.5) * (travelDist);
            y = juggler.elbowY + juggler.height * (gravity * beatLength) * (progress - 0.5) * (progress - beats);
        }
        if (startingHand === "right") {
            x = WIDTH - x;
        }
        ctx.arc(x, y, juggler.ballSize, 0, 2 * Math.PI);
        ctx.fill();
    }

    function checkThrow(ballThrow, multiplexAllowed, sync) {
        // checks if a string is a valid representation of a single-handed throw. 
        // returns an empty array if invalid
        if (ballThrow[0] == "[") { //multiplex
            if (!multiplexAllowed || ballThrow[ballThrow.length - 1] != "]") {
                return [];
            } else {
                let throwsList = [];
                for (let i = 1; i < ballThrow.length - 1; i++) { //start at 1 and end at length-1 to ignore the square brackets
                    let res;
                    if (ballThrow[i + 1] == "x") {
                        res = checkThrow(ballThrow.slice(i, i + 2), false, sync)[0];
                        i++; //skip the "x"
                    } else {
                        res = checkThrow(ballThrow[i], false, sync)[0];
                    }
                    if (res == -1) {
                        return [];
                    } else {
                        throwsList.push(res);
                    }
                }
                return throwsList;
            }
        } else { //normal throw
            if (ballThrow.length == 1) {
                let index = alphabet.indexOf(ballThrow);
                if (index != -1 && (!sync || index % 2 == 0)) { //sync throws must be an even number of beats);
                    return [index];
                }
            } else if (sync && ballThrow.length == 2 && ballThrow[1] == "x" && alphabet.includes(ballThrow[0])) {
                let index = alphabet.indexOf(ballThrow[0]);
                if (index % 2 == 0 && index > 0) { //crossing sync throws must be an even nonzero number of beats
                    return [-1 * index]; // negative numbers are used to indicate crossing throws
                }
            }
            return [];
        }
    }

    function parseSiteswap(siteswap) { //returns a list of all the throws, or an empty list if the siteswap string is invalid
        if (siteswap.startsWith("(")) { //synchronous
            let pairs = siteswap.split("(");
            let numList = [];
            for (let i = 1; i < pairs.length; i++) {
                if (!pairs[i].endsWith(")")) {
                    return [];
                }
                let splitPair = pairs[i].slice(0, -1).split(",")
                if (splitPair.length != 2) {
                    return [];
                } else {
                    let throw1 = checkThrow(splitPair[0], true, true);
                    let throw2 = checkThrow(splitPair[1], true, true);
                    if (throw1.length != 0 && throw2.length != 0) {
                        numList.push(throw1);
                        numList.push(throw2);
                    } else {
                        return [];
                    }
                }
            }
            if (checkSiteswap(numList, true)) {
                return numList;
            } else {
                return [];
            }
        } else { //asynchronous
            let numList = [];
            for (let i = 0; i < siteswap.length; i++) {
                let ballThrow = siteswap[i];
                if (ballThrow === "[") { //dealing with a multiplex
                    let closingIndex = siteswap.indexOf("]", i);
                    ballThrow = siteswap.slice(i, closingIndex + 1);
                    i = closingIndex;
                }
                let parsedThrow = checkThrow(ballThrow, true, false);
                if (parsedThrow.length != 0) {
                    numList.push(parsedThrow);
                }
                else {
                    return [];
                }
            }
            if (checkSiteswap(numList, false)) {
                return numList;
            } else {
                return [];
            }
        }
    }

    function checkSiteswap(siteswap, sync) {
        let beats = siteswap.length;
        if (sync && beats % 2 == 1) throw "Error: somehow sync siteswap has odd number of throws!";
        let catchesEachBeat = Array(beats).fill(0);
        for (let i = 0; i < beats; i++) {
            siteswap[i].forEach(ball => {
                if (ball < 0) {
                    let adjustment = -2 * (i % 2) + 1;
                    catchesEachBeat[mod(i - ball + adjustment, beats)] += 1; //subtracting ball since it is stored as a negative number
                } else {
                    catchesEachBeat[(i + ball) % beats] += 1;
                }
            });
        }
        for (let i = 0; i < beats; i++) {
            if (siteswap[i].length !== catchesEachBeat[i]) {
                return false;
            }
        }
        return true;
    }

    function getMaxThrow(siteswap) {
        let flattened = [].concat(...siteswap);
        let positiveSiteswap = flattened.map(x => Math.abs(x));
        return Math.max(...positiveSiteswap);
    }

    function calcIdealWorkingHeight(siteswap) {
        let maxThrow = getMaxThrow(siteswap);
        return Math.min(HEIGHT - 10, (10 - HEIGHT) / (-0.25 + (gravity * beatLength) * ((maxThrow - 0.5) / 2) * (-maxThrow / 2 + 0.25)));
    }

    function getRotation(beats, start) {
        if ((beats + start) % 2 < 1.5) {
            return 2 * (((beats + start) % 2)) * Math.PI / 3;
        } else {
            return 2 * (((beats + start) % 2)) * Math.PI;
        }
    }

    function flipAngle(angle, flip) {
        return flip ? Math.PI - angle : angle;
    }

    function drawAsyncSiteswap(ctx, juggler, siteswap, beats) {
        let maxThrowSize = getMaxThrow(siteswap); //amount of beats we need to backtrack
        for (let i = 0; i < maxThrowSize; i++) {
            let hand, throwHeights, progress;
            if ((Math.floor(beats) - i) % 2 != 0) {
                hand = "left";
            } else {
                hand = "right";
            }
            progress = beats % 1 + i;
            throwHeights = siteswap[mod(Math.floor(beats) - i - 1, siteswap.length)];
            throwHeights.forEach((height) => {
                if (progress <= height) {
                    drawBall(ctx, juggler, hand, height, progress);
                }
            });
        }
    }

    function drawSyncSiteswap(ctx, juggler, siteswap, beats) {
        if (siteswap.length % 2 != 0) throw "Error: somehow sync siteswap has odd number of throws!";;
        let maxThrowSize = getMaxThrow(siteswap); //amount of beats we need to backtrack
        for (let i = 0; i < maxThrowSize; i += 2) {
            let progress = beats % 2 + i;
            let leftThrowHeights = siteswap[mod(Math.floor(beats * 0.5) * 2 - i - 1, siteswap.length)];
            let rightThrowHeights = siteswap[mod(Math.floor(beats * 0.5) * 2 - i - 2, siteswap.length)];
            leftThrowHeights.forEach((height) => {
                if (progress <= Math.abs(height)) {
                    drawBall(ctx, juggler, "left", height, progress);
                }
            });
            rightThrowHeights.forEach((height) => {
                if (progress <= Math.abs(height)) {
                    drawBall(ctx, juggler, "right", height, progress);
                }
            });
        }
    }


    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        let animationFrameId;

        function animateJuggler(timeStamp) {
            if (animationOngoing) {
                ctx.clearRect(0, 0, WIDTH, HEIGHT);
                let currentTime = timeStamp - startingTime;
                let beats = currentTime / beatLength;
                let leftRotation, rightRotation;
                if (isSync) {
                    leftRotation = flipAngle(getRotation(beats, 1.5), LHoutsideThrows);
                    rightRotation = flipAngle(getRotation(beats, 1.5), RHoutsideThrows);
                } else {
                    leftRotation = flipAngle(getRotation(beats, 0.5), LHoutsideThrows);
                    rightRotation = flipAngle(getRotation(beats, 1.5), RHoutsideThrows);
                }
                drawPerson(ctx, juggler, leftRotation, rightRotation);
                if (isSync) {
                    drawSyncSiteswap(ctx, juggler, siteswap, beats)
                } else {
                    drawAsyncSiteswap(ctx, juggler, siteswap, beats)
                }
                animationFrameId = window.requestAnimationFrame(animateJuggler);
            }
        }
        startingTime = performance.now();
        isSync = inputSiteswap.startsWith("(");
        siteswap = parseSiteswap(inputSiteswap);
        juggler = getJuggler(calcIdealWorkingHeight(siteswap));
        if (siteswap.length != 0) {
            animationOngoing = true;
            animationFrameId = window.requestAnimationFrame(animateJuggler);
        } else {
            animationOngoing = false;
            console.log("invalid siteswap")
        }

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [inputSiteswap]);
    
    return <canvas ref={canvasRef} width={dimension} height={dimension} className='border border-dashed border-black'></canvas>
}