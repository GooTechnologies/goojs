define([
	'goo/particles/ParticleUtils'
],
	/** @lends */
function (
	ParticleUtils
) {
	'use strict';

	var ParticleLib = {};

	ParticleLib.getSmoke = function(options) {
		options = options || {};
		options.scale = typeof options.scale !== 'undefined' ? options.scale : 1;
		options.spread = typeof options.spread !== 'undefined' ? options.speed : 2;
		options.velocity = typeof options.velocity !== 'undefined' ? options.velocity : 2;
		options.color = options.color || [0, 0, 0];

		return {
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 25,
			minLifetime : 0.5,
			maxLifetime : 4.0,
			getEmissionVelocity : function (particle, particleEntity) {
				// not nice, will end up a square
				var vec3 = particle.velocity;
				vec3.data[0] = (Math.random()-0.5) * 2 * options.spread * options.scale;
				vec3.data[1] = (Math.random() + 4) * options.velocity * options.scale;
				vec3.data[2] = (Math.random()-0.5) * 2 * options.spread * options.scale;
				return vec3;
				//return ParticleUtils.getRandomVelocityOffY(vec3, 0, Math.PI * 18 / 180, 8);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 3.0 * options.scale,
				color : [options.color[0], options.color[1], options.color[2], 1]
			}, {
				timeOffset : 1.0,
				size : 6.0 * options.scale,
				color : [options.color[0], options.color[1], options.color[2], 0]
			}]
		};
	};

	ParticleLib.getFire = function(options) {
		options = options || {};
		options.scale = typeof options.scale !== 'undefined' ? options.scale : 1;
		options.spread = typeof options.spread !== 'undefined' ? options.spread : 2;
		options.velocity = typeof options.velocity !== 'undefined' ? options.velocity : 10;
		options.startColor = options.startColor || [1, 1, 0];
		options.endColor = options.endColor || [1, 0, 0];

		return {
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : 30,
			minLifetime : 0.5,
			maxLifetime : 2.0,
			getEmissionVelocity : function (particle, particleEntity) {
				// not nice, will end up a square
				var vec3 = particle.velocity;
				vec3.data[0] = (Math.random()-0.5) * 2 * options.spread * options.scale;
				vec3.data[1] = (Math.random() + 1) * options.velocity * options.scale;
				vec3.data[2] = (Math.random()-0.5) * 2 * options.spread * options.scale;
				return vec3;
				//return ParticleUtils.getRandomVelocityOffY(vec3, 0, Math.PI * 15 / 180, 5);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 2.0 * options.scale,
				color : [options.startColor[0], options.startColor[1], options.startColor[2], 1]
			}, {
				timeOffset : 0.25,
				color : [options.endColor[0], options.endColor[1], options.endColor[2], 1]
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