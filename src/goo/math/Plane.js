define([
	'goo/math/Vector3'
], function (
	Vector3
) {
	'use strict';

	/**
	 * A representation of a mathematical plane using a normal vector and a plane constant (d) whose absolute value represents the distance
	 *        from the origin to the plane. It is generally calculated by taking a point (X) on the plane and finding its dot-product with the plane's
	 *        normal vector. In other words: d = N dot X
	 * @param {Vector3} normal Normal of the plane.
	 * @param {Number} constant The plane offset along the normal.
	 */
	function Plane (normal, constant) {
		this.normal = normal !== undefined ? new Vector3(normal) : new Vector3(Vector3.UNIT_Y);
		this.constant = isNaN(constant) ? 0 : constant;
	}

	// TODO: add Object.freeze? - Object.freeze is still too slow unfortunately
	Plane.XZ = new Plane(Vector3.UNIT_Y, 0);
	Plane.XY = new Plane(Vector3.UNIT_Z, 0);
	Plane.YZ = new Plane(Vector3.UNIT_X, 0);

	/**
	 * @param {Vector3} point
	 * @return {Number} The distance from this plane to a provided point. If the point is on the negative side of the plane the distance returned is negative,
	 *         otherwise it is positive. If the point is on the plane, it is zero.
	 */
	Plane.prototype.pseudoDistance = function (point) {
		return this.normal.dot(point) - this.constant;
	};

	/**
	 * @description Sets this plane to the plane defined by the given three points.
	 * @param {Vector3} pointA
	 * @param {Vector3} pointB
	 * @param {Vector3} pointC
	 * @return {Plane} Self for chaining.
	 */
	Plane.prototype.setPlanePoints = function (pointA, pointB, pointC) {
		this.normal.setVector(pointB).subVector(pointA);
		this.normal.cross([pointC.x - pointA.x, pointC.y - pointA.y, pointC.z - pointA.z]).normalize();
		this.constant = this.normal.dot(pointA);
		return this;
	};

	/**
	 * @description Reflects an incoming vector across the normal of this Plane.
	 * @param {Vector3} unitVector the incoming vector. Must be a unit vector.
	 * @param {Vector3} [store] Vector to store the result in. May be the same as the unitVector.
	 * @return {Vector3} The reflected vector.
	 */
	Plane.prototype.reflectVector = function (unitVector, store) {
		var result = store;
		if (typeof(result) === 'undefined') {
			result = new Vector3();
		}

		var dotProd = this.normal.dot(unitVector) * 2;
		result.set(unitVector).sub([this.normal.x * dotProd, this.normal.y * dotProd, this.normal.z * dotProd]);
		return result;
	};

	var p0 = new Vector3();

	/**
	 * Get the intersection of a ray with a plane.
	 * @param {Ray} ray
	 * @param {Vector3} [store]
	 * @param {bool} [suppressWarnings=false]
	 * @param {bool} [precision=1e-8]
	 * @returns {Vector3|null} The store, or new Vector3 if no store was given. In the case where the ray is parallel with the plane, null is returned (and a warning is printed to console).
	 */
	Plane.prototype.rayIntersect = function (ray, store, suppressWarnings, precision) {
		precision = typeof(precision)==='undefined' ? 1e-7 : precision;
		store = store || new Vector3();

		var lDotN = ray.direction.dot(this.normal);
		if(Math.abs(lDotN) < precision) {
			if(!suppressWarnings){
				console.warn('Ray parallell with plane');
			}
			return null;
		}
		var c = this.constant;
		var pMinusL0DotN = p0.set(this.normal).scale(c).subVector(ray.origin).dot(this.normal);

		var d = pMinusL0DotN / lDotN;

		return store.setVector(ray.direction).scale(d).addVector(ray.origin);
	};

	return Plane;
});
