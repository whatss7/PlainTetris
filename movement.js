// Movement and level rules
// Part of PlainTetris. Every movement, its difficulties, speed curves, ARE/DAS/lock schedules and
// level-up rules live here.
// Loaded before script.js; it only declares data and functions, and reads
// the game state (board, currentBlock, cx/cy, ...) at call time.

//#region Level and Speed

// Frames a piece takes to fall one cell, indexed by level. NES and Game Boy
// clamp to the last entry; a higher level keeps the same speed.
var NES_GRAVITY = [
    48, 43, 38, 33, 28, 23, 18, 13,  // 0-7
    8, 6,                            // 8-9
    5, 5, 5,                         // 10-12
    4, 4, 4,                         // 13-15
    3, 3, 3,                         // 16-18
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2,    // 19-28
    1                                // 29+
];

var GB_GRAVITY = [
    53, 49, 45, 41, 37, 33, 28, 22, 17, 11,  // 0-9
    10, 9, 8, 7, 6, 6, 5, 5, 4, 4,           // 10-19
    3                                        // 20
];

// One table per Sega difficulty, selected by the Difficulty setting.
var SEGA_GRAVITY = {
    easy: [48, 32, 24, 18, 14, 12, 10, 8, 6, 4, 12, 10, 8, 6, 4, 2],
    normal: [48, 24, 18, 15, 12, 10, 8, 6, 4, 2, 10, 8, 6, 4, 2, 1],
    hard: [40, 20, 16, 12, 10, 8, 6, 4, 2, 1, 10, 8, 6, 4, 2, 1],
    hardest: [30, 15, 12, 10, 8, 6, 4, 2, 1, 1, 8, 6, 4, 2, 1, 1]
};

// Sega's level timer must reach this many frames before a lock without a line
// clear raises the level. Levels 15 and above use the level 15 value.
function segaLevelTime(lv) {
    if (lv === 0) return 3480;
    if (lv <= 8) return 2320;
    if (lv <= 10) return 3480;
    if (lv <= 14) return 1740;
    return 3480;
}

// Whole frames a piece takes to fall one cell for the discrete curves. Levels
// past the end of a table keep the last (fastest) entry.
function nesFramesPerCell(lv) {
    return NES_GRAVITY[Math.min(lv, NES_GRAVITY.length - 1)];
}

function gbFramesPerCell(lv) {
    return GB_GRAVITY[Math.min(lv, GB_GRAVITY.length - 1)];
}

function segaFramesPerCell(difficultyId, lv) {
    var table = SEGA_GRAVITY[difficultyId] || SEGA_GRAVITY.normal;
    return table[Math.min(lv, table.length - 1)];
}

// TGM1 internal gravity in units of 1/256 G. A value applies from its level up
// to the level before the next entry, so levels 90-99 all fall at 64/256G. The
// curve drops sharply at level 200 and again at 420, and reaches 20G at 500.
var TGM_GRAVITY = [
    [0, 4], [30, 6], [35, 8], [40, 10], [50, 12], [60, 16], [70, 32],
    [80, 48], [90, 64], [100, 80], [120, 96], [140, 112], [160, 128],
    [170, 144], [200, 4], [220, 32], [230, 64], [233, 96], [236, 128],
    [239, 160], [243, 192], [247, 224], [251, 256], [300, 512],
    [330, 768], [360, 1024], [400, 1280], [420, 1024], [450, 768],
    [500, 5120]
];

// Last entry whose level is at or below lv, so each level range uses one
// discrete speed (the source data lists the level a value starts at).
function internalGravityFrom(table, lv) {
    var value = table[0][1];
    for (var i = 0; i < table.length; i++) {
        if (lv < table[i][0]) break;
        value = table[i][1];
    }
    return value;
}

function tgmInternalGravity(lv) {
    return internalGravityFrom(TGM_GRAVITY, lv);
}

// Rows a TGM piece asks for in one tick: Internal Gravity / 256.
function tgmCellsPerTick(lv) {
    return tgmInternalGravity(lv) / 256;
}

// TGM2 Normal mode internal gravity (1/256 G). It follows the TGM shape but on a
// different schedule: the curve restarts at levels 100 and 200 and reaches 20G at
// level 300, where the mode's level cap sits.
var TGM2_NORMAL_GRAVITY = [
    [0, 4], [8, 5], [19, 6], [35, 8], [40, 10], [50, 12], [60, 16],
    [70, 32], [80, 48], [90, 64], [100, 4], [108, 5], [119, 6],
    [125, 8], [131, 12], [139, 32], [149, 48], [156, 80], [164, 112],
    [174, 128], [180, 144], [200, 16], [212, 48], [221, 80], [232, 112],
    [244, 144], [256, 176], [267, 192], [277, 208], [287, 224],
    [295, 240], [300, 5120]
];

function tgm2NormalCellsPerTick(lv) {
    return internalGravityFrom(TGM2_NORMAL_GRAVITY, lv) / 256;
}

// TGM3 Easy mode internal gravity (1/256 G). The first hundred levels follow the
// TGM2 Normal shape, then the curve restarts at level 101 and reaches 20G at the
// mode's level cap of 200.
var TGM3_EASY_GRAVITY = [
    [0, 4], [8, 5], [19, 6], [35, 8], [40, 10], [50, 12], [60, 16],
    [70, 32], [80, 48], [90, 64], [101, 16], [112, 48], [121, 80],
    [132, 128], [144, 112], [156, 144], [167, 176], [177, 192],
    [200, 5120]
];

function tgm3EasyCellsPerTick(lv) {
    return internalGravityFrom(TGM3_EASY_GRAVITY, lv) / 256;
}

