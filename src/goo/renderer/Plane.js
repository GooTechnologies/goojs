define(['goo/math/Vector3'], function(Vector3) {
	"use strict";

	/**
	 * @name Plane
	 * @class A representation of a mathematical plane using a normal vector and a plane constant (d) whose absolute value represents the distance
	 *        from the origin to the plane. It is generally calculated by taking a point (X) on the plane and finding its dot-product with the plane's
	 *        normal vector. iow: d = N dot X
	 * @param {Vector3} normal normal of the plane
	 * @property {Number} constant the plane offset along the normal
	 */
	function Plane(normal, constant) {
		this.normal = normal || new Vector3(0, 1, 0);
		this.constant = constant || 0;
	}

	Plane.prototype.pseudoDistance = function(point) {
		return _normal.dot(point) - _constant;
	};

	/**
	 * @param point
	 * @return the side of this plane on which the given point lies.
	 * @see Side
	 * @throws NullPointerException if point is null.
	 */
	Plane.prototype.whichSide = function(point) {
		var dis = pseudoDistance(point);
		if (dis < 0) {
			return Side.Inside;
		} else if (dis > 0) {
			return Side.Outside;
		} else {
			return Side.Neither;
		}
	};

	Plane.prototype.reflectVector = function(unitVector, store) {
		var result = store;
		if (result === null) {
			result = new Vector3();
		}

		var dotProd = _normal.dot(unitVector) * 2;
		result.set(unitVector).subtractLocal(_normal.getX() * dotProd, _normal.getY() * dotProd, _normal.getZ() * dotProd);
		return result;
	};

	return Plane;
});