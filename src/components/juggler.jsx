'use client'

import { useEffect, useRef, useState } from 'react';
import { parseSiteswap } from '@/utils/siteswap-validation';
import { getMaxThrow, calcIdealWorkingHeight, getRotation, flipAngle } from '@/utils/other';

export default function Juggler({dimension, inputSiteswap, beatLength, gravity, showTwosAsHolds, LHoutsideThrows, RHoutsideThrows}) {
    const canvasRef = useRef(null);

    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    function getJuggler(workingHeight, canvasWidth, canvasHeight) {
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

    function drawPerson(ctx, j, leftRotation, rightRotation, canvasWidth) {
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

    function drawBall(ctx, juggler, startingHand, ballThrow, progress, canvasWidth) {
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

    function showInvalidSiteSwap(ctx, canvasWidth, canvasHeight) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        ctx.fillStyle = "black";
        ctx.font = `${canvasWidth/15}px Arial`;
        ctx.fillText("Invalid Siteswap", canvasWidth * 0.5 - ctx.measureText("Invalid Siteswap").width * 0.5, canvasHeight * 0.5);
    }

    function getSiteswapTextFontSize(ctx, siteswapName, canvasWidth) {
        let fontSize = canvasWidth/20;
        ctx.font = `${fontSize}px Arial`;
        while (ctx.measureText(inputSiteswap).width >= canvasWidth*0.4) {
            fontSize *= 0.75;
            ctx.font = `${fontSize}px Arial`;
        }
        return fontSize;
    }

    function drawSiteswapName(ctx, fontSize) {
        ctx.fillStyle = "black";
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(inputSiteswap, 10, 10 + fontSize);
    }

    function drawAsyncSiteswap(ctx, juggler, siteswap, beats, canvasWidth) {
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
                    drawBall(ctx, juggler, hand, height, progress, canvasWidth);
                }
            });
        }
    }

    function drawSyncSiteswap(ctx, juggler, siteswap, beats, canvasWidth) {
        if (siteswap.length % 2 != 0) throw "Error: somehow sync siteswap has odd number of throws!";;
        let maxThrowSize = getMaxThrow(siteswap); //amount of beats we need to backtrack
        for (let i = 0; i < maxThrowSize; i += 2) {
            let progress = beats % 2 + i;
            let leftThrowHeights = siteswap[mod(Math.floor(beats * 0.5) * 2 - i - 1, siteswap.length)];
            let rightThrowHeights = siteswap[mod(Math.floor(beats * 0.5) * 2 - i - 2, siteswap.length)];
            leftThrowHeights.forEach((height) => {
                if (progress <= Math.abs(height)) {
                    drawBall(ctx, juggler, "left", height, progress, canvasWidth);
                }
            });
            rightThrowHeights.forEach((height) => {
                if (progress <= Math.abs(height)) {
                    drawBall(ctx, juggler, "right", height, progress, canvasWidth);
                }
            });
        }
    }


    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        const canvasHeight = dimension;
        const canvasWidth = dimension;
        let animationFrameId;
        const startingTime = performance.now();
        const siteswap = parseSiteswap(inputSiteswap);
        const isSync = inputSiteswap.startsWith("(");
        const juggler = getJuggler(calcIdealWorkingHeight(siteswap, canvasHeight, gravity, beatLength), canvasWidth, canvasHeight);
        const fontSize = getSiteswapTextFontSize(ctx, inputSiteswap, canvasWidth);

        function animateJuggler(timeStamp) {
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
            drawSiteswapName(ctx, fontSize);
            drawPerson(ctx, juggler, leftRotation, rightRotation, canvasWidth, canvasHeight);
            if (isSync) {
                drawSyncSiteswap(ctx, juggler, siteswap, beats, canvasWidth)
            } else {
                drawAsyncSiteswap(ctx, juggler, siteswap, beats, canvasWidth)
            }
            animationFrameId = window.requestAnimationFrame(animateJuggler);
        }

        if (siteswap.length != 0) {
            animationFrameId = window.requestAnimationFrame(animateJuggler);
        } else {
            showInvalidSiteSwap(ctx, canvasWidth, canvasHeight);
        }

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        }
    }, [inputSiteswap, dimension, beatLength, gravity, showTwosAsHolds, LHoutsideThrows, RHoutsideThrows]);
    
    return <canvas ref={canvasRef} width={dimension} height={dimension} className='border border-black object-fill'></canvas>
}