// TGM3 Master mode internal gravity in 1/65536 G. The arcade table uses the larger
// denominator so its values are integers; the ratios match TGM1 exactly, so level
// 251 is 1G and level 500 is 20G.
var TGM3_MASTER_GRAVITY = [
    [0, 1024], [30, 1536], [35, 2048], [40, 2560], [50, 3072],
    [60, 4096], [70, 8192], [80, 12288], [90, 16384], [100, 20480],
    [120, 24576], [140, 28672], [160, 32768], [170, 36864], [200, 1024],
    [220, 8192], [230, 16384], [233, 24576], [236, 32768], [239, 40960],
    [243, 49152], [247, 57344], [251, 65536], [300, 131072],
    [330, 196608], [360, 262144], [400, 327680], [420, 262144],
    [450, 196608], [500, 1310720]
];

function tgm3MasterCellsPerTick(lv) {
    return internalGravityFrom(TGM3_MASTER_GRAVITY, lv) / 65536;
}

// TGM4 gravity tables. Marathon runs on 1/65536 G over its fifteen levels; Normal
// and 1.1 reuse the 1/256 G shape of TGM1, except that the top step is 5376 (21G)
// instead of TGM1's 5120. 2.1, 3.1 and 4.1 are fixed 20G.
var TGM4_MARATHON_GRAVITY = [
    [1, 1092], [2, 1377], [3, 1767], [4, 2309], [5, 3076], [6, 4168],
    [7, 5748], [8, 8090], [9, 11619], [10, 17066], [11, 25401],
    [12, 39009], [13, 60681], [14, 99296], [15, 156038]
];

function tgm4MarathonCellsPerTick(lv) {
    return internalGravityFrom(TGM4_MARATHON_GRAVITY, lv) / 65536;
}

var TGM4_NORMAL_GRAVITY = [
    [0, 4], [30, 6], [35, 8], [40, 10], [50, 12], [60, 16], [70, 32],
    [80, 48], [90, 64], [100, 80], [120, 96], [140, 112], [160, 128],
    [170, 144], [200, 4], [220, 32], [230, 64], [233, 96], [236, 128],
    [239, 160], [243, 192], [247, 224], [251, 256], [300, 512], [330, 768],
    [360, 1024], [400, 1280], [420, 1024], [450, 768], [500, 5376]
];

function tgm4NormalCellsPerTick(lv) {
    return internalGravityFrom(TGM4_NORMAL_GRAVITY, lv) / 256;
}

// Asuka Easy, the slow introduction to TGM4's Asuka: a 1/256 G curve that falls
// back at level 500 and finishes with 21G at 800. Asuka Normal is a fixed 20G.
var ASUKA_EASY_GRAVITY = [
    [0, 4], [330, 6], [335, 8], [340, 10], [350, 12], [360, 16], [370, 32],
    [380, 48], [390, 64], [400, 80], [420, 96], [440, 112], [460, 128],
    [470, 144], [500, 4], [520, 32], [530, 64], [533, 96], [536, 128],
    [539, 160], [543, 192], [547, 224], [551, 256], [600, 512], [630, 768],
    [660, 1024], [700, 1280], [720, 1024], [750, 768], [800, 5376]
];

function asukaEasyCellsPerTick(lv) {
    return internalGravityFrom(ASUKA_EASY_GRAVITY, lv) / 256;
}

// Guideline (Tetris Worlds) curve: time per row in seconds is
// (0.8 - (level - 1) * 0.007) ^ (level - 1), so level 1 falls one row per
// second and level 19 is capped at 20G.
function modernSecondsPerRow(lv) {
    if (lv <= 1) return 1;
    if (lv > 19) return modernSecondsPerRow(19);
    return Math.pow(0.8 - (lv - 1) * 0.007, lv - 1);
}

// Rows the modern curve asks for in one tick; capped at 20 rows, i.e. 20G.
function modernCellsPerTick(lv) {
    return Math.min(1 / (modernSecondsPerRow(lv) * TICK_RATE), 20);
}

// Custom difficulty: level 0 does not fall at all; positive levels count frames
// per cell from the default, so 1 is 60 frames (1/60G), 2 is 59, and 60 is one
// cell per frame (1G). Negative levels count cells per frame instead: -1 is 1G,
// -20 the cap.
function customCellsPerTick(lv) {
    if (lv > 0) return 1 / (DROP_TICKS + 1 - lv);
    if (lv < 0) return Math.min(-lv, 20);
    return 0;
}

// Level-up rule shared by Modern, NES and Game Boy: every 10 total lines, up to
// maxLevel (Infinity for Modern's uncapped progression).
function lineLevelUp(maxLevel) {
    return function (clearedLineCount) {
        var changed = false;
        while (line >= nextLevelLine && level < maxLevel) {
            level++;
            nextLevelLine += 10;
            changed = true;
        }
        return changed;
    };
}

// Sega levels advance every 4 cleared lines, or when the level timer runs out
// after a lock that cleared nothing.
function segaLevelUp(clearedLineCount) {
    var changed = false;
    if (clearedLineCount > 0) {
        segaLevelLines += clearedLineCount;
        if (segaLevelLines >= 4) {
            level++;
            segaLevelLines = 0;
            changed = true;
        }
    } else if (segaLevelTimer >= segaLevelTime(level)) {
        level++;
        changed = true;
    }
    if (changed) segaLevelTimer = 0;
    return changed;
}

// TGM levels advance by one for every piece that locks and one more for every
// cleared line. The piece increment is refused while the last two digits are 99
// (99, 199, ..., 899) and at level 998; cleared lines always count, so a line
// clear is the only way past those stops. Level 999 is the cap and the game
// keeps running there (TGM1's staff-roll ending is not emulated).
function tgmLevelUp(clearedLineCount) {
    if (level >= 999) return false;
    var gained = clearedLineCount > 0 ? clearedLineCount : 0;
    if (level < 998 && level % 100 !== 99) gained += 1;
    if (gained === 0) return false;
    level = Math.min(999, level + gained);
    return true;
}

