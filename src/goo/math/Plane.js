define(['goo/math/Vector3'],
/** @lends */
function (Vector3) {
	"use strict";

	/**
	 * @class A representation of a mathematical plane using a normal vector and a plane constant (d) whose absolute value represents the distance
	 *        from the origin to the plane. It is generally calculated by taking a point (X) on the plane and finding its dot-product with the plane's
	 *        normal vector. iow: d = N dot X
	 * @param {Vector3} normal normal of the plane
	 * @property {Number} constant the plane offset along the normal
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
	 * @param point
	 * @return the distance from this plane to a provided point. If the point is on the negative side of the plane the distance returned is negative,
	 *         otherwise it is positive. If the point is on the plane, it is zero.
	 */
	Plane.prototype.pseudoDistance = function (point) {
		return this.normal.dot(point) - this.constant;
	};

	/**
	 * @description Sets this plane to the plane defined by the given three points.
	 * @param pointA
	 * @param pointB
	 * @param pointC
	 * @return this plane for chaining
	 */
	Plane.prototype.setPlanePoints = function (pointA, pointB, pointC) {
		this.normal.set(pointB).subtractLocal(pointA);
		this.normal.crossLocal(pointC.x - pointA.x, pointC.y - pointA.y, pointC.z - pointA.z).normalizeLocal();
		this.constant = this.normal.dot(pointA);
		return this;
	};

	/**
	 * @description Reflects an incoming vector across the normal of this Plane.
	 * @param unitVector the incoming vector. Must be a unit vector.
	 * @param store optional Vector to store the result in. May be the same as the unitVector.
	 * @return the reflected vector.
	 */
	Plane.prototype.reflectVector = function (unitVector, store) {
		var result = store;
		if (result === null) {
			result = new Vector3();
		}

		var dotProd = this.normal.dot(unitVector) * 2;
		result.set(unitVector).subtractLocal(this.normal.x * dotProd, this.normal.y * dotProd, this.normal.z * dotProd);
		return result;
	};

	return Plane;
});