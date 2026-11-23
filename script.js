/*
 * Plain Tetris - single-file game script.
 *
 * Region layout:
 *   Global state    - mutable state shared by everything below
 *   Constants       - piece shapes, colours, scoring, canvas size, tick timing
 *   Rotation System - wall kick tables, spawn states, rotation rules
 *   Render          - WebGL setup, frame building and drawing
 *   Randomizers     - piece sequence generators and their selection
 *   Logics          - pieces and board, movement, the game loop and game flow
 *   UI              - button, select and checkbox handlers
 *   Stats           - statistics collection and the stats panel
 *   Input           - action queue fed by the keyboard and touch controls
 *   Mobile          - on-screen buttons and layout scaling
 *   Bootstrap       - startup: sizing, initial draw, keyboard listener
 */

//#region Global state

// WebGL context, shader program, buffers and attribute locations
var gl;
var program = null;
var vBuffer = null;
var cBuffer = null;
var vPosition = -1;
var vColor = -1;

// Board, the falling piece and the preview piece
var board = [];
var currentBlock = [];
var nextBlock = [];

// Input queue and the state of the current session
var requestQueue = [];
var line = 0;
var score = 0;
var GameStopped = false;
var GameFailed = false;
var gameStarted = false;

var cx, cy  // position of current block

var currentRotationState = "0"; // 0: initial, R: clockwise, 2: 180 degrees, L: counter-clockwise
var currentBlockType = "I"; // I, J, L, S, T, Z, O
var nextBlockType = "I"; // I, J, L, S, T, Z, O

// Random source used by the randomizers; swapped for a seeded one each game.
var gameRandom = Math.random;
var gameSeed = "";
var seedRevealPending = false;
var randomStartEnabled = false;

// Timer: a single interval drives the whole game.
var gameTimer = null;
var dropTicks = 0;

// Canvas scale factors for desktop and mobile layouts
var globalScale = 1;
var mobileScale = 1;
var currentScale = 1;

// Debug logging: gameLog() prints only while debugMode is on
var debugMode = false;
function gameLog(msg) {
    if (debugMode) {
        console.log(msg);
    }
}

//#endregion

//#region Constants

// Piece order used by blocks[], the randomizers and the stats counters
var TYPES = ["I", "J", "L", "O", "S", "T", "Z"];

// Tetrimino shapes in their initial orientation, indexed like TYPES
var tetriminos = [
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0],
    ],
    [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 4, 4, 0],
        [0, 4, 4, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0],
    ],
    [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0],
    ],
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
    ]
];

// Cell colours; index 0 is the empty cell and 8 is the ghost piece
var cellColors = [
    [0.0, 0.0, 0.0],
    [1.0, 0.0, 0.0],
    [1.0, 0.5, 0.0],
    [1.0, 1.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 1.0],
    [0.0, 0.5, 0.5],
    [0.5, 0.0, 1.0],
    [0.2, 0.2, 0.2]
];

// Score awarded for clearing 0, 1, 2, 3 or 4 lines at once
var scores = [0, 40, 100, 300, 1200];

// Logical canvas size, scaled by currentScale in setCanvas()
var canvasWidth = 500;
var canvasHeight = 600;

// Timing: one interval of TICK_MS drives input and gravity together; gravity
// moves the piece every DROP_TICKS ticks, i.e. once per second.

var TICK_RATE = 60;
var TICK_MS = 1000 / TICK_RATE;
var DROP_TICKS = 60;

//#endregion

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
    "asrs": "Arika SRS",
    "t64": "Tetris 64",
};

// System and wall kick setting used by the next game
var gameRotationSystemName = "srs";
var wallKickEnabled = true;

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

// Extra rules a system can apply once the first kick attempt has failed
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
    }
};

var ROTATION_SYSTEM_RULES = {
    "arika": ["centerColumnRule"]
};

function rotationRulesBlockKick(type, block, x, y) {
    var rules = ROTATION_SYSTEM_RULES[gameRotationSystemName] || [];
    for (var i = 0; i < rules.length; i++) {
        var rule = ROTATION_RULES[rules[i]];
        if (rule && rule(type, block, x, y)) return true;
    }
    return false;
}

