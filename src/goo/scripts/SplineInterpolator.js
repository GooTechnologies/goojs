define([
	'goo/math/Matrix4x4',
	'goo/math/Vector4'
], /* @lends */ function (
	Matrix4x4,
	Vector4
) {
	'use strict';

	var clamp = function (x, lower, upper) {
		return Math.min(Math.max(x, lower), upper);
	};

	/**
	 * @class Interpolates an attribute of an entity.
	 * @constructor
	 * @description Creates a new SplineInterpolator.
	 * @param {Object} [properties] Object containing spline properties.
	 */

	function SplineInterpolator (properties) {
		properties = properties || {};

		this.controlPoint = 0;
		this.controlPoints = properties.controlPoints || [];
		this.elapsedTime = 0.0;
		this.enabled = properties.enabled || true;
		this.firstIteration = true;
		this.tolerance = properties.tolerance || 0.01;
		this.beforeFunction = properties.beforeFunction || function (entity) {
			return entity.transform.translation.clone().data;
		};
		this.updateFunction = properties.updateFunction || function (entity, array) {
			entity.transform.translation.set(array);
			entity.transformComponent.setUpdated();
		};
		this.afterFunction = properties.afterFunction || function () {};
	}

	SplineInterpolator.CATMULL_ROM = new Matrix4x4(-0.5, 1.0, -0.5, 0.0, 1.5, -2.5, 0.0, 1.0, -1.5, 2.0, 0.5, 0.0, 0.5, -0.5, 0.0, 0.0);
	SplineInterpolator.UNIFORM_CUBIC = new Matrix4x4(-0.16667, 0.5, -0.5, 0.16667, 0.5, -1.0, 0.0, 0.66667, -0.5, 0.5, 0.5, 0.16667, 0.16667, 0.0, 0.0, 0.0);

	/**
	 * @description Performs one iteration of the script.
	 * @param {Entity} entity The entity controlled by the script.
	 * @param {Float} tpf The time that has elapsed between two consequent runs.
	 */

	SplineInterpolator.prototype.run = function (entity, tpf) {
		if (this.firstIteration) {
			this.firstIteration = false;

			try {
				this.controlPoints.unshift({ 'time' : 0.0, 'value' : this.beforeFunction(entity) });
			} catch (e) {
				this.enabled = false;

				return;
			}
		}

		var ia = clamp(this.controlPoint - 1, 0, this.controlPoints.length - 1);
		var ib = clamp(this.controlPoint + 0, 0, this.controlPoints.length - 1);
		var ic = clamp(this.controlPoint + 1, 0, this.controlPoints.length - 1);
		var id = clamp(this.controlPoint + 2, 0, this.controlPoints.length - 1);

		var factor = (this.controlPoints[ic].time > this.controlPoints[ib].time) ? (this.elapsedTime - this.controlPoints[ib].time) / (this.controlPoints[ic].time - this.controlPoints[ib].time) : 0.0;
		var t = SplineInterpolator.CATMULL_ROM.applyPre(new Vector4(factor * factor * factor, factor * factor, factor, 1.0));
		var array = new Array(this.controlPoints[0].value.length);
		var difference = 0.0;

		for (var i = 0; i < array.length; i++) {
			array[i] = 0.0;
			array[i] += this.controlPoints[ia].value[i] * t[0];
			array[i] += this.controlPoints[ib].value[i] * t[1];
			array[i] += this.controlPoints[ic].value[i] * t[2];
			array[i] += this.controlPoints[id].value[i] * t[3];

			difference += Math.abs(this.controlPoints[this.controlPoints.length - 1].value[i] - array[i]);
		}

		try {
			this.updateFunction(entity, array);
		} catch (e) {
			this.enabled = false;

			return;
		}

		this.elapsedTime += tpf;

		if (this.elapsedTime >= this.controlPoints[ic].time) {
			this.controlPoint++;
		}

		if (this.controlPoint >= this.controlPoints.length || difference < this.tolerance) {
			try {
				this.afterFunction(entity);
			} catch(e) {}

			this.enabled = false;

			return;
		}
	};

	return SplineInterpolator;
});
