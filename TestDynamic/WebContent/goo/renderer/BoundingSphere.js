"use strict";

define([ 'goo/math/Transform' ], function(Transform) {
	function BoundingSphere() {
		this.center = new THREE.Vector3();
		this.radius = 1;
	}

	BoundingSphere.prototype.computeFromPoints = function(verts) {
		this.calcWelzl(verts);
		this.radius = 100;
	};

	BoundingSphere.prototype.transform = function(transform, bound) {
		if (bound === null) {
			bound = new BoundingSphere();
		}
		// bound.worldTransform.multiply(bound.worldTransform, otherTransform);
		return bound;
	};

	BoundingSphere.prototype.calcWelzl = function(verts) {
	};

	return BoundingSphere;
});