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

	function ObjectSpinModifier() {
		this.name = 'ObjectSpinModifier';
		this.type = 'Object';

		this.matrix3 = new Matrix3x3();

		this.spinAngles = new Vector3(0, 0, 0);
	}

	ObjectSpinModifier.prototype.gui = [
		{
			key: 'spinAngles',
			name: 'Spin Angles',
			type: 'vec3',
			mult: 0.001
			// limit: [-1, 1]
		}
	];

	ObjectSpinModifier.prototype.updateObject = function(target, allTargets, normalizedVert) {
		this.matrix3.setIdentity();
		this.matrix3.rotateX(this.spinAngles.x * normalizedVert.x * 2 * Math.PI);
		this.matrix3.rotateY(this.spinAngles.y * normalizedVert.y * 2 * Math.PI);
		this.matrix3.rotateZ(this.spinAngles.z * normalizedVert.z * 2 * Math.PI);

		this.matrix3.applyPost(target.transform.translation);
		Matrix3x3.combine(target.transform.rotation, this.matrix3, target.transform.rotation);

	};

	return ObjectSpinModifier;
});