// Spawn orientation per system: the rotation state a piece starts in
var SPAWN_STATES = ["0", "R", "2", "L"];
var SPAWN_STATES_BY_SYSTEM = {
    "srs": { "default": "0" },
    "nes": { "default": "2" },
    "gb": { "default": "2" },
    "sega": { "default": "2" },
    "arika": { "default": "2" },
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

//#endregion

//#region Render

// Per-frame geometry and colours, rebuilt by draw()
var vertices = []
var colors = []

function initShaders(gl, vertexShaderId, fragmentShaderId) {
    var vertShader;
    var fragShader;

    var vertElem = document.getElementById(vertexShaderId);
    if (!vertElem) {
        alert("Unable to load vertex shader " + vertexShaderId);
        return -1;
    }
    else {
        vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertElem.text);
        gl.compileShader(vertShader);
        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            var msg = "Vertex shader failed to compile.  The error log is:"
                + "<pre>" + gl.getShaderInfoLog(vertShader) + "</pre>";
            alert(msg);
            return -1;
        }
    }

    var fragElem = document.getElementById(fragmentShaderId);
    if (!fragElem) {
        alert("Unable to load vertex shader " + fragmentShaderId);
        return -1;
    }
    else {
        fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragElem.text);
        gl.compileShader(fragShader);
        if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
            var msg = "Fragment shader failed to compile.  The error log is:"
                + "<pre>" + gl.getShaderInfoLog(fragShader) + "</pre>";
            alert(msg);
            return -1;
        }
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog(program) + "</pre>";
        alert(msg);
        return -1;
    }

    return program;
}

function flatten(v) {
    var result = new Float32Array(v.length * v[0].length);

    var idx = 0;
    for (var i = 0; i < v.length; ++i) {
        for (var j = 0; j < v[i].length; ++j) {
            result[idx++] = v[i][j];
        }
    }

    return result;
}

// Build the vertex and colour arrays for the board (including the ghost piece)
function drawBoard() {
    var shadowBoard = board;
    if(!GameFailed) shadowBoard = getShadowBoard();
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 20; j++) {
            vertices.push([0.12 * i - 1.0, 0.1 * j - 1.0]);
            vertices.push([0.12 * i - 1.0, 0.1 * (j + 1) - 1.0]);
            vertices.push([0.12 * (i + 1) - 1.0, 0.1 * j - 1.0]);
            vertices.push([0.12 * (i + 1) - 1.0, 0.1 * (j + 1) - 1.0]);
            vertices.push([0.12 * i - 1.0, 0.1 * (j + 1) - 1.0]);
            vertices.push([0.12 * (i + 1) - 1.0, 0.1 * j - 1.0]);
            for (var k = 0; k < 6; k++) {
                colors.push(cellColors[shadowBoard[i][j]])
            }
        }
    }
}

// Build the vertex and colour arrays for the next-piece preview
function drawNext() {
    var blockSize = nextBlock.length
    var leftGap = Math.floor((5 - blockSize) / 2)
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            vertices.push([0.12 * i + 0.3, 0.1 * j + 0.3]);
            vertices.push([0.12 * i + 0.3, 0.1 * (j + 1) + 0.3]);
            vertices.push([0.12 * (i + 1) + 0.3, 0.1 * j + 0.3]);
            vertices.push([0.12 * (i + 1) + 0.3, 0.1 * (j + 1) + 0.3]);
            vertices.push([0.12 * i + 0.3, 0.1 * (j + 1) + 0.3]);
            vertices.push([0.12 * (i + 1) + 0.3, 0.1 * j + 0.3]);
            for (var k = 0; k < 6; k++) {
                if (i < leftGap || i >= leftGap + blockSize) colors.push([0, 0, 0])
                else if (j < leftGap || j >= leftGap + blockSize) colors.push([0, 0, 0])
                else colors.push(cellColors[nextBlock[i - leftGap][j - leftGap]])
            }
        }
    }
}

// Upload both arrays to the GPU and draw the frame
function draw() {
    if (!gl || !program) return;

    vertices = []
    colors = []

    drawBoard();
    drawNext();

    gl.useProgram(program);

    // Load the data into the GPU

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);

    // Associate out shader variables with our data buffer

    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Load the data into the GPU

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW);

    // Associate out shader variables with our data buffer

    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}

