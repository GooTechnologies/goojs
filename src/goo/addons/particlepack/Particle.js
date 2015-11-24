define([
	'goo/math/Vector3'
], function (
	Vector3
) {
	'use strict';

	function Particle(particleComponent) {
		this.component = particleComponent;
		this.lifeTime = 1;
		this.timeScale = 0;
		this.emitTime = 0;
		this.active = true;
		this.startPosition = new Vector3();
		this.startDirection = new Vector3();
		this.startAngle = 0;
		this.sortValue = 0;
	}

	var dirDelta = new Vector3();
	var gravityDelta = new Vector3();
	Particle.prototype.getWorldPosition = function (store) {
		var component = this.component;

		// pos + dir * t + 0.5 * t * t * g
		var age = component.time - this.emitTime;

		if (component.loop) {
			age = age % this.lifeTime;
		}

		dirDelta.copy(this.startDirection).scale(age);
		gravityDelta.copy(component.gravity).scale(age * age * 0.5);
		store.copy(this.startPosition).add(dirDelta).add(gravityDelta);

		if (component.localSpace) {
			// Transform to world space
			store.applyPost(this.component.entity.transformComponent.worldTransform.rotation);
			store.add(this.component.entity.transformComponent.worldTransform.translation);
		}

		return store;
	};

	return Particle;
});