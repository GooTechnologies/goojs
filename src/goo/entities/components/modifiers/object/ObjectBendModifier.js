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

	function ObjectBendModifier() {
		this.name = 'ObjectBendModifier';
		this.type = 'Object';

		this.matrix3 = new Matrix3x3();
		this.calcvec = new Vector3();
		this.dirvec = new Vector3();

		this.modifierType = 'Y';
		this.bendAngle = 0;
		this.offset = new Vector3(0, 0, 0);
	}

	ObjectBendModifier.prototype.gui = [
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
			type: 'vec3',
			mult: 0.25
		}
	];

	ObjectBendModifier.prototype.updateObject = function(target, allTargets, normalizedVert) {
		var position = target.transform.translation;

		position.addVector(this.offset);

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
		// this.matrix3.applyPost(normal);
		
		Matrix3x3.combine(target.transform.rotation, this.matrix3, target.transform.rotation);

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

		position.subVector(this.offset);

	};

	return ObjectBendModifier;
});