// Size the canvas and (re)create the WebGL context, program and buffers
function setCanvas() {
    var canvas = document.getElementById("gl-canvas");

    canvas.width = Math.floor(canvasWidth * currentScale);
    canvas.height = Math.floor(canvasHeight * currentScale);

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
        return;
    }

    if (program) {
        gl.deleteProgram(program);
        program = null;
    }
    if (vBuffer) {
        gl.deleteBuffer(vBuffer);
        vBuffer = null;
    }
    if (cBuffer) {
        gl.deleteBuffer(cBuffer);
        cBuffer = null;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);    //Background Color

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    if (program === -1) {
        program = null;
        return;
    }

    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
    vPosition = gl.getAttribLocation(program, "vPosition");
    vColor = gl.getAttribLocation(program, "vColor");
}

//#endregion

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
var gameRandomizerName = "uniform";
var randomizer = createUniformRandomizer();

function setRandomizer(name) {
    if (!RANDOMIZERS.hasOwnProperty(name)) return;
    if (gameStarted) return; // a started game keeps its randomizer
    gameRandomizerName = name;
    refreshStatsIfVisible();
}


//#endregion

//#region Logics

// ---- Pieces and board helpers ----

function makeTetrimino(type) {
    var id = TYPES.indexOf(type);
    var blockSize = tetriminos[id].length;
    var result = [];
    // Transpose and flip (a.k.a. rotate) the matrix to get the correct shape
    for (var i = 0; i < blockSize; i++) {
        result.push([]);
        for (var j = 0; j < blockSize; j++) {
            result[i].push(tetriminos[id][blockSize - 1 - j][i]);
        }
    }
    return result;
}

function rotateClockwise(block) {
    var newBlock = []
    var blockSize = block.length

    for (var i = 0; i < blockSize; i++) {
        newBlock.push([])
        for (var j = 0; j < blockSize; j++) {
            newBlock[i].push(block[blockSize - 1 - j][i])
        }
    }
    return newBlock;
}

function copyMatrix(dst, src) {
    for (var i = 0; i < src.length; i++) {
        dst.push([])
        for (var j = 0; j < src[i].length; j++) {
            dst[i].push(src[i][j])
        }
    }
}

function testBlockPlace(newBlock, x, y, targetBoard) {
    var prevBoard = targetBoard || board;
    var blockSize = newBlock.length;
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (newBlock[i][j] != 0) {
                var ni = x + i, nj = y + j
                if (ni < 0 || nj < 0 || ni >= 10 || nj >= 25 || prevBoard[ni][nj] != 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function addBlockToBoard(prevBoard, block, x, y) {
    var blockSize = block.length
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (block[i][j] != 0) {
                prevBoard[x + i][y + j] = block[i][j]
            }
        }
    }
}

function addCurrentToBoard() {
    addBlockToBoard(board, currentBlock, cx, cy);
}

function deleteCurrentFromBoard() {
    var blockSize = currentBlock.length
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (currentBlock[i][j] != 0) {
                board[cx + i][cy + j] = 0
            }
        }
    }
}

// Copy of the board with the ghost piece at its landing position
function getShadowBoard() {
    var result = []
    var shadowBlock = []
    copyMatrix(result, board)
    copyMatrix(shadowBlock, currentBlock)
    var blockSize = currentBlock.length
    if (blockSize == 0) return result;
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (shadowBlock[i][j] != 0) {
                shadowBlock[i][j] = 8;
            }
        }
    }
    // Remove the current piece from the copy only, so the shadow can fall
    // through the cells the piece occupies right now.
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (currentBlock[i][j] != 0) {
                result[cx + i][cy + j] = 0;
            }
        }
    }
    var maxDownDistance = 0;
    for (; testBlockPlace(shadowBlock, cx, cy - maxDownDistance, result); maxDownDistance++);
    maxDownDistance--;
    addBlockToBoard(result, shadowBlock, cx, cy - maxDownDistance);
    addBlockToBoard(result, currentBlock, cx, cy);
    return result;
}

// ---- Movement ----

