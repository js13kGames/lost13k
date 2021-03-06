"use strict";

const TEXT_BUBBLE_STYLE = 1;
const TEXT_BUBBLE_TIME = 3;

const DEBUG_BORDER = 0;
const NOISE_RESOLUTION = 2048;

const SHORT_JUMP_DISTANCE = 80;

const PATH_STEPS = 10;
const PATH_STEP_DISTANCE = 100;
const PATH_ITERATIONS = 100;
const PATH_ANGLE_DIFF_MAX = 0.3;

const STAR_COUNT = 40;
const STAR_DISTANCE_TARGET = 30;
const STAR_DISTANCE_ITERATIONS = 100;

const BODY_TYPE_STAR = 0;
const BODY_TYPE_PLANET = 1;
const BODY_TYPE_MOON = 2;

const RESOURCE_LONG_JUMP = 0;
const RESOURCE_SHORT_JUMP = 1;
const RESOURCE_ROCKET = 2;

const GAME_STATE_NEW = 0;
const GAME_STATE_INTRO = 1;
const GAME_STATE_READY = 2;
const GAME_STATE_WON = 3;
const GAME_STATE_LOST = 4;

// [ [ h, s, l, type ], [ ... ], ... ]
let BODY_TYPE_DEFINITIONS =
[
	// star == 0
	[ [ 0.13, 1.0, 0.7, "warm" ], [ 0.5, 0.4, 0.9, "cold" ], [ 0, 0.8, 0.4, "dying red" ] ],
	
	// planet == 1
	[ [ 0.55, 0.5, 0.8, "icy" ], [ 0.25, 0.5, 0.5, "forest" ], [ 0.12, 0.7, 0.5, "deserted" ], [ 0, 0.5, 0.5, "rusty red" ] ],
	
	// moon == 2
	[ [ 0.55, 0.2, 0.9, "icy" ], [ 0, 0.0, 0.3, "rocky" ] ]
];

const SHAPE_CAT_BODY_SLEEPING = [
	0, 0,
	2, 2,
	10, 2,
	11, 3,
	11, 4,
	-2, 4,
	-4, 2,
	-4, -2,
	-2, -4,
	12, -4,
	14, -2,
	14, 2,
	12, 4,
	11, 4,
	0, 4
];

const SHAPE_CAT_HEAD_AWAKE = [
	0, 0,
	0, -4,
	1, -7,
	3, -4,
	6, -4,
	8, -7,
	9, -4,
	9, 0,
	7, 2,
	2, 2,
	0, 0
];

const SHAPE_CAT_BODY_RUNNING_1 = [
	0, -0,
	1, -2,
	7, -3,
	9, -5,
	8, -6,
	5, -8,
	4, -10,
	4, -12,
	5, -12,
	6, -11,
	6, -10,
	7, -8,
	9, -7,
	13, -8,
	23, -8,
	25, -4,
	25, -3,
	31, -1,
	30, -0,
	24, -1,
	21, -3,
	19, -2,
	16, -2,
	11, -3,
	10, -2,
	7, -1,
	0, 0
];

const SHAPE_CAT_HEAD_RUNNING = [
	0, -4,
	1, -5,
	2, -7,
	4, -9,
	4, -7,
	6, -6,
	7, -3,
	7, -2,
	6, -1,
	2, 0,
	0, -4
];

const SHAPE_CAT_BODY_RUNNING_2 = [
	15, 2,
	10, -1,
	10, -2,
	9, -3,
	9, -6,
	8, -9,
	9, -13,
	10, -13,
	10, -11,
	9, -9,
	10, -7,
	13, -8,
	23, -8,
	25, -4,
	24, -2,
	21, -1,
	18, 3,
	17, 2,
	18, -1,
	19, -2,
	14, -2,
	13, -4,
	13, -1,
	16, 1,
	15, 2
];

const SHAPE_CAT_EYE = [
	0, 0,
	0, 1.5
];
