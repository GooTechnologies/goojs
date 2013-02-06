define(['goo/math/Vector', 'goo/math/Vector2', 'goo/math/Vector3', 'goo/math/MathUtils'],
/** @lends OrbitCamControlScript */
function (Vector, Vector2, Vector3, MathUtils) {
	"use strict";

	function OrbitCamControlScript (properties) {

		properties = properties || {};

		this.domElement = properties.domElement || document;

		this.turnSpeedHorizontal = !isNaN(properties.turnSpeedHorizontal) ? properties.turnSpeed : 0.01;
		this.turnSpeedVertical = !isNaN(properties.turnSpeedVertical) ? properties.turnSpeed : 0.01;
		this.zoomSpeed = !isNaN(properties.zoomSpeed) ? properties.zoomSpeed : 0.005;

		this.dragOnly = properties.dragOnly !== undefined ? properties.dragOnly === true : true;
		this.dragButton = !isNaN(properties.dragButton) ? properties.dragButton : -1;

		this.worldUpVector = properties.worldUpVector || new Vector3(0, 1, 0);

		this.baseDistance = !isNaN(properties.baseDistance) ? properties.baseDistance : 15;
		this.minZoomDistance = !isNaN(properties.minZoomDistance) ? properties.minZoomDistance : 1;
		this.maxZoomDistance = !isNaN(properties.maxZoomDistance) ? properties.maxZoomDistance : 100;

		this.minAscent = !isNaN(properties.minAscent) ? properties.minAscent : -89.95 * MathUtils.DEG_TO_RAD;
		this.maxAscent = !isNaN(properties.maxAscent) ? properties.maxAscent : 89.95 * MathUtils.DEG_TO_RAD;
		this.minAzimuth = !isNaN(properties.minAzimuth) ? properties.minAzimuth : 0;
		this.maxAzimuth = !isNaN(properties.maxAzimuth) ? properties.maxAzimuth : MathUtils.TWO_PI;

		this.releaseVelocity = properties.releaseVelocity !== undefined ? properties.releaseVelocity === true : true;
		this.invertedX = properties.invertedX !== undefined ? properties.invertedX === true : false;
		this.invertedY = properties.invertedY !== undefined ? properties.invertedY === true : false;
		this.invertedWheel = properties.invertedWheel !== undefined ? properties.invertedWheel === true : true;

		this.drag = !isNaN(properties.drag) ? properties.drag : 0.95;

		this.timeSamples = [0, 0, 0, 0, 0];
		this.xSamples = [0, 0, 0, 0, 0];
		this.ySamples = [0, 0, 0, 0, 0];
		this.sample = 0;
		this.velocity = new Vector2();

		this.maxSampleTimeMS = !isNaN(properties.maxSampleTimeMS) ? properties.maxSampleTimeMS : 200;

		this.lookAtPoint = properties.lookAtPoint || new Vector3(0, 0, 0);
		this.spherical = properties.spherical || new Vector3(15, 0, 0);
		this.cartesian = new Vector3();

		this.dirty = true;

		this.onRun = properties.onRun;

		this.mouseState = {
			buttonDown : false,
			lastX : NaN,
			lastY : NaN
		};

		this.setupMouseControls();
	}

	OrbitCamControlScript.prototype.updateButtonState = function (event, down) {
		if (this.domElement !== document) {
			this.domElement.focus();
		}

		if (this.dragOnly && (this.dragButton === -1 || this.dragButton == event.button)) {
			this.mouseState.buttonDown = down;

			event.preventDefault();
			event.stopPropagation();
		}
	};

	OrbitCamControlScript.prototype.updateDeltas = function (event) {
		var dx = 0, dy = 0;
		if (isNaN(this.mouseState.lastX) || isNaN(this.mouseState.lastY)) {
			this.mouseState.lastX = event.clientX;
			this.mouseState.lastY = event.clientY;
		} else {
			dx = event.clientX - this.mouseState.lastX;
			dy = event.clientY - this.mouseState.lastY;
			this.mouseState.lastX = event.clientX;
			this.mouseState.lastY = event.clientY;
		}

		if (this.dragOnly && !this.mouseState.buttonDown || this.mouseState.dX === 0 && this.mouseState.dY === 0) {
			return;
		}

		this.timeSamples[this.sample] = Date.now();
		this.xSamples[this.sample] = dx;
		this.ySamples[this.sample] = dy;
		this.sample++;
		if (this.sample > this.timeSamples.length - 1) {
			this.sample = 0;
		}

		if (!this.firstPing) {
			this.velocity.set(0, 0);
			this.move(this.turnSpeedHorizontal * dx, this.turnSpeedVertical * dy);
		} else {
			this.firstPing = false;
		}
	};

	OrbitCamControlScript.prototype.move = function (x, y) {
		var azimuthAccel = this.invertedX ? -x : x;
		var thetaAccel = this.invertedY ? -y : y;

		// update our master spherical coords, using x and y movement
		this.spherical.y = (MathUtils.clamp(MathUtils.moduloPositive(this.spherical.y - azimuthAccel, MathUtils.TWO_PI), this.minAzimuth,
			this.maxAzimuth));
		this.spherical.z = (MathUtils.clamp(this.spherical.z + thetaAccel, this.minAscent, this.maxAscent));
		this.dirty = true;
	};

	OrbitCamControlScript.prototype.applyWheel = function (event) {
		if (Math.abs(event.wheelDelta) > 1) {
			this.zoom(this.zoomSpeed * event.wheelDelta);
		}
	};

	OrbitCamControlScript.prototype.zoom = function (percent) {
		var amount = (this.invertedWheel ? -1 : 1) * percent * this.baseDistance;
		this.spherical.x = MathUtils.clamp(this.spherical.x + amount, this.minZoomDistance, this.maxZoomDistance);
		this.dirty = true;
	};

	OrbitCamControlScript.prototype.applyReleaseDrift = function () {
		var now = Date.now();
		var dx = 0, dy = 0;
		var samplesRead = 0;
		for ( var i = 0, max = this.timeSamples.length; i < max; i++) {
			if (now - this.timeSamples[i] < this.maxSampleTimeMS) {
				dx += this.xSamples[i];
				dy += this.ySamples[i];
				samplesRead++;
			}
		}
		if (samplesRead > 0) {
			this.velocity.set(dx * this.turnSpeedHorizontal / samplesRead, dy * this.turnSpeedVertical / samplesRead);
		} else {
			this.velocity.set(0, 0);
		}
	};

	OrbitCamControlScript.prototype.setupMouseControls = function () {
		var that = this;
		this.domElement.addEventListener('mousedown', function (event) {
			that.updateButtonState(event, true);
			that.velocity.set(0, 0);
		}, false);

		this.domElement.addEventListener('mouseup', function (event) {
			that.updateButtonState(event, false);
			that.applyReleaseDrift();
		}, false);

		this.domElement.addEventListener('mousemove', function (event) {
			that.updateDeltas(event);
		}, false);

		this.domElement.addEventListener('mousewheel', function (event) {
			that.applyWheel(event);
		});
		this.domElement.addEventListener('DOMMouseScroll', function (event) {
			that.applyWheel(event);
		});
	};

	OrbitCamControlScript.prototype.updateVelocity = function (time) {
		if (this.velocity.lengthSquared() > 0.000001) {
			this.move(this.velocity.x, this.velocity.y);
			this.velocity.mul(MathUtils.clamp(MathUtils.lerp(time, 1.0, 1.0 - this.drag), 0.0, 1.0));
			this.dirty = true;
		} else {
			this.velocity.set(0, 0, 0);
		}
	};

	OrbitCamControlScript.prototype.run = function (entity) {
		// grab our transformComponent
		var transformComponent = entity.transformComponent;
		if (!transformComponent) {
			return;
		}
		var transform = transformComponent.transform;

		if (this.releaseVelocity) {
			this.updateVelocity(entity._world.tpf);
		}

		if (!this.dirty) {
			return;
		}

		MathUtils.sphericalToCartesian(this.spherical.x, this.spherical.y, this.spherical.z, this.cartesian);

		transform.translation.set(this.cartesian.add(this.lookAtPoint));
		if (!transform.translation.equals(this.lookAtPoint)) {
			transform.lookAt(this.lookAtPoint, this.worldUpVector);
		}
		this.dirty = false;

		// set our component updated.
		transformComponent.setUpdated();
	};

	return OrbitCamControlScript;
});