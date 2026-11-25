# Plain Tetris

[Try it out! This supports mobile devices too!](https://whatss7.github.io/PlainTetris/)

This is a simple Tetris program based on WebGL.

## Configs

### Randomizers

The randomizer config decides the order in which the seven pieces arrive. Every randomizer is seeded, so one seed reproduces the same piece sequence.

| Randomizer | Description |
| --- | --- |
| N-bag | A bag of N pieces is shuffled and dealt in order; a new bag is generated when the last piece of the current one is used. |
| NES | Rolls 0-7 to choose a piece; if the result is the same as the previous piece or is the dummy value 7, it is rerolled in 0-6. |
| Game Boy | Pieces are compared as 3-bit vectors; a piece is rerolled while both it and the previous piece are subsets of the piece before the previous one (up to 3 draws). The piece distribution is not uniform. |
| Tetris DX | A reroll mechanism that has a flaw. The piece distribution is not uniform. |
| Sega | A 32-bit LCG generates a 1000-piece sequence from the seed; the sequence repeats every 1000 pieces. |
| Arika TGM | The first piece is I, J, L or T; after that, up to 4 draws are made until the piece is not in the four-piece history. |
| Arika TGM2 | Same as TGM with a 6-draw limit and a different initial history. |
| Arika TGM3 | A dynamic 35-piece pool; the first piece is I, J, L or T; up to 6 draws avoiding the recent history. |
| Uniform | Every piece is drawn uniformly at random. |

Leave "Seed" empty for a random seed; the stats panel reveals the seed that was used after the game ends, so the run can be replayed.

### Rotation Systems

Spawn position is part of the rotation system.

| System | Description |
| --- | --- |
| SRS | Guideline standard. Pure rotation with the full wall kick tables. |
| NES | Nintendo's rotation system as used on the NES. No wall kicks. |
| Game Boy | Nintendo's rotation system as used on the Game Boy. No wall kicks. |
| Tetris DX | The rotation system as used on Tetris DX. It's an early version of what would become SRS. A turn is tried about the box center first and then about a second center one cell off it. |
| Sega | Sega's 1988 arcade rotation: flat side up and bottom-aligned when rotating. No wall kicks. |
| Arika | Sega-derived TGM rotation. Right kick is tried first, the I piece never kicks, and a rotation is refused when the first colliding cell of the rotated piece is in the centre column. |
| Arika TGM3 | Same as Arika, but with additional wall and floor kicks for the I and T pieces. |
| Arika SRS | SRS with Arika's symmetric I-piece kicks, so symmetric four-line clears work in both directions. |
| Tetris 64 | Four distinct rotation states per piece. The O piece moves when rotated. The left kick is tried first. |

Wall kicks can be disabled for systems that support them by unchecking "Enable Wall Kick".

### Movement

The movement config sets the speed curve and the basic rules that differ between games: DAS, ARR, soft drop, ARE and lock delay. Line-clear ARE is not modelled separately from the normal ARE.

| System | Description |
| --- | --- |
| Modern | Guideline movement: 10-frame DAS, 1/2G ARR, 1/2G soft drop, 2-frame ARE, 30-frame lock delay with move reset (rotating in place does not hold the piece), and IRS in Default/Custom or rotation repeat in Tetris Worlds/TW Custom. |
| NES | 16-frame DAS, 1/6G ARR, 1/2G soft drop, ARE grows from 10 to 18 frames with the lock row, and no lock delay. |
| Game Boy | 24-frame DAS, 1/9G ARR, 1/3G soft drop, 2-frame ARE, and no lock delay. |
| Tetris DX | 9-frame DAS, 1/3G ARR, 1/2G soft drop, lock delay and ARE shrinks from 56 to 32 as level increases. ARE is cancellable. |
| Sega | 20-frame DAS, 1G ARR, 1G soft drop, 30-frame ARE, and a 30-frame lock delay with step reset. |
| Arika TGM | Tetris The Grand Master movement: 16-frame DAS, 1/2G ARR, 1/2G soft drop, 30-frame ARE, 30-frame lock delay with move reset, and IRS. |
| Arika TGM2 | Movement system of Tetris The Absolute The Grand Master 2; varies for different game modes. |
| Arika TGM3 | Movement system of Tetris The Grand Master 3 Terror-Instinct; varies for different game modes. |
| Arika TGM4 | Movement system of Tetris The Grand Master 4 Absolute Eye; varies for different game modes. |
| Raw (not recommended) | Every keydown the browser sends, repeats included, is one move or rotation, so DAS and ARR follow the browser's key repeat and an on-screen button moves exactly once per press. No ARE or lock delay. |

Note that a movement system does not imply the corresponding game mode. For example, the Arika TGM4 Master difficulty does not have features from the original game such as Pikii and Cyclone. Some per-game rule details such as TGM4's 8 move / 2 rotation reset limit are also not modelled: this project never imposes a reset limit.

Hard drop, sonic drop and hold are popular in modern Tetris games but are not implemented here: pieces can only be moved sideways, soft-dropped and rotated.

A "Custom" difficulty replaces the movement's speed curve with a level-controlled fall speed, while Arika TGM2, TGM3 and TGM4 instead offer per-mode "Fixed" variants that freeze the level and keep the mode's own speed and delays.

## Licensing

The project is licensed under the MIT License with the following exceptions:

The file `webgl-utils.js` is copyrighted 2010 Google Inc. and is licensed under the BSD-3-Clause License. See the header comments in that file for full license text and conditions.

`initShaders()` and `flatten()` are modified from [Edward Angel's demo](https://www.cs.unm.edu/~angel/WebGL/), which is licensed by MIT License.
