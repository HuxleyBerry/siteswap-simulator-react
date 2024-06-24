'use client'

import { useEffect, useRef, useState } from 'react';
import { parseSiteswap } from '@/utils/siteswap-validation';
import { getMaxThrow, calcIdealWorkingHeight, getRotation, flipAngle } from '@/utils/other';

export default function Juggler({dimension, inputSiteswap, beatLength, gravity, showTwosAsHolds, LHoutsideThrows, RHoutsideThrows}) {
    let canvasWidth = 0;
    let canvasHeight = 0;
    const canvasRef = useRef(null);

    let animationFrameId;
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
            headY: canvasHeight - workingHeight * 0.8,
            shoulderX: canvasWidth * 0.5 - workingHeight * 0.2,
            shoulderY: canvasHeight - workingHeight * 0.6,
            hipX: canvasWidth * 0.5 - workingHeight * 0.1,
            hipY: canvasHeight - workingHeight * 0.1,
            elbowX: canvasWidth * 0.5 - workingHeight * 0.3,
            elbowY: canvasHeight - workingHeight * 0.2,
    
            ballSize: workingHeight * 0.05,
            crossingTravelDist: workingHeight * 0.6,
            sameTravelDist: workingHeight * 0.3,
            armLength: workingHeight * 0.15,
            height: workingHeight,
            handX: (rot) => {
                return canvasWidth * 0.5 - workingHeight * (0.3 - 0.15 * Math.cos(rot));
            },
            handY: (rot) => {
                return canvasHeight - workingHeight * (0.2 + Math.sin(rot) * 0.15);
            }
        };
    }

    function drawPerson(ctx, j, leftRotation, rightRotation) {
        // draw head
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.5, j.headY, j.headSize, 0, 2 * Math.PI);
        // draw body
        ctx.moveTo(j.shoulderX, j.shoulderY);
        ctx.lineTo(canvasWidth - j.shoulderX, j.shoulderY);
        ctx.lineTo(canvasWidth - j.hipX, j.hipY);
        ctx.lineTo(j.hipX, j.hipY);
        ctx.closePath();
        // draw arms
        ctx.moveTo(j.shoulderX, j.shoulderY);
        ctx.lineTo(j.elbowX, j.elbowY);
        ctx.lineTo(j.handX(leftRotation), j.handY(leftRotation));
        ctx.moveTo(canvasWidth - j.shoulderX, j.shoulderY);
        ctx.lineTo(canvasWidth - j.elbowX, j.elbowY);
        ctx.lineTo(canvasWidth - j.handX(rightRotation), j.handY(rightRotation));
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
            x = canvasWidth - x;
        }
        ctx.arc(x, y, juggler.ballSize, 0, 2 * Math.PI);
        ctx.fill();
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

    function animateJuggler(timeStamp, ctx) {
        if (animationOngoing) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
            animationFrameId = window.requestAnimationFrame((timeStamp) => animateJuggler(timeStamp, ctx));
        }
    }

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        canvasHeight = dimension;
        canvasWidth = dimension;
        startingTime = performance.now();
        isSync = inputSiteswap.startsWith("(");
        siteswap = parseSiteswap(inputSiteswap);
        juggler = getJuggler(calcIdealWorkingHeight(siteswap, canvasHeight, gravity, beatLength));
        if (siteswap.length != 0) {
            animationOngoing = true;
            animationFrameId = window.requestAnimationFrame((timeStamp) => animateJuggler(timeStamp, ctx));
        } else {
            animationOngoing = false;
            console.log("invalid siteswap")
        }

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [inputSiteswap, dimension]);
    
    return <canvas ref={canvasRef} width={dimension} height={dimension} className='border border-black object-fill'></canvas>
}