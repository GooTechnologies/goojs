define(['goo/math/Transform', 'goo/math/Vector3'], function(Transform, Vector3) {
	"use strict";

	function BoundingSphere() {
		this.center = new Vector3();
		this.radius = 1;

		this._checkPlane = 0;
	}

	BoundingSphere.prototype.computeFromPoints = function(verts) {
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
		var newCenter = max.add(min).scalarDiv(2.0);
		var size = 0, test;
		for ( var i = 0; i < verts.length; i += 3) {
			vec.set(verts[i], verts[i + 1], verts[i + 2]);
			test = vec.sub(newCenter).length();
			if (test > size) {
				size = test;
			}
		}

		this.radius = size / 1.0;
		this.center.copy(newCenter);
	};

	BoundingSphere.prototype.transform = function(transform, bound) {
		if (bound === null) {
			bound = new BoundingSphere();
		}

		transform.applyForward(this.center, bound.center);

		var scale = transform.scale;
		bound.radius = Math.abs(this._maxAxis(scale) * this.radius);

		return bound;
	};

	BoundingSphere.prototype.whichSide = function(plane) {
		var distance = this._pseudoDistance(plane, this.center);

		if (distance <= -this.radius) {
			return -1; // Outside;
		} else if (distance >= this.radius) {
			return 1; // Inside;
		} else {
			return 0; // Intersects;
		}
	};

	BoundingSphere.prototype._pseudoDistance = function(plane, point) {
		return plane.x * point.x + plane.y * point.y + plane.z * point.z + plane.w;
	};

	BoundingSphere.prototype._maxAxis = function(scale) {
		return Math.max(Math.abs(scale.x), Math.max(Math.abs(scale.y), Math.abs(scale.z)));
	};

	BoundingSphere.prototype.toString = function() {
		var x = Math.round(this.center.x * 10) / 10;
		var y = Math.round(this.center.y * 10) / 10;
		var z = Math.round(this.center.z * 10) / 10;
		var radius = Math.round(this.radius * 10) / 10;

		return '[' + x + ',' + y + ',' + z + ']' + ' - ' + radius;
	};

	return BoundingSphere;
});