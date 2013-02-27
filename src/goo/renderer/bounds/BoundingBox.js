define(['goo/math/Transform', 'goo/math/Vector3', 'goo/renderer/Camera'],
/** @lends BoundingBox */
function(Transform, Vector3, Camera) {
	"use strict";

	/**
	 * @class <code>BoundingBox</code> defines a sphere that defines a container for a group of vertices of a particular piece of geometry. This
	 *        sphere defines a radius and a center. <br>
	 *        <br>
	 *        A typical usage is to allow the class define the center and radius by calling either <code>containAABB</code> or
	 *        <code>averagePoints</code>. A call to <code>computeFramePoint</code> in turn calls <code>containAABB</code>.
	 */
	function BoundingBox() {
		this.center = new Vector3();
		this.xExtent = 1;
		this.yExtent = 1;
		this.zExtent = 1;

		this._compVect1 = new Vector3();
		this.vec = new Vector3();
		this.min = new Vector3(Infinity, Infinity, Infinity);
		this.max = new Vector3(-Infinity, -Infinity, -Infinity);
	}

	BoundingBox.prototype.computeFromPoints = function(verts) {
		var min = this.min;
		var max = this.max;
		var vec = this.vec;

		min.setd(Infinity, Infinity, Infinity);
		max.setd(-Infinity, -Infinity, -Infinity);
		var x, y, z;
		for ( var i = 0; i < verts.length; i += 3) {
			x = verts[i + 0];
			y = verts[i + 1];
			z = verts[i + 2];
			min.x = x < min.x ? x : min.x;
			min.y = y < min.y ? y : min.y;
			min.z = z < min.z ? z : min.z;
			max.x = x > max.x ? x : max.x;
			max.y = y > max.y ? y : max.y;
			max.z = z > max.z ? z : max.z;
		}

		vec.setv(max).subv(min).div(2.0);
		this.xExtent = vec.x;
		this.yExtent = vec.y;
		this.zExtent = vec.z;

		this.center.setv(max).add_d(min).div(2.0);
	};

	BoundingBox.prototype.transform = function(transform, bound) {
		if (bound === null) {
			bound = new BoundingBox();
		}

		transform.applyForward(this.center, bound.center);

		// TODO: Port box transform code
		bound.xExtent = this.xExtent;
		bound.yExtent = this.yExtent;
		bound.zExtent = this.zExtent;

		return bound;
	};

	BoundingBox.prototype.whichSide = function(plane) {
		var radius = Math.abs(this.xExtent * plane.normal.x) + Math.abs(this.yExtent * plane.normal.y) + Math.abs(this.zExtent * plane.normal.z);

		var distance = this._pseudoDistance(plane, this.center);

		if (distance < -radius) {
			return Camera.Inside;
		} else if (distance > radius) {
			return Camera.Outside;
		} else {
			return Camera.Intersects;
		}
	};

	BoundingBox.prototype._pseudoDistance = function(plane, point) {
		return plane.normal.x * point.x + plane.normal.y * point.y + plane.normal.z * point.z - plane.constant;
	};

	BoundingBox.prototype._maxAxis = function(scale) {
		return Math.max(Math.abs(scale.x), Math.max(Math.abs(scale.y), Math.abs(scale.z)));
	};

	BoundingBox.prototype.toString = function() {
		var x = Math.round(this.center.x * 10) / 10;
		var y = Math.round(this.center.y * 10) / 10;
		var z = Math.round(this.center.z * 10) / 10;

		return '[' + x + ',' + y + ',' + z + ']' + ' - ' + '[' + this.xExtent + ',' + this.yExtent + ',' + this.zExtent + ']';
	};

	BoundingBox.prototype.intersectsBoundingBox = function(bb) {
		if (this.center.x + this.xExtent < bb.center.x - bb.xExtent || this.center.x - this.xExtent > bb.center.x + bb.xExtent) {
			return false;
		} else if (this.center.y + this.yExtent < bb.center.y - bb.yExtent || this.center.y - this.yExtent > bb.center.y + bb.yExtent) {
			return false;
		} else if (this.center.z + this.zExtent < bb.center.z - bb.zExtent || this.center.z - this.zExtent > bb.center.z + bb.zExtent) {
			return false;
		} else {
			return true;
		}
	};

	BoundingBox.prototype.testStaticAABBAABB = function(bb, contact) {
		var a = this;
		var b = bb;

		// [Minimum Translation Vector]
		var mtvInfo = {
			mtvDistance : 10000000000, // Set current minimum distance (max float value so next value is always less)
			mtvAxis : new Vector3()
		// Axis along which to travel with the minimum distance
		};

		// [Axes of potential separation]
		// * Each shape must be projected on these axes to test for intersection:
		//
		// (1, 0, 0) A0 (= B0) [X Axis]
		// (0, 1, 0) A1 (= B1) [Y Axis]
		// (0, 0, 1) A1 (= B2) [Z Axis]

		// [X Axis]
		if (!this.testAxisStatic(Vector3.UNIT_X, a.center.x - a.xExtent, a.center.x + a.xExtent, b.center.x - b.xExtent, b.center.x + b.xExtent,
			mtvInfo)) {
			return false;
		}

		// [Y Axis]
		if (!this.testAxisStatic(Vector3.UNIT_Y, a.center.y - a.yExtent, a.center.y + a.yExtent, b.center.y - b.yExtent, b.center.y + b.yExtent,
			mtvInfo)) {
			return false;
		}

		// [Z Axis]
		if (!this.testAxisStatic(Vector3.UNIT_Z, a.center.z - a.zExtent, a.center.z + a.zExtent, b.center.z - b.zExtent, b.center.z + b.zExtent,
			mtvInfo)) {
			return false;
		}

		if (contact) {
			contact.isIntersecting = true;

			// Calculate Minimum Translation Vector (MTV) [normal * penetration]
			// contact.normal = mtvInfo.mtvAxis.normalize();
			contact.normal = mtvInfo.mtvAxis;

			// Multiply the penetration depth by itself plus a small increment
			// When the penetration is resolved using the MTV, it will no longer intersect
			contact.penetration = Math.sqrt(mtvInfo.mtvDistance) * 1.001;
			// contact.penetration = mtvInfo.mtvDistance * 1.001;
		}

		return true;
	};

	BoundingBox.prototype.testAxisStatic = function(axis, minA, maxA, minB, maxB, mtvInfo) {
		// [Separating Axis Theorem]
		// * Two convex shapes only overlap if they overlap on all axes of separation
		// * In order to create accurate responses we need to find the collision vector (Minimum Translation Vector)
		// * Find if the two boxes intersect along a single axis
		// * Compute the intersection interval for that axis
		// * Keep the smallest intersection/penetration value
		var axisLengthSquared = Vector3.dot(axis, axis);

		// If the axis is degenerate then ignore
		if (axisLengthSquared < 0.000001) {
			return true;
		}

		// Calculate the two possible overlap ranges
		// Either we overlap on the left or the right sides
		var d0 = maxB - minA; // 'Left' side
		var d1 = maxA - minB; // 'Right' side

		// Intervals do not overlap, so no intersection
		if (d0 <= 0.0 || d1 <= 0.0) {
			return false;
		}

		// Find out if we overlap on the 'right' or 'left' of the object.
		var overlap = d0 < d1 ? d0 : -d1;

		// The mtd vector for that axis
		// var sep = axis * (overlap / axisLengthSquared);
		var sep = new Vector3().copy(axis).mul(overlap / axisLengthSquared);

		// The mtd vector length squared
		var sepLengthSquared = Vector3.dot(sep, sep);

		// If that vector is smaller than our computed Minimum Translation Distance use that vector as our current MTV distance
		if (sepLengthSquared < mtvInfo.mtvDistance) {
			mtvInfo.mtvDistance = sepLengthSquared;
			// mtvInfo.mtvAxis = sep;
			mtvInfo.mtvAxis = axis;
		}

		return true;
	};

	//TODO:!
	BoundingBox.prototype.intersectsRay = function(ray) {
		if (!this.center) {
			return false;
		}

		var diff = this._compVect1.copy(ray.origin).sub(this.center);

		var direction = ray.direction;

		// final float[] t = { 0.0f, Float.POSITIVE_INFINITY };
		//
		// // Check for degenerate cases and pad using zero tolerance. Should give close enough result.
		// float x = xExtent;
		// if (x < MathUtils.ZERO_TOLERANCE && x >= 0) {
		// x = MathUtils.ZERO_TOLERANCE;
		// }
		// float y = yExtent;
		// if (y < MathUtils.ZERO_TOLERANCE && y >= 0) {
		// y = MathUtils.ZERO_TOLERANCE;
		// }
		// float z = zExtent;
		// if (z < MathUtils.ZERO_TOLERANCE && z >= 0) {
		// z = MathUtils.ZERO_TOLERANCE;
		// }
		//
		// // Special case.
		// if (Float.isInfinite(x) && Float.isInfinite(y) && Float.isInfinite(z)) {
		// return true;
		// }
		//
		// final boolean notEntirelyClipped = clip(direction.getX(), -diff.getX() - x, t)
		// && clip(-direction.getX(), diff.getX() - x, t) && clip(direction.getY(), -diff.getY() - y, t)
		// && clip(-direction.getY(), diff.getY() - y, t) && clip(direction.getZ(), -diff.getZ() - z, t)
		// && clip(-direction.getZ(), diff.getZ() - z, t);
		//
		// return notEntirelyClipped && (t[0] != 0.0 || t[1] != Float.POSITIVE_INFINITY);
	};

	BoundingBox.prototype.intersectsRayWhere = function(ray) {
		var diff = new Vector3().copy(ray.origin).sub(this.center);
		var a = diff.dot(diff) - this.radius * this.radius;
		var a1, discr, root;
		if (a <= 0.0) {
			// inside sphere
			a1 = ray.direction.dot(diff);
			discr = a1 * a1 - a;
			root = Math.sqrt(discr);
			var distances = [root - a1];
			var points = [new Vector3().copy(ray.direction).mul(distances[0]).add(ray.origin)];
			return {
				"distances" : distances,
				"points" : points
			};
		}

		a1 = ray.direction.dot(diff);
		if (a1 >= 0.0) {
			// No intersection
			return null;
		}

		discr = a1 * a1 - a;
		if (discr < 0.0) {
			return null;
		} else if (discr >= 0.00001) {
			root = Math.sqrt(discr);
			var distances = [-a1 - root, -a1 + root];
			var points = [new Vector3().copy(ray.direction).mul(distances[0]).add(ray.origin),
					new Vector3().copy(ray.direction).mul(distances[1]).add(ray.origin)];
			return {
				"distances" : distances,
				"points" : points
			};
		}

		var distances = [-a1];
		var points = [new Vector3().copy(ray.direction).mul(distances[0]).add(ray.origin)];
		return {
			"distances" : distances,
			"points" : points
		};
	};

	return BoundingBox;
});