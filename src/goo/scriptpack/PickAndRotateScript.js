define([], function () {
	'use strict';

	function PickAndRotateScript() {
		var gooRunner;
		var pickedEntity;
		var args, ctx;

		var mouseState;

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
			if (args.disable) { return; }

			var pressedButton = getButton(event.domEvent);
			if (pressedButton === ctx.dragButton || ctx.dragButton === -1) {
				pickedEntity = event.entity;
				onPressEvent(event);
			}
		}

		function onPressEvent(event) {
			var pickResult = gooRunner.pickSync(mouseState.x, mouseState.y);
			var entity = gooRunner.world.entityManager.getEntityByIndex(pickResult.id);

			mouseState.x = event.x;
			mouseState.y = event.y;

			mouseState.ox = mouseState.x;
			mouseState.oy = mouseState.y;

			mouseState.down = entity === ctx.entity;
		}

		function mouseMove(event) {
			mouseState.ox = mouseState.x;
			mouseState.oy = mouseState.y;

			mouseState.x = event.clientX;
			mouseState.y = event.clientY;

			if (pickedEntity && mouseState.down) {
				mouseState.dx = mouseState.x - mouseState.ox;
				mouseState.dy = mouseState.y - mouseState.oy;


				mouseState.ax += mouseState.dx;
				mouseState.ay += mouseState.dy;

				pickedEntity.transformComponent.transform.rotation.setIdentity();
				pickedEntity.transformComponent.transform.rotation.rotateX(mouseState.ay / 300 * args.yMultiplier);
				pickedEntity.transformComponent.transform.rotation.rotateY(mouseState.ax / 200 * args.xMultiplier);

				pickedEntity.transformComponent.setUpdated();
			}
		}

		function mouseUp(event) {
			mouseState.down = false;
		}

		function setup(_args, _ctx, goo) {
			args = _args;
			ctx = _ctx;

			ctx.dragButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(args.dragButton) - 1;
			if (ctx.dragButton < -1) {
				ctx.dragButton = -1;
			}

			gooRunner = ctx.world.gooRunner;

			gooRunner.addEventListener('mousedown', mouseDown);
			gooRunner.renderer.domElement.addEventListener('mousemove', mouseMove);
			gooRunner.renderer.domElement.addEventListener('mouseup', mouseUp);

			mouseState = {
				down: false,
				x: 0,
				y: 0,
				ox: 0,
				oy: 0,
				dx: 0,
				dy: 0,
				ax: 0,
				ay: 0
			};
		}

		function update(args, ctx, goo) {}

		function cleanup(args, ctx, goo) {
			ctx.domElement.removeEventListener('mousemove', mouseMove, false);
			ctx.domElement.removeEventListener('mouseup', mouseUp, false);
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
		}, {
			key: 'xMultiplier',
			description: 'Horizontal rotation multiplier',
			'default': 1,
			type: 'float',
			control: 'slider',
			min: -4,
			max: 4
		}, {
			key: 'yMultiplier',
			description: 'Vertical rotation multiplier',
			'default': 1,
			type: 'float',
			control: 'slider',
			min: -4,
			max: 4
		}]
	};

	return PickAndRotateScript;
});