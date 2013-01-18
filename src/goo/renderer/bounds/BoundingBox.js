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

		this._checkPlane = 0;

		this._compVect1 = new Vector3();
	}

	BoundingBox.prototype.computeFromPoints = function(verts) {
		var vec = new Vector3();
		var min = new Vector3(Infinity, Infinity, Infinity);
		var max = new Vector3(-Infinity, -Infinity, -Infinity);
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

		vec.copy(max).sub(min).div(2.0);
		this.xExtent = vec.x;
		this.yExtent = vec.y;
		this.zExtent = vec.z;

		this.center.copy(max).add(min).div(2.0);
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

	BoundingBox.prototype.intersectsRay = function(ray) {
		if (!this.center) {
			return false;
		}

		var diff = this._compVect1.copy(ray.origin).sub(this.center);

		var direction = ray.direction;

		// final float[] t = { 0.0f, Float.POSITIVE_INFINITY };
		//
		// // Check for degenerate cases and pad using zero tolerance. Should give close enough result.
		// float x = getXExtent();
		// if (x < MathUtils.ZERO_TOLERANCE && x >= 0) {
		// x = MathUtils.ZERO_TOLERANCE;
		// }
		// float y = getYExtent();
		// if (y < MathUtils.ZERO_TOLERANCE && y >= 0) {
		// y = MathUtils.ZERO_TOLERANCE;
		// }
		// float z = getZExtent();
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