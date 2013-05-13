define([
	'goo/math/Vector3',
	'goo/renderer/bounds/BoundingVolume',
	'goo/renderer/MeshData'
],
/** @lends */
function (
	Vector3,
	BoundingVolume,
	MeshData
) {
	"use strict";

	/**
	 * @class <code>BoundingSphere</code> defines a sphere that defines a container for a group of vertices of a particular piece of geometry. This
	 *        sphere defines a radius and a center. <br>
	 *        <br>
	 *        A typical usage is to allow the class define the center and radius by calling either <code>containAABB</code> or
	 *        <code>averagePoints</code>. A call to <code>computeFramePoint</code> in turn calls <code>containAABB</code>.
	 */
	function BoundingSphere() {
		BoundingVolume.call(this);

		this.radius = 1;

		this.vec = new Vector3();
	}

	BoundingSphere.prototype = Object.create(BoundingVolume.prototype);
	BoundingSphere.prototype.constructor = BoundingSphere;

	BoundingSphere.prototype.computeFromPoints = function (verts) {
		var min = this.min;
		var max = this.max;
		var vec = this.vec;

		min.setd(Infinity, Infinity, Infinity);
		max.setd(-Infinity, -Infinity, -Infinity);
		var x, y, z;
		for (var i = 0; i < verts.length; i += 3) {
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
		var newCenter = max.addv(min).div(2.0);
		var size = 0, test;
		for (var i = 0; i < verts.length; i += 3) {
			vec.setd(verts[i], verts[i + 1], verts[i + 2]);
			test = vec.subv(newCenter).lengthSquared();
			if (test > size) {
				size = test;
			}
		}

		this.radius = Math.sqrt(size);
		this.center.setv(newCenter);
	};

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
		this.center.mul(quantity);

		var maxRadiusSqr = 0.0;
		for (var i = 0; i < points.length; i++) {
			var diff = Vector3.sub(points[i], this.center, this.vec);
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
		bound.radius = scale.maxAxis() * this.radius;

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

	BoundingSphere.prototype.toString = function () {
		var x = Math.round(this.center.x * 10) / 10;
		var y = Math.round(this.center.y * 10) / 10;
		var z = Math.round(this.center.z * 10) / 10;
		var radius = Math.round(this.radius * 10) / 10;

		return '[' + x + ',' + y + ',' + z + ']' + ' - ' + radius;
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
			var points = [new Vector3().copy(ray.direction).mul(distances[0]).add(ray.origin)];
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
			var points = [new Vector3().copy(ray.direction).mul(distances[0]).add(ray.origin),
				new Vector3().copy(ray.direction).mul(distances[1]).add(ray.origin)];
			return {
				"distances": distances,
				"points": points
			};
		}

		var distances = [-a1];
		var points = [new Vector3().copy(ray.direction).mul(distances[0]).add(ray.origin)];
		return {
			"distances": distances,
			"points": points
		};
	};

	return BoundingSphere;
});