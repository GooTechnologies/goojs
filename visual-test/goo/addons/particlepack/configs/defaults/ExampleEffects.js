define({
	"effects":[
		{
			"id":"shrapnel",
			"renderer": "OccludingParticle",
			"spawnProbability":0.55,
			"effect_data":{
				"color0":[0.9, 0.8, 0.5],
				"color1":[0.9,0.7, 0.1],
				"colorRandom":0.4,
				"colorCurve":[[0, 1], [0.05, 0.6], [0.3, 1],[0.45, 0.4], [0.6, 1], [0.75, 0.3], [0.9,1 ], [1,0]],
				"count":8,
				"opacity":[0.3, 1],
				"alpha":[[0,1], [0.3, 1],[1,0]],
				"size":[0.55, 1.55],
				"growthFactor":[0, 2],
				"growth":[[0, 1], [1, 1]],
				"stretch":1,
				"strength":5,
				"spread":1,
				"acceleration":0.9997,
				"gravity":-9,
				"rotation":[0,7],
				"spin":"oneToZero",
				"spinspeed":[-5, 5],
				"lifespan":[0.2, 0.5],
				"sprite":"spark_seq",
				"loopcount":13,
				"trailsprite":"tail",
				"trailwidth":0.3
			}
		},
		{
			"id":"tracer",
			"renderer": "FastAdditiveTrail",
			"spawnProbability":0.25,
			"effect_data":{
				"color0":[0.9, 0.8, 0.5],
				"color1":[0.9,0.7, 0.1],
				"colorRandom":0.4,
				"colorCurve":[[0, 1], [0.05, 0.6], [0.3, 1],[0.45, 0.4], [0.6, 1], [0.75, 0.3], [0.9,1 ], [1,0]],
				"count":1,
				"opacity":[0.8, 1],
				"alpha":[[0,1], [0.3, 1],[1,0]],
				"size":[0.15, 0.15],
				"growthFactor":[0, 0],
				"growth":[[0, -1], [0.05, 1], [0.3, 2],[0.45, -2], [0.6, 1], [0.75, -1], [0.9,1 ], [1,0]],
				"stretch":1,
				"strength":42,
				"spread":0.011,
				"acceleration":0.9997,
				"gravity":-9,
				"rotation":[0,7],
				"spin":"oneToZero",
				"spinspeed":[-15, 15],
				"lifespan":[5, 5],
				"sprite":"dot_seq",
				"loopcount":15,
				"trailsprite":"tail",
				"trailwidth":0.3
			}
		},
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
			"spawnProbability":0.14,
			"effect_data":{
				"color0": [
					0.06517857089543675,
					0.04225718970066575,
					0.04675143472245335
				],
				"color1": [
					0.43392857093934194,
					0.43392857093934194,
					0.43392857093934194
				],
				"colorCurve": "oneToZero",
				"colorRandom": 0.05,
				"count": 3,
				"opacity":[0.2, 0.8],
				"alpha": "zeroOneZero",
				"size":[0.0, 0.3],
				"growthFactor": [1.11,4],
				"growth": "oneToZero",
				"stretch": 0.02,
				"strength": 4,
				"spread": 2,
				"acceleration": 0.98,
				"gravity": 11,
				"rotation": [0,7],
				"spin":"oneToZero",
				"spinspeed":[-0.4, 0.4],
				"lifespan":[0.7, 2.7],
				"sprite":"smokey",
				"loopcount":15,
				"trailsprite":"tail",
				"trailwidth":0.3
			}
		},
		{
			"id":"dirt",
			"renderer": "OccludingParticle",
			"spawnProbability":0.4,
			"effect_data":{
				"color0": [
					0.316517857089543675,
					0.24225718970066575,
					0.14675143472245335
				],
				"color1": [
					0.03392857093934194,
					0.03392857093934194,
					0.03392857093934194
				],
				"colorCurve": "oneToZero",
				"colorRandom": 0.08,
				"count": 8,
				"opacity":[0.7, 1],
				"alpha": "oneToZero",
				"size":[0.0, 0.0],
				"growthFactor": [0.1,2.5],
				"growth": "oneToZero",
				"stretch": 0.5,
				"strength": 7,
				"spread": 0.2,
				"acceleration": 0.997,
				"gravity": -9,
				"rotation": [0,7],
				"spin":"oneToZero",
				"spinspeed":[-0.4, 0.4],
				"lifespan":[0.1, 2.3],
				"sprite":"smokey",
				"loopcount":15,
				"trailsprite":"tail",
				"trailwidth":0.3
			}
		},
		{
			"id":"blood",
			"renderer": "OccludingParticle",
			"spawnProbability":0.2,
			"effect_data":{
				"color0": [
					0.556517857089543675,
					0.04225718970066575,
					0.04675143472245335
				],
				"color1": [
					0.13392857093934194,
					0.03392857093934194,
					0.03392857093934194
				],
				"colorCurve": "oneToZero",
				"colorRandom": 0.05,
				"count": 13,
				"opacity":[0.2, 1],
				"alpha": "zeroToOne",
				"size":[0.0, 0.0],
				"growthFactor": [0.1,5.5],
				"growth": "posToNeg",
				"stretch": 0.5,
				"strength": 3,
				"spread": 0.15,
				"acceleration": 0.97,
				"gravity": -9,
				"rotation": [0,7],
				"spin":"oneToZero",
				"spinspeed":[-0.4, 0.4],
				"lifespan":[0.1, 1.6],
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