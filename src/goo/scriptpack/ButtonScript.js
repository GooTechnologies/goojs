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

	/**
	 * Attaches mouse events to an entity.
	 */
	function ButtonScript() {

		function setup(params, env) {
			env.button = ['Any', 'Left', 'Middle', 'Right'].indexOf(params.button) - 1;
			if (env.button < -1) {
				env.button = -1;
			}

			// Mechanism to keep down render-to-pick buffer calls.
			env.renderToPickHandler = function () {
				env.skipUpdateBuffer = true;
			};
			SystemBus.addListener('ButtonScript.renderToPick', env.renderToPickHandler, false);

			env.mouseState = {
				x: 0,
				y: 0,
				down: false,
				downOnEntity: false, // Used for the click event
				overEntity: false
			};

			env.listeners = {
				mousedown: function (event) {
					if (!params.whenUsed) { return; }
					var pressedButton = getButton(event);
					if (pressedButton === env.button || env.button === -1) {
						env.mouseState.down = true;
						getMousePos(params, env, event);
						onMouseEvent(params, env, 'mousedown');
					}
				},
				mouseup: function (event) {
					if (!params.whenUsed) { return; }
					var pressedButton = getButton(event);
					if (pressedButton === env.button || env.button === -1) {
						env.mouseState.down = false;
						getMousePos(params, env, event);
						if (env.mouseState.downOnEntity) {
							onMouseEvent(params, env, 'click');
						}
						onMouseEvent(params, env, 'mouseup');
					}
				},
				dblclick: function (event) {
					if (!params.whenUsed) { return; }
					var pressedButton = getButton(event);
					if (pressedButton === env.button || env.button === -1) {
						env.mouseState.down = false;
						getMousePos(params, env, event);
						onMouseEvent(params, env, 'dblclick');
					}
				},
				mousemove: function (event) {
					if (!params.whenUsed || !params.enableOnMouseMove) { return; }
					env.mouseState.down = false;
					getMousePos(params, env, event);
					onMouseEvent(params, env, 'mousemove');
				},
				touchstart: function (event) {
					if (!params.whenUsed) { return; }
					env.mouseState.down = true;

					var touches = event.targetTouches;
					var rect = env.domElement.getBoundingClientRect();
					env.mouseState.x = touches[0].pageX - rect.left;
					env.mouseState.y = touches[0].pageY - rect.top;
					onMouseEvent(params, env, 'touchstart');
				},
				touchend: function (/*event*/) {
					if (!params.whenUsed) { return; }
					env.mouseState.down = false;
					onMouseEvent(params, env, 'touchend');
				}
			};
			for (var event in env.listeners) {
				env.domElement.addEventListener(event, env.listeners[event]);
			}
		}

		function getMousePos(params, env, mouseEvent) {
			var rect = env.domElement.getBoundingClientRect();
			env.mouseState.x = mouseEvent.pageX - rect.left;
			env.mouseState.y = mouseEvent.pageY - rect.top;
		}

		function update(params, env) {
			env.skipUpdateBuffer = false;
		}

		function cleanup(params, env) {
			// Remove event listeners
			for (var event in env.listeners) {
				env.domElement.removeEventListener(event, env.listeners[event]);
			}
			SystemBus.removeListener('ButtonScript.renderToPick', env.renderToPickHandler);
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
			var gooRunner = env.entity._world.gooRunner;

			var pickResult = gooRunner.pickSync(env.mouseState.x, env.mouseState.y, env.skipUpdateBuffer);
			if (!env.skipUpdateBuffer) {
				SystemBus.emit('ButtonScript.renderToPick');
			}
			var entity = gooRunner.world.entityManager.getEntityByIndex(pickResult.id);
			env.mouseState.downOnEntity = false;
			if (entity === env.entity) {
				SystemBus.emit(params.channel + '.' + type, {
					type: type,
					entity: entity
				});
				if (type === 'mousedown' || type === 'touchstart') {
					env.mouseState.downOnEntity = true;
				}
				if (params.linkUrl && type === 'click') {
					window.open(params.linkUrl, params.linkTarget);
				}
			}

			// mouseover
			if (type === 'mousemove' && !env.mouseState.overEntity && entity === env.entity) {
				SystemBus.emit(params.channel + '.mouseover', {
					type: 'mouseover',
					entity: entity
				});
			}
			// mouseout
			if (type === 'mousemove' && env.mouseState.overEntity && entity !== env.entity) {
				SystemBus.emit(params.channel + '.mouseout', {
					type: 'mouseout',
					entity: entity
				});
			}
			env.mouseState.overEntity = (entity === env.entity);
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	ButtonScript.externals = {
		key: 'ButtonScript',
		name: 'Button',
		description: 'Enables an entity to be interacted with using click or touch.',
		parameters: [{
			key: 'whenUsed',
			type: 'boolean',
			'default': true
		}, {
			key: 'button',
			name: 'button',
			description: 'Only interact with this mouse button.',
			type: 'string',
			control: 'select',
			'default': 'Any',
			options: ['Any', 'Left', 'Middle', 'Right']
		}, {
			key: 'linkUrl',
			name: 'linkUrl',
			description: 'URL to open when clicking the entity. Leave this field empty to disable.',
			type: 'string',
			'default': ''
		}, {
			key: 'linkTarget',
			name: 'linkTarget',
			description: 'The window to open the link in.',
			type: 'string',
			'default': '_blank'
		}, {
			key: 'channel',
			name: 'channel',
			description: 'Event channel to emit to. Will emit channel.click, .mousedown, .mouseup, .mouseover, .mouseout, .dblclick, .touchstart, .touchend',
			type: 'string',
			'default': 'button'
		}, {
			key: 'enableOnMouseMove',
			name: 'enableOnMouseMove',
			description: 'Enables .mousemove, .mouseover, and .mouseout events. For larger scenes, this might be worth turning off, for better performance.',
			type: 'boolean',
			'default': true
		}]
	};

	return ButtonScript;
});