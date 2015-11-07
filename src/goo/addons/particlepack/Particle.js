define([
	'goo/math/Vector3'
], function (
	Vector3
) {
	'use strict';

	function Particle(particleComponent) {
		this.component = particleComponent;
		this.timeScale = 0;
		this.timeOffset = 0;
		this.localStartPosition = new Vector3();
		this.localStartDirection = new Vector3();
		this.dirty = true; // If initial properties should be uploaded to the GPU again
	}

	Particle.prototype.update = function (time, lastTime) {
		// if the time passed the modulo/limit, and if using global positions we need to update the start position
		if (lastTime > time && !this.component.localSpace) {
			this.dirty = true;
		}
	};

	return Particle;
});