define(["goo/math/Vector"],
	function(Vector) {
		"use strict";

		/**
		 * Creates a new four-dimensional vector.
		 * 
		 * @name Vector4
		 * @class Four-dimensional vector class
		 * @param x {Float} X-component of vector
		 * @param y {Float} Y-component of vector
		 * @param z {Float} Z-component of vector
		 * @param w {Float} W-component of vector
		 */

		Vector4.prototype = Object.create(Vector.prototype);

		function Vector4(x, y, z, w) {
			Vector.call(this, 4);
			this.set(x, y, z, w);
		}

		Vector4.add = function(a, b, target) {
			if (!target) {
				target = new Vector4();
			}

			return target.set(a.x() + b.x(), a.y() + b.y(), a.z() + b.z(), a.w() + b.w());
		};

		Vector4.sub = function(a, b, target) {
			if (!target) {
				target = new Vector4();
			}

			return target.set(a.x() - b.x(), a.y() - b.y(), a.z() - b.z(), a.w() - b.w());
		};

		Vector4.prototype.copy = function(source) {
			return this.set(source.x, source.y, source.z, source.w);
		};

		Vector4.prototype.set = function(x, y, z, w) {
			this.data[0] = x || 0.0;
			this.data[1] = y || 0.0;
			this.data[2] = z || 0.0;
			this.data[3] = w || 1.0;

			return this;
		};

		Vector4.prototype.x = function() {
			return this.data[0];
		};

		Vector4.prototype.y = function() {
			return this.data[1];
		};

		Vector4.prototype.z = function() {
			return this.data[2];
		};

		Vector4.prototype.w = function() {
			return this.data[3];
		};

		Vector4.prototype.add = function(rhs) {
			return this.set(this.data[0] + rhs.x(), this.data[1] + rhs.y(), this.data[2] + rhs.z(), this.data[3]
				+ rhs.w());
		};

		return Vector4;
	});
