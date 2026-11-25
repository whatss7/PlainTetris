// Rotation systems
// Part of PlainTetris. Wall kick tables, rotation rules, spawn states and the piece shape helpers
// they use.
// Loaded before script.js; it only declares data and functions, and reads
// the game state (board, currentBlock, cx/cy, ...) at call time.

//#region Rotation System

// Combine a per-transition basic rotation offset with a list of kick offsets
function makeWallKickTableFromBasicRotation(basicRotationTable, wallKickTable) {
    var newWallKickTable = {};
    for (var key in basicRotationTable) {
        if (!Object.prototype.hasOwnProperty.call(basicRotationTable, key)) continue;
        var basicRotation = basicRotationTable[key][0] || [0, 0];
        var item = [];
        for (var i = 0; i < wallKickTable.length; i++) {
            var offset = wallKickTable[i];
            item.push([basicRotation[0] + offset[0], basicRotation[1] + offset[1]]);
        }
        newWallKickTable[key] = item;
    }
    return newWallKickTable;
}

var wallKickNone = {
    "0->R": [[0, 0]],
    "R->0": [[0, 0]],
    "R->2": [[0, 0]],
    "2->R": [[0, 0]],
    "2->L": [[0, 0]],
    "L->2": [[0, 0]],
    "L->0": [[0, 0]],
    "0->L": [[0, 0]]
};

var wallKickSRS_JLSTZ = {
    "0->R": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    "R->0": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    "R->2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    "2->R": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    "2->L": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    "L->2": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    "L->0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    "0->L": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
};

var wallKickSRS_I = {
    "0->R": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    "R->0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    "R->2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    "2->R": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    "2->L": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    "L->2": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    "L->0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    "0->L": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
};

var wallKickNES_ISZ = {
    "0->R": [[0, 1]],
    "R->0": [[0, -1]],
    "R->2": [[0, 0]],
    "2->R": [[0, 0]],
    "2->L": [[1, 0]],
    "L->2": [[-1, 0]],
    "L->0": [[-1, -1]],
    "0->L": [[1, 1]]
};

var wallKickGB_ISZ = {
    "0->R": [[-1, 1]],
    "R->0": [[1, -1]],
    "R->2": [[1, 0]],
    "2->R": [[-1, 0]],
    "2->L": [[0, 0]],
    "L->2": [[0, 0]],
    "L->0": [[0, -1]],
    "0->L": [[0, 1]]
};

var wallKickSega_I = {
    "0->R": [[0, 0]],
    "R->0": [[0, 0]],
    "R->2": [[0, 1]],
    "2->R": [[0, -1]],
    "2->L": [[1, -1]],
    "L->2": [[-1, 1]],
    "L->0": [[-1, 0]],
    "0->L": [[1, 0]]
};

var wallKickSega_JLT = {
    "0->R": [[0, 1]],
    "R->0": [[0, -1]],
    "R->2": [[0, 0]],
    "2->R": [[0, 0]],
    "2->L": [[0, 0]],
    "L->2": [[0, 0]],
    "L->0": [[0, -1]],
    "0->L": [[0, 1]]
};

var arikaKickTable = [[0, 0], [1, 0], [-1, 0]];
var wallKickArika_S = makeWallKickTableFromBasicRotation(wallKickGB_ISZ, arikaKickTable);
var wallKickArika_Z = makeWallKickTableFromBasicRotation(wallKickNES_ISZ, arikaKickTable);
var wallKickArika_JLT = makeWallKickTableFromBasicRotation(wallKickSega_JLT, arikaKickTable);

var tgm3IKickOffsets = [[0, 0], [1, 0], [2, 0], [-1, 0], [-2, 0], [0, 1], [0, 2]];
var wallKickTgm3_I = makeWallKickTableFromBasicRotation(wallKickSega_I, tgm3IKickOffsets);
var tgm3JLTKickOffsets = [[0, 0], [1, 0], [-1, 0], [0, 1]];
var wallKickTgm3_T = makeWallKickTableFromBasicRotation(wallKickSega_JLT, tgm3JLTKickOffsets);

var wallKickASRS_I = {
    "0->R": [[0, 0], [-2, 0], [1, 0], [1, 2], [-2, -1]],
    "R->0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    "R->2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    "2->R": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -1]],
    "2->L": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -1]],
    "L->2": [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    "L->0": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    "0->L": [[0, 0], [2, 0], [-1, 0], [-1, 2], [2, -1]]
};

var t64KickTable = [[0, 0], [-1, 0], [1, 0]];

