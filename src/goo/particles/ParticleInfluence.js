define(

function () {
	'use strict';

	/**
	 * A Particle influence modifies particles in some way over time
	 */
	function ParticleInfluence (settings) {
		settings = settings || {};

		/**
		 * Function for preparing to apply this particle influence. Useful for expensive operations that should only need computing once per frame
		 * @type {Function}
		 */
		// Was: function (particleEntity, emitter)
		this.prepare = settings.prepare ? settings.prepare : function () {
		};

		/**
		 * Function for applying this particle influence
		 * @type {Function}
		 */
		// Was: function (tpf, particle, index)
		this.apply = settings.apply ? settings.apply : function () {
		};

		/**
		 * Specifies whether this influence should be applied to particles. Prepare is called regardless
		 * @type {boolean}
		 */
		this.enabled = settings.enabled !== undefined ? settings.enabled === true : true;
	}

	return ParticleInfluence;
});