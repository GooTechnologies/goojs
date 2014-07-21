define([],
	/** @lends */
function (
) {
	'use strict';

	/**
	 * @class Library of particles<br>
	 * @{@linkplain http://code.gooengine.com/latest/visual-test/goo/misc/ParticleLib/ParticleLib-vtest.html Working example}
	 */
	var ParticleLib = {};

	/**
	 * Returns a set of parameters for a smoke particle emitter
	 */
	ParticleLib.getSmoke = function (options) {
		options = options || {};
		options.scale = typeof options.scale !== 'undefined' ? options.scale : 1;
		options.spread = typeof options.spread !== 'undefined' ? options.spread : 2;
		options.rate = typeof options.spread !== 'undefined' ? options.rate : 25;
		options.velocity = typeof options.velocity !== 'undefined' ? options.velocity :
			function (particle/*, particleEntity*/) {
				// not nice, will end up a square
				var vec3 = particle.velocity;
				vec3.data[0] = (Math.random() - 0.5) * 2 * options.spread * options.scale;
				vec3.data[1] = (Math.random() + 4.0) * 2 * options.scale;
				vec3.data[2] = (Math.random() - 0.5) * 2 * options.spread * options.scale;
				return vec3;
			};
		options.color = options.color || [0, 0, 0];

		return {
			totalParticlesToSpawn: -1,
			releaseRatePerSecond: options.rate,
			minLifetime: 0.5,
			maxLifetime: 4.0,
			getEmissionVelocity: options.velocity,
			timeline: [{
				timeOffset: 0.0,
				spin: 0,
				mass: 1,
				size: 3.0 * options.scale,
				color: [options.color[0], options.color[1], options.color[2], 1]
			}, {
				timeOffset: 1.0,
				size: 6.0 * options.scale,
				color: [options.color[0], options.color[1], options.color[2], 0]
			}]
		};
	};

	/**
	 * Returns a set of parameters for a fire particle emitter
	 */
	ParticleLib.getFire = function (options) {
		options = options || {};
		options.scale = typeof options.scale !== 'undefined' ? options.scale : 1;
		options.spread = typeof options.spread !== 'undefined' ? options.spread : 2;
		options.velocity = typeof options.velocity !== 'undefined' ? options.velocity : 10;
		options.startColor = options.startColor || [1, 1, 0];
		options.endColor = options.endColor || [1, 0, 0];

		return {
			totalParticlesToSpawn: -1,
			releaseRatePerSecond: 30,
			minLifetime: 0.5,
			maxLifetime: 2.0,
			getEmissionVelocity: function (particle/*, particleEntity*/) {
				// not nice, will end up a square
				var vec3 = particle.velocity;
				vec3.data[0] = (Math.random() - 0.5) * 2 * options.spread * options.scale;
				vec3.data[1] = (Math.random() + 1.0) * options.velocity * options.scale;
				vec3.data[2] = (Math.random() - 0.5) * 2 * options.spread * options.scale;
				return vec3;
			},
			timeline: [{
				timeOffset : 0.0,
				spin: 0,
				mass: 1,
				size: 2.0 * options.scale,
				color: [options.startColor[0], options.startColor[1], options.startColor[2], 0]
			}, {
				timeOffset: 0.05,
				color: [options.startColor[0], options.startColor[1], options.startColor[2], 1.0]
			}, {
				timeOffset: 0.45,
				color: [options.endColor[0], options.endColor[1], options.endColor[2], 0.8]
			}, {
				timeOffset: 0.5,
				size: 3.0 * options.scale,
				color: [0, 0, 0, 0]
			}]
		};
	};

	/**
	 * Returns a set of parameters for a snow particle emitter
	 */
	ParticleLib.getSnow = function (options) {
		options = options || {};
		options.scale = typeof options.scale !== 'undefined' ? options.scale : 2;
		options.spread = typeof options.spread !== 'undefined' ? options.spread : 50;
		options.velocity = typeof options.velocity !== 'undefined' ? options.velocity : 3;
		options.color = options.color || [1, 1, 1];

		return {
			particleCount: 1000,
			totalParticlesToSpawn: -1,
			releaseRatePerSecond: 50,
			minLifetime: 15.0,
			maxLifetime: 25.0,
			getEmissionPoint: function (particle/*, particleEntity*/) {
				var vec3 = particle.position;
				options.getEmissionPoint(vec3);
				return vec3;
			},
			getEmissionVelocity: function (particle/*, particleEntity*/) {
				var vec3 = particle.velocity;
				options.getEmissionVelocity(vec3);
				return vec3;
			},
			timeline: [{
				timeOffset : 0.0,
				spin: 0,
				mass: 1,
				size: 1.0 * options.scale,
				color: [options.color[0], options.color[1], options.color[2], 0.0]
			}, {
				timeOffset: 0.05,
				color: [options.color[0], options.color[1], options.color[2], 1.0]
			}, {
				timeOffset: 0.70,
				color: [options.color[0], options.color[1], options.color[2], 0.8]
			}, {
				timeOffset: 0.25,
				spin: 5,
				size: 0.5 * options.scale,
				color: [options.color[0], options.color[1], options.color[2], 0]
			}]
		};
	};

	return ParticleLib;
});