define(['goo/math/Vector', 'goo/math/Vector2', 'goo/math/Vector3', 'goo/math/MathUtils'],
/** @lends OrbitCamControlScript */
function (Vector, Vector2, Vector3, MathUtils) {
	"use strict";

	function OrbitCamControlScript (properties) {

		properties = properties || {};

		this.name = 'OrbitCamControlScript';

		this.domElement = properties.domElement || document;

		this.turnSpeedHorizontal = !isNaN(properties.turnSpeedHorizontal) ? properties.turnSpeed : 0.005;
		this.turnSpeedVertical = !isNaN(properties.turnSpeedVertical) ? properties.turnSpeed : 0.005;
		this.zoomSpeed = !isNaN(properties.zoomSpeed) ? properties.zoomSpeed : 0.20;

		this.dragOnly = properties.dragOnly !== undefined ? properties.dragOnly === true : true;
		this.dragButton = !isNaN(properties.dragButton) ? properties.dragButton : -1;

		this.worldUpVector = properties.worldUpVector || new Vector3(0, 1, 0);

		this.baseDistance = !isNaN(properties.baseDistance) ? properties.baseDistance : 15;
		this.minZoomDistance = !isNaN(properties.minZoomDistance) ? properties.minZoomDistance : 1;
		this.maxZoomDistance = !isNaN(properties.maxZoomDistance) ? properties.maxZoomDistance : 1000;

		this.minAscent = !isNaN(properties.minAscent) ? properties.minAscent : -89.95 * MathUtils.DEG_TO_RAD;
		this.maxAscent = !isNaN(properties.maxAscent) ? properties.maxAscent : 89.95 * MathUtils.DEG_TO_RAD;
		this.clampAzimuth = properties.clampAzimuth !== undefined ? properties.clampAzimuth === true : false;
		this.minAzimuth = !isNaN(properties.minAzimuth) ? properties.minAzimuth : 90 * MathUtils.DEG_TO_RAD;
		this.maxAzimuth = !isNaN(properties.maxAzimuth) ? properties.maxAzimuth : 270 * MathUtils.DEG_TO_RAD;

		this.releaseVelocity = properties.releaseVelocity !== undefined ? properties.releaseVelocity === true : true;
		this.invertedX = properties.invertedX !== undefined ? properties.invertedX === true : false;
		this.invertedY = properties.invertedY !== undefined ? properties.invertedY === true : false;
		this.invertedWheel = properties.invertedWheel !== undefined ? properties.invertedWheel === true : true;

		this.mouseUpOnOut = properties.mouseUpOnOut !== undefined ? properties.mouseUpOnOut === true : true;
		this.drag = !isNaN(properties.drag) ? properties.drag : 5.0;

		this.timeSamples = [0, 0, 0, 0, 0];
		this.xSamples = [0, 0, 0, 0, 0];
		this.ySamples = [0, 0, 0, 0, 0];
		this.sample = 0;
		this.velocity = new Vector2();

		this.maxSampleTimeMS = !isNaN(properties.maxSampleTimeMS) ? properties.maxSampleTimeMS : 200;

		this.lookAtPoint = properties.lookAtPoint || new Vector3(0, 0, 0);
		this.spherical = properties.spherical || new Vector3(15, 0, 0);
		this.targetSpherical = new Vector3(this.spherical);
		this.interpolationSpeed = !isNaN(properties.interpolationSpeed) ? properties.interpolationSpeed : 7;
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

	OrbitCamControlScript.prototype.updateButtonState = function (buttonIndex, down) {
		if (this.domElement !== document) {
			this.domElement.focus();
		}

		if (this.dragOnly && (this.dragButton === -1 || this.dragButton === buttonIndex)) {
			this.mouseState.buttonDown = down;
			if (down) {
				this.mouseState.lastX = NaN;
				this.mouseState.lastY = NaN;
				this.velocity.set(0, 0);
				this.spherical.y = MathUtils.moduloPositive(this.spherical.y, MathUtils.TWO_PI);
				this.targetSpherical.copy(this.spherical);
			} else {
				this.applyReleaseDrift();
			}
		}
	};

	OrbitCamControlScript.prototype.updateDeltas = function (mouseX, mouseY) {
		var dx = 0, dy = 0;
		if (isNaN(this.mouseState.lastX) || isNaN(this.mouseState.lastY)) {
			this.mouseState.lastX = mouseX;
			this.mouseState.lastY = mouseY;
		} else {
			dx = -(mouseX - this.mouseState.lastX);
			dy = mouseY - this.mouseState.lastY;
			this.mouseState.lastX = mouseX;
			this.mouseState.lastY = mouseY;
		}

		if (this.dragOnly && !this.mouseState.buttonDown || dx === 0 && dy === 0) {
			return;
		}

		this.timeSamples[this.sample] = Date.now();
		this.xSamples[this.sample] = dx;
		this.ySamples[this.sample] = dy;
		this.sample++;
		if (this.sample > this.timeSamples.length - 1) {
			this.sample = 0;
		}

		this.velocity.set(0, 0);
		this.move(this.turnSpeedHorizontal * dx, this.turnSpeedVertical * dy);
	};

	OrbitCamControlScript.prototype.move = function (x, y) {
		var azimuthAccel = this.invertedX ? -x : x;
		var thetaAccel = this.invertedY ? -y : y;

		// update our master spherical coords, using x and y movement
		if (this.clampAzimuth) {
			this.targetSpherical.y = (MathUtils.clamp(MathUtils.moduloPositive(this.targetSpherical.y - azimuthAccel, MathUtils.TWO_PI),
				this.minAzimuth, this.maxAzimuth));
		} else {
			this.targetSpherical.y = this.targetSpherical.y - azimuthAccel;
		}
		this.targetSpherical.z = (MathUtils.clamp(this.targetSpherical.z + thetaAccel, this.minAscent, this.maxAscent));
		this.dirty = true;
	};

	OrbitCamControlScript.prototype.applyWheel = function (e) {
		var delta = (this.invertedWheel ? -1 : 1) * Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		this.zoom(this.zoomSpeed * delta);
	};

	OrbitCamControlScript.prototype.zoom = function (percent) {
		var amount = percent * this.baseDistance;
		this.targetSpherical.x = MathUtils.clamp(this.targetSpherical.x + amount, this.minZoomDistance, this.maxZoomDistance);
		this.dirty = true;
	};

	OrbitCamControlScript.prototype.applyReleaseDrift = function () {
		var now = Date.now();
		var dx = 0, dy = 0;
		var found = false;
		for ( var i = 0, max = this.timeSamples.length; i < max; i++) {
			if (now - this.timeSamples[i] < this.maxSampleTimeMS) {
				dx += this.xSamples[i];
				dy += this.ySamples[i];
				found = true;
			}
		}
		if (found) {
			this.velocity.set(dx * this.turnSpeedHorizontal / this.timeSamples.length, dy * this.turnSpeedVertical / this.timeSamples.length);
		} else {
			this.velocity.set(0, 0);
		}
	};

	OrbitCamControlScript.prototype.setupMouseControls = function () {
		var that = this;
		this.domElement.addEventListener('mousedown', function (event) {
			that.updateButtonState(event.button, true);
		}, false);

		this.domElement.addEventListener('mouseup', function (event) {
			that.updateButtonState(event.button, false);
		}, false);

		if (this.mouseUpOnOut) {
			this.domElement.addEventListener('mouseout', function (event) {
				that.updateButtonState(event.button, false);
			}, false);
		}

		this.domElement.addEventListener('mousemove', function (event) {
			that.updateDeltas(event.clientX, event.clientY);
		}, false);

		this.domElement.addEventListener('mousewheel', function (event) {
			that.applyWheel(event);
		}, false);
		this.domElement.addEventListener('DOMMouseScroll', function (event) {
			that.applyWheel(event);
		}, false);

		// optional touch controls... requires Hammer.js v2
		//global Hammer:true
		if (typeof (Hammer) !== "undefined") {
			// Disable warning that we call `Hammer()`, not `new Hammer()`
			//jshint newcap:false
			var hammertime = Hammer(this.domElement, {
				transform_always_block : true,
				transform_min_scale : 1
			});

			hammertime.on('touch drag transform release', function (ev) {
				switch (ev.type) {
					case 'transform':
						var scale = ev.gesture.scale;
						if (scale < 1) {
							that.zoom(that.zoomSpeed * 1);
						} else if (scale > 1) {
							that.zoom(that.zoomSpeed * -1);
						}
						break;
					case 'touch':
						that.updateButtonState(0, true);
						break;
					case 'release':
						that.updateButtonState(0, false);
						break;
					case 'drag':
						that.updateDeltas(ev.gesture.center.pageX, ev.gesture.center.pageY);
						break;
				}
			});
		}
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

		var delta = this.interpolationSpeed * entity._world.tpf;

		if (this.clampAzimuth) {
			this.spherical.y = MathUtils.lerp(delta, this.spherical.y, this.targetSpherical.y);
		} else {
			this.spherical.y = MathUtils.lerp(delta, this.spherical.y, this.targetSpherical.y);
			// y can wrap around 0/2pi, so find closest direction and go that way -- Perhaps could be cleaner?
			// if (this.spherical.y > this.targetSpherical.y + 0.00001) {
			// if (Math.abs(this.spherical.y - this.targetSpherical.y) > Math.abs(this.spherical.y - (this.targetSpherical.y + MathUtils.TWO_PI))) {
			// this.spherical.y = MathUtils.lerp(delta, this.spherical.y, this.targetSpherical.y + MathUtils.TWO_PI);
			// this.spherical.y = MathUtils.moduloPositive(this.spherical.y, MathUtils.TWO_PI);
			// } else {
			// this.spherical.y = MathUtils.lerp(delta, this.spherical.y, this.targetSpherical.y);
			// }
			// } else if (this.spherical.y < this.targetSpherical.y - 0.00001) {
			// if (Math.abs(this.targetSpherical.y - this.spherical.y) > Math.abs(this.targetSpherical.y - (this.spherical.y + MathUtils.TWO_PI))) {
			// this.spherical.y = MathUtils.lerp(delta, this.spherical.y + MathUtils.TWO_PI, this.targetSpherical.y);
			// this.spherical.y = MathUtils.moduloPositive(this.spherical.y, MathUtils.TWO_PI);
			// } else {
			// this.spherical.y = MathUtils.lerp(delta, this.spherical.y, this.targetSpherical.y);
			// }
			// }
		}

		this.spherical.x = MathUtils.lerp(delta, this.spherical.x, this.targetSpherical.x);
		this.spherical.z = MathUtils.lerp(delta, this.spherical.z, this.targetSpherical.z);

		MathUtils.sphericalToCartesian(this.spherical.x, this.spherical.y, this.spherical.z, this.cartesian);

		transform.translation.set(this.cartesian.add(this.lookAtPoint));
		if (!transform.translation.equals(this.lookAtPoint)) {
			transform.lookAt(this.lookAtPoint, this.worldUpVector);
		}

		if (this.spherical.distanceSquared(this.targetSpherical) < 0.000001) {
			this.dirty = false;
			this.spherical.y = MathUtils.moduloPositive(this.spherical.y, MathUtils.TWO_PI);
			this.targetSpherical.copy(this.spherical);
		}

		// set our component updated.
		transformComponent.setUpdated();
	};

	return OrbitCamControlScript;
});
