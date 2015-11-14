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
		this.sortValue = 0;
	}

	var dirDelta = new Vector3();
	var gravityDelta = new Vector3();
	Particle.prototype.getWorldPosition = function (store) {
		var component = this.component;

		// pos + dir * t + 0.5 * t * t * g
		var age = component.time - this.emitTime;
		dirDelta.copy(this.startDirection).scale(age);
		gravityDelta.copy(component.gravity).scale(age * age * 0.5);
		store.copy(this.startPosition).add(dirDelta).add(gravityDelta);

		return store;
	};

	return Particle;
});