var basicRotationT64_I = {
    "0->R": [[-1, 0]],
    "R->0": [[1, 0]],
    "R->2": [[0, 1]],
    "2->R": [[0, -1]],
    "2->L": [[1, 0]],
    "L->2": [[-1, 0]],
    "L->0": [[0, -1]],
    "0->L": [[0, 1]]
};

var basicRotationT64_O = {
    "0->R": [[0, 1]],
    "R->0": [[0, -1]],
    "R->2": [[1, 0]],
    "2->R": [[-1, 0]],
    "2->L": [[0, -1]],
    "L->2": [[0, 1]],
    "L->0": [[-1, 0]],
    "0->L": [[1, 0]]
};

var wallKickT64_I = makeWallKickTableFromBasicRotation(basicRotationT64_I, t64KickTable);
var wallKickT64_O = makeWallKickTableFromBasicRotation(basicRotationT64_O, t64KickTable);
var wallKickT64_Default = makeWallKickTableFromBasicRotation(wallKickNone, t64KickTable);

// Wall kick tables used by each rotation system
var WALL_KICK_TABLES = {
    "srs": {
        "I": wallKickSRS_I,
        "O": wallKickNone,
        "default": wallKickSRS_JLSTZ
    },
    "nes": {
        "I": wallKickNES_ISZ,
        "S": wallKickNES_ISZ,
        "Z": wallKickNES_ISZ,
        "default": wallKickNone
    },
    "gb": {
        "I": wallKickGB_ISZ,
        "S": wallKickGB_ISZ,
        "Z": wallKickGB_ISZ,
        "default": wallKickNone
    },
    "sega": {
        "I": wallKickSega_I,
        "J": wallKickSega_JLT,
        "L": wallKickSega_JLT,
        "O": wallKickNone,
        "S": wallKickGB_ISZ,
        "T": wallKickSega_JLT,
        "Z": wallKickNES_ISZ
    },
    "arika": {
        "I": wallKickSega_I,
        "J": wallKickArika_JLT,
        "L": wallKickArika_JLT,
        "O": wallKickNone,
        "S": wallKickArika_S,
        "T": wallKickArika_JLT,
        "Z": wallKickArika_Z
    },
    "tgm3": {
        "I": wallKickTgm3_I,
        "J": wallKickArika_JLT,
        "L": wallKickArika_JLT,
        "O": wallKickNone,
        "S": wallKickArika_S,
        "T": wallKickTgm3_T,
        "Z": wallKickArika_Z
    },
    "asrs": {
        "I": wallKickASRS_I,
        "O": wallKickNone,
        "default": wallKickSRS_JLSTZ
    },
    "t64": {
        "I": wallKickT64_I,
        "O": wallKickT64_O,
        "default": wallKickT64_Default
    },
};

// Display names of the rotation systems
var ROTATION_SYSTEM_NAMES = {
    "srs": "SRS",
    "nes": "NES",
    "gb": "Game Boy",
    "sega": "Sega",
    "arika": "Arika",
    "tgm3": "Arika TGM3",
    "asrs": "Arika SRS",
    "t64": "Tetris 64",
};

// System and wall kick setting used by the next game
var gameRotationSystemName = "srs";
var wallKickEnabled = true;
// Kick offset of the last successful rotation, kept for the guideline rule that
// upgrades a two-cell kick to a proper T-Spin.
var lastKickOffset = null;

function rotationSystemSupportsWallKick(name) {
    var tableSet = WALL_KICK_TABLES[name];
    if (!tableSet) return false;
    for (var piece in tableSet) {
        if (!Object.prototype.hasOwnProperty.call(tableSet, piece)) continue;
        var kickTable = tableSet[piece];
        for (var key in kickTable) {
            if (!Object.prototype.hasOwnProperty.call(kickTable, key)) continue;
            if (kickTable[key] && kickTable[key].length > 1) return true;
        }
    }
    return false;
}

function getWallKickTable() {
    var tableSet = WALL_KICK_TABLES[gameRotationSystemName] || WALL_KICK_TABLES.srs;
    if (tableSet.hasOwnProperty(currentBlockType)) return tableSet[currentBlockType];
    return tableSet["default"];
}

