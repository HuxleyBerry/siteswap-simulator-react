export function getMaxThrow(siteswap) {
    let flattened = [].concat(...siteswap);
    let positiveSiteswap = flattened.map(x => Math.abs(x));
    return Math.max(...positiveSiteswap);
}

export function calcIdealWorkingHeight(siteswap, HEIGHT, gravity, beatLength) {
    const maxThrow = getMaxThrow(siteswap);
    return Math.min(HEIGHT - 10, (10 - HEIGHT) / (-0.25 + (gravity * beatLength) * ((maxThrow - 0.5) / 2) * (-maxThrow / 2 + 0.25)));
}

export function getRotation(beats, start) {
    if ((beats + start) % 2 < 1.5) {
        return 2 * (((beats + start) % 2)) * Math.PI / 3;
    } else {
        return 2 * (((beats + start) % 2)) * Math.PI;
    }
}

export function flipAngle(angle, flip) {
    return flip ? Math.PI - angle : angle;
}