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

// Directions currently held down, for auto-shift. `ticks` counts game-loop
// ticks since the press and drives the repeat timing.
var heldDirs = {
    left: { pressed: false, ticks: 0 },
    right: { pressed: false, ticks: 0 },
    down: { pressed: false, ticks: 0 },
    rotate: { pressed: false, ticks: 0 },
    rotateCCW: { pressed: false, ticks: 0 }
};
// The most recently pressed of left/right; decides which side wins when both
// are held down at once.
var lastHeldDir = null;
// The most recently pressed of rotate/rotateCCW, used when both are held.
var lastHeldRotateDir = null;
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
// Ticks left in the ARE pause after a lock; 0 means no pause is running.
var areTicks = 0;
// Fractional auto-down left over from the previous tick (modern curve only):
// a curve faster than 1G asks for several rows per tick, a slower one needs
// several ticks per row.
var gravityDemand = 0;
// Frames the piece has spent resting on the stack while its lock delay runs.
var lockTicks = 0;
// Whether the piece was already resting on the stack when the current frame
// began. Games without a lock delay use it to give a landing piece one frame
// of grace before it locks.
var restingAtFrameStart = false;

// Gravity tolerances and the high-speed cap. A curve asking for 20 cells per
// tick or more falls at a fixed 25 rows per frame instead: that covers the
// 22 rows between the highest spawn location (row 21, used by Tetris 64) and
// the floor, and it puts a hard ceiling on the work one frame can queue if a
// curve value is ever huge. The tolerance makes a float a hair under 20 from
// accumulated error still count as 20G.
var GRAVITY_EPSILON = 1e-9;
var HIGH_GRAVITY = 20;
var HIGH_GRAVITY_ROWS = 25;

function clampGravitySpeed(speed) {
    return speed >= HIGH_GRAVITY - GRAVITY_EPSILON ? HIGH_GRAVITY_ROWS : speed;
}

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

// Movement timing, lock delay and difficulty lists live in MOVEMENT_DEFINITIONS
// in movement.js; movement() resolves the selected one.

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

