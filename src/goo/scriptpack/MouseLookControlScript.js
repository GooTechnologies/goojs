var Scripts = require('../scripts/Scripts');
var Vector3 = require('../math/Vector3');
var MathUtils = require('../math/MathUtils');
var GameUtils = require('../util/GameUtils');



	var allButtons = ['Any', 'Left', 'Middle', 'Right', 'None'];

	function MouseLookControlScript() {
		var buttonPressed = false;
		var hasPointerLock = false;
		var hasPointerLockSupport = false;
		var lastX = 0, lastY = 0, x = 0, y = 0;
		var angles;
		var button;
		var _environment;
		var _parameters;
		var _initialAzimuth;

		function mouseDown(e) {
			if (!_parameters.whenUsed || _environment.entity === _environment.activeCameraEntity) {
				if (button === -1 || e.button === button || (button === 3 && !hasPointerLockSupport)) {
					buttonPressed = true;
					lastX = x = e.clientX;
					lastY = y = e.clientY;
				}
			}
		}

		// Used when button is None.
		// Helps attaching the lock if we failed in .setup().
		function mouseDownToRequestPointerLock() {
			if (!hasPointerLock) {
				GameUtils.requestPointerLock();
			}
		}

		function mouseMove(e) {
			if (hasPointerLock) {
				return;
			}
			if (!_parameters.whenUsed || _environment.entity === _environment.activeCameraEntity) {
				if (hasPointerLock && e.movementX !== undefined) {
					x += e.movementX;
					y += e.movementY;
				} else if (buttonPressed) {
					x = e.clientX;
					y = e.clientY;
				}
			}
		}

		function documentMouseMove(e) {
			if (!_parameters.whenUsed || _environment.entity === _environment.activeCameraEntity) {
				if (hasPointerLock && e.movementX !== undefined) {
					x += e.movementX;
					y += e.movementY;
				}
			}
		}

		function mouseUp() {
			buttonPressed = false;
		}

		function documentMouseUp() {
			if (hasPointerLock) {
				buttonPressed = false;
			}
		}

		function pointerLockChange() {
			hasPointerLock = !!document.pointerLockElement;

			if (document.pointerLockElement) {
				// We are attached! No mousedown listener needed any more.
				_environment.domElement.removeEventListener('mousedown', mouseDownToRequestPointerLock);
				hasPointerLockSupport = true;
			} else {
				// Not attached.
				_environment.domElement.addEventListener('mousedown', mouseDownToRequestPointerLock);
			}
		}

		function setup(parameters, environment) {
			_environment = environment;
			_parameters = parameters;
			button = allButtons.indexOf(parameters.button) - 1;
			if (button < -1) {
				button = -1;
			}
			var domElement = environment.domElement;
			if (button === 3) {
				document.addEventListener('pointerlockchange', pointerLockChange);
				GameUtils.requestPointerLock();
				document.addEventListener('mousemove', documentMouseMove);
				document.addEventListener('mousemove', documentMouseUp);
				domElement.addEventListener('mousedown', mouseDownToRequestPointerLock);
			}

			domElement.addEventListener('mousemove', mouseMove);
			domElement.addEventListener('mousedown', mouseDown);
			domElement.addEventListener('mouseup', mouseUp);

			angles = new Vector3();
			var rotation = environment.entity.transformComponent.transform.rotation;
			rotation.toAngles(angles);
			_initialAzimuth = angles.y;
		}

		function update(parameters, environment) {
			if (x === lastX && y === lastY) {
				return;
			}
			var deltaX = x - lastX;
			var deltaY = y - lastY;
			var entity = environment.entity;
			var rotation = entity.transformComponent.transform.rotation;
			rotation.toAngles(angles);

			var pitch = angles.x;
			var yaw = angles.y;

			var maxAscent = parameters.maxAscent * MathUtils.DEG_TO_RAD;
			var minAscent = parameters.minAscent * MathUtils.DEG_TO_RAD;
			pitch = MathUtils.clamp(pitch - deltaY * parameters.speed / 200, minAscent, maxAscent);

			var maxAzimuth = parameters.maxAzimuth * MathUtils.DEG_TO_RAD - _initialAzimuth;
			var minAzimuth = parameters.minAzimuth * MathUtils.DEG_TO_RAD - _initialAzimuth;
			yaw -= deltaX * parameters.speed / 200;
			if (parameters.clampAzimuth) {
				yaw = MathUtils.radialClamp(yaw, minAzimuth, maxAzimuth);
			}

			rotation.fromAngles(pitch, yaw, 0);
			entity.transformComponent.setUpdated();
			lastX = x;
			lastY = y;
		}

		function cleanup(parameters, environment) {
			var domElement = environment.domElement;
			if (button === 3) {
				GameUtils.exitPointerLock();
				document.removeEventListener('mousemove', documentMouseMove);
				document.removeEventListener('pointerlockchange', pointerLockChange);
				domElement.removeEventListener('mousedown', mouseDownToRequestPointerLock);
			}
			domElement.removeEventListener('mousemove', mouseMove);
			domElement.removeEventListener('mousedown', mouseDown);
			domElement.removeEventListener('mouseup', mouseUp);
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	MouseLookControlScript.externals = {
		key: 'MouseLookScript',
		name: 'Mouse Look Control',
		description: 'Click and drag to change rotation of entity, usually a camera',
		parameters: [
			{
				key: 'whenUsed',
				type: 'boolean',
				name: 'When Camera Used',
				description: 'Script only runs when the camera to which it is added is being used.',
				'default': true
			},
			{
				key: 'button',
				name: 'Mouse button',
				type: 'string',
				control: 'select',
				'default': 'Left',
				options: allButtons
			},
			{
				key: 'speed',
				name: 'Turn Speed',
				type: 'float',
				control: 'slider',
				'default': 1.0,
				min: -10,
				max: 10,
				scale: 0.1
			},
			{
				key: 'maxAscent',
				name: 'Max Ascent',
				type: 'float',
				control: 'slider',
				'default': 89.95,
				min: -89.95,
				max: 89.95
			},
			{
				key: 'minAscent',
				name: 'Min Ascent',
				type: 'float',
				control: 'slider',
				'default': -89.95,
				min: -89.95,
				max: 89.95
			}, {
				key: 'clampAzimuth',
				'default': false,
				type: 'boolean'
			}, {
				key: 'minAzimuth',
				description: 'Maximum arc the camera can reach clockwise of the target point',
				'default': -90,
				type: 'int',
				control: 'slider',
				min: -180,
				max: 0
			}, {
				key: 'maxAzimuth',
				description: 'Maximum arc the camera can reach counter-clockwise of the target point',
				'default': 90,
				type: 'int',
				control: 'slider',
				min: 0,
				max: 180
			}
		]
	};

	module.exports = MouseLookControlScript;