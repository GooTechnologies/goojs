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

	function AlignModifier() {
		this.name = 'AlignModifier';
		this.type = 'Object';

		this.power = 0;
	}

	AlignModifier.prototype.gui = [
		{
			key: 'power',
			name: 'Power',
			type: 'float',
			limit: [0, 1]
		}
	];

	AlignModifier.prototype.updateObject = function(target, allTargets) {
		target.transform.translation.y = MathUtils.lerp(this.power, target.transform.translation.y, 0);
	};

	return AlignModifier;
});