function rotateCounterClockwise(block) {
    var newBlock = []
    var blockSize = block.length

    for (var i = 0; i < blockSize; i++) {
        newBlock.push([])
        for (var j = 0; j < blockSize; j++) {
            newBlock[i].push(block[j][blockSize - 1 - i])
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
        // The last action was a shift, not a turn, for Asuka's T-Spin test.
        lastActionWasRotation = false;
        // A step down, or (for move-reset curves) any successful shift,
        // restarts the lock delay timer.
        var cfg = lockDelay()
        if (cfg && (dy < 0 || (dx !== 0 && cfg.reset === "move"))) lockTicks = 0
        gameLog("Move successful. New position: (" + cx + ", " + cy + ")");
    } else {
        gameLog("Move failed. Block remains at (" + cx + ", " + cy + ")");
    }
    addCurrentToBoard()

    return result
}

// Search the wall kick table for the first placement of `block` that fits when
// it is rotated from `fromState` to `toState`. Returns null when no candidate
// fits. The caller owns the board: the current piece must not be on it.
function findRotationPlacement(block, baseX, baseY, fromState, toState) {
    var kickData = getWallKickTable();
    var kickKey = fromState + "->" + toState;
    var kicks = kickData ? kickData[kickKey] : null;
    if (!kicks) return null; // a hand-written table may leave a transition out
    // With wall kicks disabled only the first offset of the transition is used.
    if (!wallKickEnabled && kicks.length > 1) kicks = [kicks[0]];

    for (var k = 0; k < kicks.length; k++) {
        var kick = kicks[k];
        var x = baseX + kick[0];
        var y = baseY + kick[1];

        // Some systems make a kick conditional (TGM3's I-piece kicks); skip it
        // before spending a collision test on it. The index is the position in
        // the table, which is what the rule uses to tell the groups apart.
        if (!rotationRulesAllowKick(currentBlockType, block, x, y, k)) {
            gameLog("Kick " + k + " not allowed for this rotation.");
            continue;
        }

        if (testBlockPlace(block, x, y)) {
            return { block: block, x: x, y: y, kick: kick, rotation: toState, index: k };
        }

        if (k === 0 && rotationRulesBlockKick(currentBlockType, block, x, y)) {
            gameLog("Rotation blocked by rotation rule after the first kick failed.");
            break;
        }
    }
    return null;
}

function tryRotate(direction) {
    direction = direction === "ccw" ? "ccw" : "cw";
    // Calculate the new shape of the block
    var newBlock = direction === "ccw"
        ? rotateCounterClockwise(currentBlock)
        : rotateClockwise(currentBlock);
    // Cells the piece occupies before the turn; a rotation only counts as a
    // move for the lock timer when this changes.
    var cellsBefore = pieceCellsKey(currentBlock, cx, cy);

    deleteCurrentFromBoard();

    var currentRotation = getRotationState();
    var nextRotation = direction === "ccw"
        ? getPreviousRotationState(currentRotation)
        : getNextRotationState(currentRotation);
    var kickKey = currentRotation + "->" + nextRotation;
    var kickData = getWallKickTable();
    var kicks = kickData ? kickData[kickKey] : null;
    gameLog("Attempting rotation.");
    gameLog("Direction: " + direction);
    gameLog("Current rotation: " + currentRotation);
    gameLog("Next rotation: " + nextRotation);
    gameLog("Kick key: " + kickKey);
    gameLog("Block type: " + currentBlockType);
    gameLog("Kicks: " + JSON.stringify(kicks));

    var placement = findRotationPlacement(newBlock, cx, cy, currentRotation, nextRotation);
    var result = false;
    if (placement) {
        currentBlock = placement.block;
        cx = placement.x;
        cy = placement.y;
        currentRotationState = placement.rotation;
        lastKickOffset = [placement.kick[0], placement.kick[1]];
        lastActionWasRotation = true;
        // Move-reset curves restart the lock delay on a successful turn,
        // but only when the turn actually changes the occupied cells: an O
        // piece turning in place must not keep the timer alive. Step-reset
        // curves only do it when the piece steps downward.
        var lockCfg = lockDelay();
        if (lockCfg && lockCfg.reset === "move" &&
            pieceCellsKey(currentBlock, cx, cy) !== cellsBefore) {
            lockTicks = 0;
        }
        result = true;
        gameLog("Rotation successful.");
        gameLog("New position: (" + cx + ", " + cy + ")");
        gameLog("New rotation: " + currentRotationState);
        gameLog("Used kick: " + JSON.stringify(placement.kick));
    }

    addCurrentToBoard();
    return result;
}

// IRS: rotate the newly spawned piece before it enters the board. The rotated
// shape gets its own spawn origin (the rotation rules decide where that is),
// then the wall kick table is tried in order. Returns false and leaves the
// unrotated spawn untouched when no candidate fits.
function tryInitialRotation(direction) {
    if (!currentBlock || currentBlock.length === 0) return false;
    var fromState = getSpawnState(currentBlockType);
    var toState = direction === "ccw"
        ? getPreviousRotationState(fromState)
        : getNextRotationState(fromState);
    var rotated = direction === "ccw"
        ? rotateCounterClockwise(currentBlock)
        : rotateClockwise(currentBlock);
    var origin = getSpawnOrigin(rotated);
    var placement = findRotationPlacement(rotated, origin[0], origin[1], fromState, toState);
    if (!placement) return false;
    currentBlock = placement.block;
    cx = placement.x;
    cy = placement.y;
    currentRotationState = placement.rotation;
    return true;
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
    releaseAllDirs()
    line = 0
    score = 0
    GameFailed = false
    GameStopped = false
    gameStarted = true
    dropTicks = 0
    areTicks = 0
    gravityDemand = 0
    lockTicks = 0
    resetLevel()
    iDrought = 0
    maxIDrought = 0
    stats = { single: 0, double: 0, triple: 0, tetris: 0 }
    tSpinStats = { single: 0, double: 0, triple: 0, miniSingle: 0, miniDouble: 0 }
    pieceCounts = { I: 0, J: 0, L: 0, O: 0, S: 0, T: 0, Z: 0 }
    currentRotationState = "0"
    currentBlockType = "I"
    nextBlockType = "I"
    randomizer.reset()
    document.getElementById("score").textContent = "0"
    document.getElementById("count").textContent = "0"
    // The two spawns below only build the first piece and its preview; they are
    // not level-ups (TGM counts the pieces that enter the well during play).
    initialSpawnPhase = true
    genNextBlock()
    genNextBlock()
    initialSpawnPhase = false
}

// ARE entry delay for the piece that has just locked. The movement owns the
// rule: a number is used as is, a function receives the row the piece locked at
// (NES: bottom two rows 10 frames, +2 for every 4 rows above, up to 18). The
// locked piece is already in the board and still described by currentBlock /
// cx / cy when this runs.
function areTicksForLock() {
    var timing = levelTiming();
    if (timing) return timing.are;
    var spec = movement().are;
    return typeof spec === "function" ? spec(lockedPieceLowestRow()) : spec;
}

// Lowest board row occupied by the piece that just locked.
function lockedPieceLowestRow() {
    var lockRow = Number.POSITIVE_INFINITY;
    for (var i = 0; i < currentBlock.length; i++) {
        for (var j = 0; j < currentBlock[i].length; j++) {
            if (currentBlock[i][j] != 0 && cy + j < lockRow) lockRow = cy + j;
        }
    }
    if (!isFinite(lockRow)) lockRow = cy;
    return lockRow;
}

// A piece that can no longer move down is already in the board; start the ARE
// pause instead of spawning its successor right away.
function startAre() {
    areTicks = areTicksForLock()
    // The next piece starts its own gravity interval.
    dropTicks = 0
    lockTicks = 0
    // Raw has no ARE: its successor is spawned on the lock frame, like the
    // version before the movement refactor. genNextBlock() still settles the
    // locked piece first (line clears, level-up, top-out). calcNext() draws the
    // frame after this returns.
    if (areTicks <= 0) {
        areTicks = 0
        gameLog("Piece locked. No ARE; spawning the next piece.")
        genNextBlock()
        return
    }
    gameLog("Piece locked. ARE: " + areTicks + " ticks.")
}

// True when the piece cannot move one cell down from where it stands.
function isGrounded() {
    deleteCurrentFromBoard()
    var grounded = !testBlockPlace(currentBlock, cx, cy - 1)
    addCurrentToBoard()
    return grounded
}

// A downward move failed. Curves with a lock delay leave the piece where it is
// and let updateLockDelay() decide when it locks. The others lock it, but only
// when it was already resting when the frame began: a piece that lands during
// the frame gets that frame to be slid or rotated, and locks on the next one.
function pieceCouldNotMoveDown() {
    if (lockDelay()) return
    if (!restingAtFrameStart) return
    startAre()
}

// Count the frames a grounded piece has spent waiting. The timer restarts when
// the piece is no longer resting, and tryMove()/tryRotate() restart it earlier
// for the curves that allow move or step resets.
function updateLockDelay() {
    var cfg = lockDelay()
    if (!cfg || GameStopped || areTicks > 0) {
        lockTicks = 0
        return
    }
    if (!isGrounded()) {
        lockTicks = 0
        return
    }
    lockTicks++
    if (lockTicks >= cfg.ticks) {
        lockTicks = 0
        startAre()
    }
}

// True when a block is left in the hidden rows above the visible field. Those
// rows only exist so pieces can spawn above the field; a block that stays
// behind there once a piece has locked and the lines have cleared is a lock
// out, and ends the game just like a spawn that no longer fits.
function hasCellsAboveField() {
    for (var i = 0; i < 10; i++) {
        for (var j = 20; j < 25; j++) {
            if (board[i][j] != 0) return true;
        }
    }
    return false;
}

// Spawn the next piece, clear completed lines and detect a topped-out board:
// a block left above the field or a new piece that cannot be placed at its
// spawn location ends the game
function genNextBlock() {
    var id = randomizer.next();
    var type = TYPES[id];
    // The piece that just locked is still the current one; keep what Asuka's
    // Kita detection needs, because the assignments below replace it.
    var lockedBlock = currentBlock;
    var lockedX = cx;
    var lockedY = cy;
    var lockedType = currentBlockType;
    var lockedRotation = lastActionWasRotation;
    lastActionWasRotation = false;
    currentBlock = nextBlock;
    currentBlockType = nextBlockType;
    nextBlockType = type;
    gameLog("Generated new block of type: " + nextBlockType);
    nextBlock = makeBlockInSpawnState(type);
    // The rotation system decides how many hidden rows above the field the
    // piece starts on, so the spawn origin is read from the rotation rules.
    var origin = getSpawnOrigin(currentBlock);
    cx = origin[0];
    cy = origin[1];
    lockTicks = 0;
    gravityDemand = 0;

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
    // Asuka's Kita must be counted before the level-up rule runs, so the clear
    // that opens a section stop can also be the one that passes it.
    if (kitaTracking()) {
        awardAsukaKita(clearedLines, lineCount, lockedType, lockedRotation,
            lockedBlock, lockedX, lockedY);
    }
    if (difficulty().medalTracking) {
        awardMasterMedals(clearedLines, lineCount, lockedType, lockedRotation,
            lockedBlock, lockedX, lockedY);
    }
    // T-Spin bookkeeping for the stats panel. Runs while the completed rows are
    // still on the board, like the Kita and medal rules above.
    if (lockedType === "T" && lockedRotation && lineCount >= 1 && lineCount <= 3) {
        var spinKind = classifyTSpinAtLock(lockedBlock, lockedX, lockedY);
        if (spinKind) {
            recordTSpin(spinKind, lineCount);
            gameLog((spinKind === "mini" ? "Mini T-Spin " : "T-Spin ") +
                ["", "Single", "Double", "Triple"][lineCount] + " recorded.");
        }
    }
    updateLevelAfterLock(lineCount);
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

    // IRS: a rotation key held through the ARE pause changes the piece's spawn
    // orientation. The state is set first because the rotation rules and the
    // normal rotation path read it; tryInitialRotation() overwrites it only when
    // a kicked placement fits.
    currentRotationState = getSpawnState(currentBlockType);
    if (!initialSpawnPhase && initialRotationEnabled()) {
        var initialRotation = heldRotationAction();
        if (initialRotation) {
            var initialDirection = initialRotation === "rotateCCW" ? "ccw" : "cw";
            if (tryInitialRotation(initialDirection)) {
                heldDirs[initialRotation].ticks = 0;
            }
        }
    }

    // Two things end the game here, both checked after the clear so a line
    // clearing under a stack can still rescue it. Lock out: a block is left in
    // the hidden rows above the field. Block out: the new piece cannot be
    // placed at its spawn location. The piece is written to the board either
    // way, so the last piece shows up behind the failure message instead of the
    // field stopping on the piece before it.
    var lockOut = hasCellsAboveField();
    var blockSize = currentBlock.length;
    var spawnFits = blockSize === 0 || testBlockPlace(currentBlock, cx, cy, board);
    if (blockSize > 0) recordSpawn(currentBlockType);
    addBlockToBoard(board, currentBlock, cx, cy);

    if (lockOut || !spawnFits) {
        if (lockOut) gameLog("Lock out: a block was left above the visible field.");
        if (!spawnFits) gameLog("Block out: the new piece cannot be placed at its spawn location.");
        GameFailed = true;
        GameStopped = true;
        stopTimer();
        releaseAllDirs();
        document.getElementById("pauseBtn").value = "Pause";
        syncStartButton();
        draw();
        revealSeed();
        refreshStatsIfVisible();
        alert("You have failed! Final score: " + score.toString());
        return;
    }
    refreshStatsIfVisible();
}

// 1 left 2 right 3 rotate CW 4 down 5 auto-down 6 rotate CCW
function calcNext() {
    if (GameStopped) return
    requestQueue.forEach(i => {
        // A lock may have started the ARE pause in an earlier iteration; the
        // rest of the queue belongs to the piece that is no longer falling.
        if (GameStopped || areTicks > 0) return
        if (i == 1) {
            tryMove(-1, 0)
        } else if (i == 2) {
            tryMove(1, 0)
        } else if (i == 3) {
            tryRotate("cw")
        } else if (i == 6) {
            tryRotate("ccw")
        } else if (i == 4) {
            if (tryMove(0, -1)) {
                // A manual drop restarts gravity.
                dropTicks = 0
            } else {
                pieceCouldNotMoveDown()
            }
        } else if (i == 5) {
            if (!tryMove(0, -1)) {
                pieceCouldNotMoveDown()
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
    // Sega's level timer counts every frame, including the ARE pause.
    if (movement().levelTimer) segaLevelTimer++;
    // ARE: a locked piece has been in the board since the last drop; hold the
    // game still for areTicks so a held direction can be released before the
    // next piece appears. Input during the pause is ignored.
    if (areTicks > 0) {
        areTicks--
        if (areTicks === 0) {
            requestQueue = []
            genNextBlock()
            draw()
        }
        return
    }
    // Record whether the piece was already resting on the stack when the frame
    // began; input below is processed before gravity, so this is the honest
    // frame-start state for the no-lock-delay grace rule.
    restingAtFrameStart = isGrounded();
    // Held directions queue their repeats before gravity, so the player's move
    // lands in the same frame and ahead of the automatic drop.
    processHeldDirs();
    // The difficulty picks the falling curve. Accelerating curves (Modern, the
    // Custom scale) ask for a fraction of a row per tick or for several rows;
    // only whole rows are dropped and the fraction is kept for the next tick,
    // so 20G moves 20 cells in one frame. The discrete curves drop whole cells
    // on a fixed frame cadence instead.
    var gravityCfg = difficulty().gravity;
    if (gravityCfg.cellsPerTick) {
        // 20G and above is clamped to 25 rows a frame; the piece then lands on
        // the spawn tick instead of creeping down from above the field.
        gravityDemand += clampGravitySpeed(gravityCfg.cellsPerTick(level));
        // Adding a fraction such as 1/59 fifty-nine times can land a hair below
        // the integer, so the floor gets a tiny tolerance.
        var rows = Math.floor(gravityDemand + GRAVITY_EPSILON);
        if (rows > 0) {
            gravityDemand -= rows;
            if (gravityDemand < GRAVITY_EPSILON) gravityDemand = 0;
        }
        if (requestQueue.indexOf(4) < 0) {
            for (var r = 0; r < rows; r++) requestQueue.push(5);
        }
    } else {
        dropTicks++;
        // The frame cadence gets the same tolerance: a curve value a hair above
        // the tick count (say 0.9999999 frames late) still fires on that tick.
        if (dropTicks + GRAVITY_EPSILON >= gravityCfg.framesPerCell(level)) {
            dropTicks = 0;
            // A manual drop queued for this tick consumes the slot, so the
            // piece never falls two cells in one tick.
            if (requestQueue.indexOf(4) < 0) {
                var cells = gravityCfg.cellsPerDrop ? gravityCfg.cellsPerDrop(level) : 1;
                for (var c = 0; c < cells; c++) requestQueue.push(5);
            }
        }
    }
    calcNext();
    // Curves with a lock delay count the frames a grounded piece waits.
    updateLockDelay();
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
    readMovementConfig();
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
    areTicks = 0
    gravityDemand = 0
    lockTicks = 0
    initBoard()
    currentBlock = []
    nextBlock = []
    currentBlockType = ""
    nextBlockType = ""
    requestQueue = []
    releaseAllDirs()
    line = 0
    score = 0
    currentRotationState = "0"
    iDrought = 0
    maxIDrought = 0
    stats = { single: 0, double: 0, triple: 0, tetris: 0 }
    tSpinStats = { single: 0, double: 0, triple: 0, miniSingle: 0, miniDouble: 0 }
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
    readMovementConfig();
    resetLevel();
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
        releaseAllDirs()
        startTimer()
    } else {
        GameStopped = true
        document.getElementById("pauseBtn").value = "Unpause"
        releaseAllDirs()
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
    releaseAllDirs()
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
    var ids = ["randomizerSelect", "rotationSystemSelect", "seedInput", "randomStartCheckbox",
        "movementSelect", "difficultySelect", "startLevelInput"];
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

// Movement settings. The movement select and the difficulty select are
// independent: the movement owns timing, lock delay and the level rules, while
// the difficulty picks the falling-speed curve (and NES's CTWC variant or one of
// Sega's four arcade tables). The start level box depends on both: the Custom
// difficulty always spans -20 to 60, the standard ones use the movement's range.

function refreshDifficultyOptions() {
    var select = document.getElementById("difficultySelect");
    var list = movement().difficulties;
    var known = false;
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === gameDifficulty) known = true;
    }
    if (!known) gameDifficulty = movement().defaultDifficulty;
    if (!select) return;
    var html = "";
    for (var k = 0; k < list.length; k++) {
        html += '<option value="' + list[k].id + '"' +
            (list[k].id === gameDifficulty ? " selected" : "") + ">" + list[k].name + "</option>";
    }
    select.innerHTML = html;
}

function refreshStartLevelField() {
    var input = document.getElementById("startLevelInput");
    var min = minStartLevel(), max = maxStartLevel();
    if (gameStartLevel < min) gameStartLevel = min;
    if (gameStartLevel > max) gameStartLevel = max;
    if (!input) return;
    input.min = String(min);
    input.max = String(max);
    input.value = String(gameStartLevel);
}

function setMovement(name) {
    var select = document.getElementById("movementSelect");
    if (!MOVEMENT_DEFINITIONS.hasOwnProperty(name)) return;
    if (gameStarted) {
        if (select) select.value = gameMovement;
        return;
    }
    if (select) select.value = name;
    if (gameMovement === name) return;
    gameMovement = name;
    // A different movement brings its own difficulties and start level range.
    gameDifficulty = movement().defaultDifficulty;
    gameStartLevel = modeStartLevel();
    refreshDifficultyOptions();
    refreshStartLevelField();
    refreshStatsIfVisible();
}

function setDifficulty(id) {
    var select = document.getElementById("difficultySelect");
    if (gameStarted) {
        if (select) select.value = gameDifficulty;
        return;
    }
    var list = movement().difficulties, chosen = null;
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) chosen = list[i];
    }
    if (!chosen) return;
    var wasCustom = isCustomDifficulty();
    gameDifficulty = id;
    if (select) select.value = id;
    // Custom and standard levels mean different speeds, so refill the box when
    // entering or leaving the Custom scale. Default/CTWC keep the typed level.
    if (wasCustom !== isCustomDifficulty()) gameStartLevel = modeStartLevel();
    refreshStartLevelField();
    refreshStatsIfVisible();
}

function setStartLevel(value) {
    if (gameStarted) {
        refreshStartLevelField();
        return;
    }
    var lv = parseInt(value, 10);
    if (!isFinite(lv)) return;
    gameStartLevel = Math.max(minStartLevel(), Math.min(lv, maxStartLevel()));
    refreshStartLevelField();
    refreshStatsIfVisible();
}

// Read the movement controls into the game settings; used when a game starts
// and when the panel is re-synced after a reset.
function readMovementConfig() {
    var movementSelect = document.getElementById("movementSelect");
    if (movementSelect && MOVEMENT_DEFINITIONS.hasOwnProperty(movementSelect.value)) {
        gameMovement = movementSelect.value;
    }
    var list = movement().difficulties;
    var valid = false;
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === gameDifficulty) valid = true;
    }
    if (!valid) gameDifficulty = movement().defaultDifficulty;
    var difficultySelect = document.getElementById("difficultySelect");
    if (difficultySelect) {
        for (var k = 0; k < list.length; k++) {
            if (list[k].id === difficultySelect.value) gameDifficulty = difficultySelect.value;
        }
    }
    var levelInput = document.getElementById("startLevelInput");
    if (levelInput) {
        var chosenLevel = parseInt(levelInput.value, 10);
        if (isFinite(chosenLevel)) {
            gameStartLevel = Math.max(minStartLevel(), Math.min(chosenLevel, maxStartLevel()));
        }
    }
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

// T-Spins that cleared lines, split by the guideline labels. A three-line clear
// can only be a proper T-Spin, so there is no Mini Triple counter.
var tSpinStats = { single: 0, double: 0, triple: 0, miniSingle: 0, miniDouble: 0 };

function recordTSpin(kind, lineCount) {
    if (lineCount === 3) {
        tSpinStats.triple++;
    } else if (lineCount === 2) {
        if (kind === "mini") tSpinStats.miniDouble++;
        else tSpinStats.double++;
    } else if (lineCount === 1) {
        if (kind === "mini") tSpinStats.miniSingle++;
        else tSpinStats.single++;
    }
}

var pieceCounts = { I: 0, J: 0, L: 0, O: 0, S: 0, T: 0, Z: 0 };
var iDrought = 0;
var maxIDrought = 0;

function recordSpawn(type) {
    if (pieceCounts.hasOwnProperty(type)) pieceCounts[type]++;
    if (type === "I") {
        iDrought = 0;
    } else {
        iDrought++;
        if (iDrought > maxIDrought) maxIDrought = iDrought;
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

// Format a cells-per-frame value as a G figure, reducing the fraction so the
// custom practice difficulties can show the exact speed of the frozen level.
function formatGravity(cellsPerTick) {
    if (!cellsPerTick) return "0";
    if (Math.abs(cellsPerTick - Math.round(cellsPerTick)) < 1e-9) {
        return Math.round(cellsPerTick) + " G";
    }
    // Prefer the 1/65536 G grid (TGM3 Master, TGM4 Marathon); fall back to the
    // 1/256 G grid the other curves use, and to decimals when the reduced
    // fraction would be too unwieldy (Marathon's 1/65536 values).
    var num = Math.round(cellsPerTick * 65536);
    var den = 65536;
    if (Math.abs(num / den - cellsPerTick) > 1e-9) {
        num = Math.round(cellsPerTick * 256);
        den = 256;
    }
    var a = num, b = den;
    while (b) {
        var t = a % b;
        a = b;
        b = t;
    }
    num /= a;
    den /= a;
    if (den > 256) return (Math.round(cellsPerTick * 100) / 100) + " G";
    return num + "/" + den + " G";
}

function refreshStats() {
    var mode = document.getElementById("statsMode")
    var rnd = document.getElementById("statsRandomizer");
    var wk = document.getElementById("statsRotationSystem");
    var movementEl = document.getElementById("statsMovement");
    var ss = document.getElementById("statsStartLevel");
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
    if (movementEl) {
        var movementText = "Movement: " + movement().name;
        if (difficulty().name !== "Default" && movement().name !== "Raw") movementText += " (" + difficulty().name + ")";
        movementEl.textContent = movementText;
    }
    if (ss) {
        if (isCustomDifficulty()) {
            if (gameStartLevel >= 60) {
                ss.textContent = "Speed: 1 G";
            } else if (gameStartLevel > 0) {
                ss.textContent = "Speed: 1/" + (61 - gameStartLevel) + " G";
            } else if (gameStartLevel < 0) {
                ss.textContent = "Speed: " + (-gameStartLevel) + " G";
            } else {
                ss.textContent = "Speed: 0";
            }
        } else if (difficulty().customMode) {
            // The level is frozen, so show the speed the original mode has there.
            ss.textContent = "Start Level: " + gameStartLevel + "  Speed: " +
                formatGravity(difficulty().gravity.cellsPerTick(gameStartLevel));
        } else {
            ss.textContent = "Start Level: " + gameStartLevel;
        }
    }
    if (sc) {
        sc.textContent = "Level: " + level + "  Lines: " + line + "  Score: " + score;
        // Asuka gates each section on a Kita, so the counter has to be visible.
        if (kitaTracking()) sc.textContent += "  Kita: " + sectionKitas;
    }
    var tsp = document.getElementById("statsTSpins");
    if (tsp) {
        tsp.textContent = "T-Spins: " +
            "  Single: " + tSpinStats.single +
            "  Double: " + tSpinStats.double +
            "  Triple: " + tSpinStats.triple;
    }
    var mtsp = document.getElementById("statsMiniTSpins");
    if (mtsp) {
        mtsp.textContent = "Mini T-Spins: " +
            "  Single: " + tSpinStats.miniSingle +
            "  Double: " + tSpinStats.miniDouble;
    }
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
    if (streak) streak.textContent = "I Drought: " + iDrought + "  Max: " + maxIDrought;
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

function requestRotateCCW() {
    if (GameStopped || requestQueue.length >= 8) return
    requestQueue.push(6)
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

// Queue one movement for a held direction; picked up by calcNext() this tick.
function queueHeldMove(dir) {
    if (dir === "left") requestLeft()
    else if (dir === "right") requestRight()
    else if (dir === "rotate") requestUp()
    else if (dir === "rotateCCW") requestRotateCCW()
    else if (dir === "down") requestDown()
}

// Pressing a direction always moves once right away; the repeat comes later.
function pressDir(dir) {
    if (GameStopped) return
    var state = heldDirs[dir]
    if (!state || state.pressed) return
    state.pressed = true
    state.ticks = 0
    if (dir === "left" || dir === "right") lastHeldDir = dir
    if (dir === "rotate" || dir === "rotateCCW") lastHeldRotateDir = dir
    queueHeldMove(dir)
}

function releaseDir(dir) {
    var state = heldDirs[dir]
    if (!state || !state.pressed) return
    state.pressed = false
    state.ticks = 0
    if (lastHeldDir === dir) {
        lastHeldDir = heldDirs.right.pressed ? "right" : (heldDirs.left.pressed ? "left" : null)
    }
    if (lastHeldRotateDir === dir) {
        lastHeldRotateDir = heldDirs.rotateCCW.pressed ? "rotateCCW" :
            (heldDirs.rotate.pressed ? "rotate" : null)
    }
}

// The rotate key that wins when both are held: the one pressed last. Also used
// by IRS, which reads the same held state at the end of the ARE pause.
function heldRotationAction() {
    if (heldDirs.rotate.pressed && heldDirs.rotateCCW.pressed) {
        return lastHeldRotateDir || "rotate"
    }
    if (heldDirs.rotate.pressed) return "rotate"
    if (heldDirs.rotateCCW.pressed) return "rotateCCW"
    return null
}

// Drop every held direction. Needed on pause, game over, focus loss and when
// the on-screen buttons are rebuilt: a lost keyup/pointerup would otherwise
// keep the piece moving forever.
function releaseAllDirs() {
    ["left", "right", "down", "rotate", "rotateCCW"].forEach(function (dir) {
        heldDirs[dir].pressed = false
        heldDirs[dir].ticks = 0
    })
    lastHeldDir = null
    lastHeldRotateDir = null
}

// Turn the currently held directions into queued moves for this tick.
function processHeldDirs() {
    if (GameStopped) return

    // Raw movement leaves auto-shift to the operating system's key repeat: the
    // keyboard listener queues every repeat itself, and an on-screen button is
    // one move per press, so there is nothing to synthesise here.
    if (movement().nativeRepeat) return

    // With both horizontal directions held, the one pressed last wins.
    var dir = null
    if (heldDirs.left.pressed && heldDirs.right.pressed) dir = lastHeldDir || "left"
    else if (heldDirs.left.pressed) dir = "left"
    else if (heldDirs.right.pressed) dir = "right"

    if (dir) {
        var state = heldDirs[dir]
        state.ticks++
        if (state.ticks >= dasTicks() && (state.ticks - dasTicks()) % arrTicks() === 0) {
            queueHeldMove(dir)
        }
    }

    if (heldDirs.down.pressed) {
        heldDirs.down.ticks++
        if (heldDirs.down.ticks % softDropTicks() === 0) requestDown()
    }

    // Modern's Tetris Worlds difficulties repeat rotation while the key is
    // held. It uses the same shape as DAS: nothing repeats until the charge
    // has elapsed, then one rotation every rotateTicks(). Rotating restarts
    // the lock delay, so holding rotate is how a piece is kept alive at high
    // speed.
    var rotateDir = heldRotationAction()
    if (rotateDir && rotateTicks() > 0) {
        var rotateState = heldDirs[rotateDir]
        rotateState.ticks++
        var rotateCharge = dasTicks()
        if (rotateState.ticks >= rotateCharge &&
            (rotateState.ticks - rotateCharge) % rotateTicks() === 0) queueHeldMove(rotateDir)
    }
}

//#endregion

//#region Mobile Compatibility

var vBtnShown = false

// On-screen button handlers. Pointer events fire on touch-down instead of
// touch-up, so holding a button drives the same auto-shift as a held key. The
// pointer capture keeps sending pointerup even if the finger slides off the
// button, which is what stops a piece from moving forever.

function vbtnDown(action, evt) {
    if (evt) {
        evt.preventDefault()
        var el = evt.currentTarget
        if (el && el.setPointerCapture && evt.pointerId !== undefined) {
            try { el.setPointerCapture(evt.pointerId) } catch (e) { }
        }
    }
    pressDir(action)
}

function vbtnUp(action, evt) {
    if (evt) evt.preventDefault()
    releaseDir(action)
}

// Inline attributes for a direction button: pointer handlers where supported,
// the old click-only behaviour as a fallback for browsers without them.
function vbtnDirAttrs(action) {
    if (!window.PointerEvent) {
        var handler = action === "rotate" ? "requestUp()"
            : (action === "down" ? "requestDown()" : (action === "left" ? "requestLeft()" : "requestRight()"))
        return ' onclick="' + handler + '"'
    }
    var name = "'" + action + "', event"
    return ' onpointerdown="vbtnDown(' + name + ')"'
        + ' onpointerup="vbtnUp(' + name + ')"'
        + ' onpointercancel="vbtnUp(' + name + ')"'
        + ' onlostpointercapture="vbtnUp(' + name + ')"'
        + ' oncontextmenu="return false"'
}

// The keyboard hint only pays off when there is a keyboard. With the on-screen
// buttons up it is redundant, and on a narrow phone screen it is what wraps the
// score row onto a second line, so it appears and disappears with them.
function updateControlHint() {
    var hint = document.getElementById("controlHint");
    if (hint) hint.style.display = vBtnShown ? "none" : "";
}

function showVirtualBtns() {
    if (!gl) return;

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    draw();

    vBtnShown = !vBtnShown;

    currentScale = vBtnShown ? mobileScale : globalScale;

    var btnSize = "" + Math.floor(120 * currentScale)
    var fontSize = "" + Math.floor(40 * currentScale)

    // The buttons are about to be replaced, so any hold on them is gone.
    releaseAllDirs()

    if (vBtnShown) {
        var vBtn =
            '<input type="button" id="mobileStartBtn" class="vbtn" onclick="startButtonAction()" value="' + (!gameStarted ? "S" : (GameFailed ? "R" : "A")) + '" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<input type="button" class="vbtn"' + vbtnDirAttrs("rotate") + ' value="&uarr;" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<input type="button" class="vbtn" onclick="pauseGame()" value="P" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<br/>\n' +
            '<input type="button" class="vbtn"' + vbtnDirAttrs("left") + ' value="&larr;" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<input type="button" class="vbtn"' + vbtnDirAttrs("down") + ' value="&darr;" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
            '<input type="button" class="vbtn"' + vbtnDirAttrs("right") + ' value="&rarr;" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>'
        document.getElementById("btnBox").innerHTML = vBtn
    } else {
        document.getElementById("btnBox").innerHTML = ""
    }
    updateControlHint()
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
    refreshDifficultyOptions();
    refreshStartLevelField();
    setCanvas();
    initBoard();
    draw();

    if(windowWidth < windowHeight) showVirtualBtns();
};

// Map a key to the input action it triggers.
function arrowAction(evt) {
    // Leave browser shortcuts (Ctrl+Z and friends) alone.
    if (evt.ctrlKey || evt.metaKey || evt.altKey) return null;
    switch (evt.key) {
        case "ArrowUp": return "rotate";
        case "ArrowDown": return "down";
        case "ArrowLeft": return "left";
        case "ArrowRight": return "right";
        case "x":
        case "X": return "rotate";
        case "z":
        case "Z": return "rotateCCW";
    }
    return null;
}

document.onkeydown = function keydown(evt) {
    var action = arrowAction(evt);
    if (!action) return;
    evt.preventDefault();
    // Raw movement trusts the operating system's key repeat: every keydown,
    // the first and each repeated one, queues exactly one action. This is the
    // old version's feel; no DAS or ARR is involved.
    if (movement().nativeRepeat) {
        queueHeldMove(action);
        return;
    }
    // The other movements ignore the repeat flag: auto-shift generates the
    // repeats from processHeldDirs() instead, so the rate is the game's own.
    if (evt.repeat) return;
    pressDir(action);
};

document.onkeyup = function keyup(evt) {
    var action = arrowAction(evt);
    if (!action) return;
    evt.preventDefault();
    releaseDir(action);
};

// A keyup or pointerup never arrives when the page loses focus (tab switch,
// task switch, an incoming call, a native dialog). Releasing here prevents a
// direction from being stuck down after the page comes back.
window.onblur = function () {
    releaseAllDirs();
};

document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") releaseAllDirs();
});

//#endregion