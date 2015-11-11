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
		this.timeOffset = 0;
		this.active = true;
		this.localStartPosition = new Vector3();
		this.localStartDirection = new Vector3();
	}

	Particle.prototype.didEmitBetween = function (t0, t1, looping, duration) {
		if (!this.active) {
			return false;
		}
		if (looping) {
			// Move the timeOffset so the time window is on the same loop
			var movedTimeOffset = this.timeOffset;
			if (movedTimeOffset < 0) {
				movedTimeOffset += this.lifeTime;
			}
			t0 = t0 % this.lifeTime;
			t1 = t1 % this.lifeTime;
			if (t1 < t0) {
				t1 += this.lifeTime;
			}

			// Within the window?
			return movedTimeOffset >= t0 && movedTimeOffset < t1;
		}

		return false;
	};

	return Particle;
});