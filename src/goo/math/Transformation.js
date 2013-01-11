define(["goo/math/Matrix4x4", "goo/math/Vector", "goo/math/Vector3", "goo/math/Versor"], function (Matrix4x4, Vector, Vector3, Versor) {
	"use strict";

	/* ====================================================================== */

	/**
	 * @name Transformation
	 * @class Models a transformation node in a hierarchy using separate
	 *        translation, rotation and scale components. The class has two
	 *        matrix members which needs to be updated when either component
	 *        changes. This is done through setting the doUpdate member to true.
	 * @property {Vector3} translation Translation vector.
	 * @property {Versor} rotation Rotation represented using a versor.
	 * @property {Vector3} scale Scale vector.
	 * @property {Matrix4x4} parentFromChild A transformation matrix that
     *           transforms to the parent coordinate system from the child
     *           coordinate system.
	 * @property {Matrix4x4} childFromParent A transformation matrix that
     *           transforms to the child coordinate system from the parent
     *           coordinate system.
	 * @property {Boolean} doUpdate Indicates whether a matrix update is needed.
	 * @constructor
	 * @description Creates a new transformation.
	 * @param {Vector3} translation Translation vector.
	 * @param {Versor} rotation Rotation represented using a versor.
	 * @param {Vector3} scale Scale vector.
	 */

	function Transformation(translation, rotation, scale) {
		this.translation = translation || new Vector3(0.0, 0.0, 0.0);
		this.rotation = rotation || new Versor(1.0, 0.0, 0.0, 0.0);
		this.scale = scale || new Vector3(1.0, 1.0, 1.0);
		this.parentFromChild = new Matrix4x4();
		this.childFromParent = new Matrix4x4();
		this.doUpdate = true;
	}

	/* ====================================================================== */

	/**
	 * @description Transforms a normal to the parent coordinate system from the child coordinate system. The inverse transpose of the transformation matrix is applied to account for non-uniform scaling.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.parentFromChildNormal = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.parentFromChildNormal(source), target);
		}

		target.x = this.childFromParent.e00 * source.x + this.childFromParent.e10 * source.y + this.childFromParent.e20 * source.z;
		target.y = this.childFromParent.e01 * source.x + this.childFromParent.e11 * source.y + this.childFromParent.e21 * source.z;
		target.z = this.childFromParent.e02 * source.x + this.childFromParent.e12 * source.y + this.childFromParent.e22 * source.z;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a normal to the child coordinate system from the parent coordinate system. The inverse transpose of the transformation matrix is applied to account for non-uniform scaling.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.childFromParentNormal = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.childFromParentNormal(source), target);
		}

		target.x = this.parentFromChild.e00 * source.x + this.parentFromChild.e10 * source.y + this.parentFromChild.e20 * source.z;
		target.y = this.parentFromChild.e01 * source.x + this.parentFromChild.e11 * source.y + this.parentFromChild.e21 * source.z;
		target.z = this.parentFromChild.e02 * source.x + this.parentFromChild.e12 * source.y + this.parentFromChild.e22 * source.z;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a vector to the parent coordinate system from the child coordinate system. The transformation matrix is applied, excluding the translational part.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.parentFromChildVector = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.parentFromChildVector(source), target);
		}

		target.x = this.parentFromChild.e00 * source.x + this.parentFromChild.e01 * source.y + this.parentFromChild.e02 * source.z;
		target.y = this.parentFromChild.e10 * source.x + this.parentFromChild.e11 * source.y + this.parentFromChild.e12 * source.z;
		target.z = this.parentFromChild.e20 * source.x + this.parentFromChild.e21 * source.y + this.parentFromChild.e22 * source.z;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a vector to the child coordinate system from the parent coordinate system. The transformation matrix is applied, excluding the translational part.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.childFromParentVector = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.childFromParentVector(source), target);
		}

		target.x = this.childFromParent.e00 * source.x + this.childFromParent.e01 * source.y + this.childFromParent.e02 * source.z;
		target.y = this.childFromParent.e10 * source.x + this.childFromParent.e11 * source.y + this.childFromParent.e12 * source.z;
		target.z = this.childFromParent.e20 * source.x + this.childFromParent.e21 * source.y + this.childFromParent.e22 * source.z;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a vertex to the parent coordinate system from the child coordinate system. The transformation matrix is applied, including the translational part.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.parentFromChildVertex = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.parentFromChildVertex(source), target);
		}

		target.x = this.parentFromChild.e00 * source.x + this.parentFromChild.e01 * source.y + this.parentFromChild.e02 * source.z + this.parentFromChild.e03;
		target.y = this.parentFromChild.e10 * source.x + this.parentFromChild.e11 * source.y + this.parentFromChild.e12 * source.z + this.parentFromChild.e13;
		target.z = this.parentFromChild.e20 * source.x + this.parentFromChild.e21 * source.y + this.parentFromChild.e22 * source.z + this.parentFromChild.e23;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a vertex to the child coordinate system from the parent coordinate system. The transformation matrix is applied, including the translational part.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.childFromParentVertex = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.childFromParentVertex(source), target);
		}

		target.x = this.childFromParent.e00 * source.x + this.childFromParent.e01 * source.y + this.childFromParent.e02 * source.z + this.childFromParent.e03;
		target.y = this.childFromParent.e10 * source.x + this.childFromParent.e11 * source.y + this.childFromParent.e12 * source.z + this.childFromParent.e13;
		target.z = this.childFromParent.e20 * source.x + this.childFromParent.e21 * source.y + this.childFromParent.e22 * source.z + this.childFromParent.e23;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Updates the two matrix members using the translation, rotation and scale components.
	 * @return {Transformation} Self for chaining.
	 */

	Transformation.prototype.update = function () {
		if (!this.doUpdate) {
			return;
		}

		var m = this.rotation.toMatrix3x3();

		this.parentFromChild.e00 = m.e00 * this.scale.x;
		this.parentFromChild.e10 = m.e10 * this.scale.x;
		this.parentFromChild.e20 = m.e20 * this.scale.x;
		this.parentFromChild.e30 = 0.0;
		this.parentFromChild.e01 = m.e01 * this.scale.y;
		this.parentFromChild.e11 = m.e11 * this.scale.y;
		this.parentFromChild.e21 = m.e21 * this.scale.y;
		this.parentFromChild.e31 = 0.0;
		this.parentFromChild.e02 = m.e02 * this.scale.z;
		this.parentFromChild.e12 = m.e12 * this.scale.z;
		this.parentFromChild.e22 = m.e22 * this.scale.z;
		this.parentFromChild.e32 = 0.0;
		this.parentFromChild.e03 = this.translation.x;
		this.parentFromChild.e13 = this.translation.y;
		this.parentFromChild.e23 = this.translation.z;
		this.parentFromChild.e33 = 1.0;

		this.childFromParent.e00 = m.e00 / this.scale.x;
		this.childFromParent.e10 = m.e01 / this.scale.y;
		this.childFromParent.e20 = m.e02 / this.scale.z;
		this.childFromParent.e30 = 0.0;
		this.childFromParent.e01 = m.e10 / this.scale.x;
		this.childFromParent.e11 = m.e11 / this.scale.y;
		this.childFromParent.e21 = m.e12 / this.scale.z;
		this.childFromParent.e31 = 0.0;
		this.childFromParent.e02 = m.e20 / this.scale.x;
		this.childFromParent.e12 = m.e21 / this.scale.y;
		this.childFromParent.e22 = m.e22 / this.scale.z;
		this.childFromParent.e32 = 0.0;
		this.childFromParent.e03 = 0.0 - (m.e00 * this.translation.x + m.e10 * this.translation.y + m.e20 * this.translation.z) / this.scale.x;
		this.childFromParent.e13 = 0.0 - (m.e01 * this.translation.x + m.e11 * this.translation.y + m.e21 * this.translation.z) / this.scale.y;
		this.childFromParent.e23 = 0.0 - (m.e02 * this.translation.x + m.e12 * this.translation.y + m.e22 * this.translation.z) / this.scale.z;
		this.childFromParent.e33 = 1.0;

		this.doUpdate = false;

		return this;
	};

	/* ====================================================================== */

	return Transformation;
});
