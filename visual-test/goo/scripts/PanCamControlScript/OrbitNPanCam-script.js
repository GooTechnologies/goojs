require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/scripts/newwave/FPCamControlScript',
	'goo/scripts/WASDControlScript',
	'goo/scripts/ScriptUtils',
	'goo/math/Vector',
	'goo/math/MathUtils',
	'goo/math/Vector2',
	'lib/V'
], function (
	GooRunner,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	LightComponent,
	NewWaveFPCamControlScript,
	WASDControlScript,
	ScriptUtils,
	Vector,
	MathUtils,
	Vector2,
	V
	) {
	'use strict';

	var external = {
		name: 'Orbit cam',
		description: 'Enables camera to orbit around a point in 3D space using the mouse',
		parameters: [{
			key: 'turnSpeedHorizontal',
			'default': 0.005
		}, {
			key: 'turnSpeedVertical',
			'default': 0.005
		}, {
			key: 'zoomSpeed',
			'default': 0.2
		}, {
			key: 'dragOnly',
			description: 'Only move the camera when dragging',
			'default': true
		}, {
			key: 'dragButton',
			description: 'Only drag with button with this code (-1 to enable all)',
			'default': 0
		}, {
			key: 'worldUpVector',
			'default': new Vector3(0, 1, 0)
		}, {
			key: 'baseDistance',
			'default': 15
		}, {
			key: 'minZoomDistance',
			'default': 1
		}, {
			key: 'maxZoomDistance',
			'default': 1000
		}, {
			key: 'minAscent',
			description: 'Maximum arc (in radians) the camera can reach below the target point',
			'default': -89.95 * MathUtils.DEG_TO_RAD
		}, {
			key: 'maxAscent',
			description: 'Maximum arc (in radians) the camera can reach above the target point',
			'default': 89.95 * MathUtils.DEG_TO_RAD
		}, {
			key: 'clampAzimuth',
			'default': false
		}, {
			key: 'minAzimuth',
			description: 'Maximum arc (in radians) the camera can reach clockwise of the target point',
			'default': 90 * MathUtils.DEG_TO_RAD
		}, {
			key: 'maxAzimuth',
			description: 'Maximum arc (in radians) the camera can reach counter-clockwise of the target point',
			'default': 270 * MathUtils.DEG_TO_RAD
		}, {
			key: 'releaseVelocity',
			'default': true
		}, {
			key: 'invertedX',
			'default': false
		}, {
			key: 'invertedY',
			'default': false
		}, {
			key: 'invertedWheel',
			'default': true
		}, {
			key: 'drag',
			'default': 5.0
		}, {
			key: 'maxSampleTimeMS',
			'default': 200
		}, {
			key: 'lookAtPoint',
			description: 'The point to orbit around',
			'default': new Vector3()
		}, {
			key: 'spherical',
			description: 'The initial position of the camera given in spherical coordinates (r, theta, phi). Theta is the angle from the x-axis towards the z-axis, and phi is the angle from the xz-plane towards the y-axis.',
			'default': new Vector3(15, 0, 0)
		}, {
			key: 'interpolationSpeed',
			'default': 7
		}, {
			key: 'zoomDistanceFactor',
			'default': 0.035
		}, {
			key: 'detailZoom',
			'default': 0.15
		}]
	};

	var OrbitCamScript = function () {
		var entity, transformComponent, transform, gooRunner;
		var parameters;

		var spherical = new Vector3(15, 0, 0);

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
		var dirty;
		var mouseState;

		function setup(_parameters, env) {
			ScriptUtils.fillDefaultValues(_parameters, external.parameters);
			parameters = _parameters;
			entity = env.getEntity();

			timeSamples = [0, 0, 0, 0, 0];
			xSamples = [0, 0, 0, 0, 0];
			ySamples = [0, 0, 0, 0, 0];
			sample = 0;
			velocity = new Vector2(0, 0);

			targetSpherical = new Vector3(spherical);
			cartesian = new Vector3();

			dirty = true;

			mouseState = {
				buttonDown: false,
				lastX: NaN,
				lastY: NaN
			};

			setupMouseControls();
		}

		function updateButtonState(buttonIndex, down) {
			if (parameters.domElement !== document) {
				parameters.domElement.focus();
			}

			if (parameters.dragOnly && (parameters.dragButton === -1 || parameters.dragButton === buttonIndex)) {
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
				targetSpherical.y = _radialClamp(targetSpherical.y - azimuthAccel, parameters.minAzimuth, parameters.maxAzimuth);
			} else {
				targetSpherical.y = targetSpherical.y - azimuthAccel;
			}
			targetSpherical.z = MathUtils.clamp(targetSpherical.z + thetaAccel, parameters.minAscent, parameters.maxAscent);
			dirty = true;
		};

		function applyWheel(e) {
			var delta = (parameters.invertedWheel ? -1 : 1) * Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
			delta *= parameters.zoomDistanceFactor * targetSpherical.x;
			zoom(parameters.zoomSpeed * delta);
		};

		function zoom(percent) {
			var amount = percent * parameters.baseDistance;
			targetSpherical.x = MathUtils.clamp(targetSpherical.x + amount, parameters.minZoomDistance, parameters.maxZoomDistance);
			dirty = true;
		};

		function applyReleaseDrift() {
			var now = Date.now();
			var dx = 0, dy = 0;
			var found = false;
			for (var i = 0, max = timeSamples.length; i < max; i++) {
				if (now - timeSamples[i] < parameters.maxSampleTimeMS) {
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
			parameters.domElement.addEventListener('mousedown', function (event) {
				updateButtonState(event.button, true);
			}, false);

			document.addEventListener('mouseup', function (event) {
				updateButtonState(event.button, false);
			}, false);

			document.addEventListener('mousemove', function (event) {
				updateDeltas(event.clientX, event.clientY);
			}, false);

			parameters.domElement.addEventListener('mousewheel', function (event) {
				applyWheel(event);
			}, false);
			parameters.domElement.addEventListener('DOMMouseScroll', function (event) {
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
			parameters.domElement.oncontextmenu = function () { return false; };
			var oldDistance = 0;

			// Touch controls
			parameters.domElement.addEventListener('touchstart', function () {
				updateButtonState(0, true);
			});
			parameters.domElement.addEventListener('touchend', function () {
				updateButtonState(0, false);
				oldDistance = 0;
			});
			parameters.domElement.addEventListener('touchmove', function (event) {
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
				var scale = (distance - oldDistance) / Math.max(parameters.domElement.height, parameters.domElement.width);
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
				dirty = true;
			} else {
				velocity.set(0, 0, 0);
			}
		};

		function run(entity, tpf, env) {
			// grab our transformComponent
			var transformComponent = entity.transformComponent;

			var transform = transformComponent.transform;

			if (parameters.releaseVelocity) {
				updateVelocity(entity._world.tpf);
			}

			if (!dirty) {
				// return; // have this disabled once, when the panning occurs
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

			transform.translation.set(cartesian.add(parameters.lookAtPoint));
			if (!transform.translation.equals(parameters.lookAtPoint)) {
				transform.lookAt(parameters.lookAtPoint, parameters.worldUpVector);
			}

			if (spherical.distanceSquared(targetSpherical) < 0.000001) {
				dirty = false;
				spherical.y = MathUtils.moduloPositive(spherical.y, MathUtils.TWO_PI);
				targetSpherical.copy(spherical);
			}

			// set our component updated.
			transformComponent.setUpdated();
		};

		function cleanup() {

		}

		return {
			setup: setup,
			run: run,
			cleanup: cleanup
		};
	};





	function PanCamScript() {
		var entity, gooRunner, transform, transformComponent;
		var fwdVector = new Vector3(0, 1, 0);
		var leftVector = new Vector3(-1, 0, 0);

		var moveVector = new Vector3();
		var calcVector = new Vector3();

		var mouseState = {
			x: 0,
			y: 0,
			ox: 0,
			oy: 0,
			dx: 0,
			dy: 0,
			down: false
		}

		function setup(parameters, env) {
			entity = env.getEntity();
			transform = entity.transformComponent.transform;
			gooRunner = entity._world.gooRunner;

			gooRunner.renderer.domElement.addEventListener('mousedown', function (event) {
				if (event.button === 2) {
					mouseState.down = true;
					mouseState.x = event.clientX;
					mouseState.y = event.clientY;
				}
			});

			gooRunner.renderer.domElement.addEventListener('mousemove', function (event) {
				if (mouseState.down) {
					mouseState.ox = mouseState.x;
					mouseState.oy = mouseState.y;

					mouseState.x = event.clientX;
					mouseState.y = event.clientY;

					mouseState.dx = mouseState.x - mouseState.ox;
					mouseState.dy = mouseState.y - mouseState.oy;



					calcVector.set(
						fwdVector.x * mouseState.dy + leftVector.x * mouseState.dx,
						fwdVector.y * mouseState.dy + leftVector.y * mouseState.dx,
						fwdVector.z * mouseState.dy + leftVector.z * mouseState.dx
					);

					calcVector.scale(0.03);

					transform.rotation.applyPost(calcVector);


					// either this to play nice with the orbit cam script
					entity.scriptComponent.scripts[0].parameters.lookAtPoint.add(calcVector);

					// or this when there's no orbit script present
					// update look at point
					//
					// entity.scriptComponent.scripts[0].parameters.lookAtPoint.add(calcVector);
					// and update translation
				}
			});

			gooRunner.renderer.domElement.addEventListener('mouseup', function (e) {
				mouseState.down = false;
			});
		}

		function update(parameters, env) {
			// nothing
		}

		function cleanup(parameters, env) {

		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}



	function orbitCamScriptDemo() {
		var goo = V.initGoo();

		V.addLights();

		V.addColoredBoxes();

		// add camera
		var camera = new Camera();
		var cameraEntity = goo.world.createEntity(camera, 'CameraEntity', [0, 0, 20]).lookAt([0, 0, 0]).addToWorld();

		// camera control set up
		var scripts = new ScriptComponent();

		var orbitCamScript = OrbitCamScript();
		orbitCamScript.parameters = {
			domElement: goo.renderer.domElement
		};
		scripts.scripts.push(orbitCamScript);


		var panCamScript = PanCamScript();
		panCamScript.parameters = {
			domElement: goo.renderer.domElement
		};
		scripts.scripts.push(panCamScript);
		/*
		var key = null;
		var x = 0, y = 0, z = 0;

		scripts.scripts.push({
			run: function () {
				if (key === 38) { z -= 0.1; }
				if (key === 37) { x -= 0.1; }
				if (key === 40) { z += 0.1; }
				if (key === 39) { x += 0.1; }

				orbitCamScript.parameters.lookAtPoint.set(x, y, z);
				//cameraEntity.lookAt(0, Math.sin(goo.world.time * 2) * 2, 0);

				//cameraEntity.setTranslation();
				//cameraEntity.transformComponent.setUpdated();
			}
		});

		window.addEventListener('keydown', function (e) {
			key = e.which;
		});

		window.addEventListener('keyup', function (e) {
			key = null;
			console.log('up', e.which);
		});
		*/

		cameraEntity.setComponent(scripts);
	}

	orbitCamScriptDemo();
});