define([
	'goo/math/Vector3',
	'goo/scripts/Scripts',
	'goo/renderer/Renderer'
], function (
	Vector3,
	Scripts,
	Renderer
) {
	'use strict';

	var externals = {
		name: 'PanCamControlScript',
		description: 'Enables camera to pan around a point in 3D space using the mouse',
		parameters: [{
			key: 'panButton',
			name: 'Pan button',
			description: 'Only pan with this button',
			type: 'string',
			control: 'select',
			'default': 'Right',
			options: ['Any', 'Left', 'Middle', 'Right']
		},{
			key: 'scale',
			name: 'Amount',
			type: 'float',
			control: 'slider',
			min: 1,
			max: 1000,
			exponential: true,
			'default': 3
		},{
			key: 'invertX',
			name: 'Invert X',
			type: 'boolean',
			'default': false
		},{
			key: 'invertY',
			name: 'Invert Y',
			type: 'boolean',
			'default': false
		}]
	};

	function PanCamScript() {
		var fwdVector, leftVector, moveVector, calcVector, calcVector2;
		var panButton;
		var lookAtPoint;
		var mouseState;
		
		var mouseDown, mouseUp, mouseMove, mouseLeave;

		function setup(parameters, env) {
			panButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(parameters.panButton) - 1;
			if (panButton < -1) {
				panButton = -1;
			}
			lookAtPoint = parameters._lookAtPoint;
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
			}

			mouseDown = function(event) {
				if (event.button === panButton || panButton === -1) {
					mouseState.down = true;
					mouseState.ox = mouseState.x = event.clientX;
					mouseState.oy = mouseState.y = event.clientY;
				}
			};
			mouseUp = function(event) {
				if (event.button === panButton || panButton === -1) {
					mouseState.down = false;
					mouseState.dx = mouseState.dy = 0;
				}
			}
			mouseMove = function(event) {
				if (mouseState.down) {
					mouseState.x = event.clientX;
					mouseState.y = event.clientY;
					parameters.dirty = true;
				}
			}
			mouseLeave = function(event) {
				mouseState.down = false;
				mouseState.ox = mouseState.x;
				mouseState.oy = mouseState.y;
			}

			env.domElement.addEventListener('mousedown', mouseDown);
			env.domElement.addEventListener('mousemove', mouseMove);
			env.domElement.addEventListener('mouseup', mouseUp);
			env.domElement.addEventListener('mouseleave', mouseLeave);
			parameters.dirty = true;
		}

		function update(parameters, env) {
			if(!parameters.dirty) { return ;}
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
					-mouseState.dx / env.viewportWidth,
					mouseState.dy / env.viewportHeight,
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
				var entity = env.getEntity();
				var transform = entity.transformComponent.transform;
				calcVector.setv(fwdVector).scale(mouseState.dy)
				calcVector2.setv(leftVector).scale(mouseState.dx);
				calcVector.addv(calcVector2);
				transform.rotation.applyPost(calcVector);

				calcVector.scale(parameters.scale / 500);
				entity.transformComponent.transform.translation.addv(calcVector);
				entity.transformComponent.setUpdated();
			}
		}

		function cleanup(parameters, env) {
			env.domElement.removeEventListener('mousedown', mouseDown);
			env.domElement.removeEventListener('mousemove', mouseMove);
			env.domElement.removeEventListener('mouseup', mouseUp);
			env.domElement.removeEventListener('mouseleave', mouseLeave);
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup,
			externals: externals
		};
	}
	Scripts.register(externals, PanCamScript);
});