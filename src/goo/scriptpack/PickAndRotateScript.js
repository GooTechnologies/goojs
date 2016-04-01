function PickAndRotateScript() {
	var gooRunner;
	var validPick;
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
		if ((pressedButton === ctx.dragButton || ctx.dragButton === -1) && event.entity) {
			validPick = false;
			event.entity.traverseUp(function (entity) {
				if (entity === ctx.entity) {
					validPick = true;
					return false;
				}
			});

			if (validPick) {
				onPressEvent(event);
			}
		}
	}

	function onPressEvent(event) {
		mouseState.x = event.x;
		mouseState.y = event.y;

		mouseState.oldX = mouseState.x;
		mouseState.oldY = mouseState.y;

		mouseState.down = true;
	}

	function mouseMove(event) {
		mouseState.oldX = mouseState.x;
		mouseState.oldY = mouseState.y;

		mouseState.x = event.clientX || event.touches[0].clientX;
		mouseState.y = event.clientY || event.touches[0].clientY;

		if (validPick && mouseState.down) {
			var deltaX = mouseState.x - mouseState.oldX;
			var deltaY = mouseState.y - mouseState.oldY;

			mouseState.ax += deltaX;
			mouseState.ay += deltaY;

			ctx.entity.transformComponent.transform.rotation.setIdentity();
			ctx.entity.transformComponent.transform.rotation.rotateX(mouseState.ay / 300 * args.yMultiplier);
			ctx.entity.transformComponent.transform.rotation.rotateY(mouseState.ax / 200 * args.xMultiplier);

			ctx.entity.transformComponent.setUpdated();
		}
	}

	function mouseUp() {
		mouseState.down = false;
	}

	function setup(_args, _ctx) {
		args = _args;
		ctx = _ctx;

		ctx.dragButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(args.dragButton) - 1;
		if (ctx.dragButton < -1) {
			ctx.dragButton = -1;
		}

		gooRunner = ctx.world.gooRunner;

		gooRunner.addEventListener('mousedown', mouseDown);
		gooRunner.addEventListener('touchstart', mouseDown);
		gooRunner.renderer.domElement.addEventListener('mousemove', mouseMove);
		gooRunner.renderer.domElement.addEventListener('touchmove', mouseMove);
		gooRunner.renderer.domElement.addEventListener('mouseup', mouseUp);
		gooRunner.renderer.domElement.addEventListener('touchend', mouseUp);

		mouseState = {
			down: false,
			x: 0,
			y: 0,
			oldX: 0,
			oldY: 0,
			ax: 0,
			ay: 0
		};
	}

	function update(/* args, ctx */) {}

	function cleanup(args, ctx) {
		ctx.domElement.removeEventListener('mousemove', mouseMove);
		ctx.domElement.removeEventListener('touchmove', mouseMove);
		ctx.domElement.removeEventListener('mouseup', mouseUp);
		ctx.domElement.removeEventListener('touchend', mouseUp);
		gooRunner.removeEventListener('mousedown', mouseDown);
		gooRunner.removeEventListener('touchstart', mouseDown);
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

module.exports = PickAndRotateScript;