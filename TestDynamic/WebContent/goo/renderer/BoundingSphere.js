define(['goo/math/Transform'], function(Transform) {
	"use strict";

	function BoundingSphere() {
		this.center = new THREE.Vector3();
		this.radius = 1;
	}

	BoundingSphere.prototype.computeFromPoints = function(verts) {
		var big = Infinity;
		var vec = new THREE.Vector3();
		var min = new THREE.Vector3(big, big, big);
		var max = new THREE.Vector3(-big, -big, -big);
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
		var center = max.addSelf(min).divideScalar(2.0);
		var size = 0, test;
		for ( var i = 0; i < verts.length; i += 3) {
			vec.set(verts[i], verts[i + 1], verts[i + 2]);
			test = vec.subSelf(center).length();
			if (test > size) {
				size = test;
			}
		}

		this.radius = size / 4.0;
		this.center.copy(center);
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

	return BoundingSphere;
});