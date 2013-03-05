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
		// Was: function (particleEntity, emitter)
		this.prepare = settings.prepare ? settings.prepare : function () {
		};

		// function for applying this particle influence.
		// Was: function (tpf, particle, index)
		this.apply = settings.apply ? settings.apply : function () {
		};

		// true if this influence should be applied to particles. Prepare is called regardless.
		this.enabled = settings.enabled !== undefined ? settings.enabled === true : true;
	}

	return ParticleInfluence;
});