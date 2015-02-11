"use strict";

define(function() {

	// Curve format:    [pointA, pointB]
	// Point:           [progress, amplitude]

	var curves = {
		"zeroToOne":    [[0, 0], [1, 1]],
		"oneToZero":    [[0, 1], [1, 0]],
		"quickFadeOut": [[0, 1], [0.9,1], [1,   0]],
		"quickFadeIn":  [[0, 0], [0.2,1], [1,   1]],
		"centerStep":   [[0, 0], [0.45,0],[0.55,1], [1, 1]],
		"quickInOut":   [[0, 0], [0.1,1], [0.9, 1], [1, 0]],
		"posToNeg":     [[0, 1], [1,-1]],
		"negToPos":     [[0,-1], [1, 1]],
		"zeroOneZero":  [[0, 0], [0.5,1], [1,  0]],
		"oneZeroOne":   [[0, 1], [0.5,0], [1,  1]],
		"growShrink":   [[0, 1], [0.5,0], [1, -2]]
	};

	var SimulationParameters = function(position, normal, simParams, effectData) {
		this.position = position;
		this.normal = normal;
		this.data = this.configureData(simParams, effectData);
	};

	SimulationParameters.prototype.configureData = function(simParams, effectData) {
		var data = {};

		for (var i = 0; i < simParams.length; i++) {

			var value;

			if (effectData[simParams[i].param]) {
				value = effectData[simParams[i].param];
			} else {
				value = simParams[i].value
			}

			if (simParams[i].type == "curve" && typeof(value) == 'string') {
                data[simParams[i].param] = curves[value];
			} else {
				data[simParams[i].param] = value;
			}
		}


		data.effectCount = data.count;
		return data;
	};

	return SimulationParameters
});