// TGM2/TGM3 delays shrink as the level rises. Each difficulty supplies a bucket
// table and the last bucket at or below the level wins. The buckets hold ARE,
// DAS and lock delay; the line-clear ARE difference is not modelled.
function timingFromBuckets(buckets) {
    return function (lv) {
        var current = buckets[0];
        for (var i = 0; i < buckets.length; i++) {
            if (lv < buckets[i].level) break;
            current = buckets[i];
        }
        return { are: current.are, das: current.das, lock: current.lock };
    };
}

var tgm2NormalTiming = timingFromBuckets([
    { level: 0, are: 27, das: 16, lock: 30 }
]);

var tgm2MasterTiming = timingFromBuckets([
    { level: 0, are: 27, das: 16, lock: 30 },
    { level: 500, are: 27, das: 10, lock: 30 },
    { level: 601, are: 27, das: 10, lock: 30 },
    { level: 701, are: 18, das: 10, lock: 30 },
    { level: 801, are: 14, das: 10, lock: 30 },
    { level: 901, are: 14, das: 8, lock: 17 }
]);

var tgm2DeathTiming = timingFromBuckets([
    { level: 0, are: 18, das: 12, lock: 30 },
    { level: 100, are: 14, das: 12, lock: 26 },
    { level: 200, are: 14, das: 11, lock: 22 },
    { level: 300, are: 8, das: 10, lock: 18 },
    { level: 400, are: 7, das: 8, lock: 15 },
    { level: 500, are: 6, das: 8, lock: 15 }
]);

// TGM2 levels count exactly like TGM, but a difficulty may cap the level
// (Normal stops at 300). The cap is a ceiling the counter cannot pass; it is not
// a game-over state, so the game keeps running at the cap.
function tgm2LevelUp(clearedLineCount) {
    var cap = difficulty().levelCap || 999;
    if (level >= cap) return false;
    var gained = clearedLineCount > 0 ? clearedLineCount : 0;
    if (level < 998 && level % 100 !== 99) gained += 1;
    if (gained === 0) return false;
    level = Math.min(level + gained, cap);
    return true;
}

// TGM3 level advance. Levels only move on line clears: in Easy a clear adds its
// line count, while Master and Shirase award bonus levels for triples (4) and
// Tetrises (6). Each mode stops at its own cap (Easy 200, Master 999, Shirase
// 1300), and the cap is a ceiling rather than a game-over state.
function tgm3LevelUp(clearedLineCount) {
    var cap = difficulty().levelCap || 999;
    if (level >= cap) return false;
    var gained = clearedLineCount > 0 ? clearedLineCount : 0;
    if (difficulty().lineBonus) {
        if (gained === 3) gained = 4;
        else if (gained === 4) gained = 6;
    }
    if (gained === 0) return false;
    level = Math.min(level + gained, cap);
    return true;
}

// TGM4 level rules. The regular modes still gain a level for every locked piece,
// and their line-clear table differs per mode; the levels ending in 99 and 998
// only move on line clears. 3.1 keeps the Shirase rule of counting clears only,
// and Marathon gains one level per ten cleared lines up to level 15.
function tgm4PieceLevelUp(lineTable) {
    return function (clearedLineCount) {
        var cap = difficulty().levelCap || 999;
        if (level >= cap) return false;
        var gained = 0;
        if (level < 998 && level % 100 !== 99) gained += 1;
        if (clearedLineCount > 0) gained += lineTable[clearedLineCount] || clearedLineCount;
        if (gained === 0) return false;
        level = Math.min(level + gained, cap);
        return true;
    };
}

function tgm4ClearOnlyLevelUp(lineTable) {
    return function (clearedLineCount) {
        var cap = difficulty().levelCap || 999;
        if (level >= cap) return false;
        var gained = clearedLineCount > 0 ? (lineTable[clearedLineCount] || clearedLineCount) : 0;
        if (gained === 0) return false;
        level = Math.min(level + gained, cap);
        return true;
    };
}

function tgm4MarathonLevelUp(clearedLineCount) {
    var cap = difficulty().levelCap || 15;
    if (level >= cap) return false;
    marathonLines += clearedLineCount;
    if (marathonLines < 10) return false;
    var gained = Math.floor(marathonLines / 10);
    marathonLines -= gained * 10;
    level = Math.min(level + gained, cap);
    return true;
}

var tgm4NormalLevelUp = tgm4PieceLevelUp([0, 1, 2, 3, 6]);
var tgm4T11LevelUp = tgm4PieceLevelUp([0, 1, 2, 3, 4]);
var tgm4T21LevelUp = tgm4PieceLevelUp([0, 1, 2, 3, 4]);
var tgm4T31LevelUp = tgm4ClearOnlyLevelUp([0, 1, 2, 4, 6]);
var tgm4T41LevelUp = tgm4PieceLevelUp([0, 1, 2, 3, 6]);

// TGM4 Master counts every locked piece and 1/2/3/6 per clear, with no section
// stop at the levels ending in 99 (the wiki notes the mode has no line-clear
// requirement to get past them), and caps at 2600.
function tgm4MasterLevelUp(clearedLineCount) {
    var cap = difficulty().levelCap || 2600;
    if (level >= cap) return false;
    var gained = 1;
    if (clearedLineCount > 0) {
        gained += [0, 1, 2, 3, 6][clearedLineCount] || clearedLineCount;
        // Medals are awarded before this rule runs, so the clear that earns a
        // medal threshold also benefits from it.
        if (difficulty().medalTracking) gained += masterMedalBonus();
    }
    level = Math.min(level + gained, cap);
    return true;
}

