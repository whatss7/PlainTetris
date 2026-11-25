// Randomizers
// Part of PlainTetris. Seeded PRNGs, the per-game piece generators and the randomizer registry.
// Loaded before script.js; it only declares data and functions, and reads
// the game state (board, currentBlock, cx/cy, ...) at call time.

//#region Randomizers

// Seeded PRNG (xmur3 hash + mulberry32) so that one seed reproduces both the
// piece sequence and the Random Start fill.
function hashSeedString(text) {
    var h = 1779033703 ^ text.length;
    for (var i = 0; i < text.length; i++) {
        h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
}

function createSeededRandom(seedText) {
    var a = hashSeedString(String(seedText)) || 1;
    return function () {
        a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Bag containing a number of copies of each of the seven pieces.
function createBagRandomizer(size) {
    var bag = [];

    function refill() {
        function shuffle(bag) {
            for (var i = bag.length - 1; i > 0; i--) {
                var j = Math.floor(gameRandom() * (i + 1));
                var tmp = bag[i];
                bag[i] = bag[j];
                bag[j] = tmp;
            }
        }

        bag = [];
        var copies = Math.floor(size / 7);
        for (var c = 0; c < copies; c++) {
            for (var i = 0; i < TYPES.length; i++) {
                bag.push(i);
            }
        }

        var leftover = size - copies * 7;
        var extra = [];
        for (var i = 0; i < TYPES.length; i++) {
            extra.push(i);
        }
        shuffle(extra);

        for (var i = 0; i < leftover; i++) {
            bag.push(extra[i]);
        }
        shuffle(bag);
    }

    return {
        next: function () {
            if (bag.length === 0) refill();
            return bag.pop();
        },
        reset: function () { bag = []; }
    };
}

// NES Tetris: roll 0-7, where 7 is a dummy value. If the roll is 7 or the
// same as the last piece, roll once more from 0-6 and take that result.
function createNesRandomizer() {
    var last = -1;
    return {
        next: function () {
            var id = Math.floor(gameRandom() * 8);
            if (id === 7 || id === last) {
                id = Math.floor(gameRandom() * 7);
            }
            last = id;
            return id;
        },
        reset: function () { last = -1; }
    };
}

// Game Boy: pieces are numbered with 3-bit vectors (L=0, J=1, I=2, O=3,
// Z=4, S=5, T=6; 111 is unused). The first two pieces are fully random;
// after that a candidate is rerolled while both it and the previous piece
// are subsets of the piece before the previous one, up to three rolls.
var gameBoyVectors = [2, 1, 0, 3, 5, 6, 4];

function createGameBoyRandomizer() {
    var previous1 = -1;
    var previous2 = -1;
    return {
        next: function () {
            var piece = Math.floor(gameRandom() * 7);
            for (var attempt = 0; attempt < 2; attempt++) {
                if (previous1 < 0 || previous2 < 0) break;
                var similar = (gameBoyVectors[previous1] & ~gameBoyVectors[previous2]) === 0 &&
                    (gameBoyVectors[piece] & ~gameBoyVectors[previous2]) === 0;
                if (!similar) break;
                piece = Math.floor(gameRandom() * 7);
            }
            previous2 = previous1;
            previous1 = piece;
            return piece;
        },
        reset: function () {
            previous1 = -1;
            previous2 = -1;
        }
    };
}

// Tetris DX (Game Boy Color): pieces are numbered I=0, T=1, Z=2, S=3, J=4,
// L=5, O=6. A roll of 0-7 picks the next piece, where 7 means "the piece the
// internal counter stands on". A roll that repeats the previous piece is thrown
// away and replaced by the re-roll counter, and five re-rolls in a row restart
// the roll. Because the counter usually lands on 1 (T) first, the result is the
// documented bias towards T (about 24% T, 14% Z, 12% for the rest).
var tetrisDxPieceMap = [0, 5, 6, 4, 1, 2, 3];

function createTetrisDxRandomizer() {
    var lastPiece = -1;
    var rerollCount = 0;
    // The counter counts the pieces dealt so far, so the first piece draws 0.
    var pieceCount = 6;
    return {
        next: function () {
            pieceCount = (pieceCount + 1) % 7;
            var piece;
            for (;;) {
                piece = Math.floor(gameRandom() * 8);
                if (piece === 7) piece = pieceCount;
                if (piece !== lastPiece) {
                    lastPiece = piece;
                    rerollCount = 0;
                    break;
                }
                // A repeat is replaced by the re-roll counter instead of being
                // rolled again; the previous piece is left as it was.
                rerollCount++;
                piece = rerollCount;
                if (rerollCount >= 5) {
                    rerollCount = 0;
                    continue;
                }
                break;
            }
            return tetrisDxPieceMap[piece];
        },
        reset: function () {
            lastPiece = -1;
            rerollCount = 0;
            pieceCount = 6;
        }
    };
}

// Sega (System 16, 1988): a 32-bit seed generates a 1000-piece sequence that
// repeats every 1000 pieces. Seed 0 is replaced by a built-in constant, which
// produces the documented power-on sequence. The seed field accepts decimal or
// 0x-hex values; any other text is hashed like the other randomizers.
var SEGA_DEFAULT_SEED = 0x2A6D365A;
// Codes 0..6 from the original `rand() % 7` switch, mapped to TYPES indexes.
var segaPieceMap = [0, 6, 4, 3, 5, 2, 1];

function parseSegaSeed(text) {
    var s = String(text).trim();
    if (/^0x[0-9a-f]+$/i.test(s)) return parseInt(s, 16) >>> 0;
    if (/^[0-9]+$/.test(s)) return parseInt(s, 10) >>> 0;
    return hashSeedString(s);
}

// One step of the original uint32_t rand(): returns the new seed and the
// 32-bit value it produced.
function segaRand(seed) {
    var temp = (seed >>> 0) === 0 ? SEGA_DEFAULT_SEED : (seed >>> 0);
    var oldseed = temp;
    temp = Math.imul(temp, 41) >>> 0;
    var nextSeed = (temp + ((temp << 16) >>> 0)) >>> 0;
    var value = (((temp & 0xFFFF) + (temp >>> 16)) | (oldseed & 0xFFFF0000)) >>> 0;
    return { seed: nextSeed, value: value };
}

function createSegaRandomizer() {
    var seq = [];
    var index = 0;
    return {
        next: function () {
            if (seq.length === 0) {
                var seed = parseSegaSeed(gameSeed);
                for (var i = 0; i < 1000; i++) {
                    var r = segaRand(seed);
                    seed = r.seed;
                    seq.push(segaPieceMap[(r.value & 0x3F) % 7]);
                }
            }
            var piece = seq[index];
            index = (index + 1) % 1000;
            return piece;
        },
        reset: function () {
            seq = [];
            index = 0;
        }
    };
}

// TGM: 4 piece history with 4 rolls
function createTgmRandomizer() {
    var history = [6, 6, 6, 6];
    var first_try = true;
    return {
        next: function () {
            var roll = -1;
            if (first_try) {
                first_try = false;
                roll = [0, 1, 2, 5][Math.floor(gameRandom() * 4)];
            } else {
                for (var i = 0; i < 4; i++) {
                    roll = Math.floor(gameRandom() * 7);
                    if (history.indexOf(roll) < 0) break;
                }
            }
            history.push(roll);
            history.shift();
            return roll;
        },
        reset: function () {
            history = [6, 6, 6, 6];
            first_try = true;
        }
    };
}

// TGM2: 4 piece history with 6 rolls
function createTgm2Randomizer() {
    var history = [6, 4, 6, 4];
    var first_try = true;
    return {
        next: function () {
            var roll = -1;
            if (first_try) {
                first_try = false;
                roll = [0, 1, 2, 5][Math.floor(gameRandom() * 4)];
            } else {
                for (var i = 0; i < 6; i++) {
                    roll = Math.floor(gameRandom() * 7);
                    if (history.indexOf(roll) < 0) break;
                }
            }
            history.push(roll);
            history.shift();
            return roll;
        },
        reset: function () {
            history = [6, 4, 6, 4];
            first_try = true;
        }
    };
}

// TGM3: a 35-piece pool (five copies of each piece). A dealt piece is not
// removed from the pool; its slot is refilled with the most droughted piece
// instead. Four-piece history, up to six rolls, and the first piece is
// restricted to I, J, L and T.
function createTgm3Randomizer() {
    var pool;
    var order;
    var history;
    var firstPiece;

    function refill() {
        pool = [];
        for (var copy = 0; copy < 5; copy++) {
            for (var i = 0; i < TYPES.length; i++) pool.push(i);
        }
        order = [];
        history = null;
        firstPiece = true;
    }

    refill();

    return {
        next: function () {
            var piece;
            if (firstPiece) {
                firstPiece = false;
                piece = [0, 1, 2, 5][Math.floor(gameRandom() * 4)];
                history = [4, 6, 4, piece]; // S, Z, S, first piece
                return piece;
            }
            var roll, i;
            for (roll = 0; roll < 6; roll++) {
                i = Math.floor(gameRandom() * 35);
                piece = pool[i];
                if (history.indexOf(piece) < 0 || roll === 5) break;
                if (order.length) pool[i] = order[0];
            }
            if (order.indexOf(piece) >= 0) order.splice(order.indexOf(piece), 1);
            order.push(piece);
            pool[i] = order[0];
            history.shift();
            history[3] = piece;
            return piece;
        },
        reset: refill
    };
}

// Each factory returns { next, reset }; next() yields an index into TYPES.
function createUniformRandomizer() {
    return {
        next: function () { return Math.floor(gameRandom() * 7); },
        reset: function () { }
    };
}

// Registry of available randomizers and the one used by the current game
var RANDOMIZERS = {
    "7-bag": function () { return createBagRandomizer(7); },
    "nes": createNesRandomizer,
    "gb": createGameBoyRandomizer,
    "tdx": createTetrisDxRandomizer,
    "sega": createSegaRandomizer,
    "tgm": createTgmRandomizer,
    "tgm2": createTgm2Randomizer,
    "tgm3": createTgm3Randomizer,
    "uniform": createUniformRandomizer,
    "8-bag": function () { return createBagRandomizer(8); },
    "14-bag": function () { return createBagRandomizer(14); },
    "35-bag": function () { return createBagRandomizer(35); },
};

var RANDOMIZER_NAMES = {
    "7-bag": "7-bag",
    "nes": "NES",
    "gb": "Game Boy",
    "tdx": "Tetris DX",
    "sega": "Sega",
    "tgm": "Arika TGM",
    "tgm2": "Arika TGM2",
    "tgm3": "Arika TGM3",
    "uniform": "Uniform",
    "8-bag": "8-bag",
    "14-bag": "14-bag",
    "35-bag": "35-bag",
};

// Randomizer used by the current game. It is read from the select when a game
// starts, so changing the selection mid-game only affects the next game.
var gameRandomizerName = "7-bag";
var randomizer = createUniformRandomizer();

function setRandomizer(name) {
    if (!RANDOMIZERS.hasOwnProperty(name)) return;
    if (gameStarted) return; // a started game keeps its randomizer
    gameRandomizerName = name;
    refreshStatsIfVisible();
}


//#endregion
