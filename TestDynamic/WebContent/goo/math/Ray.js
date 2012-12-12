define(['goo/math/Vector3', 'goo/math/MathUtils'], function(Vector3, MathUtils) {
	"use strict";

	/**
	 * @name Ray
	 * @class Constructs a new ray with an origin at (0,0,0) and a direction of (0,0,1).
	 */
	function Ray() {
		this.origin = new Vector3();
		this.direction = new Vector3().copy(Vector3.UNIT_Z);
	}

	/**
	 * @param polygonVertices
	 * @param locationStore
	 * @return true if this ray intersects a polygon described by the given vertices.
	 */
	Ray.prototype.intersects = function(polygonVertices, locationStore, doPlanar) {
		if (polygonVertices.length == 3) {
			return intersectsTriangle(polygonVertices[0], polygonVertices[1], polygonVertices[2], locationStore, doPlanar);
		} else if (polygonVertices.length == 4) {
			return intersectsTriangle(polygonVertices[0], polygonVertices[1], polygonVertices[2], locationStore, doPlanar)
				|| intersectsTriangle(polygonVertices[0], polygonVertices[2], polygonVertices[3], locationStore, doPlanar);
		}
		return false;
	};

	/**
	 * Ray vs triangle implementation.
	 * 
	 * @param pointA
	 * @param pointB
	 * @param pointC
	 * @param locationStore
	 * @param doPlanar
	 * @return true if this ray intersects a triangle formed by the given three points.
	 */
	Ray.prototype.intersectsTriangle = function(pointA, pointB, pointC, locationStore, doPlanar) {
		var diff = new Vector3().set(_origin).subtractLocal(pointA);
		var edge1 = new Vector3().set(pointB).subtractLocal(pointA);
		var edge2 = new Vector3().set(pointC).subtractLocal(pointA);
		var norm = new Vector3().set(edge1).crossLocal(edge2);

		var dirDotNorm = _direction.dot(norm);
		var sign;
		if (dirDotNorm > MathUtils.EPSILON) {
			sign = 1.0;
		} else if (dirDotNorm < -MathUtils.EPSILON) {
			sign = -1.0;
			dirDotNorm = -dirDotNorm;
		} else {
			// ray and triangle/quad are parallel
			return false;
		}

		var dirDotDiffxEdge2 = sign * _direction.dot(diff.cross(edge2, edge2));
		var result = false;
		if (dirDotDiffxEdge2 >= 0.0) {
			var dirDotEdge1xDiff = sign * _direction.dot(edge1.crossLocal(diff));
			if (dirDotEdge1xDiff >= 0.0) {
				if (dirDotDiffxEdge2 + dirDotEdge1xDiff <= dirDotNorm) {
					var diffDotNorm = -sign * diff.dot(norm);
					if (diffDotNorm >= 0.0) {
						// ray intersects triangle
						// if storage vector is null, just return true,
						if (locationStore == null) {
							return true;
						}
						// else fill in.
						var inv = 1 / dirDotNorm;
						var t = diffDotNorm * inv;
						if (!doPlanar) {
							locationStore.set(_origin).addLocal(_direction.getX() * t, _direction.getY() * t, _direction.getZ() * t);
						} else {
							// these weights can be used to determine
							// interpolated values, such as texture coord.
							// eg. texcoord s,t at intersection point:
							// s = w0*s0 + w1*s1 + w2*s2;
							// t = w0*t0 + w1*t1 + w2*t2;
							var w1 = dirDotDiffxEdge2 * inv;
							var w2 = dirDotEdge1xDiff * inv;
							// float w0 = 1.0 - w1 - w2;
							locationStore.set(t, w1, w2);
						}
						result = true;
					}
				}
			}
		}
		return result;
	};

	return Ray;
});