// Asuka counts a level for every locked piece and 1/2/3/6 per line clear, but a
// level ending in 99 only moves on a line clear: that is the section stop. Crossing
// into the next hundred needs at least one Kita in the current section, and the
// counter empties when the new section starts. Without a Kita the jump is clamped
// to the stop instead of being refused outright, so a clear at 98 still reaches 99.
function asukaLevelUp(clearedLineCount) {
    var cap = difficulty().levelCap || 1300;
    if (level >= cap) return false;
    var gained = 0;
    if (level % 100 !== 99) gained += 1;
    if (clearedLineCount > 0) gained += [0, 1, 2, 3, 6][clearedLineCount] || clearedLineCount;
    if (gained === 0) return false;
    var target = Math.min(level + gained, cap);
    var oldSection = Math.floor(level / 100);
    var newSection = Math.floor(target / 100);
    if (newSection > oldSection) {
        if (sectionKitas < 1) {
            gameLog("Section stop: a Kita is needed to advance.");
            target = Math.min(target, oldSection * 100 + 99, cap);
            if (target <= level) return false;
            level = target;
            return true;
        }
        sectionKitas = 0;
    }
    level = target;
    return true;
}

// True when the board has nothing left outside the rows that are about to be
// cleared; used for Asuka's All Clear Kita. Must run before the rows shift.
function boardIsEmptyExceptRows(clearedRows) {
    for (var j = 0; j < 25; j++) {
        if (clearedRows.indexOf(j) >= 0) continue;
        for (var i = 0; i < 10; i++) {
            if (board[i][j] != 0) return false;
        }
    }
    return true;
}

// Occupancy of one corner cell for the T-Spin test. The floor, the left/right
// walls count as occupied; above the playfield counts as empty.
function tSpinCellOccupied(bx, by) {
    if (bx < 0 || bx > 9 || by < 0) return true;
    if (by >= 25) return false;
    return board[bx][by] !== 0;
}

// Direction from the T's centre to its stem, in the piece matrix. The stem is
// the neighbour whose opposite cell is empty; the two line cells point at each
// other, so they are skipped. Returns [dx, dy] or null.
function tSpinStemDirection(block) {
    var n = block.length - 1;
    var c = Math.floor(n / 2);
    var dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (var d = 0; d < 4; d++) {
        var si = c + dirs[d][0], sj = c + dirs[d][1];
        if (si < 0 || si > n || sj < 0 || sj > n || !block[si][sj]) continue;
        var oi = c - dirs[d][0], oj = c - dirs[d][1];
        if (oi >= 0 && oi <= n && oj >= 0 && oj <= n && block[oi][oj]) continue;
        return dirs[d];
    }
    return null;
}

// Count the occupied corners. The four corners are the corners of the piece
// matrix, which for the T are the cells diagonally adjacent to its centre --
// not the corners of the occupied cells' bounding box, which would include the
// T's own line cells. The two corners on the stem side are the front corners.
function tSpinCornerCounts(block, x, y) {
    var n = block.length - 1;
    var stem = tSpinStemDirection(block);
    var corners = [[0, 0], [n, 0], [0, n], [n, n]];
    var front = 0, back = 0;
    for (var c = 0; c < corners.length; c++) {
        var ci = corners[c][0], cj = corners[c][1];
        var occupied = tSpinCellOccupied(x + ci, y + cj);
        var isFront = false;
        if (stem) {
            if (stem[0] !== 0) isFront = ci === (stem[0] > 0 ? n : 0);
            else isFront = cj === (stem[1] > 0 ? n : 0);
        }
        if (isFront) { if (occupied) front++; }
        else if (occupied) back++;
    }
    return { front: front, back: back };
}

// Three of the four corners occupied: a T-Spin, per the guideline 3-corner rule.
function isTSpinAtLock(block, x, y) {
    var counts = tSpinCornerCounts(block, x, y);
    return counts.front + counts.back >= 3;
}

// "proper" when both front corners are occupied, "mini" when only one front
// corner and both back corners are. The guideline exception: a rotation that
// kicked the piece two cells along one axis still counts as proper. Returns
// null when the position is not a T-Spin.
function classifyTSpinAtLock(block, x, y) {
    var counts = tSpinCornerCounts(block, x, y);
    if (counts.front + counts.back < 3) return null;
    if (counts.front === 2 && counts.back >= 1) return "proper";
    if (counts.front === 1 && counts.back === 2) {
        if (lastKickOffset &&
            Math.abs(lastKickOffset[0]) + Math.abs(lastKickOffset[1]) >= 3) {
            return "proper";
        }
        return "mini";
    }
    return null;
}

// A Tetris, a T-Spin Triple or an All Clear earns one Kita for the current
// section. Runs before the completed rows are removed, because the All Clear
// test looks at the board with those rows still in place.
function awardAsukaKita(clearedRows, lineCount, pieceType, wasRotation, block, x, y) {
    if (!kitaTracking() || lineCount === 0) return;
    var allClear = boardIsEmptyExceptRows(clearedRows);
    var kita = lineCount === 4 ||
        (lineCount === 3 && pieceType === "T" && wasRotation && isTSpinAtLock(block, x, y)) ||
        allClear;
    if (!kita) return;
    sectionKitas += 1;
    gameLog("Kita earned" + (allClear ? " (All Clear)" : "") +
        ". Section Kitas: " + sectionKitas);
}

// TGM4 Master medals. Only the three level-up medals are modelled: All Clear,
// Tetris and T-Spin Double/Triple. They have no counter of their own in the
// interface; the debug log records every award. The PIKII medal and the
// freeze-time effects of Master Pikii are not implemented. Each medal type adds
// one level per N medals on every clear.
function masterMedalBonus() {
    return Math.floor(masterMedals.allClear / 6) +
        Math.floor(masterMedals.tetris / 10) +
        Math.floor(masterMedals.tSpin / 16);
}

// Awards medals for the clear that just happened; runs before the completed rows
// are removed because the All Clear test looks at the board with them still in
// place. Must run before the level-up rule of the same lock.
function awardMasterMedals(clearedRows, lineCount, pieceType, wasRotation, block, x, y) {
    if (!difficulty().medalTracking || lineCount === 0) return;
    if (lineCount === 4) {
        masterMedals.tetris += 1;
        gameLog("Master medal: Tetris (" + masterMedals.tetris + " total).");
    }
    if (boardIsEmptyExceptRows(clearedRows)) {
        masterMedals.allClear += 1;
        gameLog("Master medal: All Clear (" + masterMedals.allClear + " total).");
    }
    if ((lineCount === 2 || lineCount === 3) && pieceType === "T" && wasRotation &&
        isTSpinAtLock(block, x, y)) {
        masterMedals.tSpin += 1;
        gameLog("Master medal: T-Spin (" + masterMedals.tSpin + " total).");
    }
}

