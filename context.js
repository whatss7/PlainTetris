var gl
var board = []
var currentBlock = []
var nextBlock = []
var requestQueue = []
var line = 0
var score = 0
var GameStopped = false
var GameFailed = false
var resetTimerScheduled = false

var timer1, timer2

var globalScale = 1
var mobileScale = 1
var currentScale = 1

//#region Constants

var d_colors = [
    [0.0, 0.0, 0.0],
    [1.0, 0.0, 0.0],
    [1.0, 0.5, 0.0],
    [1.0, 1.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 1.0],
    [0.0, 0.5, 0.5],
    [0.5, 0.0, 1.0],
    [0.1, 0.1, 0.1]
]

var blocks = [
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
]

var scores = [0, 100, 200, 400, 800]

var initPos = [3, 3, 3, 3, 3, 3, 3]

var canvasWidth = 500
var canvasHeight = 600

//#endregion

//#region Render functions | draw()

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

var vertices = []
var colors = []

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
                colors.push(d_colors[shadowBoard[i][j]])
            }
        }
    }
}

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
                else colors.push(d_colors[nextBlock[i - leftGap][j - leftGap]])
            }
        }
    }
}

function draw() {
    var canvas = document.getElementById("gl-canvas");

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vertices = []
    colors = []

    drawBoard();
    drawNext();

    // Load the data into the GPU

    var vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Load the data into the GPU

    var cBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    render();

    gl.deleteBuffer(vBufferId);
    gl.deleteBuffer(cBufferId);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}

function setCanvas() {
    var canvas = document.getElementById("gl-canvas");

    canvas.width = Math.floor(canvasWidth * currentScale);
    canvas.height = Math.floor(canvasHeight * currentScale);

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);    //Background Color
}
//#endregion

//#region Logics
var cx, cy  //position of current block

function genNextBlock() {
    var id = Math.floor(Math.random() * 7)
    var blockSize = blocks[id].length
    currentBlock = nextBlock
    nextBlock = []
    // Transpose and flip (a.k.a. rotate) the matrix to get the correct shape
    for (var i = 0; i < blockSize; i++) {
        nextBlock.push([])
        for (var j = 0; j < blockSize; j++) {
            nextBlock[i].push(blocks[id][blockSize - 1 - j][i])
        }
    }
    cx = 3
    cy = 20

    var clearedLines = []

    // Test if any lines can be cleared
    for (var j = 0; j < 20; j++) {
        var flag = true
        for (var i = 0; i < 10; i++) {
            if (board[i][j] == 0) {
                flag = false
                break
            }
        }
        if (flag) {
            clearedLines.push(j)
        }
    }

    // Clear lines if so
    var lineCount = clearedLines.length
    score += scores[lineCount]
    line += lineCount
    for (var i = 0; i < 10; i++) {
        for (var it = lineCount - 1; it >= 0; it--) {
            for (var j = clearedLines[it] + 1; j < 25; j++) {
                board[i][j - 1] = board[i][j]
            }
            board[i][24] = 0;
        }
    }
    document.getElementById("score").textContent = score.toString()
    document.getElementById("count").textContent = line.toString()

    // Test if any block is out of bound
    for (var i = 0; i < 10; i++) {
        for (var j = 20; j < 25; j++) {
            if (board[i][j] != 0) {
                GameFailed = true
                GameStopped = true
                document.getElementById("startBtn").value = "Start"
                break
            }
        }
        if (GameStopped) break
    }

    if (GameStopped) {
        alert("You have failed! Final score: " + score.toString())
        clearInterval(timer1)
        clearInterval(timer2)
    }

    // Put new block in place
    blockSize = currentBlock.length
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            board[cx + i][cy + j] = currentBlock[i][j]
        }
    }
}

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

function initGame() {
    initBoard()
    currentBlock = []
    nextBlock = []
    requestQueue = []
    line = 0
    score = 0
    GameFailed = false
    genNextBlock()
    genNextBlock()
}

