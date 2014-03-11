define([
	'goo/math/Vector3',
	'goo/math/Matrix3x3',
	'goo/math/MathUtils',
	'goo/util/GameUtils',
	'goo/scripts/ScriptUtils',
	'goo/scripts/Scripts'
],
	/** @lends */
	function (
	Vector3,
	Matrix3x3,
	MathUtils,
	GameUtils,
	ScriptUtils,
	Scripts
) {
	'use strict';
	/*jshint validthis: true */

	/**
	 * @class Enables mouse rotation of an entity.
	 * @param {Object} [properties]
	 * @param {Element} [properties.domElement] Element to add mouse listeners to
	 * @param {number} [properties.turnSpeedHorizontal=0.01]
	 * @param {number} [properties.turnSpeedVertical=0.01]
	 */

	var external = {
		name: 'FPCamControlScript',
		description: 'Attempts to lock the pointer and control the entity\'s orientation based on mouse movements',
		parameters: [/*{
			key: 'domElement'
		}, */{
			key: 'turnSpeedHorizontal',
			'default': 0.01,
			type: 'float',
			control: 'slider',
			min: 0.01,
			max: 1
		}, {
			key: 'turnSpeedVertical',
			'default': 0.01,
			type: 'float',
			control: 'slider',
			min: 0.01,
			max: 1
		}, {
			key: 'maxAscent',
			'default': 89,
			type: 'int',
			control: 'slider',
			min: -89,
			max: 89
		}, {
			key: 'minAscent',
			'default': -89,
			type: 'int',
			control: 'slider',
			min: -89,
			max: 89
		}]
	};

	var cons = function () {
		var calcVector;
		var rotX, rotY;
		var pointerLocked;
		var mouseState;

		function setup(parameters, env) {
			ScriptUtils.fillDefaultValues(parameters, external.parameters);

			calcVector = new Vector3();
			rotX = 0.0;
			rotY = 0.0;

			pointerLocked = false;

			mouseState = {
				dX: 0,
				dY: 0
			};

			setupMouseControls(env.domElement);
		}

		function run(entity, tpf, env, parameters) {
			var transformComponent = entity.transformComponent;
			var transform = transformComponent.transform;

			var orient = transform.rotation;
			orient.toAngles(calcVector);
			rotY = calcVector.x;
			rotX = calcVector.y;

			// apply dx around upVector
			if (mouseState.dX !== 0) {
				rotX -= parameters.turnSpeedHorizontal * mouseState.dX;
			}
			// apply dy around left vector
			if (mouseState.dY !== 0) {
				var maxAscent = parameters.maxAscent * MathUtils.DEG_TO_RAD;
				var minAscent = parameters.minAscent * MathUtils.DEG_TO_RAD;
				rotY -= parameters.turnSpeedVertical * mouseState.dY;
				if (rotY > maxAscent) {
					rotY = maxAscent;
				} else if (rotY < minAscent) {
					rotY = minAscent;
				}
			}

			transform.rotation.fromAngles(rotY, rotX, 0.0);

			// set our component updated.
			transformComponent.setUpdated();

			// clear state
			mouseState.dX = 0;
			mouseState.dY = 0;
		}

		function cleanup(parameters, env) {

		}

	    // ---
		var mousedown = function () {
			GameUtils.requestPointerLock();
		};

		var mousemove = function (event) {
			if (pointerLocked) {
				mouseState.dX += event.movementX;
				mouseState.dY += event.movementY;
			}
		};

		var pointerLockChange = function (/*event*/) {
			pointerLocked = !!document.pointerLockElement;
		};

		var pointerLockError = function (/*event*/) {
			pointerLocked = !!document.pointerLockElement;
		};

		function setupMouseControls(domElement) {
			domElement.addEventListener('mousedown', mousedown.bind(this), false);
			document.addEventListener('mousemove', mousemove.bind(this));
			document.addEventListener('pointerlockchange', pointerLockChange.bind(this));
			document.addEventListener('pointerlockerror', pointerLockError.bind(this));

			//! AT: attempt to request a pointer lock; will succeed only if fullscreen is enabled
			GameUtils.requestPointerLock();
		}


		return {
			setup: setup,
			run: run,
			cleanup: cleanup,
			externals: external,
		};
	};

	Scripts.register(external, cons);

	return cons;
});