// TGM3 delays, keyed by (speed) level. Easy keeps one schedule for the whole mode;
// Master and Shirase tighten ARE, DAS and lock delay as the level rises.
var tgm3EasyTiming = timingFromBuckets([
    { level: 0, are: 48, das: 14, lock: 30 }
]);

var tgm3MasterTiming = timingFromBuckets([
    { level: 0, are: 27, das: 16, lock: 30 },
    { level: 500, are: 27, das: 10, lock: 30 },
    { level: 600, are: 27, das: 10, lock: 30 },
    { level: 700, are: 18, das: 10, lock: 30 },
    { level: 800, are: 14, das: 10, lock: 30 },
    { level: 900, are: 14, das: 8, lock: 17 },
    { level: 1000, are: 8, das: 8, lock: 17 },
    { level: 1100, are: 7, das: 8, lock: 15 },
    { level: 1200, are: 6, das: 8, lock: 15 }
]);

var tgm3ShiraseTiming = timingFromBuckets([
    { level: 0, are: 12, das: 10, lock: 18 },
    { level: 100, are: 12, das: 8, lock: 18 },
    { level: 200, are: 12, das: 8, lock: 17 },
    { level: 300, are: 6, das: 8, lock: 15 },
    { level: 500, are: 6, das: 6, lock: 13 },
    { level: 600, are: 6, das: 6, lock: 12 },
    { level: 1100, are: 6, das: 6, lock: 10 },
    { level: 1200, are: 6, das: 6, lock: 8 },
    { level: 1300, are: 6, das: 6, lock: 15 }
]);

// TGM4 delays. Marathon uses one fast schedule; Normal (v1.7) and 1.1 are constant,
// while 2.1, 3.1 and 4.1 tighten like their arcade counterparts as the level rises.
// The line-clear ARE and the section speed boost are not modelled.
var tgm4MarathonTiming = timingFromBuckets([
    { level: 0, are: 7, das: 9, lock: 30 }
]);

var tgm4NormalTiming = timingFromBuckets([
    { level: 0, are: 32, das: 18, lock: 30 }
]);

var tgm4T11Timing = timingFromBuckets([
    { level: 0, are: 27, das: 14, lock: 30 }
]);

var tgm4T21Timing = timingFromBuckets([
    { level: 0, are: 18, das: 10, lock: 30 },
    { level: 100, are: 14, das: 10, lock: 26 },
    { level: 200, are: 14, das: 9, lock: 22 },
    { level: 300, are: 12, das: 8, lock: 20 },
    { level: 400, are: 10, das: 6, lock: 18 },
    { level: 500, are: 6, das: 6, lock: 15 }
]);

var tgm4T31Timing = timingFromBuckets([
    { level: 0, are: 12, das: 8, lock: 18 },
    { level: 100, are: 12, das: 6, lock: 18 },
    { level: 200, are: 12, das: 6, lock: 17 },
    { level: 300, are: 6, das: 6, lock: 15 },
    { level: 500, are: 6, das: 4, lock: 13 },
    { level: 600, are: 6, das: 4, lock: 12 },
    { level: 1100, are: 6, das: 4, lock: 10 },
    { level: 1200, are: 6, das: 4, lock: 8 },
    { level: 2000, are: 12, das: 6, lock: 17 }
]);

var tgm4T41Timing = timingFromBuckets([
    { level: 0, are: 6, das: 4, lock: 8 }
]);

// TGM4 Master delays (Standard DAS). The lock delay starts at 20 frames and
// tightens to 10 at 900, then the ARE jumps back to 12 from 1000 while the lock
// stays short. Line-clear ARE and frozen sections are not modelled.
var tgm4MasterTiming = timingFromBuckets([
    { level: 0, are: 12, das: 12, lock: 20 },
    { level: 300, are: 10, das: 12, lock: 20 },
    { level: 400, are: 9, das: 12, lock: 19 },
    { level: 501, are: 8, das: 10, lock: 19 },
    { level: 600, are: 7, das: 10, lock: 16 },
    { level: 700, are: 7, das: 10, lock: 14 },
    { level: 800, are: 7, das: 10, lock: 12 },
    { level: 801, are: 7, das: 8, lock: 12 },
    { level: 900, are: 6, das: 8, lock: 10 },
    { level: 1000, are: 12, das: 8, lock: 16 },
    { level: 1800, are: 12, das: 8, lock: 14 },
    { level: 1900, are: 12, das: 8, lock: 12 },
    { level: 2000, are: 12, das: 8, lock: 10 },
    { level: 2301, are: 12, das: 4, lock: 10 }
]);

// Asuka delays (Standard rule). Normal is a fixed 20G mode whose ARE, DAS and
// lock tighten with the level; Easy keeps one schedule for all 1000 levels.
var asukaNormalTiming = timingFromBuckets([
    { level: 0, are: 18, das: 14, lock: 30 },
    { level: 100, are: 14, das: 14, lock: 26 },
    { level: 200, are: 12, das: 14, lock: 18 },
    { level: 201, are: 12, das: 12, lock: 18 },
    { level: 301, are: 12, das: 10, lock: 18 },
    { level: 400, are: 12, das: 10, lock: 17 },
    { level: 500, are: 8, das: 10, lock: 15 },
    { level: 700, are: 6, das: 10, lock: 13 },
    { level: 701, are: 6, das: 8, lock: 13 },
    { level: 800, are: 6, das: 8, lock: 12 }
]);

