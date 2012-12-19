define(["goo/math/Matrix4x4", "goo/math/Vector", "goo/math/Vector3", "goo/math/Vector4"],
	function (Matrix4x4, Vector, Vector3, Vector4) {
	"use strict";

	/* ====================================================================== */

	function Transformation() {
		this.translation = new Vector3(0.0, 0.0, 0.0);
		this.rotation = new Vector3(0.0, 0.0, 0.0);
		this.scale = new Vector3(1.0, 1.0, 1.0);
		this.worldFromLocal = new Matrix4x4();
		this.localFromWorld = new Matrix4x4();
		this.doUpdate = true;
	}

	/* ====================================================================== */

	Transformation.prototype.worldFromLocalNormal = function (source, target) {
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

	Transformation.prototype.localFromWorldNormal = function (source, target) {
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

	Transformation.prototype.worldFromLocalVertex = function (source, target) {
		if (!target) {
			target = new Vector4();
		}

		if (target === source) {
			return Vector.copy(this.worldFromLocalVertex(source), target);
		}

		target.x = this.worldFromLocal.e00 * source.x + this.worldFromLocal.e01 * source.y + this.worldFromLocal.e02 * source.z + this.worldFromLocal.e03 * source.w;
		target.y = this.worldFromLocal.e10 * source.x + this.worldFromLocal.e11 * source.y + this.worldFromLocal.e12 * source.z + this.worldFromLocal.e13 * source.w;
		target.z = this.worldFromLocal.e20 * source.x + this.worldFromLocal.e21 * source.y + this.worldFromLocal.e22 * source.z + this.worldFromLocal.e23 * source.w;
		target.w = this.worldFromLocal.e30 * source.x + this.worldFromLocal.e31 * source.y + this.worldFromLocal.e32 * source.z + this.worldFromLocal.e33 * source.w;

		return target;
	};

	/* ====================================================================== */

	Transformation.prototype.localFromWorldVertex = function (source, target) {
		if (!target) {
			target = new Vector4();
		}

		if (target === source) {
			return Vector.copy(this.localFromWorldVertex(source), target);
		}

		target.x = this.localFromWorld.e00 * source.x + this.localFromWorld.e01 * source.y + this.localFromWorld.e02 * source.z + this.localFromWorld.e03 * source.w;
		target.y = this.localFromWorld.e10 * source.x + this.localFromWorld.e11 * source.y + this.localFromWorld.e12 * source.z + this.localFromWorld.e13 * source.w;
		target.z = this.localFromWorld.e20 * source.x + this.localFromWorld.e21 * source.y + this.localFromWorld.e22 * source.z + this.localFromWorld.e23 * source.w;
		target.w = this.localFromWorld.e30 * source.x + this.localFromWorld.e31 * source.y + this.localFromWorld.e32 * source.z + this.localFromWorld.e33 * source.w;

		return target;
	};

	/* ====================================================================== */

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
	};

	/* ====================================================================== */

	return Transformation;
});
