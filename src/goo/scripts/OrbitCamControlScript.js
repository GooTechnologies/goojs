define([
	'goo/math/Vector2', 'goo/math/Vector3', 'goo/math/MathUtils'],
/** @lends */
function (
	Vector2, Vector3, MathUtils) {
	"use strict";

	var _defaults = {
		domElement: null,

		turnSpeedHorizontal: 0.005,
		turnSpeedVertical: 0.005,
		zoomSpeed: 0.20,

		dragOnly: true,
		dragButton: -1,

		worldUpVector: new Vector3(0,1,0),

		baseDistance: 15,
		minZoomDistance: 1,
		maxZoomDistance: 1000,

		minAscent: -89.95 * MathUtils.DEG_TO_RAD,
		maxAscent: 89.95 * MathUtils.DEG_TO_RAD,
		clampAzimuth: false,
		minAzimuth: 90 * MathUtils.DEG_TO_RAD,
		maxAzimuth: 270 * MathUtils.DEG_TO_RAD,

		releaseVelocity: true,
		invertedX: false,
		invertedY: false,
		invertedWheel: true,

		drag: 5.0,

		maxSampleTimeMS: 200,

		lookAtPoint: new Vector3(0,0,0),
		spherical: new Vector3(15,0,0),
		interpolationSpeed: 7,
		onRun: null
	};

	/**
	 * @class Enables camera to orbit around a point in 3D space using the mouse.
	 * @param {Object} [properties]
	 * @param {Element} [properties.domElement=document] Element to add mouse listeners to
	 * @param {number} [properties.turnSpeedHorizontal=0.005]
	 * @param {number} [properties.turnSpeedVertical=0.005]
	 * @param {number} [properties.zoomSpeed=0.2]
	 * @param {boolean} [properties.dragOnly=true] Only move the camera when dragging
	 * @param {number} [properties.dragButton=-1] Only drag with button with this code (-1 to enable all)
	 * @param {Vector3} [properties.worldUpVector=Vector3(0,1,0)]
	 * @param {number} [properties.minZoomDistance=1]
	 * @param {number} [properties.maxZoomDistance=1000]
	 * @param {number} [properties.minAscent=-89.95 * MathUtils.DEG_TO_RAD] Maximum arc (in radians) the camera can reach below the target point
	 * @param {number} [properties.maxAscent=89.95 * MathUtils.DEG_TO_RAD] Maximum arc (in radians) the camera can reach above the target point
	 * @param {boolean} [properties.clampAzimuth=false]
	 * @param {number} [properties.minAzimuth=-90 * MathUtils.DEG_TO_RAD] Maximum arc (in radians) the camera can reach clockwise of the target point
	 * @param {number} [properties.maxAzimuth=270 * MathUtils.DEG_TO_RAD] Maximum arc (in radians) the camera can reach counter-clockwise of the target point
	 * @param {boolean} [properties.invertedX=false]
	 * @param {boolean} [properties.invertedY=false]
	 * @param {boolean} [properties.invertedWheel=true]
	 * @param {Vector3} [properties.lookAtPoint=Vector3(0,0,0)] The point to orbit around.
	 * @param {Vector3} [properties.spherical=Vector3(15,0,0)] The initial position of the camera given in spherical coordinates (r, theta, phi).
	 * Theta is the angle from the x-axis towards the z-axis, and phi is the angle from the xz-plane towards the y-axis. Some examples:
	 * <ul>
	 * <li>View from right: <code>new Vector3(15,0,0); // y is up and z is left</code> </li>
	 * <li>View from front: <code>new Vector3(15, Math.PI/2, 0) // y is up and x is right </code> </li>
	 * <li>View from top: <code>new Vector3(15,Math.PI/2,Math.PI/2) // z is down and x is right</code> </li>
	 * <li>View from top-right corner: <code>new Vector3(15, Math.PI/3, Math.PI/8)</code> </li>
	 * </ul>
	 */
	function OrbitCamControlScript (properties) {
		properties = properties || {};
		for(var key in _defaults) {
			if(typeof(_defaults[key]) === 'boolean') {
				this[key] = properties[key] !== undefined ? properties[key] === true : _defaults[key];
			}
			else if (!isNaN(_defaults[key])) {
				this[key] = !isNaN(properties[key]) ? properties[key] : _defaults[key];
			}
			else if(_defaults[key] instanceof Vector3) {
				this[key] = (properties[key]) ? new Vector3(properties[key]) : new Vector3().set(_defaults[key]);
			}
			else {
				this[key] = properties[key] || _defaults[key];
			}
		}

		this.name = 'OrbitCamControlScript';

		this.timeSamples = [0, 0, 0, 0, 0];
		this.xSamples = [0, 0, 0, 0, 0];
		this.ySamples = [0, 0, 0, 0, 0];
		this.sample = 0;
		this.velocity = new Vector2(0, 0);

		this.targetSpherical = new Vector3(this.spherical);
		this.cartesian = new Vector3();

		this.dirty = true;

		this.detailZoom = properties.detailZoom || 0.15;
		this.zoomDistanceFactor = properties.zoomDistanceFactor || 0.035;


		this.mouseState = {
			buttonDown : false,
			lastX : NaN,
			lastY : NaN
		};

		if(this.domElement) {
			this.setupMouseControls();
		}

		if (properties.demoMode) {
			this.demoMode = true;
			this.moveInterval = properties.moveInterval;
			this.lastTimeMoved = Date.now() + (properties.moveInitialDelay - this.moveInterval);
		}
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

	// Should be moved to mathUtils?
	function _radialClamp(value, min, max) {
		// Rotating coordinates to be mirrored
		var zero = (min + max)/2 + ((max > min) ? Math.PI : 0);
		var _value = MathUtils.moduloPositive(value - zero, MathUtils.TWO_PI);
		var _min = MathUtils.moduloPositive(min - zero, MathUtils.TWO_PI);
		var _max = MathUtils.moduloPositive(max - zero, MathUtils.TWO_PI);

		// Putting min, max and value on the same circle
		if (value < 0 && min > 0) { min -= MathUtils.TWO_PI; }
		else if (value > 0 && min < 0) { min += MathUtils.TWO_PI; }
		if (value > MathUtils.TWO_PI && max < MathUtils.TWO_PI) { max += MathUtils.TWO_PI; }

		return _value < _min ? min : _value > _max ? max : value;
	}


	OrbitCamControlScript.prototype.move = function (x, y) {
		var azimuthAccel = this.invertedX ? -x : x;
		var thetaAccel = this.invertedY ? -y : y;

		// update our master spherical coords, using x and y movement
		if (this.clampAzimuth) {
			this.targetSpherical.y = _radialClamp(this.targetSpherical.y - azimuthAccel,
				this.minAzimuth, this.maxAzimuth);
		} else {
			this.targetSpherical.y = this.targetSpherical.y - azimuthAccel;
		}
		this.targetSpherical.z = (MathUtils.clamp(this.targetSpherical.z + thetaAccel, this.minAscent, this.maxAscent));
		this.dirty = true;
	};

	OrbitCamControlScript.prototype.applyWheel = function (e) {
		var delta = (this.invertedWheel ? -1 : 1) * Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		delta *= this.zoomDistanceFactor * this.targetSpherical.x;
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

		document.addEventListener('mouseup', function (event) {
			that.updateButtonState(event.button, false);
		}, false);

		document.addEventListener('mousemove', function (event) {
			that.updateDeltas(event.clientX, event.clientY);
			that.lastTimeMoved = Date.now();
		}, false);

		this.domElement.addEventListener('mousewheel', function (event) {
			that.applyWheel(event);
			that.lastTimeMoved = Date.now();
		}, false);
		this.domElement.addEventListener('DOMMouseScroll', function (event) {
			that.applyWheel(event);
		}, false);

		// Avoid missing the mouseup event because of Chrome bug:
		// https://code.google.com/p/chromium/issues/detail?id=244289
		this.domElement.addEventListener('dragstart', function (event) {
			event.preventDefault();
		}, false);
		this.domElement.oncontextmenu = function() { return false; };
		var oldDistance = 0;

		// Touch controls
		this.domElement.addEventListener('touchstart', function() {
			that.updateButtonState(0, true);
		});
		this.domElement.addEventListener('touchend', function() {
			that.updateButtonState(0, false);
			oldDistance = 0;
		});
		this.domElement.addEventListener('touchmove', function(event) {
			var cx, cy, distance;
			var touches = event.targetTouches;
			var x1 = touches[0].clientX;
			var y1 = touches[0].clientY;
			if (touches.length === 2) {
				var x2 = touches[1].clientX;
				var y2 = touches[1].clientY;
				cx = (x1 + x2) / 2;
				cy = (y1 + y2) / 2;
				distance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
			} else {
				cx = x1;
				cy = y1;
				that.updateDeltas(cx, cy);
			}
			var scale = (distance - oldDistance) / Math.max(that.domElement.height, that.domElement.width);
			scale /= 3;
			if (oldDistance === 0) {
				oldDistance = distance;
			} else if (touches.length === 2 && Math.abs(scale) > 0.3) {
				that.applyWheel({ wheelDelta: scale });
				oldDistance = distance;
			}
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

	OrbitCamControlScript.prototype.run = function (entity, tpf, env) {
		if (this.demoMode) {
			var now = Date.now();

			if (now - this.lastTimeMoved > this.moveInterval) {
				this.lastTimeMoved = now;
				this.move(Math.round(Math.random())-0.5, Math.round(Math.random())-0.5);
			}
		}
		if (env) {
			if(!this.domElement && env.domElement) {
				this.domElement = env.domElement;
				this.setupMouseControls();
			}
		}
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

		var delta = MathUtils.clamp(this.interpolationSpeed * entity._world.tpf, 0.0, 1.0);

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