function tryMove(dx, dy) {
    // Calculate the new position of the block
    var ncx = cx + dx, ncy = cy + dy
    gameLog("Attempting to move block from (" + cx + ", " + cy + ") to (" + ncx + ", " + ncy + ")");

    deleteCurrentFromBoard()
    var result = testBlockPlace(currentBlock, ncx, ncy);
    if (result) { 
        cx = ncx, cy = ncy; 
        gameLog("Move successful. New position: (" + cx + ", " + cy + ")");
    } else {
        gameLog("Move failed. Block remains at (" + cx + ", " + cy + ")");
    }
    addCurrentToBoard()

    return result
}

function tryRotate() {
    // Calculate the new shape of the block
    var newBlock = rotateClockwise(currentBlock);

    deleteCurrentFromBoard();

    var kickData = getWallKickTable();
    var currentRotation = getRotationState();
    var nextRotation = getNextRotationState(currentRotation);
    var kickKey = currentRotation + "->" + nextRotation;
    var kicks = kickData ? kickData[kickKey] : null;
    var result = false;
    if (!kicks) { // a hand-written table may leave a transition out
        addCurrentToBoard();
        return false;
    }
    // With wall kicks disabled only the first offset of the transition is used.
    if (!wallKickEnabled && kicks.length > 1) kicks = [kicks[0]];
    gameLog("Attempting rotation.");
    gameLog("Current rotation: " + currentRotation);
    gameLog("Next rotation: " + nextRotation);
    gameLog("Kick key: " + kickKey);
    gameLog("Block type: " + currentBlockType);
    gameLog("Kicks: " + JSON.stringify(kicks));

    for (var k = 0; k < kicks.length; k++) {
        var kick = kicks[k];
        var tempPos = [cx + kick[0], cy + kick[1]];

        if (testBlockPlace(newBlock, tempPos[0], tempPos[1])) {
            currentBlock = newBlock;
            cx = tempPos[0];
            cy = tempPos[1];
            currentRotationState = getNextRotationState(currentRotationState);
            result = true;
            gameLog("Rotation successful.");
            gameLog("New position: (" + cx + ", " + cy + ")");
            gameLog("New rotation: " + currentRotationState);
            gameLog("Used kick: " + JSON.stringify(kick));
            break;
        }

        if (k === 0 && rotationRulesBlockKick(currentBlockType, newBlock, tempPos[0], tempPos[1])) {
            gameLog("Rotation blocked by rotation rule after the first kick failed.");
            break;
        }
    }
    
    addCurrentToBoard();
    return result;
}

// Board setup and the game loop
function initBoard() {
    board = []
    for (var i = 0; i < 10; i++) {
        var arr = []
        for (var j = 0; j < 25; j++) {
            arr.push(0)
        }
        board.push(arr)
    }
}

function fillRandomStart() {
    if (!randomStartEnabled) return;
    for (var row = 0; row < 8; row++) {
        var count = 9 - row;
        var cells = [];
        for (var x = 0; x < 10; x++) cells.push(x);
        for (var k = 0; k < count; k++) {
            var pick = k + Math.floor(gameRandom() * (10 - k));
            var tmp = cells[k];
            cells[k] = cells[pick];
            cells[pick] = tmp;
            board[cells[k]][row] = Math.floor(gameRandom() * 7) + 1;
        }
    }
}

function initGame() {
    initBoard()
    fillRandomStart()
    currentBlock = []
    nextBlock = []
    requestQueue = []
    line = 0
    score = 0
    GameFailed = false
    GameStopped = false
    gameStarted = true
    dropTicks = 0
    nonIStreak = 0
    longestNonIStreak = 0
    stats = { single: 0, double: 0, triple: 0, tetris: 0 }
    pieceCounts = { I: 0, J: 0, L: 0, O: 0, S: 0, T: 0, Z: 0 }
    currentRotationState = "0"
    currentBlockType = "I"
    nextBlockType = "I"
    randomizer.reset()
    document.getElementById("score").textContent = "0"
    document.getElementById("count").textContent = "0"
    genNextBlock()
    genNextBlock()
}

