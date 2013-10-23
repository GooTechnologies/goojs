define([
	'goo/particles/ParticleUtils'
],
	/** @lends */
function (
	ParticleUtils
) {
	'use strict';

	var ParticleLib = {};

	ParticleLib.getSmoke = function() {
		return {
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 25,
			minLifetime : 0.5,
			maxLifetime : 4.0,
//			getEmissionPoint : function (particle, particleEntity) {
//				var vec3 = particle.position;
//				ParticleUtils.applyEntityTransformPoint(vec3.set(0, 0, 0), particleEntity);
//			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return ParticleUtils.getRandomVelocityOffY(vec3, 0, Math.PI * 18 / 180, 8);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 3.0,
				color : [0, 0, 0, 1]
			}, {
				timeOffset : 1.0,
				size : 6.0,
				color : [0, 0, 0, 0]
			}]
		};
	};

	ParticleLib.getFire = function() {
		return {
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 30,
			minLifetime : 0.5,
			maxLifetime : 2.0,
//			getEmissionPoint : function (particle, particleEntity) {
//				var vec3 = particle.position;
//				ParticleUtils.applyEntityTransformPoint(vec3.set(25, 0, 0), particleEntity);
//			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return ParticleUtils.getRandomVelocityOffY(vec3, 0, Math.PI * 15 / 180, 5);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 2.0,
				color : [1, 1, 0, 1]
			}, {
				timeOffset : 0.25,
				color : [1, 0, 0, 1]
			}, {
				timeOffset : 0.25,
				color : [0, 0, 0, 1]
			}, {
				timeOffset : 0.5,
				size : 3.0,
				color : [0, 0, 0, 0]
			}]
		};
	};

	return ParticleLib;
});