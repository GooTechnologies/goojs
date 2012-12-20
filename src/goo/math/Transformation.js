define(["goo/math/Matrix4x4", "goo/math/Vector", "goo/math/Vector3"], function (Matrix4x4, Vector, Vector3) {
	"use strict";

	/* ====================================================================== */

	/**
	 * @name Transformation
	 * @class Models a transformation node in a hierarchy using separate
	 *        translation, rotation and scale components (vectors). The class
     *        has two matrix members which needs to be updated when either
     *        component changes. This is done through setting the doUpdate
     *        member to true.
	 * @property {Vector3} translation Translation vector.
	 * @property {Vector3} rotation Rotation vector (Euler angles).
	 * @property {Vector3} scale Scale vector.
	 * @property {Matrix4x4} worldFromLocal A transformation matrix that
     *           transforms to the world coordinate system from the local
     *           coordinate system.
	 * @property {Matrix4x4} localFromWorld A transformation matrix that
     *           transforms to the local coordinate system from the world
     *           coordinate system. 
	 * @property {Boolean} doUpdate Indicates whether a matrix update is needed.
	 * @constructor
	 * @description Creates a new transformation.
	 * @param {Vector3} translation Translation vector.
	 * @param {Vector3} rotation Rotation vector (Euler angles).
	 * @param {Vector3} scale Scale vector.
	 */

	// REVIEW: How should rotations be represented? Euler angles? Versors? Matrices?

	function Transformation(translation, rotation, scale) {
		this.translation = translation || new Vector3(0.0, 0.0, 0.0);
		this.rotation = rotation || new Vector3(0.0, 0.0, 0.0);
		this.scale = scale || new Vector3(1.0, 1.0, 1.0);
		this.worldFromLocal = new Matrix4x4();
		this.localFromWorld = new Matrix4x4();
		this.doUpdate = true;
	}

	/* ====================================================================== */

	/**
	 * @description Transforms a normal to the world coordinate system from the local coordinate system. The inverse transpose of the transformation matrix is applied to account for non-uniform scaling.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.worldFromLocalNormal = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.worldFromLocalNormal(source), target);
		}

		target.x = this.localFromWorld.e00 * source.x + this.localFromWorld.e10 * source.y + this.localFromWorld.e20 * source.z;
		target.y = this.localFromWorld.e01 * source.x + this.localFromWorld.e11 * source.y + this.localFromWorld.e21 * source.z;
		target.z = this.localFromWorld.e02 * source.x + this.localFromWorld.e12 * source.y + this.localFromWorld.e22 * source.z;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a normal to the local coordinate system from the world coordinate system. The inverse transpose of the transformation matrix is applied to account for non-uniform scaling.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.localFromWorldNormal = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.localFromWorldNormal(source), target);
		}

		target.x = this.worldFromLocal.e00 * source.x + this.worldFromLocal.e10 * source.y + this.worldFromLocal.e20 * source.z;
		target.y = this.worldFromLocal.e01 * source.x + this.worldFromLocal.e11 * source.y + this.worldFromLocal.e21 * source.z;
		target.z = this.worldFromLocal.e02 * source.x + this.worldFromLocal.e12 * source.y + this.worldFromLocal.e22 * source.z;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a vector to the world coordinate system from the local coordinate system. The transformation matrix is applied, excluding the translational part.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.worldFromLocalVector = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.worldFromLocalVector(source), target);
		}

		target.x = this.worldFromLocal.e00 * source.x + this.worldFromLocal.e01 * source.y + this.worldFromLocal.e02 * source.z;
		target.y = this.worldFromLocal.e10 * source.x + this.worldFromLocal.e11 * source.y + this.worldFromLocal.e12 * source.z;
		target.z = this.worldFromLocal.e20 * source.x + this.worldFromLocal.e21 * source.y + this.worldFromLocal.e22 * source.z;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a vector to the local coordinate system from the world coordinate system. The transformation matrix is applied, excluding the translational part.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.localFromWorldVector = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.localFromWorldVector(source), target);
		}

		target.x = this.localFromWorld.e00 * source.x + this.localFromWorld.e01 * source.y + this.localFromWorld.e02 * source.z;
		target.y = this.localFromWorld.e10 * source.x + this.localFromWorld.e11 * source.y + this.localFromWorld.e12 * source.z;
		target.z = this.localFromWorld.e20 * source.x + this.localFromWorld.e21 * source.y + this.localFromWorld.e22 * source.z;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a vertex to the world coordinate system from the local coordinate system. The transformation matrix is applied, including the translational part.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.worldFromLocalVertex = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.worldFromLocalVertex(source), target);
		}

		target.x = this.worldFromLocal.e00 * source.x + this.worldFromLocal.e01 * source.y + this.worldFromLocal.e02 * source.z + this.worldFromLocal.e03;
		target.y = this.worldFromLocal.e10 * source.x + this.worldFromLocal.e11 * source.y + this.worldFromLocal.e12 * source.z + this.worldFromLocal.e13;
		target.z = this.worldFromLocal.e20 * source.x + this.worldFromLocal.e21 * source.y + this.worldFromLocal.e22 * source.z + this.worldFromLocal.e23;

		return target;
	};

	/* ====================================================================== */

	/**
	 * @description Transforms a vertex to the local coordinate system from the world coordinate system. The transformation matrix is applied, including the translational part.
	 * @param {Vector3} source Source vector.
	 * @param {Vector3} [target] Target vector.
	 * @return {Vector3} A new vector if the target vector is omitted, else the target vector.
	 */

	Transformation.prototype.localFromWorldVertex = function (source, target) {
		if (this.doUpdate) {
			this.update();
		}

		if (!target) {
			target = new Vector3();
		}

		if (target === source) {
			return Vector.copy(this.localFromWorldVertex(source), target);
		}

		target.x = this.localFromWorld.e00 * source.x + this.localFromWorld.e01 * source.y + this.localFromWorld.e02 * source.z + this.localFromWorld.e03;
		target.y = this.localFromWorld.e10 * source.x + this.localFromWorld.e11 * source.y + this.localFromWorld.e12 * source.z + this.localFromWorld.e13;
		target.z = this.localFromWorld.e20 * source.x + this.localFromWorld.e21 * source.y + this.localFromWorld.e22 * source.z + this.localFromWorld.e23;

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

		var sx = Math.sin(this.rotation.x);
		var cx = Math.cos(this.rotation.x);
		var sy = Math.sin(this.rotation.y);
		var cy = Math.cos(this.rotation.y);
		var sz = Math.sin(this.rotation.z);
		var cz = Math.cos(this.rotation.z);

		var a = cz * cy;
		var b = sz * cy;
		var c = 0.0 - sy;
		var d = cz * sy * sx - sz * cx;
		var e = sz * sy * sx + cz * cx;
		var f = cy * sx;
		var g = cz * sy * cx + sz * sx;
		var h = sz * sy * cx - cz * sx;
		var i = cy * cx;

		this.worldFromLocal.e00 = a * this.scale.x;
		this.worldFromLocal.e10 = b * this.scale.x;
		this.worldFromLocal.e20 = c * this.scale.x;
		this.worldFromLocal.e30 = 0.0;
		this.worldFromLocal.e01 = d * this.scale.y;
		this.worldFromLocal.e11 = e * this.scale.y;
		this.worldFromLocal.e21 = f * this.scale.y;
		this.worldFromLocal.e31 = 0.0;
		this.worldFromLocal.e02 = g * this.scale.z;
		this.worldFromLocal.e12 = h * this.scale.z;
		this.worldFromLocal.e22 = i * this.scale.z;
		this.worldFromLocal.e32 = 0.0;
		this.worldFromLocal.e03 = this.translation.x;
		this.worldFromLocal.e13 = this.translation.y;
		this.worldFromLocal.e23 = this.translation.z;
		this.worldFromLocal.e33 = 1.0;

		this.localFromWorld.e00 = a / this.scale.x;
		this.localFromWorld.e10 = d / this.scale.y;
		this.localFromWorld.e20 = g / this.scale.z;
		this.localFromWorld.e30 = 0.0;
		this.localFromWorld.e01 = b / this.scale.x;
		this.localFromWorld.e11 = e / this.scale.y;
		this.localFromWorld.e21 = h / this.scale.z;
		this.localFromWorld.e31 = 0.0;
		this.localFromWorld.e02 = c / this.scale.x;
		this.localFromWorld.e12 = f / this.scale.y;
		this.localFromWorld.e22 = i / this.scale.z;
		this.localFromWorld.e32 = 0.0;
		this.localFromWorld.e03 = 0.0 - (a * this.translation.x + b * this.translation.y + c * this.translation.z) / this.scale.x;
		this.localFromWorld.e13 = 0.0 - (d * this.translation.x + e * this.translation.y + f * this.translation.z) / this.scale.y;
		this.localFromWorld.e23 = 0.0 - (g * this.translation.x + h * this.translation.y + i * this.translation.z) / this.scale.z;
		this.localFromWorld.e33 = 1.0;

		this.doUpdate = false;

		return this;
	};

	/* ====================================================================== */

	return Transformation;
});