// Spawn the next piece, clear completed lines and detect a topped-out board
function genNextBlock() {
    var id = randomizer.next();
    var type = TYPES[id];
    currentBlock = nextBlock;
    currentBlockType = nextBlockType;
    nextBlockType = type;
    gameLog("Generated new block of type: " + nextBlockType);
    nextBlock = makeBlockInSpawnState(type);
    cx = 3;
    cy = 20;

    var clearedLines = [];

    // Test if any lines can be cleared
    for (var j = 0; j < 20; j++) {
        var flag = true;
        for (var i = 0; i < 10; i++) {
            if (board[i][j] == 0) {
                flag = false;
                break;
            }
        }
        if (flag) {
            clearedLines.push(j);
        }
    }

    // Clear lines if so
    var lineCount = clearedLines.length;
    score += scores[lineCount];
    line += lineCount;
    recordLineClear(lineCount);
    for (var i = 0; i < 10; i++) {
        for (var it = lineCount - 1; it >= 0; it--) {
            for (var j = clearedLines[it] + 1; j < 25; j++) {
                board[i][j - 1] = board[i][j];
            }
            board[i][24] = 0;
        }
    }
    document.getElementById("score").textContent = score.toString();
    document.getElementById("count").textContent = line.toString();

    // Test if any block is out of bound
    for (var i = 0; i < 10; i++) {
        for (var j = 20; j < 25; j++) {
            if (board[i][j] != 0) {
                GameFailed = true;
                GameStopped = true;
                break;
            }
        }
        if (GameStopped) break;
    }

    if (GameStopped) {
        stopTimer();
        document.getElementById("pauseBtn").value = "Pause";
        syncStartButton();
        draw();
        revealSeed();
        refreshStatsIfVisible();
        alert("You have failed! Final score: " + score.toString());
        return;
    }

    // Put new block in place
    var blockSize = currentBlock.length;
    if (blockSize > 0) recordSpawn(currentBlockType);
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            board[cx + i][cy + j] = currentBlock[i][j];
        }
    }
    currentRotationState = getSpawnState(currentBlockType);
    refreshStatsIfVisible();
}

// 1 left 2 right 3 up 4 down 5 auto-down
function calcNext() {
    if (GameStopped) return
    requestQueue.forEach(i => {
        if (GameStopped) return
        if (i == 1) {
            tryMove(-1, 0)
        } else if (i == 2) {
            tryMove(1, 0)
        } else if (i == 3) {
            tryRotate()
        } else if (i == 4) {
            if (tryMove(0, -1)) {
                // A manual drop restarts gravity.
                dropTicks = 0
            } else {
                genNextBlock()
            }
        } else if (i == 5) {
            if (!tryMove(0, -1)) {
                genNextBlock()
            }
        }
        if (GameStopped) return
    });
    requestQueue = []
    if (GameStopped) return
    draw()
}

// One tick of the game: the automatic drop request is queued first when the
// piece is due, then the queue is drained in a single pass, so input and
// gravity always land in the same frame.
function gameTick() {
    if (GameStopped) return
    dropTicks++;
    if (dropTicks >= DROP_TICKS) {
        dropTicks = 0;
        // A manual drop queued for this tick consumes the slot, so the piece
        // never falls two cells in one tick.
        if (requestQueue.indexOf(4) < 0) requestQueue.push(5);
    }
    calcNext();
}

function startTimer() {
    stopTimer()
    dropTicks = 0
    gameTimer = setInterval(gameTick, TICK_MS)
}

function stopTimer() {
    if (gameTimer !== null) clearInterval(gameTimer)
    gameTimer = null
}

// ---- Game lifecycle ----

