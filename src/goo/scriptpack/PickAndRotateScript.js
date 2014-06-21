define([
	'goo/math/Vector3'
], function (
	Vector3
) {
	'use strict';

	function PickAndRotateScript() {
		var env;
		var transformComponent, transform, gooRunner;
		var pickedEntity;
		var parameters;

		var mouseState = {
			down: false,
			x: 0,
			y: 0,
			ox: 0,
			oy: 0,
			dx: 0,
			dy: 0
		};

		var fwdVector = new Vector3(0, 0, -1);
		var leftVector = new Vector3(-1, 0, 0);

		var moveVector = new Vector3();
		var calcVector = new Vector3();

		function getButton(event) {
			var pressedButton = event.button;
			if (pressedButton === 0) {
				if (event.altKey) {
					pressedButton = 2;
				} else if (event.shiftKey) {
					pressedButton = 1;
				}
			}
			return pressedButton;
		}

		function mouseDown(event) {
			if (parameters.disable) { return; }
			var pressedButton = getButton(event.domEvent);
			if (pressedButton === env.dragButton || env.dragButton === -1) {
				pickedEntity = event.entity;
				onPressEvent();
			}
		}

		function onPressEvent() {
			var pickResult = gooRunner.pickSync(mouseState.x, mouseState.y);
			var entity = gooRunner.world.entityManager.getEntityByIndex(pickResult.id);
			if (entity === env.entity) {
				mouseState.down = true;
			} else {
				mouseState.down = false;
			}
		}

		function mouseMove(event) {
			mouseState.ox = mouseState.x;
			mouseState.oy = mouseState.y;

			mouseState.x = event.clientX;
			mouseState.y = event.clientY;

			mouseState.dx = mouseState.x - mouseState.ox;
			mouseState.dy = mouseState.y - mouseState.oy;

			if (pickedEntity && mouseState.down) {
				pickedEntity.transformComponent.transform.rotation.fromAngles(mouseState.y / -180, mouseState.x / 180, 0.0);
				pickedEntity.transformComponent.setUpdated();
			}
		}
		function mouseUp(/*event*/) {
			mouseState.down = false;
		}

		function setup(_parameters, ctx) {
			parameters = _parameters;
			env = ctx;

			env.dragButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(parameters.dragButton) - 1;
			if (env.dragButton < -1) {
				env.dragButton = -1;
			}

			gooRunner = env.world.gooRunner;

			gooRunner.addEventListener('mousedown', mouseDown);
			gooRunner.renderer.domElement.addEventListener('mousemove', mouseMove);
			gooRunner.renderer.domElement.addEventListener('mouseup', mouseUp);
		}

		function update(/*parameters, env*/) {
			if (moveVector.equals(Vector3.ZERO)) { return; }

			// direction of movement in local coords
			calcVector.set(
				fwdVector.x * moveVector.z + leftVector.x * moveVector.x,
				fwdVector.y * moveVector.z + leftVector.y * moveVector.x,
				fwdVector.z * moveVector.z + leftVector.z * moveVector.x
			);
			calcVector.normalize();

			// move speed for this run...
			var moveMult = 1.0;

			// scale by speed
			calcVector.mul(moveMult);

			// grab orientation of player
			var orient = transform.rotation;

			// reorient our movement to entity space
			orient.applyPost(calcVector);

			// add to our transform
			transform.translation.add(calcVector);

			// set our component updated.
			transformComponent.setUpdated();
		}

		function cleanup(_parameters, env) {
			env.domElement.removeEventListener('mousemove', mouseMove, false);
			env.domElement.removeEventListener('mouseup', mouseUp, false);
			gooRunner.removeEventListener('mousedown', mouseDown);
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	PickAndRotateScript.externals = {
		key: 'PickAndRotateScript',
		name: 'Pick and Rotate',
		description: 'Enables pick-drag-rotating entities',
		parameters: [{
			key: 'disable',
			description: 'Prevent rotation. For preventing this script programmatically.',
			type: 'boolean',
			'default': false
		}, {
			key: 'dragButton',
			description: 'Button to enable dragging',
			'default': 'Any',
			options: ['Any', 'Left', 'Middle', 'Right'],
			type: 'string',
			control: 'select'
		}]
	};

	return PickAndRotateScript;
});