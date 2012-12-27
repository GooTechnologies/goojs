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

	return ParticleUtils;
});