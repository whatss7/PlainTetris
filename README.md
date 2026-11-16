# Plain Tetris

[Try it out! This supports mobile device too!](https://whatss7.github.io/PlainTetris/)

This is a simple Tetris program based on WebGL.

You can choose rotation system and randomizer for the tetris game.

## Features

- Ghost piece, next piece preview, score and line count.
- Config panel with randomizer, rotation system, wall kick toggle, random start and seed. Settings are locked while a game is running.
- Random Start mode fills the bottom 8 rows with 9, 8, ..., 2 random cells.
- A seed reproduces the same piece sequence and the same random start.
- Stats panel: line clear counts, tetris rate, piece counts, longest non-I streak, and the randomizer / rotation system of the current game (the seed is shown once the game ends).
- Keyboard and on-screen buttons for mobile.

This tetris will not accelerate as game proceeds.

## Randomizers

| Randomizer | Description |
| --- | --- |
| N-bag | Bags of n pieces is shuffled and used in order; A new bag is generated when the last piece is used. |
| NES | Rolls 0-7 for a piece; if the piece is the same as the previous one or the piece is dummy 7, it is rerolled in 0-6. |
| CTWC | Same as NES, but the first roll is in 0-6 range. |
| Game Boy | Pieces are compared as 3-bit vectors; a piece is rerolled while it and the previous piece are subsets of the one before (up to 3 draws). Piece distribution is not uniform. |
| Sega | A 32-bit LCG generates a 1000-piece sequence from the seed; the sequence repeats every 1000 pieces. |
| Arika TGM | First piece is I, J, L or T; up to 4 draws while the piece is in the last-4 history. |
| Arika TGM2 | Same as TGM with a 6-draw limit and a different initial history. |
| Arika TGM3 | Dynamic 35-piece pool; first piece is I, J, L or T; up to 6 draws avoiding the recent history. |
| Uniform | Every piece is drawn uniformly at random. |

## Rotation Systems

| System | Description |
| --- | --- |
| SRS | Guideline standard: pure rotation with the full wall kick tables, including floor kicks. |
| NES | Nintendo's rotation system as used on the NES. No wall kicks. |
| Game Boy | Nintendo's rotation system as used on the Game Boy. No wall kicks. |
| Sega | Sega's 1988 arcade rotation: flat side up and bottom-aligned when rotating. No wall kicks. |
| Arika | Sega-derived TGM rotation. Right kick is tried first, the I piece never kicks, and a rotation is refused when its first collision is in the centre column. |
| Arika SRS | SRS with Arika's symmetric I-piece kicks, so symmetric four-line clears work in both directions. |
| Tetris 64 | Four distinct states per piece rotating. O piece moves when rotated. Left kick is tried first. |

Wall kicks can be disabled for systems that support them by unchecking "Enable Wall Kick".

The project is licensed by MIT License with following exceptions:

The file `webgl-utils.js` is copyrighted 2010 Google Inc. and is licensed under the BSD-3-Clause License. See the header comments in that file for full license text and conditions.

`initShaders()` and `flatten()` modified from [Edward Angel's demo](https://www.cs.unm.edu/~angel/WebGL/), which is licensed by MIT License.
