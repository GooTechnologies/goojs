define([
	'goo/math/Vector3',
	'goo/math/MathUtils',
	'goo/renderer/bounds/BoundingVolume',
	'goo/renderer/MeshData'
],
/** @lends */
function (
	Vector3,
	MathUtils,
	BoundingVolume,
	MeshData
) {
	'use strict';

	/**
	 * @class <code>BoundingSphere</code> defines a sphere that defines a container for a group of vertices of a particular piece of geometry. This
	 *        sphere defines a radius and a center. <br>
	 *        <br>
	 *        A typical usage is to allow the class define the center and radius by calling either <code>containAABB</code> or
	 *        <code>averagePoints</code>. A call to <code>computeFramePoint</code> in turn calls <code>containAABB</code>.
	 */
	function BoundingSphere(center, radius) {
		BoundingVolume.call(this, center);
		this.radius = radius !== undefined ? radius : 1;
	}

	var tmpVec = new Vector3();

	BoundingSphere.prototype = Object.create(BoundingVolume.prototype);
	BoundingSphere.prototype.constructor = BoundingSphere;

	BoundingSphere.prototype.computeFromPoints = function (verts) {
		var min = this.min;
		var max = this.max;
		var vec = tmpVec;

		min.setDirect(Infinity, Infinity, Infinity);
		max.setDirect(-Infinity, -Infinity, -Infinity);
		var x, y, z;
		for (var i = 0; i < verts.length; i += 3) {
			x = verts[i + 0];
			y = verts[i + 1];
			z = verts[i + 2];
			min.data[0] = x < min.data[0] ? x : min.data[0];
			min.data[1] = y < min.data[1] ? y : min.data[1];
			min.data[2] = z < min.data[2] ? z : min.data[2];
			max.data[0] = x > max.data[0] ? x : max.data[0];
			max.data[1] = y > max.data[1] ? y : max.data[1];
			max.data[2] = z > max.data[2] ? z : max.data[2];
		}
		var newCenter = max.addVector(min).div(2.0);
		var size = 0, test;
		for (var i = 0; i < verts.length; i += 3) {
			vec.setDirect(verts[i], verts[i + 1], verts[i + 2]);
			test = vec.subVector(newCenter).lengthSquared();
			if (test > size) {
				size = test;
			}
		}

		this.radius = Math.sqrt(size);
		this.center.setVector(newCenter);
	};

	(function () {
		var relativePoint = new Vector3();

		/**
		 * Method to test whether a point is inside the bounding box or not
		 * @param {Vector3} point
		 * @returns {boolean}
		 */
		BoundingSphere.prototype.containsPoint = function (point) {
			return relativePoint.setVector(point).subVector(this.center).lengthSquared() <= Math.pow(this.radius, 2);
		};
	})();

	BoundingSphere.prototype.computeFromPrimitives = function (data, section, indices, start, end) {
		if (end - start <= 0) {
			return;
		}

		var vertList = [];
		var store = [];
		var vertsPerPrimitive = MeshData.getVertexCount(data.indexModes[section]);

		var count = 0;
		for (var i = start; i < end; i++) {
			store = data.getPrimitiveVertices(indices[i], section, store);
			for (var j = 0; j < vertsPerPrimitive; j++) {
				vertList[count++] = new Vector3().set(store[j]);
			}
		}

		this.averagePoints(vertList);
	};

	BoundingSphere.prototype.averagePoints = function (points) {
		this.center.set(points[0]);

		for (var i = 1; i < points.length; i++) {
			this.center.add(points[i]);
		}

		var quantity = 1.0 / points.length;
		this.center.scale(quantity);

		var maxRadiusSqr = 0.0;
		for (var i = 0; i < points.length; i++) {
			var diff = Vector3.sub(points[i], this.center, tmpVec);
			var radiusSqr = diff.lengthSquared();
			if (radiusSqr > maxRadiusSqr) {
				maxRadiusSqr = radiusSqr;
			}
		}

		this.radius = Math.sqrt(maxRadiusSqr) + 0.00001;
	};

	BoundingSphere.prototype.transform = function (transform, bound) {
		if (bound === null) {
			bound = new BoundingSphere();
		}

		transform.applyForward(this.center, bound.center);

		var scale = transform.scale;
		bound.radius = Math.abs(this._maxAxis(scale) * this.radius);

		return bound;
	};

	BoundingSphere.prototype.whichSide = function (plane) {
		var planeData = plane.normal.data;
		var pointData = this.center.data;
		var distance = planeData[0] * pointData[0] + planeData[1] * pointData[1] + planeData[2] * pointData[2] - plane.constant;

		if (distance < -this.radius) {
			return BoundingVolume.Inside;
		} else if (distance > this.radius) {
			return BoundingVolume.Outside;
		} else {
			return BoundingVolume.Intersects;
		}
	};

	BoundingSphere.prototype._pseudoDistance = function (plane, point) {
		return plane.normal.x * point.x + plane.normal.y * point.y + plane.normal.z * point.z - plane.constant;
	};

	BoundingSphere.prototype._maxAxis = function (scale) {
		return Math.max(Math.abs(scale.x), Math.max(Math.abs(scale.y), Math.abs(scale.z)));
	};

	BoundingSphere.prototype.toString = function () {
		var x = Math.round(this.center.x * 10) / 10;
		var y = Math.round(this.center.y * 10) / 10;
		var z = Math.round(this.center.z * 10) / 10;
		var radius = Math.round(this.radius * 10) / 10;

		return '[' + x + ',' + y + ',' + z + ']' + ' - ' + radius;
	};

	BoundingSphere.prototype.intersects = function (bv) {
		return bv.intersectsSphere(this);
	};

	BoundingSphere.prototype.intersectsBoundingBox = function (bb) {
		// bb.min/max aren't updated properly; have to do it here for now
		bb.min.x = bb.center.x - bb.xExtent;
		bb.min.y = bb.center.y - bb.yExtent;
		bb.min.z = bb.center.z - bb.zExtent;

		bb.max.x = bb.center.x + bb.xExtent;
		bb.max.y = bb.center.y + bb.yExtent;
		bb.max.z = bb.center.z + bb.zExtent;

		var rs = Math.pow(this.radius, 2);
		var dmin = 0;

		if (this.center.x < bb.min.x) {
			dmin += Math.pow(this.center.x - bb.min.x, 2);
		} else if (this.center.x > bb.max.x) {
			dmin += Math.pow(this.center.x - bb.max.x, 2);
		}

		if (this.center.y < bb.min.y) {
			dmin += Math.pow(this.center.y - bb.min.y, 2);
		} else if (this.center.y > bb.max.y) {
			dmin += Math.pow(this.center.y - bb.max.y, 2);
		}

		if (this.center.z < bb.min.z) {
			dmin += Math.pow(this.center.z - bb.min.z, 2);
		} else if (this.center.z > bb.max.z) {
			dmin += Math.pow(this.center.z - bb.max.z, 2);
		}

		return dmin <= rs;
	};

	BoundingSphere.prototype.intersectsSphere = function (bs) {
		var diff = tmpVec.setVector(this.center).subVector(bs.center);
		var rsum = this.radius + bs.radius;
		return diff.dot(diff) <= rsum * rsum;
		//return this.center.distanceSquared(bs.center) <= rsum * rsum;
	};

	BoundingSphere.prototype.intersectsRay = function (ray) {
		if (!this.center) {
			return false;
		}

		var diff = new Vector3().copy(ray.origin).sub(this.center);
		var a = diff.dot(diff) - this.radius * this.radius;
		if (a <= 0.0) {
			// in sphere
			return true;
		}

		// outside sphere
		var b = ray.direction.dot(diff);
		if (b >= 0.0) {
			return false;
		}
		return b * b >= a;
	};

	BoundingSphere.prototype.intersectsRayWhere = function (ray) {
		var diff = new Vector3().copy(ray.origin).sub(this.center);
		var a = diff.dot(diff) - this.radius * this.radius;
		var a1, discr, root;
		if (a <= 0.0) {
			// inside sphere
			a1 = ray.direction.dot(diff);
			discr = a1 * a1 - a;
			root = Math.sqrt(discr);
			var distances = [root - a1];
			var points = [new Vector3().copy(ray.direction).scale(distances[0]).add(ray.origin)];
			return {
				"distances": distances,
				"points": points
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
			var points = [new Vector3().copy(ray.direction).scale(distances[0]).add(ray.origin),
				new Vector3().copy(ray.direction).scale(distances[1]).add(ray.origin)];
			return {
				"distances": distances,
				"points": points
			};
		}

		var distances = [-a1];
		var points = [new Vector3().copy(ray.direction).scale(distances[0]).add(ray.origin)];
		return {
			"distances": distances,
			"points": points
		};
	};

	BoundingSphere.prototype.merge = function (bv) {
		if (bv instanceof BoundingSphere) {
			return this.mergeSphere(bv.center, bv.radius, this);
		} else {
			var boxRadius = tmpVec.setDirect(bv.xExtent, bv.yExtent, bv.zExtent).length();
			return this.mergeSphere(bv.center, boxRadius, this);
		}
	};

	BoundingSphere.prototype.mergeSphere = function (center, radius, store) {
		if (!store) {
			store = new BoundingSphere();
		}

		var diff = tmpVec.setVector(center).subVector(this.center);
		var lengthSquared = diff.lengthSquared();
		var radiusDiff = radius - this.radius;
		var radiusDiffSqr = radiusDiff * radiusDiff;

		// if one sphere wholly contains the other
		if (radiusDiffSqr >= lengthSquared) {
			// if we contain the other
			if (radiusDiff <= 0.0) {
				store.center.setVector(this.center);
				store.radius = this.radius;
				return store;
			}
			// else the other contains us
			else {
				store.center.setVector(center);
				store.radius = radius;
				return store;
			}
		}

		// distance between sphere centers
		var length = Math.sqrt(lengthSquared);

		// init a center var using our center
		var rCenter = store.center;

		// if our centers are at least a tiny amount apart from each other...
		if (length > MathUtils.EPSILON) {
			// place us between the two centers, weighted by radii
			var coeff = (length + radiusDiff) / (2.0 * length);
			rCenter.addVector(diff.scale(coeff));
		}

		// Set radius
		store.radius = 0.5 * (length + this.radius + radius);

		return store;
	};

	// doesn't actually clone, center is shared
	BoundingSphere.prototype.clone = function (store) {
		if (store && store instanceof BoundingSphere) {
			store.center.setVector(this.center);
			store.radius = this.radius;
			return store;
		}

		return new BoundingSphere(this.center, this.radius);
	};

	return BoundingSphere;
});