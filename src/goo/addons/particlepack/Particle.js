define([
	'goo/math/Vector3'
], function (
	Vector3
) {
	'use strict';

	/**
	 * @class
	 * @constructor
	 * @param {ParticleComponent} particleComponent
	 */
	function Particle(particleComponent) {
		this.index = 0;
		this.component = particleComponent;
		this.lifeTime = 1;
		this.timeScale = 0;
		this.emitTime = 0;
		this.active = 1;
		this.startPosition = new Vector3();
		this.startDirection = new Vector3();
		this.startAngle = 0;
		this.startSize = 1;
		this.sortValue = 0;
	}

	var dirDelta = new Vector3();
	var gravityDelta = new Vector3();

	/**
	 * Get the world position of the particle
	 * @param {Vector3} store
	 */
	Particle.prototype.getWorldPosition = function (store) {
		if(!this.active) return store;
		var component = this.component;

		// pos + dir * t + 0.5 * t * t * g
		var age = component.time - this.emitTime;

		if (component.loop) {
			age = age % this.component.duration;
		}

		dirDelta.copy(this.startDirection).scale(age);
		gravityDelta.copy(component.gravity).scale(age * age * 0.5);
		store.copy(this.startPosition).add(dirDelta).add(gravityDelta);

		if (component.localSpace) {
			// Transform to world space
			var worldTransform = component._entity.transformComponent.worldTransform;
			store.applyPost(worldTransform.rotation);
			store.add(worldTransform.translation);
		}

		return store;
	};

	return Particle;
});