// 1 left 2 right 3 up 4 down 5 auto-down
function calcNext() {
    if (GameStopped) return
    requestQueue.forEach(i => {
        if (i == 1) {
            tryMove(-1, 0)
        } else if (i == 2) {
            tryMove(1, 0)
        } else if (i == 3) {
            tryRotate()
        } else if (i == 4) {
            if (tryMove(0, -1)) {
                resetTimerScheduled = true
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
    draw()
    if (resetTimerScheduled) {
        resetTimerScheduled = false;
        setTimer();
    }
}

function testBlockPlace(newBlock, x, y) {
    var blockSize = newBlock.length;
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (newBlock[i][j] != 0) {
                var ni = x + i, nj = y + j
                if (ni < 0 || nj < 0 || ni >= 10 || nj >= 25 || board[ni][nj] != 0) {
                    return false;
                }
            }
        }
    }
    return true;
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

function addCurrentToBoard() { addBlockToBoard(board, currentBlock, cx, cy); }

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

function tryMove(dx, dy) {
    // Calculate the new position of the block
    var ncx = cx + dx, ncy = cy + dy

    deleteCurrentFromBoard()
    var result = testBlockPlace(currentBlock, ncx, ncy);
    if (result) { cx = ncx, cy = ncy; }
    addCurrentToBoard()

    return result
}

function tryRotate() {
    // Calculate the new shape of the block
    var newBlock = rotateClockwise(currentBlock);

    deleteCurrentFromBoard()
    var result = testBlockPlace(newBlock, cx, cy);
    if (result) { currentBlock = newBlock; }
    addCurrentToBoard()

    return result
}

function copyMatrix(dst, src) {
    for (var i = 0; i < src.length; i++) {
        dst.push([])
        for (var j = 0; j < src[i].length; j++) {
            dst[i].push(src[i][j])
        }
    }
}

function getShadowBoard() {
    var result = []
    var shadowBlock = []
    copyMatrix(result, board)
    copyMatrix(shadowBlock, currentBlock)
    var blockSize = currentBlock.length
    if(blockSize == 0) return result;
    for (var i = 0; i < blockSize; i++) {
        for (var j = 0; j < blockSize; j++) {
            if (shadowBlock[i][j] != 0) {
                shadowBlock[i][j] = 8;
            }
        }
    }
    deleteCurrentFromBoard();
    var maxDownDistance = 0;
    for (; testBlockPlace(shadowBlock, cx, cy - maxDownDistance); maxDownDistance++);
    maxDownDistance--;
    addCurrentToBoard();
    addBlockToBoard(result, shadowBlock, cx, cy - maxDownDistance);
    addBlockToBoard(result, currentBlock, cx, cy);
    return result;
}

function setTimer() {
    clearInterval(timer1)
    clearInterval(timer2)
    timer1 = setInterval(calcNext, 100);
    timer2 = setInterval(() => {
        requestQueue.push(5)
    }, 1000);
}

function clearTimer() {
    clearInterval(timer1)
    clearInterval(timer2)
}

function startGame() {
    GameStopped = false
    document.getElementById("startBtn").value = "Retry"
    document.getElementById("pauseBtn").value = "Pause"
    initGame()
    setTimer()
    requestQueue = []
}

function pauseGame() {
    if (GameStopped) {
        if (GameFailed) return
        GameStopped = false
        document.getElementById("pauseBtn").value = "Pause"
        requestQueue = []
        setTimer()
    } else {
        GameStopped = true
        document.getElementById("pauseBtn").value = "Unpause"
        clearTimer()
    }
}
//#endregion

//#region Mobile Compability
var vBtnShown = false

function showVirtualBtns() {

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    draw();

    vBtnShown = !vBtnShown;

    currentScale = vBtnShown ? mobileScale : globalScale;

    var btnSize = "" + Math.floor(120 * currentScale)
    var fontSize = "" + Math.floor(40 * currentScale)

    if (vBtnShown) {
        var vBtn =
            '<input type="button" onclick="startGame()" value="S" style="width:' + btnSize + 'px;height:' + btnSize + 'px;font-size:' + fontSize + 'px"/>\n' +
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

function requestUp() {
    if (GameStopped) return
    requestQueue.push(3)
}

function requestDown() {
    if (GameStopped) return
    requestQueue.push(4)
}

function requestLeft() {
    if (GameStopped) return
    requestQueue.push(1)
}

function requestRight() {
    if (GameStopped) return
    requestQueue.push(2)
}
//#endregion

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

    setCanvas();
    initBoard();
    draw();
};

document.onkeydown = function keydown(evt) {
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
    }
}
