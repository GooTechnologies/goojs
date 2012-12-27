define([ 'goo/math/Vector3' ], function(Vector3) {
	"use strict";

	/**
	 * @name ParticleUtils
	 * @class Various helper utils for particle systems.
	 */
	function ParticleUtils() {
	}

	ParticleUtils.getRandomVelocityOffY = function(store, minOffsetAngle, maxOffsetAngle, scale) {
		var randomAngle = minOffsetAngle + Math.random() * (maxOffsetAngle - minOffsetAngle);
		var randomDir = Math.PI * 2 * Math.random();

		store.x = Math.cos(randomDir) * Math.sin(randomAngle);
		store.y = Math.cos(randomAngle);
		store.z = Math.sin(randomDir) * Math.sin(randomAngle);
        //rotateVectorSpeed(store);
        store.mul(scale);
        return store;
	};
	
	ParticleUtils.createConstantForce = function(force, useWorldCoords) {
		var applyForce = new Vector3(force);
		return {
			enabled: true,
			prepare: function(particleEntity) {
				if (useWorldCoords) {
					// grab our rotation and reverse it, if found
					var transformComponent = particleEntity.transformComponent;
			        // if we have a transform, unwind the world rotation.
			        if (transformComponent && transformComponent.worldTransform) {
			        	applyForce.set(force);
			        	transformComponent.worldTransform.rotation.applyPre(applyForce);
			        }
				}
			},
			apply: function(tpf, particle, particleIndex) {
				particle.velocity.x += applyForce.x * tpf;
				particle.velocity.y += applyForce.y * tpf;
				particle.velocity.z += applyForce.z * tpf;
			}
		};
	};

	return ParticleUtils;
});