// Extra rules a system can apply to the candidates in its wall kick table
var ROTATION_RULES = {
    // Arika RS "center column rule": the L/J/T 3x3 box is searched
    // 123 / 456 / 789 (top row first, left to right) and the first cell where
    // the rotated piece collides decides: a middle-column cell (2, 5 or 8)
    // blocks the rotation, a side-column cell (or no collision) lets the
    // remaining kicks run. It is evaluated only after the table's first
    // offset (the system's basic rotation) has been tried and failed.
    centerColumnRule: function (type, block, x, y) {
        if (type !== "J" && type !== "L" && type !== "T") return false;
        var size = block.length;
        for (var j = size - 1; j >= 0; j--) {
            for (var i = 0; i < size; i++) {
                if (block[i][j] == 0) continue;
                var bx = x + i, by = y + j;
                var collides = bx < 0 || bx >= 10 || by < 0 || by >= 25 || board[bx][by] != 0;
                if (collides) return i === 1;
            }
        }
        return false;
    },

    // TGM3's special I kicks are conditional, so its table lists every candidate
    // and this rule rejects the ones that do not apply. index is the position in
    // the kick list: 1-2 kick right, 3-4 kick left, 5-6 kick up.
    tgm3IKickRule: function (type, block, x, y, index) {
        if (type !== "I") return true;
        if (index >= 5) {
            return pieceIsHorizontal(currentBlock) && pieceTouchesFloor();
        }
        if (index >= 1) {
            if (!pieceIsVertical(currentBlock)) return false;
            return index <= 2 ? pieceTouchesLeftWall() : pieceTouchesRightWall();
        }
        return true;
    }
};

var ROTATION_SYSTEM_RULES = {
    "arika": { blockAfterFirst: ["centerColumnRule"] },
    "tgm3": { blockAfterFirst: ["centerColumnRule"], allowKick: "tgm3IKickRule" }
};

function rotationRulesBlockKick(type, block, x, y) {
    var system = ROTATION_SYSTEM_RULES[gameRotationSystemName];
    var rules = (system && system.blockAfterFirst) || [];
    for (var i = 0; i < rules.length; i++) {
        var rule = ROTATION_RULES[rules[i]];
        if (rule && rule(type, block, x, y)) return true;
    }
    return false;
}

// Whether the candidate at `index` may be tried at all. Systems without an
// allowKick rule accept every candidate.
function rotationRulesAllowKick(type, block, x, y, index) {
    var system = ROTATION_SYSTEM_RULES[gameRotationSystemName];
    if (!system || !system.allowKick) return true;
    var rule = ROTATION_RULES[system.allowKick];
    return rule ? rule(type, block, x, y, index) : true;
}

// Bounding box of the occupied cells of a piece matrix, or null when empty.
function pieceBounds(block) {
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < block.length; i++) {
        for (var j = 0; j < block[i].length; j++) {
            if (block[i][j] == 0) continue;
            if (i < minX) minX = i;
            if (i > maxX) maxX = i;
            if (j < minY) minY = j;
            if (j > maxY) maxY = j;
        }
    }
    if (minX === Infinity) return null;
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
}

// A vertical I occupies one column and four rows; a horizontal one occupies
// four columns and one row.
function pieceIsVertical(block) {
    var box = pieceBounds(block);
    return !!box && box.minX === box.maxX && box.maxY - box.minY === 3;
}

function pieceIsHorizontal(block) {
    var box = pieceBounds(block);
    return !!box && box.minY === box.maxY && box.maxX - box.minX === 3;
}

// Wall/floor contact of the piece being rotated, in board coordinates.
function pieceTouchesLeftWall() {
    for (var i = 0; i < currentBlock.length; i++) {
        for (var j = 0; j < currentBlock[i].length; j++) {
            if (currentBlock[i][j] != 0 && cx + i === 0) return true;
        }
    }
    return false;
}

function pieceTouchesRightWall() {
    for (var i = 0; i < currentBlock.length; i++) {
        for (var j = 0; j < currentBlock[i].length; j++) {
            if (currentBlock[i][j] != 0 && cx + i === 9) return true;
        }
    }
    return false;
}

function pieceTouchesFloor() {
    for (var i = 0; i < currentBlock.length; i++) {
        for (var j = 0; j < currentBlock[i].length; j++) {
            if (currentBlock[i][j] != 0 && cy + j === 0) return true;
        }
    }
    return false;
}

// Sorted "x:y" key of the cells a piece occupies at (x, y). Rotations that do
// not change this key (the O piece turning in place) are not moves.
function pieceCellsKey(block, x, y) {
    var cells = [];
    for (var i = 0; i < block.length; i++) {
        for (var j = 0; j < block[i].length; j++) {
            if (block[i][j] != 0) cells.push((x + i) + ":" + (y + j));
        }
    }
    cells.sort();
    return cells.join(",");
}

// Spawn orientation per system: the rotation state a piece starts in
var SPAWN_STATES = ["0", "R", "2", "L"];
var SPAWN_STATES_BY_SYSTEM = {
    "srs": { "default": "0" },
    "nes": { "default": "2" },
    "gb": { "default": "2" },
    "sega": { "default": "2" },
    "arika": { "default": "2" },
    "tgm3": { "default": "2" },
    "asrs": { "default": "0" },
    "t64": { "default": "2", "S": "0" },
};

