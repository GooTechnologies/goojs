define([
	'goo/math/Vector3',
	'goo/math/Vector2',
	'goo/math/MathUtils'
], function(
	Vector3,
	Vector2,
	MathUtils
) {
	'use strict';

	function OrbitCamControlScript() {
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
		var zoomDistanceFactor = 0.035;
		var listeners;

		function setup(parameters, environment) {
			domElement = environment.domElement;
			dragButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(parameters.dragButton) - 1;
			if (dragButton < -1) {
				dragButton = -1;
			}
			// Making more linear perception
			environment.smoothness = Math.pow(MathUtils.clamp(parameters.smoothness, 0, 1), 0.3);
			environment.inertia = Math.pow(MathUtils.clamp(parameters.drag, 0, 1), 0.3);

			timeSamples = [0, 0, 0, 0, 0];
			xSamples = [0, 0, 0, 0, 0];
			ySamples = [0, 0, 0, 0, 0];
			sample = 0;
			velocity = new Vector2(0, 0);

			environment.spherical = spherical = new Vector3(parameters.spherical);
			spherical.data[1] *= MathUtils.DEG_TO_RAD;
			spherical.data[2] *= MathUtils.DEG_TO_RAD;
			environment.lookAtPoint = lookAtPoint = new Vector3(parameters.lookAtPoint);
			environment.goingToLookAt = new Vector3(lookAtPoint);

			environment.targetSpherical = targetSpherical = new Vector3(spherical);
			cartesian = new Vector3();
			worldUpVector = new Vector3(Vector3.UNIT_Y);
			maxSampleTimeMS = 200;

			environment.dirty = true;

			mouseState = {
				buttonDown: false,
				lastX: NaN,
				lastY: NaN
			};

			setupMouseControls(parameters, environment);
		}

		function updateButtonState(buttonIndex, down, parameters, environment) {
			if (environment.domElement !== document) {
				environment.domElement.focus();
			}

			if (dragButton === -1 || dragButton === buttonIndex) {
				mouseState.buttonDown = down;
				if (down) {
					mouseState.lastX = NaN;
					mouseState.lastY = NaN;
					velocity.set(0, 0);
					spherical.y = MathUtils.moduloPositive(spherical.y, MathUtils.TWO_PI);
					targetSpherical.copy(spherical);
				} else {
					applyReleaseDrift(parameters);
				}
			}
		}

		function updateDeltas(mouseX, mouseY, parameters, environment) {
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

			if (!mouseState.buttonDown || dx === 0 && dy === 0) {
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
			move(parameters.orbitSpeed * dx, parameters.orbitSpeed * dy, parameters, environment);
		}

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

		function move(azimuthAccel, thetaAccel, parameters, environment) {

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
			environment.dirty = true;
		}

		function applyWheel(e, parameters, environment) {
			var delta =  Math.max(-1, Math.min(1, -e.wheelDelta || e.detail));
			delta *= zoomDistanceFactor * targetSpherical.x;
			zoom(parameters.zoomSpeed * delta, parameters, environment);
		}

		function zoom(amount, parameters, environment) {
			targetSpherical.x = MathUtils.clamp(targetSpherical.x + amount, parameters.minZoomDistance, parameters.maxZoomDistance);
			environment.dirty = true;
		}

		function applyReleaseDrift(parameters) {
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
					dx * parameters.orbitSpeed / timeSamples.length,
					dy * parameters.orbitSpeed / timeSamples.length
				);
			} else {
				velocity.set(0, 0);
			}
		}

		function setupMouseControls(parameters, environment) {
			var oldDistance = 0;
			listeners = {
				mousedown: function(event) {
					if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
						updateButtonState(event.button, true, parameters, environment);
					}
				},
				mouseup: function(event) {
					updateButtonState(event.button, false, parameters, environment);
				},
				mousemove: function(event) {
					if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
						updateDeltas(event.clientX, event.clientY, parameters, environment);
					}
				},
				mouseleave: function(event) {
					environment.listeners.mouseup(event);
				},
				mousewheel: function(event) {
					if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
						applyWheel(event, parameters, environment);
					}
				},
				touchstart: function(event) {
					if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
						updateButtonState(dragButton, event.targetTouches.length === 1, parameters, environment);
					}
				},
				touchend: function(/*event*/) {
					updateButtonState(dragButton, false, parameters, environment);
					oldDistance = 0;
				},
				touchmove: function(event) {
					if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
						var cx, cy, distance;
						var touches = event.targetTouches;
						var x1 = touches[0].clientX;
						var y1 = touches[0].clientY;
						if (touches.length === 2) {
							var x2 = touches[1].clientX;
							var y2 = touches[1].clientY;
							distance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
						} else {
							cx = x1;
							cy = y1;
							updateDeltas(cx, cy, parameters, environment);
						}
						var scale = (distance - oldDistance) / Math.max(domElement.height, domElement.width);
						scale /= 3;
						if (oldDistance === 0) {
							oldDistance = distance;
						} else if (touches.length === 2 && Math.abs(scale) > 0.3) {
							applyWheel({ wheelDelta: scale }, parameters, environment);
							oldDistance = distance;
						}
					}
				}
			};
			listeners.DOMMouseScroll = listeners.mousewheel;
			listeners.mouseleave = listeners.mouseup;

			for (var event in listeners) {
				environment.domElement.addEventListener(event, listeners[event]);
			}

			// Avoid missing the mouseup event because of Chrome bug:
			// https://code.google.com/p/chromium/issues/detail?id=244289
			// seems solved
			/*
			parameters.domElement.addEventListener('dragstart', function (event) {
				preventDefault();
			}, false);
			*/
			domElement.oncontextmenu = function () { return false; };
		}

		function updateVelocity (time, parameters, environment) {
			if (velocity.lengthSquared() > 0.000001) {
				move(velocity.x, velocity.y, parameters, environment);
				var rate = MathUtils.lerp(environment.inertia, 0, 1 - time / environment.inertia);
				velocity.mul(rate);
			} else {
				velocity.set(0, 0, 0);
			}
		}

		function update(parameters, environment, goo) {
			var entity = environment.entity;
			// grab our transformComponent
			var transformComponent = entity.transformComponent;

			var transform = transformComponent.transform;

			var delta = MathUtils.lerp(environment.smoothness, 1, environment.world.tpf);

			if (!environment.goingToLookAt.equals(environment.lookAtPoint)) {
				environment.lookAtPoint.lerp(environment.goingToLookAt, delta);
				environment.dirty = true;
			}

			if (parameters.releaseVelocity) {
				updateVelocity(entity._world.tpf, parameters, environment);
			}

			if (!environment.dirty) {
				return; //
			}

			//var delta = MathUtils.clamp(parameters.interpolationSpeed * environment.world.tpf, 0.0, 1.0);

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
				environment.dirty = false;
				spherical.y = MathUtils.moduloPositive(spherical.y, MathUtils.TWO_PI);
				targetSpherical.copy(spherical);
				environment.dirty = false;
			}

			// set our component updated.
			transformComponent.setUpdated();
			goo.SystemBus.emit('goo.cameraPositionChanged', {
				spherical: environment.spherical.data,
				translation: transform.translation.data,
				lookAtPoint: environment.lookAtPoint.data,
				id: entity.id
			});
		}

		function cleanup(parameters, environment) {
			for (var event in listeners) {
				environment.domElement.removeEventListener(event, listeners[event]);
			}
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	OrbitCamControlScript.externals = {
		name: 'OrbitCamControlScript',
		description: 'Enables camera to orbit around a point in 3D space using the mouse',
		parameters: [{
			key: 'whenUsed',
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
			key: 'orbitSpeed',
			'default': 0.005,
			type: 'float',
			scale: 0.001,
			decimals: 3
		}, {
			key: 'zoomSpeed',
			'default': 1.0,
			type: 'float',
			scale: 0.1
		}, {
			key: 'drag',
			name: 'Inertia',
			'default': 0.9,
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1.0
		}, {
			key: 'smoothness',
			'default': 0.4,
			type: 'float',
			min: 0,
			max: 1,
			control: 'slider'
		}, {
			key: 'minZoomDistance',
			'default': 1,
			type: 'float',
			min: 0.01
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
			key: 'lookAtPoint',
			description: 'The point to orbit around',
			'default': [0, 0, 0],
			type: 'vec3'
		}, {
			key: 'spherical',
			name: 'Start Point',
			description: 'The initial position of the camera given in spherical coordinates (r, theta, phi). Theta is the angle from the x-axis towards the z-axis, and phi is the angle from the xz-plane towards the y-axis.',
			'default': [15, 0, 0],
			type: 'vec3'
		}]
	};

	return OrbitCamControlScript;
});