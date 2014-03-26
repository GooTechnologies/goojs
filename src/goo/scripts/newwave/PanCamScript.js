define([
	'goo/math/Vector3',
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils',
	'goo/renderer/Renderer'
], function (
	Vector3,
	Scripts,
	ScriptUtils,
	Renderer
) {
	'use strict';

	function PanCamScript() {
		var fwdVector, leftVector, moveVector, calcVector, calcVector2;
		var panButton;
		var lookAtPoint;
		var mouseState;

		var mouseDown, mouseUp, mouseMove, mouseLeave;

		function setup(parameters, environment) {
			panButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(parameters.panButton) - 1;
			if (panButton < -1) {
				panButton = -1;
			}
			lookAtPoint = environment.goingToLookAt;
			fwdVector = new Vector3(Vector3.UNIT_Y);
			leftVector = new Vector3(Vector3.UNIT_X).invert();
			moveVector = new Vector3();
			calcVector = new Vector3();
			calcVector2 = new Vector3();
			mouseState = {
				x: 0,
				y: 0,
				ox: 0,
				oy: 0,
				dx: 0,
				dy: 0,
				down: false
			};

			mouseDown = function(event) {
				if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
					if (event.button === panButton || panButton === -1) {
						mouseState.down = true;
						mouseState.ox = mouseState.x = event.clientX;
						mouseState.oy = mouseState.y = event.clientY;
					}
				}
			};
			mouseUp = function(event) {
				if (event.button === panButton || panButton === -1) {
					mouseState.down = false;
					mouseState.dx = mouseState.dy = 0;
				}
			};
			mouseMove = function(event) {
				if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
					if (mouseState.down) {
						mouseState.x = event.clientX;
						mouseState.y = event.clientY;
						environment.dirty = true;
					}
				}
			};
			mouseLeave = function(/*event*/) {
				mouseState.down = false;
				mouseState.ox = mouseState.x;
				mouseState.oy = mouseState.y;
			};

			environment.domElement.addEventListener('mousedown', mouseDown);
			environment.domElement.addEventListener('mousemove', mouseMove);
			environment.domElement.addEventListener('mouseup', mouseUp);
			environment.domElement.addEventListener('mouseleave', mouseLeave);
			environment.dirty = true;
		}

		function update(parameters, environment) {
			if(!environment.dirty) { return ;}
			mouseState.dx = mouseState.x - mouseState.ox;
			mouseState.dy = mouseState.y - mouseState.oy;
			if (mouseState.dx === 0 && mouseState.dy === 0) {
				return;
			}

			if (parameters.invertX) {
				mouseState.dx = -mouseState.dx;
			}
			if (parameters.invertY) {
				mouseState.dy = -mouseState.dy;
			}

			mouseState.ox = mouseState.x;
			mouseState.oy = mouseState.y;

			var c = Renderer.mainCamera;

			if (lookAtPoint && c) {
				if (lookAtPoint.equals(c.translation)) { return; }
				c.getScreenCoordinates(lookAtPoint, 1, 1, calcVector);
				calcVector.add_d(
					-mouseState.dx / environment.viewportWidth,
					mouseState.dy / environment.viewportHeight,
					0
				);
				c.getWorldCoordinates(
					calcVector.x,
					calcVector.y,
					1,
					1,
					calcVector.z,
					calcVector
				);
				lookAtPoint.setv(calcVector);
			} else {
				var entity = environment.entity;
				var transform = entity.transformComponent.transform;
				calcVector.setv(fwdVector).scale(mouseState.dy);
				calcVector2.setv(leftVector).scale(mouseState.dx);
				calcVector.addv(calcVector2);
				transform.rotation.applyPost(calcVector);

				calcVector.scale(parameters.panSpeed);
				entity.transformComponent.transform.translation.addv(calcVector);
				entity.transformComponent.setUpdated();
			}
		}

		function cleanup(parameters, environment) {
			environment.domElement.removeEventListener('mousedown', mouseDown);
			environment.domElement.removeEventListener('mousemove', mouseMove);
			environment.domElement.removeEventListener('mouseup', mouseUp);
			environment.domElement.removeEventListener('mouseleave', mouseLeave);
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	PanCamScript.externals = {
		name: 'PanCamControlScript',
		description: 'Enables camera to pan around a point in 3D space using the mouse',
		parameters: [{
			key: 'whenUsed',
			type: 'boolean',
			'default': true
		}, {
			key: 'panButton',
			name: 'Pan button',
			description: 'Only pan with this button',
			type: 'string',
			control: 'select',
			'default': 'Any',
			options: ['Any', 'Left', 'Middle', 'Right']
		}, {
			key: 'panSpeed',
			type: 'float',
			'default': 0.005,
			scale: 0.001,
			decimals: 3
		}]
	};

	return PanCamScript;
});