var asukaEasyTiming = timingFromBuckets([
    { level: 0, are: 18, das: 12, lock: 30 }
]);


// The Custom difficulty carries the old Custom Speed option: it keeps the
// movement's timing but replaces the falling speed and never levels up.
function customDifficulty() {
    return {
        id: "custom",
        name: "Custom",
        custom: true,
        noLevelUp: true,
        gravity: { cellsPerTick: customCellsPerTick }
    };
}

// Fixed-level practice variant of one arcade mode. It freezes the level (no
// level-up) but keeps the mode's own gravity and delay curves, evaluated at
// that level, so the feel is the original mode's at that speed instead of the
// generic Custom scale. The TGM2, TGM3 and TGM4 modes change their delays (or
// their gravity) with the level, which is why they need this instead of
// customDifficulty(). TGM4 4.1 is the one mode without a Fixed entry: its speed
// and delays are constant, so a frozen-level copy would be the same mode.
function customModeDifficulty(base) {
    return {
        id: base.id + "-fixed",
        name: base.name + " Fixed",
        customMode: true,
        noLevelUp: true,
        levelCap: base.levelCap,
        timing: base.timing,
        gravity: base.gravity
    };
}

// Movement definitions. Everything that depends on the movement lives here:
// input timing, ARE, lock delay, start level range, the level-up rule and the
// difficulty list that picks a falling-speed curve. ARE and the first level-up
// line are functions, so areTicksForLock()/firstLevelLine() never test a name.
var MOVEMENT_DEFINITIONS = {
    modern: {
        name: "Modern",
        das: 10, arr: 2, softDrop: 2, rotate: 2,
        are: 2,
        lockDelay: { ticks: 30, reset: "move" },
        startLevel: { min: 1, max: 19, default: 1 },
        firstLevelLine: function (startLevel) { return startLevel * 10; },
        levelUp: lineLevelUp(Infinity),
        defaultDifficulty: "default",
        difficulties: [
            { id: "default", name: "Default", gravity: { cellsPerTick: modernCellsPerTick } },
            customDifficulty()
        ]
    },
    nes: {
        name: "NES",
        das: 16, arr: 6, softDrop: 2, rotate: 0,
        // NES ARE grows with the height the piece locked at. The movement owns
        // the range logic; areTicksForLock() only supplies the locked row.
        are: function (lockRow) {
            var group = lockRow <= 1 ? 0 : Math.floor((lockRow - 2) / 4) + 1;
            if (group > 4) group = 4;
            return 10 + group * 2;
        },
        lockDelay: null,
        startLevel: { min: 0, max: 19, default: 0 },
        firstLevelLine: function (startLevel) {
            return Math.min(startLevel * 10 + 10, Math.max(100, startLevel * 10 - 50));
        },
        levelUp: lineLevelUp(99),
        defaultDifficulty: "default",
        difficulties: [
            { id: "default", name: "Default", gravity: { framesPerCell: nesFramesPerCell } },
            {
                id: "ctwc",
                name: "CTWC",
                gravity: {
                    framesPerCell: function (lv) { return lv >= 39 ? 1 : nesFramesPerCell(lv); },
                    cellsPerDrop: function (lv) { return lv >= 39 ? 2 : 1; }
                }
            },
            customDifficulty()
        ]
    },
    gb: {
        name: "Game Boy",
        das: 24, arr: 9, softDrop: 3, rotate: 0,
        are: 2,
        lockDelay: null,
        startLevel: { min: 0, max: 9, default: 0 },
        firstLevelLine: function (startLevel) { return startLevel * 10 + 10; },
        levelUp: lineLevelUp(20),
        defaultDifficulty: "default",
        difficulties: [
            { id: "default", name: "Default", gravity: { framesPerCell: gbFramesPerCell } },
            customDifficulty()
        ]
    },
    sega: {
        name: "Sega",
        das: 20, arr: 1, softDrop: 1, rotate: 0,
        are: 30,
        lockDelay: { ticks: 30, reset: "step" },
        levelTimer: true,
        startLevel: { min: 0, max: 15, default: 0 },
        firstLevelLine: function (startLevel) { return startLevel * 10 + 10; },
        levelUp: segaLevelUp,
        // No Default entry: the four arcade speed tables are the difficulties.
        defaultDifficulty: "normal",
        difficulties: [
            { id: "easy", name: "Easy", gravity: { framesPerCell: function (lv) { return segaFramesPerCell("easy", lv); } } },
            { id: "normal", name: "Normal", gravity: { framesPerCell: function (lv) { return segaFramesPerCell("normal", lv); } } },
            { id: "hard", name: "Hard", gravity: { framesPerCell: function (lv) { return segaFramesPerCell("hard", lv); } } },
            { id: "hardest", name: "Hardest", gravity: { framesPerCell: function (lv) { return segaFramesPerCell("hardest", lv); } } },
            customDifficulty()
        ]
    },
    tgm: {
        name: "Arika TGM",
        das: 16, arr: 2, softDrop: 2, rotate: 2,
        are: 30,
        lockDelay: { ticks: 30, reset: "move" },
        startLevel: { min: 0, max: 999, default: 0 },
        // TGM counts pieces and lines instead of an explicit line threshold.
        firstLevelLine: function () { return Infinity; },
        levelUp: tgmLevelUp,
        defaultDifficulty: "default",
        difficulties: [
            { id: "default", name: "Default", gravity: { cellsPerTick: tgmCellsPerTick } },
            customDifficulty()
        ]
    },
    tgm2: {
        name: "Arika TGM2",
        das: 16, arr: 2, softDrop: 2, rotate: 2,
        are: 27,
        lockDelay: { ticks: 30, reset: "move" },
        startLevel: { min: 0, max: 999, default: 0 },
        // TGM2 counts pieces and lines like TGM1; Normal caps the counter at 300.
        firstLevelLine: function () { return Infinity; },
        levelUp: tgm2LevelUp,
        // The three arcade modes are the difficulties; Master is the standard.
        // Each mode also has a Custom practice variant that freezes the level.
        defaultDifficulty: "master",
        difficulties: (function () {
            var normal = {
                id: "normal", name: "Normal", levelCap: 300,
                timing: tgm2NormalTiming,
                gravity: { cellsPerTick: tgm2NormalCellsPerTick }
            };
            var master = {
                id: "master", name: "Master",
                timing: tgm2MasterTiming,
                gravity: { cellsPerTick: tgmCellsPerTick }
            };
            var death = {
                id: "death", name: "T.A. Death",
                timing: tgm2DeathTiming,
                // Death mode is a fixed 20G from the first piece.
                gravity: { cellsPerTick: function () { return 20; } }
            };
            return [
                normal, customModeDifficulty(normal),
                master, customModeDifficulty(master),
                death, customModeDifficulty(death)
            ];
        })()
    },
    tgm3: {
        name: "Arika TGM3",
        das: 16, arr: 2, softDrop: 2, rotate: 2,
        are: 27,
        lockDelay: { ticks: 30, reset: "move" },
        startLevel: { min: 0, max: 1300, default: 0 },
        // TGM3 levels move only on line clears, with triple and Tetris bonuses in
        // Master and Shirase, so there is no line threshold.
        firstLevelLine: function () { return Infinity; },
        levelUp: tgm3LevelUp,
        // The three arcade modes are the difficulties; Master is the standard.
        // Each mode also has a Custom practice variant that freezes the level.
        defaultDifficulty: "master",
        difficulties: (function () {
            var easy = {
                id: "easy", name: "Easy", levelCap: 200,
                timing: tgm3EasyTiming,
                gravity: { cellsPerTick: tgm3EasyCellsPerTick }
            };
            var master = {
                id: "master", name: "Master", levelCap: 999, lineBonus: true,
                timing: tgm3MasterTiming,
                gravity: { cellsPerTick: tgm3MasterCellsPerTick }
            };
            var shirase = {
                id: "shirase", name: "Shirase", levelCap: 1300, lineBonus: true,
                timing: tgm3ShiraseTiming,
                // Shirase is a fixed 20G for the whole game.
                gravity: { cellsPerTick: function () { return 20; } }
            };
            return [
                easy, customModeDifficulty(easy),
                master, customModeDifficulty(master),
                shirase, customModeDifficulty(shirase)
            ];
        })()
    },
    tgm4: {
        name: "Arika TGM4",
        das: 16, arr: 2, softDrop: 2, rotate: 2,
        are: 32,
        lockDelay: { ticks: 30, reset: "move" },
        startLevel: { min: 0, max: 2600, default: 0 },
        // Every TGM4 mode counts its own way, so the level-up rule sits on the
        // difficulty and no line threshold is used. Normal is the standard mode.
        firstLevelLine: function () { return Infinity; },
        levelUp: tgm4NormalLevelUp,
        defaultDifficulty: "normal",
        difficulties: (function () {
            var normal = {
                id: "normal", name: "Normal", levelCap: 999,
                timing: tgm4NormalTiming,
                gravity: { cellsPerTick: tgm4NormalCellsPerTick },
                levelUp: tgm4NormalLevelUp
            };
            var t11 = {
                id: "t11", name: "1.1", levelCap: 999,
                timing: tgm4T11Timing,
                gravity: { cellsPerTick: tgm4NormalCellsPerTick },
                levelUp: tgm4T11LevelUp
            };
            var t21 = {
                id: "t21", name: "2.1", levelCap: 999,
                timing: tgm4T21Timing,
                // 2.1, 3.1 and 4.1 are a fixed 20G from the first piece.
                gravity: { cellsPerTick: function () { return 20; } },
                levelUp: tgm4T21LevelUp
            };
            var t31 = {
                id: "t31", name: "3.1", levelCap: 2000,
                timing: tgm4T31Timing,
                gravity: { cellsPerTick: function () { return 20; } },
                levelUp: tgm4T31LevelUp
            };
            var t41 = {
                id: "t41", name: "4.1", levelCap: 999,
                timing: tgm4T41Timing,
                gravity: { cellsPerTick: function () { return 20; } },
                levelUp: tgm4T41LevelUp
            };
            var master = {
                id: "master", name: "Master", levelCap: 2600,
                timing: tgm4MasterTiming,
                // Master is a fixed 20G for the whole game.
                gravity: { cellsPerTick: function () { return 20; } },
                levelUp: tgm4MasterLevelUp,
                medalTracking: true
            };
            var marathon = {
                id: "marathon", name: "Marathon", levelCap: 15,
                timing: tgm4MarathonTiming,
                gravity: { cellsPerTick: tgm4MarathonCellsPerTick },
                levelUp: tgm4MarathonLevelUp
            };
            // Asuka and Asuka Easy are TGM4's hidden expert modes; they carry
            // their own level rule (a section stop needs a Kita) and are the only
            // modes with Kita tracking.
            var asuka = {
                id: "asuka", name: "Asuka", levelCap: 1300,
                timing: asukaNormalTiming,
                // Asuka Normal is a fixed 20G for the whole game.
                gravity: { cellsPerTick: function () { return 20; } },
                levelUp: asukaLevelUp,
                kitaTracking: true
            };
            var asukaEasy = {
                id: "asuka-easy", name: "Asuka Easy", levelCap: 1000,
                timing: asukaEasyTiming,
                gravity: { cellsPerTick: asukaEasyCellsPerTick },
                levelUp: asukaLevelUp,
                kitaTracking: true
            };
            return [
                normal, customModeDifficulty(normal),
                t11, customModeDifficulty(t11),
                t21, customModeDifficulty(t21),
                t31, customModeDifficulty(t31),
                // 4.1's gravity and delays are constant, so its Fixed variant
                // would be the same mode: it is the only TGM4 mode without one.
                t41,
                master, customModeDifficulty(master),
                marathon, customModeDifficulty(marathon),
                asuka, customModeDifficulty(asuka),
                asukaEasy, customModeDifficulty(asukaEasy)
            ];
        })()
    },
    // Raw is the feel of the version before the movement refactor. The keyboard
    // listener queues one action per keydown, operating-system repeats included,
    // so the repeat rate is the browser's instead of DAS/ARR; processHeldDirs()
    // synthesises nothing, and the on-screen buttons move once per press. The old
    // version also spawned the next piece on the lock frame, so Raw has neither
    // ARE nor a lock delay. Custom is the only difficulty: the start level is the
    // speed (the same -20..60 scale) and the game never levels up.
    raw: {
        name: "Raw",
        nativeRepeat: true,
        das: 0, arr: 0, softDrop: 0, rotate: 0,
        are: 0,
        lockDelay: null,
        startLevel: { min: -20, max: 60, default: 1 },
        firstLevelLine: function () { return 0; },
        levelUp: function () { return false; },
        defaultDifficulty: "custom",
        difficulties: [customDifficulty()]
    }
};

