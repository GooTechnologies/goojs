define([
	'goo/math/MathUtils',
	'goo/math/Matrix3x3',
	'goo/math/Vector3'
],
/** @lends */
function (
	MathUtils,
	Matrix3x3,
	Vector3
) {
	'use strict';

	function BendModifier() {
		this.name = 'BendModifier';

		this.matrix3 = new Matrix3x3();
		this.calcvec = new Vector3();
		this.dirvec = new Vector3();

		this.modifierType = 'Y';
		this.bendAngle = 0;
		this.offset = new Vector3(0, 0, 0);
	}

	BendModifier.prototype.gui = [
		{
			key: 'modifierType',
			name: 'Axis',
			type: 'dropdown',
			choices: ['X', 'Y', 'Z']
		},
		{
			key: 'bendAngle',
			name: 'Bend Angle',
			type: 'float',
			limit: [-1, 1]
		},
		{
			key: 'offset',
			name: 'Offset',
			type: 'vec3'
		}
	];

	BendModifier.prototype.updateVertex = function(data) {
		var position = data.position;
		var normal = data.normal;
		var normalizedVert = data.normalizedVert;

		data.position.addVector(this.offset);

		var angleval = 0;
		if (this.modifierType === 'X') {
			this.calcvec.setDirect(0, 0, -position.z);
			angleval = (this.bendAngle * normalizedVert.z);
			this.dirvec.setDirect(
				0,
				0,
				position.z * MathUtils.lerp(Math.abs(angleval * angleval), 1, 2 / Math.PI)
			);
		} else if (this.modifierType === 'Y') {
			this.calcvec.setDirect(-position.x, 0, 0);
			angleval = (this.bendAngle * normalizedVert.x);
			this.dirvec.setDirect(
				position.x * MathUtils.lerp(Math.abs(angleval * angleval), 1, 2 / Math.PI),
				0,
				0
			);
		} else if (this.modifierType === 'Z') {
			this.calcvec.setDirect(0, -position.y, 0);
			angleval = (this.bendAngle * normalizedVert.y);
			this.dirvec.setDirect(
				0,
				position.y * MathUtils.lerp(Math.abs(angleval * angleval), 1, 2 / Math.PI),
				0
			);
		}
		position.addVector(this.calcvec);

		this.matrix3.setIdentity();
		if (this.modifierType === 'X') {
			this.matrix3.rotateX(angleval * 1 * Math.PI);
		} else if (this.modifierType === 'Y') {
			this.matrix3.rotateY(angleval * 1 * Math.PI);
		} else if (this.modifierType === 'Z') {
			this.matrix3.rotateZ(angleval * 1 * Math.PI);
		}
		this.matrix3.applyPost(position);
		this.matrix3.applyPost(normal);

		this.matrix3.setIdentity();
		if (this.modifierType === 'X') {
			this.matrix3.rotateX(angleval * 0.5 * Math.PI);
		} else if (this.modifierType === 'Y') {
			this.matrix3.rotateY(angleval * 0.5 * Math.PI);
		} else if (this.modifierType === 'Z') {
			this.matrix3.rotateZ(angleval * 0.5 * Math.PI);
		}
		this.matrix3.applyPost(this.dirvec);
		position.addVector(this.dirvec);

		data.position.subVector(this.offset);
	};

	return BendModifier;
});