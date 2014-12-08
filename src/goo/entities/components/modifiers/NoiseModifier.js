define([
	'goo/noise/ValueNoise',
	'goo/math/Vector3'
],
/** @lends */
function (
	ValueNoise,
	Vector3
) {
	'use strict';

	function NoiseModifier() {
		this.name = 'NoiseModifier';

		this.vec = new Vector3();
		this.vec2 = new Vector3();
		this.power = 0;
		this.strength = new Vector3(1, 1, 1);
		this.scale = 1;
	}

	NoiseModifier.prototype.gui = [
		{
			key: 'power',
			name: 'Power',
			type: 'float',
			mult: 0.1
		},
		{
			key: 'strength',
			name: 'Strength',
			type: 'vec3',
			mult: 0.01
		},
		{
			key: 'scale',
			name: 'Scale',
			type: 'float',
			mult: 0.1
		}
	];

	NoiseModifier.prototype.updateVertex = function(data) {
		var noise = ValueNoise.evaluate3d(data.position.x, data.position.y, data.position.z, this.scale);
		this.vec.setVector(data.normal).scale(noise * this.power);
		data.position.addVector(this.vec);

		// this.vec.setVector(Vector3.ZERO);
		// this.vec.setVector(data.position);

		// for (var i = 0; i < this.power; i++) {
		// 	var noisex = ValueNoise.evaluate1d(data.position.x, this.scale);
		// 	var noisey = ValueNoise.evaluate1d(data.position.y, this.scale);
		// 	var noisez = ValueNoise.evaluate1d(data.position.z, this.scale);
		// 	this.vec2.setDirect(noisex, noisey, noisez).scale(0.1).mulVector(this.strength);
		// 	data.position.addVector(this.vec2);
		// }

		// data.position.addVector(this.vec);
	};

	return NoiseModifier;
});