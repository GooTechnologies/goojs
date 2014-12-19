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

	function BulgeNoiseModifier() {
		this.name = 'BulgeNoiseModifier';
		this.type = 'Vertex';

		this.scale = new Vector3(1, 1, 1);
	}

	BulgeNoiseModifier.prototype.gui = [
		{
			key: 'scale',
			name: 'Scale',
			type: 'vec3'
		}
	];

	BulgeNoiseModifier.prototype.updateVertex = function(data) {
		data.position.mulVector(this.scale);
	};

	return BulgeNoiseModifier;
});