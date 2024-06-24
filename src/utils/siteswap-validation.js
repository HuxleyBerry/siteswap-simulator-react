function mod(n, m) {
    return ((n % m) + m) % m;
}

function checkThrow(ballThrow, multiplexAllowed, sync) {
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
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

export function parseSiteswap(siteswap) { //returns a list of all the throws, or an empty list if the siteswap string is invalid
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