function getSpawnState(type) {
    var tableSet = SPAWN_STATES_BY_SYSTEM[gameRotationSystemName] || SPAWN_STATES_BY_SYSTEM.srs;
    var state = tableSet.hasOwnProperty(type) ? tableSet[type] : tableSet["default"];
    return SPAWN_STATES.indexOf(state) >= 0 ? state : "0";
}

// Build a piece in its spawn orientation: the standard state 0 shape rotated
// clockwise until it reaches the configured state.
function makeBlockInSpawnState(type) {
    var block = makeTetrimino(type);
    var steps = SPAWN_STATES.indexOf(getSpawnState(type));
    for (var i = 0; i < steps; i++) block = rotateClockwise(block);
    return block;
}

// Where a piece appears when it spawns, per rotation system. Rows count from
// the floor of the board (0 is the bottom row, 19 the top visible row), so the
// 1-indexed "row 20" of the guidelines is y = 19 here and the hidden rows
// above the field are y = 20..24.
//
//   anchor "top"     the highest occupied cell of the piece sits on `row`
//   anchor "bottom"  the lowest occupied cell of the piece sits on `row`
//
// SRS and Arika SRS spawn a piece wholly above the visible field, in the
// two-row band on rows 20 and 21, with the I on the lower row because its
// spawn orientation is a single row. NES, Game Boy, Sega, Arika and Arika TGM3
// start with the topmost cell on row 20, i.e. the top visible row. Tetris 64
// starts with its lowest cell on row 22, two rows above the top of the field.
// The Sega games that spawn on row 22 are the ones with a 10x22 field (TGM
// ACE); on a 10x20 field the same rule puts the piece on row 20.
//
//   hand "left"   three empty columns on the left, four on the right
//   hand "right"  four empty columns on the left, three on the right
//
// A 3-cell wide piece cannot be centred in a 10 column field, so each game
// picks a side to leave the extra column on. Game Boy and Tetris DX are
// left-handed, NES and SNES are right-handed; SRS, Sega and the Arika games are
// left-handed, so NES is the only right-handed system here.
var SPAWN_COLUMN = 3;
var SPAWN_LOCATIONS_BY_SYSTEM = {
    "srs": { "hand": "left", "anchor": "bottom", "row": 20 },
    "asrs": { "hand": "left", "anchor": "bottom", "row": 20 },
    "nes": { "hand": "right", "anchor": "top", "row": 19 },
    "gb": { "hand": "left", "anchor": "top", "row": 19 },
    "sega": { "hand": "left", "anchor": "top", "row": 19 },
    "arika": { "hand": "left", "anchor": "top", "row": 19 },
    "tgm3": { "hand": "left", "anchor": "top", "row": 19 },
    "t64": { "hand": "left", "anchor": "bottom", "row": 21 },
};

function getSpawnLocation() {
    return SPAWN_LOCATIONS_BY_SYSTEM[gameRotationSystemName] ||
        SPAWN_LOCATIONS_BY_SYSTEM.srs;
}

// Board origin (x, y) a freshly spawned piece is placed at. The padding inside
// the piece matrices puts the I on columns 4-7 and the O on columns 5-6, which
// are the same in both hands because those pieces are symmetric in a 10 column
// field. The 3-cell wide pieces are the ones the hand moves: left-handed puts
// them on columns 4-6, right-handed on columns 5-7, counting from the left.
function getSpawnOrigin(block) {
    var location = getSpawnLocation();
    var box = pieceBounds(block);
    if (!box) return [SPAWN_COLUMN, location.row];
    var threeWide = box.maxX - box.minX === 2;
    var x = SPAWN_COLUMN + (threeWide && location.hand === "right" ? 1 : 0);
    var y = location.anchor === "top"
        ? location.row - box.maxY
        : location.row - box.minY;
    return [x, y];
}

// Rotation state machine (0 -> R -> 2 -> L -> 0)
function getRotationState() {
    return currentRotationState;
}

function getNextRotationState(currentRotation) {
    switch (currentRotation) {
        case "0": return "R";
        case "R": return "2";
        case "2": return "L";
        case "L": return "0";
        default: return "0";
    }
}

// Counter-clockwise state machine (0 -> L -> 2 -> R -> 0)
function getPreviousRotationState(currentRotation) {
    switch (currentRotation) {
        case "0": return "L";
        case "L": return "2";
        case "2": return "R";
        case "R": return "0";
        default: return "0";
    }
}

//#endregion
