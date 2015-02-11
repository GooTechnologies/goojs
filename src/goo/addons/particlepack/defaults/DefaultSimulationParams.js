define({
	"id": "defaultConfig",
	"particle_params":[
		{
			"param":"color0",
			"value": [0.4, 0.7, 1, 1],
			"type": "color"
		},
		{
			"param":"color1",
			"value": [0.8, 0.2, 0, 1],
			"type": "color"
		},
		{
			"param":"colorCurve",
			"value": "oneToZero",
			"type": "curve",
			"values":   ["zeroToOne", "oneToZero", "zeroOneZero", "oneZeroOne", "growShrink"],
			"texts":    ["zeroToOne", "oneToZero", "zeroOneZero", "oneZeroOne", "growShrink"]
		},
		{
			"param":"colorRandom",
			"value": 0,
			"type": "number"
		},
		{
			"param":"count",
			"value": 25,
			"type": "number",
			"min": 1,
			"max": 200
		},
		{
			"param":"opacity",
			"value": [0.6, 1],
			"type": "range",
			"min": 0.0,
			"max": 1.0
		},
		{
			"param":"alpha",
			"value": "oneToZero",
			"type": "curve",
			"values":   ["zeroToOne", "oneToZero", "zeroOneZero", "oneZeroOne", "growShrink"],
			"texts":    ["zeroToOne", "oneToZero", "zeroOneZero", "oneZeroOne", "growShrink"]
		},
		{
			"param":"size",
			"value": [0.01, 0.1],
			"type": "range",
			"min": 0.0,
			"max": 10.0
		},
		{
			"param":"growthFactor",
			"value": [0.02, 0.6],
			"type": "range",
			"min": 0.0,
			"max": 10.0
		},
		{
			"param":"growth",
			"value": "posToNeg",
			"type": "curve",
			"values":["zeroToOne", "oneToZero", "zeroOneZero", "oneZeroOne", "posToNeg", "negToPos", "growShrink"],
			"texts": ["zeroToOne", "oneToZero", "zeroOneZero", "oneZeroOne", "posToNeg", "negToPos", "growShrink"]
		},
		{
			"param":"stretch",
			"value": 0,
			"type": "number",
			"min": 0.0,
			"max": 1.0
		},
		{
			"param":"strength",
			"value": 0,
			"type": "number",
			"min": 0.0,
			"max": 100.0
		},
		{
			"param":"spread",
			"value": 0.94,
			"type": "number",
			"min": 0.0,
			"max": 1.0
		},
		{
			"param":"acceleration",
			"value": 0.98,
			"type": "number",
			"min": 0.0,
			"max": 5.0
		},
		{
			"param":"gravity",
			"value": 0,
			"type": "number",
			"min": -20.0,
			"max": 20.0
		},
		{
			"param":"rotation",
			"value": [0, 6.29],
			"type": "range",
			"min": 0.0,
			"max": 6.29
		},

		{
			"param":"spin",
			"value": "posToNeg",
			"type": "curve",
			"values":["zeroToOne", "oneToZero", "zeroOneZero", "oneZeroOne", "posToNeg", "negToPos", "growShrink"],
			"texts": ["zeroToOne", "oneToZero", "zeroOneZero", "oneZeroOne", "posToNeg", "negToPos", "growShrink"]
		},
		{
			"param":"spinspeed",
			"value": [-15, 15],
			"type": "range",
			"min": -40.0,
			"max":  40.0
		},
		{
			"param": "lifespan",
			"value": [0.01, 4],
			"type": "range",
			"min": 0.0,
			"max": 25.0
		},
		{
			"param": "sprite",
			"value": "dot_seq",
			"type": "option",
			"values":["dot", "dot_seq","spark_seq", "trail_dot", "flaredot", "sparks"],
			"texts": ["dot", "dot_seq","spark_seq", "trail_dot", "flaredot", "sparks"]
		},
		{
			"param": "loopcount",
			"value": 5,
			"type": "number",
			"min": 1,
			"max": 100.0
		},
		{
			"param": "trailsprite",
			"value": "tail",
			"type": "option",
			"values":["dot","tail", "bluetrails", "wave", "waves", "dot_seq","spark_seq", "trail_dot", "flaredot", "sparks"],
			"texts": ["dot","tail", "bluetrails", "wave", "waves", "dot_seq","spark_seq", "trail_dot", "flaredot", "sparks"]
		},
		{
			"param": "trailwidth",
			"value": 0.2,
			"type": "number",
			"min": 0,
			"max": 10.0
		}
	]
});