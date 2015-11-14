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
	}

	return Particle;
});