// Chosen in the config panel and read when a game starts.
var gameMovement = "modern";
var gameDifficulty = "custom";
var gameStartLevel = 1;

// Live level state for the running game.
var level = 0;              // current level, drives the gravity curve
var nextLevelLine = 0;      // Modern / NES / Game Boy: total lines for the next level
var segaLevelLines = 0;     // Sega: lines cleared since the last level-up
var segaLevelTimer = 0;     // Sega: frames since the last level-up
var marathonLines = 0;      // TGM4 Marathon: cleared lines since the last level-up
var sectionKitas = 0;       // Asuka: Kitas earned in the current section
var masterMedals = { allClear: 0, tetris: 0, tSpin: 0 }; // TGM4 Master: internal medal counts
var lastActionWasRotation = false; // Asuka: T-Spin detection for the next lock
var initialSpawnPhase = false; // true while initGame() builds the first piece and preview

// The selected movement definition and difficulty entry. Both fall back to the
// first entry so a stale name can never break the game loop.
function movement() {
    return MOVEMENT_DEFINITIONS[gameMovement] || MOVEMENT_DEFINITIONS.modern;
}

function difficulty() {
    var list = movement().difficulties;
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === gameDifficulty) return list[i];
    }
    return list[0];
}

// Asuka tracks a Kita counter. The flag sits on the difficulty (Asuka is a
// TGM4 mode), so look there first and fall back to the movement entry.
function kitaTracking() {
    return !!(difficulty().kitaTracking || movement().kitaTracking);
}

