define({
	"effects":[
		{
			"id":"fire",
			"renderer": "AdditiveParticle",
			"spawnProbability":0.2,
			"effect_data":{
				"color0": [
					0.8313725490196079,
					0.5525770287810265,
					0.2509803921568628
				],
				"color1": [
					0.8428571427567881,
					0.13922193830957738,
					0.21784039690703058
				],
				"colorCurve": "oneToZero",
				"colorRandom": 0.14,
				"count": 1,
				"opacity":[0.4, 1],
				"alpha": "zeroOneZero",
				"size":[0.0, 0.4],
				"growthFactor": [5.61,6],
				"growth": "posToNeg",
				"stretch": 0.02,
				"strength": 1,
				"spread": 1,
				"acceleration": 0.96,
				"gravity": 14.16,
				"rotation": [0,7],
				"spin":"oneToZero",
				"spinspeed":[-1, 1],
				"lifespan":[0.6, 1.7],
				"sprite":"smokey",
				"loopcount":15,
				"trailsprite":"tail",
				"trailwidth":0.3
			}
		},

		{
			"id":"smoke",
			"renderer": "StandardParticle",
			"spawnProbability":0.4,
			"effect_data":{
				"color0": [
					0.16517857089543675,
					0.14225718970066575,
					0.04675143472245335
				],
				"color1": [
					0.23392857093934194,
					0.23392857093934194,
					0.23392857093934194
				],
				"colorCurve": "oneToZero",
				"colorRandom": 0.05,
				"count": 1,
				"opacity":[0.4, 1],
				"alpha": "oneToZero",
				"size":[0.0, 1],
				"growthFactor": [1.61,3],
				"growth": "oneToZero",
				"stretch": 0.02,
				"strength": 2,
				"spread": 1,
				"acceleration": 0.96,
				"gravity": 11,
				"rotation": [0,7],
				"spin":"oneToZero",
				"spinspeed":[-0.4, 0.4],
				"lifespan":[0.6, 2.7],
				"sprite":"smokey",
				"loopcount":15,
				"trailsprite":"tail",
				"trailwidth":0.3
			}
		},

		{
			"id":"firework_blue",
			"renderer": "AdditiveParticleAndTrail",
			"spawnProbability":0.04,
			"effect_data":{
				"color0":[0.6,1, 1],
				"color1":[0.0,0.7, 1],
				"colorRandom":0.4,
				"colorCurve":[[0, 1], [0.05, 0.6], [0.3, 1],[0.45, 0.4], [0.6, 1], [0.75, 0.3], [0.9,1 ], [1,0]],
				"count":40,
				"opacity":[0.4, 1],
				"alpha":[[0,1], [0.3, 1],[1,0]],
				"size":[0.05, 0.12],
				"growthFactor":[0.01, 0.7],
				"growth":[[0, -1], [0.05, 1], [0.3, 2],[0.45, -2], [0.6, 1], [0.75, -1], [0.9,1 ], [1,0]],
				"stretch":1,
				"strength":12,
				"spread":0.6,
				"acceleration":0.97,
				"gravity":-9,
				"rotation":[0,7],
				"spin":"oneToZero",
				"spinspeed":[-15, 15],
				"lifespan":[1, 3],
				"sprite":"dot_seq",
				"loopcount":15,
				"trailsprite":"tail",
				"trailwidth":0.3
			}
		}
	]
});