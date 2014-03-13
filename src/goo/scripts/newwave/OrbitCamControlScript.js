define([
	'goo/math/Vector3',
	'goo/math/Vector2',
	'goo/math/MathUtils',
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils'
], function(
	Vector3,
	Vector2,
	MathUtils,
	Scripts,
	ScriptUtils
) {
	'use strict';

	var externals = {
		name: 'OrbitCamControlScript',
		description: 'Enables camera to orbit around a point in 3D space using the mouse',
		parameters: [{
			key: 'turnSpeedHorizontal',
			'default': 0.005,
			type: 'float',
			min: 0.001
		}, {
			key: 'turnSpeedVertical',
			'default': 0.005,
			type: 'float',
			min: 0.001
		}, {
			key: 'zoomSpeed',
			'default': 0.2,
			type: 'float',
			min: 0.01
		}, {
			key: 'dragOnly',
			description: 'Only move the camera when dragging',
			'default': true,
			type: 'boolean'
		}, {
			key: 'dragButton',
			description: 'Button to enable dragging',
			'default': 'Any',
			options: ['Any', 'Left', 'Middle', 'Right'],
			type: 'string',
			control: 'select'
		}, {
			key: 'baseDistance',
			'default': 15,
			type: 'float',
			min: 1
		}, {
			key: 'minZoomDistance',
			'default': 1,
			type: 'float',
			min: 0.01,
		}, {
			key: 'maxZoomDistance',
			'default': 1000,
			type: 'float',
			min: 1
		}, {
			key: 'minAscent',
			description: 'Maximum arc the camera can reach below the target point',
			'default': -89,
			type: 'int',
			control: 'slider',
			min: -89,
			max: 89
		}, {
			key: 'maxAscent',
			description: 'Maximum arc the camera can reach above the target point',
			'default': 89.95,
			type: 'int',
			control: 'slider',
			min: -89,
			max: 89
		}, {
			key: 'clampAzimuth',
			'default': false,
			type: 'boolean'
		}, {
			key: 'minAzimuth',
			description: 'Maximum arc the camera can reach clockwise of the target point',
			'default': 90,
			type: 'int',
			control: 'slider',
			min: 0,
			max: 360
		}, {
			key: 'maxAzimuth',
			description: 'Maximum arc the camera can reach counter-clockwise of the target point',
			'default': 270,
			type: 'int',
			control: 'slider',
			min: 0,
			max: 360
		}, {
			key: 'releaseVelocity',
			'default': true,
			type: 'boolean'
		}, {
			key: 'invertedX',
			'default': false,
			type: 'boolean'
		}, {
			key: 'invertedY',
			'default': false,
			type: 'boolean'
		}, {
			key: 'invertedWheel',
			'default': true,
			type: 'boolean'
		}, {
			key: 'drag',
			'default': 5.0,
			type: 'int'
		}, {
			key: 'lookAtPoint',
			description: 'The point to orbit around',
			'default': [0, 0, 0],
			type: 'vec3'
		}, {
			key: 'spherical',
			description: 'The initial position of the camera given in spherical coordinates (r, theta, phi). Theta is the angle from the x-axis towards the z-axis, and phi is the angle from the xz-plane towards the y-axis.',
			'default': [15, 0, 0],
			type: 'vec3'
		}, {
			key: 'interpolationSpeed',
			'default': 7,
			type: 'int',
			min: 1,
			max: 80
		}, {
			key: 'zoomDistanceFactor',
			'default': 0.035,
			type: 'float',
			control: 'slider',
			min: 0.01,
			max: 1
		}, {
			key: 'detailZoom',
			'default': 0.15,
			type: 'float',
			control: 'slider',
			min: 0.01,
			max: 1
		}]
	};

	var OrbitCamScript = function () {
		var entity, transformComponent, transform, gooRunner;
		var parameters;

		var spherical;
		var lookAtPoint;

		/**
		 * @param {Vector3} [properties.spherical=Vector3(15,0,0)] The initial position of the camera given in spherical coordinates (r, theta, phi).
		 * Theta is the angle from the x-axis towards the z-axis, and phi is the angle from the xz-plane towards the y-axis. Some examples:
		 * <ul>
		 * <li>View from right: <code>new Vector3(15,0,0); // y is up and z is left</code> </li>
		 * <li>View from front: <code>new Vector3(15, Math.PI/2, 0) // y is up and x is right </code> </li>
		 * <li>View from top: <code>new Vector3(15,Math.PI/2,Math.PI/2) // z is down and x is right</code> </li>
		 * <li>View from top-right corner: <code>new Vector3(15, Math.PI/3, Math.PI/8)</code> </li>
		 * </ul>
		 */

		var timeSamples, xSamples, ySamples, sample;
		var velocity, targetSpherical, cartesian;
		var mouseState;
		var worldUpVector;
		var maxSampleTimeMS;
		var domElement;
		var dragButton;

		function setup(_parameters, env) {
			parameters = _parameters;
			entity = env.getEntity();
			domElement = env.domElement;
			dragButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(_parameters.dragButton) - 1;
			if (dragButton < -1) {
				dragButton = -1;
			}

			timeSamples = [0, 0, 0, 0, 0];
			xSamples = [0, 0, 0, 0, 0];
			ySamples = [0, 0, 0, 0, 0];
			sample = 0;
			velocity = new Vector2(0, 0);

			spherical = new Vector3(_parameters.spherical);
			spherical.data[1] *= MathUtils.DEG_TO_RAD;
			spherical.data[2] *= MathUtils.DEG_TO_RAD;
			_parameters._lookAtPoint = lookAtPoint = new Vector3(_parameters.lookAtPoint);

			targetSpherical = new Vector3(spherical);
			cartesian = new Vector3();
			worldUpVector = new Vector3(Vector3.UNIT_Y);
			maxSampleTimeMS = 200;

			parameters.dirty = true;

			mouseState = {
				buttonDown: false,
				lastX: NaN,
				lastY: NaN
			};

			setupMouseControls();
		}

		function updateButtonState(buttonIndex, down) {
			if (domElement !== document) {
				domElement.focus();
			}

			if (parameters.dragOnly && (dragButton === -1 || dragButton === buttonIndex)) {
				mouseState.buttonDown = down;
				if (down) {
					mouseState.lastX = NaN;
					mouseState.lastY = NaN;
					velocity.set(0, 0);
					spherical.y = MathUtils.moduloPositive(spherical.y, MathUtils.TWO_PI);
					targetSpherical.copy(spherical);
				} else {
					applyReleaseDrift();
				}
			}
		};

		function updateDeltas(mouseX, mouseY) {
			var dx = 0, dy = 0;
			if (isNaN(mouseState.lastX) || isNaN(mouseState.lastY)) {
				mouseState.lastX = mouseX;
				mouseState.lastY = mouseY;
			} else {
				dx = -(mouseX - mouseState.lastX);
				dy = mouseY - mouseState.lastY;
				mouseState.lastX = mouseX;
				mouseState.lastY = mouseY;
			}

			if (parameters.dragOnly && !mouseState.buttonDown || dx === 0 && dy === 0) {
				return;
			}

			timeSamples[sample] = Date.now();
			xSamples[sample] = dx;
			ySamples[sample] = dy;

			sample++;
			if (sample > timeSamples.length - 1) {
				sample = 0;
			}

			velocity.set(0, 0);
			move(parameters.turnSpeedHorizontal * dx, parameters.turnSpeedVertical * dy);
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

		function move(x, y) {
			var azimuthAccel = parameters.invertedX ? -x : x;
			var thetaAccel = parameters.invertedY ? -y : y;

			// update our master spherical coords, using x and y movement
			if (parameters.clampAzimuth) {
				var minAzimuth = parameters.minAzimuth * MathUtils.DEG_TO_RAD;
				var maxAzimuth = parameters.maxAzimuth * MathUtils.DEG_TO_RAD;
				targetSpherical.y = _radialClamp(targetSpherical.y - azimuthAccel, minAzimuth, maxAzimuth);
			} else {
				targetSpherical.y = targetSpherical.y - azimuthAccel;
			}
			var minAscent = parameters.minAscent * MathUtils.DEG_TO_RAD;
			var maxAscent = parameters.maxAscent * MathUtils.DEG_TO_RAD;
			targetSpherical.z = MathUtils.clamp(targetSpherical.z + thetaAccel, minAscent, maxAscent);
			parameters.dirty = true;
		};

		function applyWheel(e) {
			var delta = (parameters.invertedWheel ? -1 : 1) * Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
			delta *= parameters.zoomDistanceFactor * targetSpherical.x;
			zoom(parameters.zoomSpeed * delta);
		};

		function zoom(percent) {
			var amount = percent * parameters.baseDistance;
			targetSpherical.x = MathUtils.clamp(targetSpherical.x + amount, parameters.minZoomDistance, parameters.maxZoomDistance);
			parameters.dirty = true;
		};

		function applyReleaseDrift() {
			var now = Date.now();
			var dx = 0, dy = 0;
			var found = false;
			for (var i = 0, max = timeSamples.length; i < max; i++) {
				if (now - timeSamples[i] < maxSampleTimeMS) {
					dx += xSamples[i];
					dy += ySamples[i];
					found = true;
				}
			}
			if (found) {
				velocity.set(
					dx * parameters.turnSpeedHorizontal / timeSamples.length,
					dy * parameters.turnSpeedVertical / timeSamples.length
				);
			} else {
				velocity.set(0, 0);
			}
		};

		function setupMouseControls() {
			domElement.addEventListener('mousedown', function (event) {
				updateButtonState(event.button, true);
			}, false);

			document.addEventListener('mouseup', function (event) {
				updateButtonState(event.button, false);
			}, false);

			document.addEventListener('mousemove', function (event) {
				updateDeltas(event.clientX, event.clientY);
			}, false);

			domElement.addEventListener('mousewheel', function (event) {
				applyWheel(event);
			}, false);
			domElement.addEventListener('DOMMouseScroll', function (event) {
				applyWheel(event);
			}, false);

			// Avoid missing the mouseup event because of Chrome bug:
			// https://code.google.com/p/chromium/issues/detail?id=244289
			// seems solved
			/*
			parameters.domElement.addEventListener('dragstart', function (event) {
				preventDefault();
			}, false);
			*/
			domElement.oncontextmenu = function () { return false; };
			var oldDistance = 0;

			// Touch controls
			domElement.addEventListener('touchstart', function () {
				updateButtonState(0, true);
			});
			domElement.addEventListener('touchend', function () {
				updateButtonState(0, false);
				oldDistance = 0;
			});
			domElement.addEventListener('touchmove', function (event) {
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
					updateDeltas(cx, cy);
				}
				var scale = (distance - oldDistance) / Math.max(domElement.height, domElement.width);
				scale /= 3;
				if (oldDistance === 0) {
					oldDistance = distance;
				} else if (touches.length === 2 && Math.abs(scale) > 0.3) {
					applyWheel({ wheelDelta: scale });
					oldDistance = distance;
				}
			});
		};

		function updateVelocity (time) {
			if (velocity.lengthSquared() > 0.000001) {
				move(velocity.x, velocity.y);
				velocity.mul(MathUtils.clamp(MathUtils.lerp(time, 1.0, 1.0 - parameters.drag), 0.0, 1.0));
			} else {
				velocity.set(0, 0, 0);
			}
		};

		function update(parameters, env) {
			var entity = env.getEntity();
			// grab our transformComponent
			var transformComponent = entity.transformComponent;

			var transform = transformComponent.transform;

			if (parameters.releaseVelocity) {
				updateVelocity(entity._world.tpf);
			}

			if (!parameters.dirty) {
				return; //
			}

			var delta = MathUtils.clamp(parameters.interpolationSpeed * entity._world.tpf, 0.0, 1.0);

			if (parameters.clampAzimuth) {
				spherical.y = MathUtils.lerp(delta, spherical.y, targetSpherical.y);
			} else {
				spherical.y = MathUtils.lerp(delta, spherical.y, targetSpherical.y);
			}

			spherical.x = MathUtils.lerp(delta, spherical.x, targetSpherical.x);
			spherical.z = MathUtils.lerp(delta, spherical.z, targetSpherical.z);

			MathUtils.sphericalToCartesian(spherical.x, spherical.y, spherical.z, cartesian);

			transform.translation.set(cartesian.add(lookAtPoint));
			if (!transform.translation.equals(lookAtPoint)) {
				transform.lookAt(lookAtPoint, worldUpVector);
			}

			if (spherical.distanceSquared(targetSpherical) < 0.000001) {
				parameters.dirty = false;
				spherical.y = MathUtils.moduloPositive(spherical.y, MathUtils.TWO_PI);
				targetSpherical.copy(spherical);
				parameters.dirty = false;
			}

			// set our component updated.
			transformComponent.setUpdated();
		};

		function cleanup() {

		}
		return {
			setup: setup,
			update: update,
			cleanup: cleanup,
			externals: externals
		};
	};

	Scripts.register(externals, OrbitCamScript);
});