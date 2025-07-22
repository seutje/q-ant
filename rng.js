function createRNG(seed) {
    let state = seed >>> 0;
    return function() {
        // Mulberry32 algorithm
        state += 0x6D2B79F5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

window.RNG = { createRNG };
