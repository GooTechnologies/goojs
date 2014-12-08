define([
	'goo/math/Matrix3x3',
	'goo/math/Vector3'
],
/** @lends */
function (
	Matrix3x3,
	Vector3
) {
	'use strict';

	function RandomNoiseModifier() {
		this.name = 'RandomNoiseModifier';

		this.noise = new Vector3(0, 0, 0);
	}

	RandomNoiseModifier.prototype.gui = [
		{
			key: 'noise',
			name: 'Noise',
			type: 'vec3',
			mult: 0.01
		}
	];

	RandomNoiseModifier.prototype.updateVertex = function(data) {
		data.position.addDirect(this.noise.x * (Math.random() - 0.5), this.noise.y * (Math.random() - 0.5), this.noise.z * (Math.random() - 0.5));
	};

	return RandomNoiseModifier;
});