function startGame() {
    var select = document.getElementById("randomizerSelect");
    if (select && RANDOMIZERS.hasOwnProperty(select.value)) {
        gameRandomizerName = select.value;
    }
    randomizer = RANDOMIZERS[gameRandomizerName]();

    var kickSelect = document.getElementById("rotationSystemSelect");
    if (kickSelect && WALL_KICK_TABLES.hasOwnProperty(kickSelect.value)) {
        gameRotationSystemName = kickSelect.value;
    }
    // The select may have been changed after a game over (when
    // setRotationSystem() is still locked), so re-sync the checkbox here.
    refreshWallKickAvailability();

    var wkBox = document.getElementById("wallKickCheckbox");
    // A kickless system disables the checkbox; keep the player's preference
    // instead of overwriting it with the forced unchecked state.
    if (wkBox && !wkBox.disabled) wallKickEnabled = !!wkBox.checked;

    // Seed: a blank field starts a random one. A generated seed stays hidden
    // while the game runs and is only shown in the stats after the game ends;
    // the field itself is left as it was (blank keeps giving fresh seeds).
    var seedInput = document.getElementById("seedInput");
    var seedText = seedInput ? seedInput.value.trim() : "";
    if (!seedText) {
        seedText = Math.floor(Math.random() * 0x100000000).toString(36).toUpperCase();
        seedRevealPending = true;
    } else {
        seedRevealPending = false;
    }
    gameSeed = seedText;
    gameRandom = createSeededRandom(seedText);

    var rsBox = document.getElementById("randomStartCheckbox");
    if (rsBox) randomStartEnabled = !!rsBox.checked;

    GameStopped = false
    gameStarted = true
    // The configuration is fixed for the whole game, including the game-over
    // screen; Reset unlocks it again.
    setConfigEnabled(false)
    syncStartButton()
    document.getElementById("pauseBtn").value = "Pause"
    initGame()
    startTimer()
    requestQueue = []
}

function resetGame() {
    stopTimer()
    gameStarted = false
    GameStopped = true
    GameFailed = false
    dropTicks = 0
    initBoard()
    currentBlock = []
    nextBlock = []
    currentBlockType = ""
    nextBlockType = ""
    requestQueue = []
    line = 0
    score = 0
    currentRotationState = "0"
    nonIStreak = 0
    longestNonIStreak = 0
    stats = { single: 0, double: 0, triple: 0, tetris: 0 }
    pieceCounts = { I: 0, J: 0, L: 0, O: 0, S: 0, T: 0, Z: 0 }
    gameSeed = ""
    seedRevealPending = false

    var select = document.getElementById("randomizerSelect");
    if (select && RANDOMIZERS.hasOwnProperty(select.value)) {
        gameRandomizerName = select.value;
    }
    var kickSelect = document.getElementById("rotationSystemSelect");
    if (kickSelect && WALL_KICK_TABLES.hasOwnProperty(kickSelect.value)) {
        gameRotationSystemName = kickSelect.value;
    }
    randomizer = RANDOMIZERS[gameRandomizerName]();
    setConfigEnabled(true)
    refreshWallKickAvailability()

    document.getElementById("score").textContent = "0"
    document.getElementById("count").textContent = "0"
    document.getElementById("pauseBtn").value = "Pause"
    syncStartButton()
    draw()
    refreshStatsIfVisible()
}

function pauseGame() {
    if (!gameStarted || GameFailed) return
    if (GameStopped) {
        GameStopped = false
        document.getElementById("pauseBtn").value = "Pause"
        requestQueue = []
        startTimer()
    } else {
        GameStopped = true
        document.getElementById("pauseBtn").value = "Unpause"
        stopTimer()
    }
}

function abortGame() {
    if (!gameStarted || GameFailed) return
    if (!GameStopped) pauseGame()

    if (!confirm("Abort this game? It counts as a failure.")) {
        return
    }

    GameFailed = true
    GameStopped = true
    stopTimer()
    revealSeed()
    document.getElementById("pauseBtn").value = "Pause"
    syncStartButton()
    draw()
    refreshStatsIfVisible()
}

//#endregion

//#region UI

// Start / Abort / Reset button

function startButtonAction() {
    if (!gameStarted) {
        startGame()
    } else if (GameFailed) {
        resetGame()
    } else {
        abortGame()
    }
}

function syncStartButton() {
    var label = !gameStarted ? "Start" : (GameFailed ? "Reset" : "Abort")
    var btn = document.getElementById("startBtn");
    if (btn) btn.value = label
    var mobile = document.getElementById("mobileStartBtn");
    if (mobile) mobile.value = label.charAt(0)
}

// Configuration panel (randomizer, rotation system, wall kick, random start, seed)

