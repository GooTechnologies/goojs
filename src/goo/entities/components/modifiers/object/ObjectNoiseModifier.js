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

	function ObjectNoiseModifier() {
		this.name = 'ObjectNoiseModifier';
		this.type = 'Object';

		this.vec = new Vector3();
		this.vec2 = new Vector3();
		this.power = 0;
		this.offset = new Vector3(0, 0, 0);
		this.strength = new Vector3(1, 1, 1);
		this.scale = 50;
	}

	ObjectNoiseModifier.prototype.gui = [
		{
			key: 'power',
			name: 'Power',
			type: 'float',
			mult: 0.1
		},
		{
			key: 'offset',
			name: 'Offset',
			type: 'vec3',
			mult: 0.01
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

	ObjectNoiseModifier.prototype.updateObject = function(target, allTargets, normalizedVert) {
		var position = target.transform.translation;
		var noise = ValueNoise.evaluate3d(
			position.x + this.offset.x * this.scale, 
			position.y + this.offset.y * this.scale, 
			position.z + this.offset.z * this.scale, this.scale);
		this.vec.setVector(normalizedVert).normalize().scale(noise * this.power);
		position.addVector(this.vec);
	};

	return ObjectNoiseModifier;
});