define(
/** @lends ParticleInfluence */
function () {
	"use strict";

	/**
	 * @class A Particle influence modifies particles in some way over time.
	 */
	function ParticleInfluence (settings) {
		settings = settings || {};

		// function for preparing to apply this particle influence. Useful for expensive operations that should only need computing once per frame.
		this.prepare = settings.prepare ? settings.prepare : function (particleEntity, emitter) {
		};

		// function for applying this particle influence.
		this.apply = settings.apply ? settings.apply : function (tpf, particle, index) {
		};

		// true if this influence should be applied to particles. Prepare is called regardless.
		this.enabled = settings.enabled !== undefined ? settings.enabled === true : true;
	}

	return ParticleInfluence;
});