// Show/hide the settings row that holds the randomizer and rotation system selects.
function toggleConfig() {
    var btn = document.getElementById("configBtn");
    if (btn && btn.disabled) return;
    var row = document.getElementById("configRow");
    if (!row) return;
    row.style.display = (row.style.display === "block") ? "none" : "block";
}

function setConfigEnabled(enabled) {
    var btn = document.getElementById("configBtn");
    if (btn) btn.disabled = !enabled;
    var row = document.getElementById("configRow");
    if (row && !enabled) row.style.display = "none";
    var ids = ["randomizerSelect", "rotationSystemSelect", "seedInput", "randomStartCheckbox"];
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) el.disabled = !enabled;
    }
    var box = document.getElementById("wallKickCheckbox");
    if (box) {
        if (!enabled) box.disabled = true;
        else refreshWallKickAvailability();
    }
}

// Configuration handlers; the panel is locked while a game is running

function refreshWallKickAvailability() {
    var box = document.getElementById("wallKickCheckbox");
    if (!box) return;
    box.disabled = !rotationSystemSupportsWallKick(gameRotationSystemName);
    box.checked = wallKickEnabled && !box.disabled;
}

function setWallKickEnabled(enabled) {
    var box = document.getElementById("wallKickCheckbox");
    if (gameStarted) {
        if (box) box.checked = wallKickEnabled;
        return;
    }
    wallKickEnabled = !!enabled;
    refreshWallKickAvailability();
    refreshStatsIfVisible();
}

function setRotationSystem(name) {
    if (!WALL_KICK_TABLES.hasOwnProperty(name)) return;
    if (gameStarted) return;
    gameRotationSystemName = name;
    refreshWallKickAvailability();
    refreshStatsIfVisible();
}

function setRandomStart(enabled) {
    var box = document.getElementById("randomStartCheckbox");
    if (gameStarted) {
        if (box) box.checked = randomStartEnabled;
        return;
    }
    randomStartEnabled = !!enabled;
    refreshStatsIfVisible();
}

// Stats panel toggle
function toggleStats() {
    var panel = document.getElementById("statsPanel");
    if (!panel) return;
    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
        refreshStats();
    }
}

//#endregion

//#region Stats

var stats = { single: 0, double: 0, triple: 0, tetris: 0 };

var pieceCounts = { I: 0, J: 0, L: 0, O: 0, S: 0, T: 0, Z: 0 };
var nonIStreak = 0;
var longestNonIStreak = 0;

function recordSpawn(type) {
    if (pieceCounts.hasOwnProperty(type)) pieceCounts[type]++;
    if (type === "I") {
        nonIStreak = 0;
    } else {
        nonIStreak++;
        if (nonIStreak > longestNonIStreak) longestNonIStreak = nonIStreak;
    }
}

function recordLineClear(lineCount) {
    if (lineCount === 1) stats.single++;
    else if (lineCount === 2) stats.double++;
    else if (lineCount === 3) stats.triple++;
    else if (lineCount === 4) stats.tetris++;
}

function tetrisRate() {
    var lines = stats.single + stats.double * 2 + stats.triple * 3 + stats.tetris * 4;
    return lines === 0 ? 0 : stats.tetris * 4 / lines * 100;
}

function refreshStats() {
    var mode = document.getElementById("statsMode")
    var rnd = document.getElementById("statsRandomizer");
    var wk = document.getElementById("statsRotationSystem");
    var sc = document.getElementById("statsScore");
    var pieces = document.getElementById("statsPieces");
    var streak = document.getElementById("statsStreak");
    var counts = document.getElementById("statsCounts");
    var rate = document.getElementById("statsRate");

    if (mode) mode.textContent = "Mode: " + (randomStartEnabled ? "Random Start" : "Standard");
    if (rnd) rnd.textContent = "Randomizer: " + RANDOMIZER_NAMES[gameRandomizerName];
    var kickDisabled = !wallKickEnabled && rotationSystemSupportsWallKick(gameRotationSystemName);
    if (wk) wk.textContent = "Rotation System: " + (ROTATION_SYSTEM_NAMES[gameRotationSystemName] || gameRotationSystemName) +
        (kickDisabled ? " (no wall kick)" : "");
    if (sc) sc.textContent = "Score: " + score + "  Lines: " + line;
    var sd = document.getElementById("statsSeed");
    if (sd) {
        if (seedRevealPending && !GameFailed) {
            sd.style.display = "none";
        } else {
            sd.style.display = "";
            sd.textContent = "Seed: " + (gameSeed || "-");
        }
    }
    if (pieces) pieces.textContent = "I: " + pieceCounts.I + "  J: " + pieceCounts.J +
        "  L: " + pieceCounts.L + "  O: " + pieceCounts.O +
        "  S: " + pieceCounts.S + "  T: " + pieceCounts.T +
        "  Z: " + pieceCounts.Z;
    if (streak) streak.textContent = "Non-I streak: " + nonIStreak + "  Max: " + longestNonIStreak;
    if (!counts || !rate) return;
    counts.textContent = "Single: " + stats.single + "  Double: " + stats.double +
        "  Triple: " + stats.triple + "  Tetris: " + stats.tetris;
    rate.textContent = "Tetris Rate: " + tetrisRate().toFixed(2) + "%";
}