function isCustomDifficulty() {
    return !!difficulty().custom;
}

// Input timing for the selected movement. TGM2's delays shrink with the level,
// so a difficulty may provide a timing(level) function; the other movements use
// the fixed values from the movement table.
function levelTiming() {
    var d = difficulty();
    return d.timing ? d.timing(level) : null;
}

function dasTicks() {
    var timing = levelTiming();
    return timing ? timing.das : movement().das;
}

function arrTicks() {
    return movement().arr;
}

function softDropTicks() {
    return movement().softDrop;
}

// Ticks between repeated rotations while rotate is held; 0 means no auto-repeat.
function rotateTicks() {
    return movement().rotate || 0;
}

function lockDelay() {
    var timing = levelTiming();
    if (timing) return { ticks: timing.lock, reset: "move" };
    return movement().lockDelay || null;
}

// Lowest selectable start level: the Custom difficulty counts cells per frame
// below level 0 (down to -20), the modern curve is 1-based like the Guideline
// games, and the others start from 0.
function minStartLevel() {
    if (isCustomDifficulty()) return -20;
    return movement().startLevel.min;
}

// Highest selectable start level. The Custom difficulty's level still picks the
// falling speed (see customCellsPerTick()); it never levels up during a game. A
// difficulty with a level cap (TGM2 Normal) cannot start above that cap.
function maxStartLevel() {
    if (isCustomDifficulty()) return 60;
    var max = movement().startLevel.max;
    var cap = difficulty().levelCap;
    return cap ? Math.min(max, cap) : max;
}

// Default level for the current movement/difficulty.
function modeStartLevel() {
    if (isCustomDifficulty()) return 1;
    return movement().startLevel.default;
}

// Total line count of the first level-up; the movement decides the rule. The
// Custom difficulty has no line-based level-up, so it starts at 0.
function firstLevelLine() {
    if (isCustomDifficulty()) return 0;
    return movement().firstLevelLine(gameStartLevel);
}

function refreshLevelDisplay() {
    var el = document.getElementById("level");
    if (el) el.textContent = level.toString();
}

// Put the level state back to the start level; called when a game starts or is
// reset so the display and gravity never keep a previous game's level. Every
// movement starts at the selected level; the Custom difficulty never levels up.
function resetLevel() {
    gameStartLevel = Math.max(minStartLevel(), Math.min(gameStartLevel, maxStartLevel()));
    level = gameStartLevel;
    nextLevelLine = firstLevelLine();
    segaLevelLines = 0;
    segaLevelTimer = 0;
    marathonLines = 0;
    sectionKitas = 0;
    masterMedals.allClear = 0;
    masterMedals.tetris = 0;
    masterMedals.tSpin = 0;
    lastActionWasRotation = false;
    gravityDemand = 0;
    lockTicks = 0;
    refreshLevelDisplay();
}

// Advance the level after a lock. The rule lives on the difficulty when the mode
// has its own counting rule (TGM4's six modes), otherwise on the movement; the
// difficulty only says whether levels advance at all (Fixed variants never do).
function updateLevelAfterLock(clearedLineCount) {
    if (initialSpawnPhase) return;
    if (difficulty().noLevelUp) return;
    var rule = difficulty().levelUp || movement().levelUp;
    if (rule(clearedLineCount)) refreshLevelDisplay();
}

//#endregion
