define([ 'goo/math/Vector3' ], function(Vector3) {
	"use strict";

	/**
	 * @name ParticleUtils
	 * @class Various helper utils for particle systems.
	 */
	function ParticleUtils() {
	}

	ParticleUtils.getRandomVelocityOffY = function(store, minOffsetAngle, maxOffsetAngle, scale, particleEntity) {
		var randomAngle = minOffsetAngle + Math.random() * (maxOffsetAngle - minOffsetAngle);
		var randomDir = Math.PI * 2 * Math.random();

		store.x = Math.cos(randomDir) * Math.sin(randomAngle);
		store.y = Math.cos(randomAngle);
		store.z = Math.sin(randomDir) * Math.sin(randomAngle);
		
		if (particleEntity) {
			ParticleUtils.applyEntityTransformVector(store, particleEntity);
		}

        store.mul(scale);
        return store;
	};
	
	ParticleUtils.createConstantForce = function(force) {
		var applyForce = new Vector3(force);
		return {
			enabled: true,
			prepare: function(particleEntity) {},
			apply: function(tpf, particle, particleIndex) {
				particle.velocity.x += applyForce.x * tpf;
				particle.velocity.y += applyForce.y * tpf;
				particle.velocity.z += applyForce.z * tpf;
			}
		};
	};

	ParticleUtils.applyEntityTransformPoint = function(vec3, entity) {
		if (!entity.transformComponent || !entity.transformComponent.worldTransform) {
			return vec3;
		}
		
		return entity.transformComponent.worldTransform.applyForward(vec3, vec3);
	};

	ParticleUtils.applyEntityTransformVector = function(vec3, entity) {
		if (!entity.transformComponent || !entity.transformComponent.worldTransform) {
			return vec3;
		}
		
		return entity.transformComponent.worldTransform.applyForwardVector(vec3, vec3);
	};

	return ParticleUtils;
});