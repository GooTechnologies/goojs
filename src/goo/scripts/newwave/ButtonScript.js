define([
	'goo/math/Vector3',
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils',
	'goo/renderer/Renderer',
	'goo/entities/SystemBus'
], function (
	Vector3,
	Scripts,
	ScriptUtils,
	Renderer,
	SystemBus
) {
	'use strict';

	function ButtonScript() {
		var button;
		var mouseState;
		var listeners;

		function setup(parameters, environment) {
			button = ['Any', 'Left', 'Middle', 'Right'].indexOf(parameters.button) - 1;
			if (button < -1) {
				button = -1;
			}

			mouseState = {
				x: 0,
				y: 0,
				down: false,
				downOnEntity: false // Used for the click event
			};
			listeners = {
				mousedown: function (event) {
					if (!parameters.whenUsed) { return; }
					var pressedButton = getButton(event);
					if (pressedButton === button || button === -1) {
						mouseState.down = true;
						mouseState.x = event.clientX;
						mouseState.y = event.clientY;
						onMouseEvent(parameters, environment, 'mousedown');
					}
				},
				mouseup: function (event) {
					if (!parameters.whenUsed) { return; }
					var pressedButton = getButton(event);
					if (pressedButton === button || button === -1) {
						mouseState.down = false;
						mouseState.x = event.clientX;
						mouseState.y = event.clientY;
						if (mouseState.downOnEntity) {
							onMouseEvent(parameters, environment, 'click');
						}
						onMouseEvent(parameters, environment, 'mouseup');
					}
				},
				dblclick: function (event) {
					if (!parameters.whenUsed) { return; }
					var pressedButton = getButton(event);
					if (pressedButton === button || button === -1) {
						mouseState.down = false;
						mouseState.x = event.clientX;
						mouseState.y = event.clientY;
						onMouseEvent(parameters, environment, 'dblclick');
					}
				},
				touchstart: function (event) {
					if (!parameters.whenUsed) { return; }
					mouseState.down = true;

					var touches = event.targetTouches;
					mouseState.x = touches[0].clientX;
					mouseState.y = touches[0].clientY;
					onMouseEvent(parameters, environment, 'touchstart');
				},
				touchend: function (/*event*/) {
					if (!parameters.whenUsed) { return; }
					mouseState.down = false;
					onMouseEvent(parameters, environment, 'touchend');
				}
			};
			for (var event in listeners) {
				environment.domElement.addEventListener(event, listeners[event]);
			}
		}

		function update(/*parameters, environment*/) {
		}

		function cleanup(parameters, environment) {
			for (var event in listeners) {
				environment.domElement.removeEventListener(event, listeners[event]);
			}
		}

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

		function onMouseEvent(params, env, type) {
			var mainCam = Renderer.mainCamera;
			if (!mainCam) {
				return;
			}
			var entity = env.entity;
			var gooRunner = entity._world.gooRunner;
			var pickResult = gooRunner.pickSync(mouseState.x, mouseState.y);
			var entity = gooRunner.world.entityManager.getEntityByIndex(pickResult.id);
			mouseState.downOnEntity = false;
			if (entity === env.entity) {
				SystemBus.emit('goo.buttonScriptEvent', {
					type: type,
					entity: entity
				});
				if (type === 'mousedown' || type === 'touchstart') {
					mouseState.downOnEntity = true;
				}
			}
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	ButtonScript.externals = {
		name: 'ButtonScript',
		description: 'Enables an entity to be interacted with using click or touch.',
		parameters: [{
			key: 'whenUsed',
			type: 'boolean',
			'default': true
		}, {
			key: 'button',
			name: 'button',
			description: 'Only interact with this button',
			type: 'string',
			control: 'select',
			'default': 'Any',
			options: ['Any', 'Left', 'Middle', 'Right']
		}]
	};

	return ButtonScript;
});