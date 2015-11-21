var Vector3 = require('../math/Vector3');
var Vector2 = require('../math/Vector2');
var MathUtils = require('../math/MathUtils');
var Camera = require('../renderer/Camera');
var SystemBus = require('../entities/SystemBus');

	'use strict';

	var ZOOM_DISTANCE_FACTOR = 0.035;
	var EPSILON = 1e-6;

	/**
	 * @param {Object} args
	 * @param {boolean} args.whenUsed When current entity is the camera in use
	 * @param {string} args.dragButton Can be 'Any', 'Left', 'Middle', 'Right', 'None'. None disables dragging
	 * @param {number} args.orbitSpeed
	 * @param {number} args.zoomSpeed
	 * @param {number} args.drag The inertia
	 * @param {number} args.smoothness
	 * @param {number} args.minZoomDistance
	 * @param {number} args.maxZoomDistance
	 * @param {number} args.minAscent in degrees
	 * @param {number} args.maxAscent in degrees
	 * @param {number} args.minAzimuth in degrees
	 * @param {number} args.maxAzimuth in degress
	 * @param {boolean} args.clampAzimuth If true, min and max azimuth are used.
	 * @param {number} args.lookAtDistance distance to the lookatpoint
	 * @param {number[3]} args.lookAtPoint the point in space to look
	 * @deprecated
	 * @param {number[3]} args.spherical The start position of the camera in [radius, azimuth, ascent] form, where 0 azimuth looks to -X
	 * @deprecated
	 */
	function setup(args, ctx) {
		ctx.dirty = true;
		ctx.timeSamples = [0, 0, 0, 0, 0];
		ctx.xSamples = [0, 0, 0, 0, 0];
		ctx.ySamples = [0, 0, 0, 0, 0];
		ctx.sample = 0;
		ctx.velocity = new Vector2(0, 0);
		ctx.cartesian = new Vector3();
		ctx.worldUpVector = Vector3.UNIT_Y.clone();
		ctx.maxSampleTimeMS = 200;

		ctx.mouseState = {
			buttonDown: false,
			lastX: NaN,
			lastY: NaN
		};

		// Making more linear perception
		ctx.smoothness = Math.pow(MathUtils.clamp(args.smoothness, 0, 1), 0.3);
		ctx.inertia = Math.pow(MathUtils.clamp(args.drag, 0, 1), 0.3);

		ctx.dragButton = ['Any', 'Left', 'Middle', 'Right', 'None'].indexOf(args.dragButton) - 1;
		if (ctx.dragButton < -1) {
			ctx.dragButton = -1;
		} else if (ctx.dragButton === 4) {
			ctx.dragButton = null;
		}

		var spherical;
		if (args.lookAtDistance) {
			// Getting script angles from transform
			var angles = ctx.entity.getRotation();
			spherical = ctx.spherical = new Vector3(
				args.lookAtDistance,
				-angles.y + Math.PI / 2,
				-angles.x
			);
		} else if (args.spherical instanceof Array) {
			var spherical = ctx.spherical = new Vector3(
				args.spherical[0],
				args.spherical[1] * MathUtils.DEG_TO_RAD,
				args.spherical[2] * MathUtils.DEG_TO_RAD
			);
		} else if (args.spherical) {
			var spherical = ctx.spherical = new Vector3(
				args.spherical.x,
				args.spherical.y * MathUtils.DEG_TO_RAD,
				args.spherical.z * MathUtils.DEG_TO_RAD
			);
		} else {
			var spherical = ctx.spherical = new Vector3(15, 0, 0); // Just something so the script won't crash
		}
		ctx.targetSpherical = spherical.clone();

		if (args.lookAtDistance) {
			// Setting look at point at a distance forward
			var rotation = ctx.entity.transformComponent.transform.rotation;
			ctx.lookAtPoint = new Vector3(0, 0, -args.lookAtDistance);
			ctx.lookAtPoint.applyPost(rotation);
			ctx.lookAtPoint.add(ctx.entity.getTranslation());
		} else if (args.lookAtPoint) {
			ctx.lookAtPoint = args.lookAtPoint instanceof Array ? Vector3.fromArray(args.lookAtPoint) : args.lookAtPoint.clone();
		} else {
			ctx.lookAtPoint = new Vector3();
		}
		ctx.goingToLookAt = ctx.lookAtPoint.clone();

		// Parallel camera size
		updateFrustumSize(1, ctx);

		setupMouseControls(args, ctx);
	}

	function updateButtonState(buttonIndex, down, args, ctx) {
		/*if (ctx.domElement !== document) {
			ctx.domElement.focus();
		}*/
		var dragButton = ctx.dragButton;
		var mouseState = ctx.mouseState;
		if (dragButton === -1 || dragButton === buttonIndex || down === false) {
			mouseState.buttonDown = down;
			if (down) {
				mouseState.lastX = NaN;
				mouseState.lastY = NaN;
				ctx.velocity.setDirect(0, 0);
				ctx.spherical.y = MathUtils.moduloPositive(ctx.spherical.y, MathUtils.TWO_PI);
				ctx.targetSpherical.set(ctx.spherical);
			} else {
				applyReleaseDrift(args, ctx);
			}
		}
	}

	function updateDeltas(mouseX, mouseY, args, ctx) {
		var dx = 0, dy = 0;
		var mouseState = ctx.mouseState;
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

		// Release velocity samples
		ctx.timeSamples[ctx.sample] = Date.now();
		ctx.xSamples[ctx.sample] = dx;
		ctx.ySamples[ctx.sample] = dy;

		ctx.sample++;
		if (ctx.sample > ctx.timeSamples.length - 1) {
			ctx.sample = 0;
		}

		ctx.velocity.setDirect(0, 0);
		move(args.orbitSpeed * dx, args.orbitSpeed * dy, args, ctx);
	}

	function move(azimuthAccel, thetaAccel, args, ctx) {
		var td = ctx.targetSpherical;

		// update our master spherical coords, using x and y movement
		if (args.clampAzimuth) {
			var minAzimuth = args.minAzimuth * MathUtils.DEG_TO_RAD;
			var maxAzimuth = args.maxAzimuth * MathUtils.DEG_TO_RAD;
			td.y = MathUtils.radialClamp(td.y - azimuthAccel, minAzimuth, maxAzimuth);
		} else {
			td.y -= azimuthAccel;
		}
		var minAscent = args.minAscent * MathUtils.DEG_TO_RAD;
		var maxAscent = args.maxAscent * MathUtils.DEG_TO_RAD;
		td.z = MathUtils.clamp(td.z + thetaAccel, minAscent, maxAscent);

		ctx.dirty = true;
	}

	function updateFrustumSize(delta, ctx) {
		var camera = ctx.entity.cameraComponent.camera;
		if (camera.projectionMode === Camera.Parallel) {
			ctx.size = camera.top;
			ctx.size /= delta;
			var size = ctx.size;
			camera.setFrustum(null, null, -size, size, size, -size);
		}
	}

	function applyWheel(e, args, ctx) {
		var delta = Math.max(-1, Math.min(1, -e.wheelDelta || e.detail));
		delta *= ZOOM_DISTANCE_FACTOR * ctx.targetSpherical.x;

		var td = ctx.targetSpherical;
		td.x = MathUtils.clamp(
			td.x + args.zoomSpeed * delta,
			args.minZoomDistance,
			args.maxZoomDistance
		);
		ctx.dirty = true;
	}

	function applyReleaseDrift(args, ctx) {
		var timeSamples = ctx.timeSamples;
		var now = Date.now();
		var dx = 0, dy = 0;
		var found = false;
		for (var i = 0, max = timeSamples.length; i < max; i++) {
			if (now - timeSamples[i] < ctx.maxSampleTimeMS) {
				dx += ctx.xSamples[i];
				dy += ctx.ySamples[i];
				found = true;
			}
		}
		if (found) {
			ctx.velocity.setDirect(
				dx * args.orbitSpeed / timeSamples.length,
				dy * args.orbitSpeed / timeSamples.length
			);
		} else {
			ctx.velocity.setDirect(0, 0);
		}
	}

	function setupMouseControls(args, ctx) {
		var oldDistance = 0;
		var isAndroid = !!navigator.userAgent.match(/Android/i);
		var fakeEvent = {
			wheelDelta: 0
		};

		ctx.listeners = {
			mousedown: function (event) {
				if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
					var button = event.button;
					if (button === 0) {
						if (event.altKey) {
							button = 2;
						} else if (event.shiftKey) {
							button = 1;
						}
					}
					updateButtonState(button, true, args, ctx);
				}
			},
			mouseup: function (event) {
				var button = event.button;
				if (button === 0) {
					if (event.altKey) {
						button = 2;
					} else if (event.shiftKey) {
						button = 1;
					}
				}
				updateButtonState(button, false, args, ctx);
			},
			mousemove: function (event) {
				if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
					updateDeltas(event.clientX, event.clientY, args, ctx);
				}
			},
			mouseleave: function (event) {
				ctx.orbitListeners.mouseup(event);
			},
			mousewheel: function (event) {
				if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
					applyWheel(event, args, ctx);
				}
			},
			touchstart: function (event) {
				if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
					updateButtonState(ctx.dragButton, event.targetTouches.length === 1, args, ctx);
				}
				// fix Android bug that stops touchmove events, unless prevented
				// https://code.google.com/p/android/issues/detail?id=5491
				if (isAndroid) {
					event.preventDefault();
				}
			},
			touchend: function (/*event*/) {
				updateButtonState(ctx.dragButton, false, args, ctx);
				oldDistance = 0;
			},
			touchmove: function (event) {
				if (!args.whenUsed || ctx.entity === ctx.activeCameraEntity) {
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
						updateDeltas(cx, cy, args, ctx);
					}
					var scale = (distance - oldDistance) / Math.max(ctx.domElement.offsetHeight, ctx.domElement.offsetWidth);
					scale /= 3;
					if (oldDistance === 0) {
						oldDistance = distance;
					} else if (touches.length === 2 && Math.abs(scale) > 0.3) {
						fakeEvent.wheelDelta = scale;
						applyWheel(fakeEvent, args, ctx);
						oldDistance = distance;
					}
				}
			}
		};
		ctx.listeners.DOMMouseScroll = ctx.listeners.mousewheel;
		ctx.listeners.mouseleave = ctx.listeners.mouseup;

		for (var event in ctx.listeners) {
			ctx.domElement.addEventListener(event, ctx.listeners[event]);
		}

		// Avoid missing the mouseup event because of Chrome bug:
		// https://code.google.com/p/chromium/issues/detail?id=244289
		// seems solved
		/*
		args.domElement.addEventListener('dragstart', function (event) {
			preventDefault();
		}, false);
		*/
		ctx.domElement.oncontextmenu = function () { return false; };
	}

	function updateVelocity(time, args, ctx) {
		if (ctx.velocity.lengthSquared() > EPSILON) {
			move(ctx.velocity.x, ctx.velocity.y, args, ctx);
			var rate = MathUtils.lerp(ctx.inertia, 0, 1 - time / ctx.inertia);
			ctx.velocity.scale(rate);
		} else {
			ctx.velocity.setDirect(0, 0, 0);
		}
	}

	function update(args, ctx/*, goo*/) {
		if (!ctx.dirty) {
			return; //
		}
		var spherical = ctx.spherical;
		var targetSpherical = ctx.targetSpherical;
		var lookAtPoint = ctx.lookAtPoint;
		var goingToLookAt = ctx.goingToLookAt;
		var cartesian = ctx.cartesian;

		var entity = ctx.entity;
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		var delta = MathUtils.lerp(ctx.smoothness, 1, ctx.world.tpf);

		if (goingToLookAt.distanceSquared(lookAtPoint) < EPSILON) {
			lookAtPoint.set(goingToLookAt);
		} else {
			lookAtPoint.lerp(goingToLookAt, delta);
		}

		if (ctx.inertia > 0) {
			updateVelocity(entity._world.tpf, args, ctx);
		}


		//var delta = MathUtils.clamp(args.interpolationSpeed * ctx.world.tpf, 0.0, 1.0);
		var sd = spherical;
		var tsd = targetSpherical;

		// Move azimuth to target
		sd.y = MathUtils.lerp(delta, sd.y, tsd.y);
		// Move ascent to target
		sd.z = MathUtils.lerp(delta, sd.z, tsd.z);

		// Move distance to target
		var deltaX = sd.x;
		sd.x = MathUtils.lerp(delta, sd.x, tsd.x);
		deltaX /= sd.x;
		updateFrustumSize(deltaX, ctx);


		MathUtils.sphericalToCartesian(sd.x, sd.y, sd.z, cartesian);

		transform.translation.set(cartesian.add(lookAtPoint));
		if (!transform.translation.equals(lookAtPoint)) {
			transform.lookAt(lookAtPoint, ctx.worldUpVector);
		}

		if (spherical.distanceSquared(targetSpherical) < EPSILON && ctx.lookAtPoint.equals(ctx.goingToLookAt)) {
			sd.y = MathUtils.moduloPositive(sd.y, MathUtils.TWO_PI);
			targetSpherical.set(spherical);
			ctx.dirty = false;
		}

		// set our component updated.
		transformComponent.setUpdated();
		SystemBus.emit('goo.cameraPositionChanged', {
			spherical: ctx.spherical.toArray(),
			translation: transform.translation.toArray(),
			lookAtPoint: ctx.lookAtPoint.toArray(),
			id: entity.id
		});
	}

	function cleanup(args, ctx) {
		for (var event in ctx.listeners) {
			ctx.domElement.removeEventListener(event, ctx.listeners[event]);
		}
	}

	function OrbitCamControlScript() {
		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	OrbitCamControlScript.externals = {
		key: 'OrbitCamControlScript',
		name: 'OrbitCamera Control',
		description: 'Enables camera to orbit around a point in 3D space using the mouse',
		parameters: [{
			key: 'whenUsed',
			'default': true,
			name: 'When Camera Used',
			description: 'Script only runs when the camera to which it is added is being used.',
			type: 'boolean'
		}, {
			key: 'dragButton',
			description: 'Button to enable dragging',
			'default': 'Any',
			options: ['Any', 'Left', 'Middle', 'Right', 'None'],
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
			'default': -89.99,
			type: 'float',
			control: 'slider',
			min: -89.99,
			max: 89.99
		}, {
			key: 'maxAscent',
			description: 'Maximum arc the camera can reach above the target point',
			'default': 89.99,
			type: 'float',
			control: 'slider',
			min: -89.99,
			max: 89.99
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
			key: 'lookAtDistance',
			description: 'The point to orbit around',
			'default': 15,
			type: 'float',
			min: 0.001
		}]
	};

	module.exports = OrbitCamControlScript;