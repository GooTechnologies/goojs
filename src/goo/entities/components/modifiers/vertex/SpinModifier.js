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

	function SpinModifier() {
		this.name = 'SpinModifier';

		this.matrix3 = new Matrix3x3();

		this.spinAngles = new Vector3(0, 0, 0);
	}

	SpinModifier.prototype.gui = [
		{
			key: 'spinAngles',
			name: 'Spin Angles',
			type: 'vec3',
			mult: 0.01
			// limit: [-1, 1]
		}
	];

	SpinModifier.prototype.updateValues = function() {};

	SpinModifier.prototype.updateVertex = function(data) {
		this.matrix3.setIdentity();
		this.matrix3.rotateX(this.spinAngles.x * data.normalizedVert.x * 2 * Math.PI);
		this.matrix3.rotateY(this.spinAngles.y * data.normalizedVert.y * 2 * Math.PI);
		this.matrix3.rotateZ(this.spinAngles.z * data.normalizedVert.z * 2 * Math.PI);

		this.matrix3.applyPost(data.position);
		this.matrix3.applyPost(data.normal);
	};

	return SpinModifier;
});