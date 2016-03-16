

/**
 * A Particle influence modifies particles in some way over time.
 * @param {Object} [settings]
 * @param {Function} [settings.prepare] <code>prepare({@link Entity} particleEntity, {@link ParticleEmitter} emitter)</code>.
 * @param {Function} [settings.apply] <code>apply(number tpf, {@link Particle} particle, number particleIndex)</code>.
 * @param {boolean} [settings.enabled=true]
 * @example-link http://code.gooengine.com/latest/visual-test/goo/particles/ParticleInfluence-vtest.html Working example
 */
function ParticleInfluence (settings) {
	settings = settings || {};

	/**
	 * Function for preparing to apply this particle influence. Useful for expensive operations that should only need computing once per frame.
	 * @type {Function}
	 * @param {Entity} [particleEntity] The Entity on which the ParticleComponent is attached to.
	 * @param {ParticleEmitter} [emitter] The ParticleEmitter on which this ParticleInfluence is attached to.
	 */
	this.prepare = settings.prepare ? settings.prepare : function () {};

	/**
	 * Function for applying this particle influence
	 * @type {Function}
	 * @param {number} [tpf] Time since last frame.
	 * @param {Particle} [particle] The Particle object this function is applyed with.
	 * @param {number} [index] The particle's index in the ParticleComponents.particles array.
	 */
	this.apply = settings.apply ? settings.apply : function () {};

	/**
	 * Specifies whether this influence should be applied to particles. Prepare is called regardless
	 * @type {boolean}
	 */
	this.enabled = settings.enabled !== undefined ? settings.enabled === true : true;
}

export default ParticleInfluence;