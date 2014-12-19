define([
	'goo/math/Matrix3x3',
	'goo/math/MathUtils',
	'goo/math/Vector3'
],
/** @lends */
function (
	Matrix3x3,
	MathUtils,
	Vector3
) {
	'use strict';

	function ObjectScaleModifier() {
		this.name = 'ObjectScaleModifier';
		this.type = 'Object';

		this.scale = new Vector3(1, 1, 1);
	}

	ObjectScaleModifier.prototype.gui = [
		{
			key: 'scale',
			name: 'Scale',
			type: 'vec3'
		}
	];

	ObjectScaleModifier.prototype.updateObject = function(target) {
		target.transform.translation.mulVector(this.scale);
	};

	return ObjectScaleModifier;
});