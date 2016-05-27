var Vector3 = require('./Vector3');

var p0 = new Vector3();

/**
 * A representation of a mathematical plane using a normal vector and a plane constant (d) whose absolute value represents the distance
 *        from the origin to the plane. It is generally calculated by taking a point (X) on the plane and finding its dot-product with the plane's
 *        normal vector. In other words: d = N dot X
 * @param {Vector3} normal Normal of the plane.
 * @param {number} constant The plane offset along the normal.
 */
class Plane {
	normal: any;
	constant: any;
	constructor(normal?, constant?) {
		this.normal = normal ? normal.clone() : Vector3.UNIT_Y.clone();
		this.constant = isNaN(constant) ? 0 : constant;

		// @ifdef DEBUG
		Object.seal(this);
		// @endif
	}

	// TODO: add Object.freeze? - Object.freeze is still too slow unfortunately
	static XZ = new Plane(Vector3.UNIT_Y, 0);
	static XY = new Plane(Vector3.UNIT_Z, 0);
	static YZ = new Plane(Vector3.UNIT_X, 0);

	/**
	 * @param {Vector3} point
	 * @returns {number} The distance from this plane to a provided point. If the point is on the negative side of the plane the distance returned is negative,
	 *         otherwise it is positive. If the point is on the plane, it is zero.
	 */
	pseudoDistance(point) {
		return this.normal.dot(point) - this.constant;
	};

	/**
	 * Sets this plane to the plane defined by the given three points.
	 * @param {Vector3} pointA
	 * @param {Vector3} pointB
	 * @param {Vector3} pointC
	 * @returns {Plane} Self for chaining.
	 */
	setPlanePoints(pointA, pointB, pointC) {
		this.normal.set(pointB).sub(pointA);
		this.normal.cross(new Vector3(pointC.x - pointA.x, pointC.y - pointA.y, pointC.z - pointA.z)).normalize();
		this.constant = this.normal.dot(pointA);
		return this;
	};

	/**
	 * Reflects an incoming vector across the normal of this Plane.
	 * @param {Vector3} unitVector the incoming vector. Must be a unit vector.
	 * @param {Vector3} [store] Vector to store the result in. May be the same as the unitVector.
	 * @returns {Vector3} The reflected vector.
	 */
	reflectVector(unitVector, store) {
		var result = store;
		if (typeof result === 'undefined') {
			result = new Vector3();
		}

		var dotProd = this.normal.dot(unitVector) * 2;
		result.set(unitVector).sub(new Vector3(this.normal.x * dotProd, this.normal.y * dotProd, this.normal.z * dotProd));
		return result;
	};


	/**
	 * Get the intersection of a ray with a plane.
	 * @param {Ray} ray
	 * @param {Vector3} [store]
	 * @param {boolean} [suppressWarnings=false]
	 * @param {boolean} [precision=1e-8]
	 * @returns {Vector3} The store, or new Vector3 if no store was given. In the case where the ray is parallel with the plane, null is returned (and a warning is printed to console).
	 */
	rayIntersect(ray, store, suppressWarnings, precision) {
		//! AT: the only function with a suppressWarnings
		precision = typeof precision === 'undefined' ? 1e-7 : precision;
		store = store || new Vector3();

		var lDotN = ray.direction.dot(this.normal);
		if (Math.abs(lDotN) < precision) {
			//! AT: this is the only function where we have this suppressWarnings mechanism
			if (!suppressWarnings) {
				console.warn('Ray parallel with plane');
			}
			return null;
		}

		var pMinusL0DotN = p0.set(this.normal)
			.scale(this.constant)
			.sub(ray.origin)
			.dot(this.normal);

		return store.set(ray.direction)
			.scale(pMinusL0DotN / lDotN)
			.add(ray.origin);
	};

	/**
	 * Copies data from another plane
	 * @param source {Plane} Source plane to copy from
	 * @returns {Plane} Returns self to allow chaining
	 */
	copy(source) {
		this.normal.copy(source.normal);
		this.constant = source.constant;
		return this;
	};

	/**
	 * Returns a clone of this plane
	 * @returns {Plane}
	 */
	clone() {
		return new Plane(this.normal.clone(), this.constant);
	};
}

export = Plane;