function refreshStatsIfVisible() {
    var panel = document.getElementById("statsPanel");
    if (panel && panel.style.display === "block") refreshStats();
}

function revealSeed() {
    if (!seedRevealPending) return;
    seedRevealPending = false;
    refreshStatsIfVisible();
}

//#endregion

//#region Input

// Action requests shared by the keyboard listener and the on-screen buttons.
// Each queues a code for calcNext() and caps the queue at 8 entries.

function requestUp() {
    if (GameStopped || requestQueue.length >= 8) return
    requestQueue.push(3)
}

function requestDown() {
    if (GameStopped || requestQueue.length >= 8) return
    requestQueue.push(4)
}

function requestLeft() {
    if (GameStopped || requestQueue.length >= 8) return
    requestQueue.push(1)
}

function requestRight() {
    if (GameStopped || requestQueue.length >= 8) return
    requestQueue.push(2)
}

//#endregion

//#region Mobile Compatibility

var vBtnShown = false

function showVirtualBtns() {
    if (!gl) return;

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    draw();

    vBtnShown = !vBtnShown;

    currentScale = vBtnShown ? mobileScale : globalScale;

    var btnSize = "" + Math.floor(120 * currentScale)
    var fontSize = "" + Math.floor(40 * currentScale)

    if (vBtnShown) {
        var vBtn =
            '<input type="button" id="mobileStartBtn" onclick="startButtonAction()" value="' + (!gameStarted ? "S" : (GameFailed ? "R" : "A")) + '" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<input type="button" onclick="requestUp()" value="&uarr;" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<input type="button" onclick="pauseGame()" value="P" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<br/>\n' +
            '<input type="button" onclick="requestLeft()" value="&larr;" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<input type="button" onclick="requestDown()" value="&darr;" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<input type="button" onclick="requestRight()" value="&rarr;" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>'
        document.getElementById("btnBox").innerHTML = vBtn
    } else {
        document.getElementById("btnBox").innerHTML = ""
    }
    setCanvas()
    draw()
}

//#endregion

//#region Bootstrap

window.onload = function init() {

    var windowWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    var windowHeight = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

    var stdWidth = 550, stdHeight = 700;
    var mobileWidth = 550, mobileHeight = 1000;

    if (windowWidth < stdWidth || windowHeight < stdHeight) {
        globalScale = Math.min(windowWidth / stdWidth, windowHeight / stdHeight);
    } else globalScale = 1;

    if (windowWidth < mobileWidth || windowHeight < mobileHeight) {
        mobileScale = Math.min(windowWidth / mobileWidth, windowHeight / mobileHeight);
    } else mobileScale = 1;

    currentScale = globalScale;

    refreshWallKickAvailability();
    setCanvas();
    initBoard();
    draw();

    if(windowWidth < windowHeight) showVirtualBtns();
};

document.onkeydown = function keydown(evt) {
    var handled = true;
    switch (evt.key) {
        case "ArrowUp":
            requestUp();
            break;
        case "ArrowDown":
            requestDown();
            break;
        case "ArrowLeft":
            requestLeft();
            break;
        case "ArrowRight":
            requestRight();
            break;
        default:
            handled = false;
    }
    if (handled) evt.preventDefault();
}

//#endregion
