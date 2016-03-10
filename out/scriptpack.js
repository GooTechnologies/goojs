goo.AxisAlignedCamControlScript = (function (
	Vector3,
	ScriptUtils,
	MathUtils
) {
	'use strict';

	/**
	 * Axis aligned camera control script
	 * @returns {{setup: setup, update: update, cleanup: cleanup}}
	 */
	function AxisAlignedCamControlScript() {
		function setup(params, env) {
			// Look axis
			env.axis = Vector3.UNIT_Z.clone();
			// Up axis will most often be Y but you never know...
			env.upAxis = Vector3.UNIT_Y.clone();
			setView(params, env, params.view);
			env.currentView = params.view;
			env.lookAtPoint	= new Vector3();
			env.distance	= params.distance;
			env.smoothness	= Math.pow(MathUtils.clamp(params.smoothness, 0, 1), 0.3);
			env.axisAlignedDirty = true;
		}

		function setView(params, env, view) {
			if (env.currentView === view) {
				return;
			}
			env.currentView = view;
			switch (view) {
				case 'XY':
					env.axis.set(Vector3.UNIT_Z);
					env.upAxis.set(Vector3.UNIT_Y);
					break;
				case 'ZY':
					env.axis.set(Vector3.UNIT_X);
					env.upAxis.set(Vector3.UNIT_Y);
					break;
			}
			env.axisAlignedDirty = true;
		}

		function update(params, env) {
			if (params.view !== env.currentView) {
				env.axisAlignedDirty = true;
			}
			if (!env.axisAlignedDirty) {
				return;
			}
			var entity = env.entity;
			var transform = entity.transformComponent.transform;
			transform.translation.set(env.axis).scale(env.distance).add(env.lookAtPoint);
			// REVIEW: Collision with pancamscript? Make new panscript for the 2d camera, or bake the panning logic into the axisaligned camera script?
			transform.lookAt(env.lookAtPoint, env.upAxis);
			entity.transformComponent.setUpdated();

			env.axisAlignedDirty = false;
		}

		// Removes all listeners
		function cleanup(/*params, env*/) {
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	AxisAlignedCamControlScript.externals = {
		key: 'AxisAlignedCamControlScript',
		name: 'Axis-aligned Camera Control',
		description: 'Aligns a camera along an axis, and enables switching between them.',
		parameters: [{
			key: 'whenUsed',
			name: 'When Camera Used',
			description: 'Script only runs when the camera to which it is added is being used.',
			'default': true,
			type: 'boolean'
		}, {
			key: 'distance',
			name: 'Distance',
			type: 'float',
			description: 'Camera distance from lookat point',
			control: 'slider',
			'default': 1,
			min: 1,
			max: 1e3
		}, {
			key: 'view',
			type: 'string',
			'default': 'XY',
			control: 'select',
			options: ['XY', 'ZY']
		}]
	};

	return AxisAlignedCamControlScript;
})(goo.Vector3,goo.ScriptUtils,goo.MathUtils);
goo.WasdControlScript = (function (
	Vector3,
	Scripts,
	ScriptUtils
) {
	'use strict';

	function WasdControlScript() {
		var entity, transformComponent, transform;
		var _parameters;

		var moveState;

		var fwdVector = new Vector3(0, 0, -1);
		var leftVector = new Vector3(-1, 0, 0);

		var moveVector = new Vector3();
		var calcVector = new Vector3();

		// ---
		function updateMovementVector() {
			moveVector.x = moveState.strafeLeft - moveState.strafeRight;
			moveVector.z = moveState.forward - moveState.back;
		}

		function keyDown(event) {
			if (event.altKey) {	return;	}

			switch (ScriptUtils.keyForCode(event.keyCode)) {
				case _parameters.crawlKey:
					moveState.speed = _parameters.crawlSpeed;
					break;

				case _parameters.forwardKey:
					moveState.forward = 1;
					updateMovementVector();
					break;
				case _parameters.backKey:
					moveState.back = 1;
					updateMovementVector();
					break;

				case _parameters.strafeLeftKey:
					moveState.strafeLeft = 1;
					updateMovementVector();
					break;
				case _parameters.strafeRightKey:
					moveState.strafeRight = 1;
					updateMovementVector();
					break;
			}
		}

		function keyUp(event) {
			if (event.altKey) {	return;	}

			switch (ScriptUtils.keyForCode(event.keyCode)) {
				case _parameters.crawlKey:
					moveState.speed = _parameters.walkSpeed;
					break;

				case _parameters.forwardKey:
					moveState.forward = 0;
					updateMovementVector();
					break;
				case _parameters.backKey:
					moveState.back = 0;
					updateMovementVector();
					break;

				case _parameters.strafeLeftKey:
					moveState.strafeLeft = 0;
					updateMovementVector();
					break;
				case _parameters.strafeRightKey:
					moveState.strafeRight = 0;
					updateMovementVector();
					break;
			}
		}

		function setupKeyControls(domElement) {
			domElement.setAttribute('tabindex', -1);
			domElement.addEventListener('keydown', keyDown, false);
			domElement.addEventListener('keyup', keyUp, false);
		}

		function setup(parameters, environment) {
			_parameters = parameters;
			environment.moveState = moveState = {
				strafeLeft: 0,
				strafeRight: 0,
				forward: 0,
				back: 0,
				crawling: false,
				speed: parameters.walkSpeed
			};

			entity = environment.entity;
			transformComponent = entity.transformComponent;
			transform = transformComponent.transform;

			setupKeyControls(environment.domElement);
		}

		function update(parameters, environment) {
			if (moveVector.equals(Vector3.ZERO)) { return; }
			if (parameters.whenUsed && environment.entity !== environment.activeCameraEntity) { return; }

			// direction of movement in local coords
			calcVector.setDirect(
				fwdVector.x * moveVector.z + leftVector.x * moveVector.x,
				fwdVector.y * moveVector.z + leftVector.y * moveVector.x,
				fwdVector.z * moveVector.z + leftVector.z * moveVector.x
			);
			calcVector.normalize();

			// move speed for this run...
			var moveMult = environment.world.tpf * moveState.speed;

			// scale by speed
			calcVector.scale(moveMult);

			// grab orientation of player
			var orient = transform.rotation;

			// reorient our movement to entity space
			calcVector.applyPost(orient);

			// add to our transform
			transform.translation.add(calcVector);

			// set our component updated.
			transformComponent.setUpdated();
		}

		function cleanup(parameters, env) {
			env.domElement.removeEventListener('keydown', keyDown, false);
			env.domElement.removeEventListener('keyup', keyUp, false);
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	WasdControlScript.externals = {
		key: 'WASD',
		name: 'WASD Control',
		description: 'Enables moving via the WASD keys',
		parameters: [{
			key: 'whenUsed',
			type: 'boolean',
			name: 'When Camera Used',
			description: 'Script only runs when the camera to which it is added is being used.',
			'default': true
		}, {
			key: 'crawlKey',
			type: 'string',
			control: 'key',
			'default': 'Shift'
		}, {
			key: 'forwardKey',
			type: 'string',
			control: 'key',
			'default': 'W'
		}, {
			key: 'backKey',
			type: 'string',
			control: 'key',
			'default': 'S'
		}, {
			key: 'strafeLeftKey',
			type: 'string',
			control: 'key',
			'default': 'A'
		}, {
			key: 'strafeRightKey',
			type: 'string',
			control: 'key',
			'default': 'D'
		}, {
			key: 'walkSpeed',
			type: 'int',
			control: 'slider',
			'default': 10,
			min: 1,
			max: 100,
			exponential: true
		}, {
			key: 'crawlSpeed',
			control: 'slider',
			type: 'int',
			'default': 1,
			min: 0.1,
			max: 10,
			exponential: true
		}]
	};

	return WasdControlScript;
})(goo.Vector3,goo.Scripts,goo.ScriptUtils);
goo.MouseLookControlScript = (function (
	Scripts,
	Vector3,
	MathUtils,
	GameUtils
) {
	'use strict';

	function MouseLookControlScript() {
		var buttonPressed = false;
		var lastX = 0, lastY = 0, x = 0, y = 0;
		var angles;
		var button;
		var _environment;
		var _parameters;
		var _initialAzimuth;

		function mouseDown(e) {
			if (!_parameters.whenUsed || _environment.entity === _environment.activeCameraEntity) {
				if (button === -1 || e.button === button) {
					buttonPressed = true;
					lastX = x = e.clientX;
					lastY = y = e.clientY;
				}
			}
		}

		// Used when button is None.
		// Helps attaching the lock if we failed in .setup().
		function mouseDown2() {
			if (!document.pointerLockElement) {
				GameUtils.requestPointerLock();
			}
		}

		function mouseMove(e) {
			if (!_parameters.whenUsed || _environment.entity === _environment.activeCameraEntity) {
				if (buttonPressed) {
					if (e.movementX !== undefined) {
						x += e.movementX;
						y += e.movementY;
					}	else {
						x = e.clientX;
						y = e.clientY;
					}
				}
			}
		}
		function mouseUp() {
			buttonPressed = false;
		}
		function pointerLockChange() {
			buttonPressed = !!document.pointerLockElement;

			if (document.pointerLockElement) {
				// We are attached! No mousedown listener needed any more.
				_environment.domElement.removeEventListener('mousedown', mouseDown2);
			} else {
				// Not attached.
				_environment.domElement.addEventListener('mousedown', mouseDown2);
			}
		}

		function setup(parameters, environment) {
			_environment = environment;
			_parameters = parameters;
			button = ['Any', 'Left', 'Middle', 'Right', 'None'].indexOf(parameters.button) - 1;
			if (button < -1) {
				button = -1;
			}
			var domElement = environment.domElement;
			if (button === 3) {
				document.addEventListener('pointerlockchange', pointerLockChange);
				document.addEventListener('mousemove', mouseMove);
				domElement.addEventListener('mousedown', mouseDown2);

				// attempt to request a pointer lock; will succeed only if fullscreen is enabled.
				GameUtils.requestPointerLock();
			} else {
				domElement.addEventListener('mousedown', mouseDown);
				domElement.addEventListener('mouseup', mouseUp);
				domElement.addEventListener('mouseleave', mouseUp);
				domElement.addEventListener('mousemove', mouseMove);
			}

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

				document.removeEventListener('mousemove', mouseMove);
				domElement.removeEventListener('mousedown', mouseDown2);
				document.removeEventListener('pointerlockchange', pointerLockChange);
			} else {
				domElement.removeEventListener('mousemove', mouseMove);
				domElement.removeEventListener('mousedown', mouseDown);
				domElement.removeEventListener('mouseup', mouseUp);
				domElement.removeEventListener('mouseleave', mouseUp);
			}
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
				options: ['Any', 'Left', 'Middle', 'Right', 'None']
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

	return MouseLookControlScript;
})(goo.Scripts,goo.Vector3,goo.MathUtils,goo.GameUtils);
goo.FlyControlScript = (function (
	Scripts,
	WasdControlScript,
	MouseLookControlScript
) {
	'use strict';

	function FlyControlScript() {
		var wasdScript = Scripts.create(WasdControlScript);
		var lookScript = Scripts.create(MouseLookControlScript);

		function setup(parameters, environment) {
			lookScript.setup(parameters, environment);
			wasdScript.setup(parameters, environment);
		}

		function update(parameters, environment) {
			lookScript.update(parameters, environment);
			wasdScript.update(parameters, environment);
		}

		function cleanup(parameters, environment) {
			lookScript.cleanup(parameters, environment);
			wasdScript.cleanup(parameters, environment);
		}

		return {
			setup: setup,
			cleanup: cleanup,
			update: update
		};
	}

	var wasdParams = WasdControlScript.externals.parameters;
	var mouseLookParams = MouseLookControlScript.externals.parameters;
	var params = wasdParams.concat(mouseLookParams.slice(1));

	FlyControlScript.externals = {
		key: 'FlyControlScript',
		name: 'Fly Control',
		description: 'This is a combo of the Wasd script and the MouseLook script',
		parameters: params
	};

	return FlyControlScript;
})(goo.Scripts,goo.WasdControlScript,goo.MouseLookControlScript);
goo.ButtonScript = (function (
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
				if (params.linkUrl && (type === 'click' || type === 'touchstart')) {
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
})(goo.Vector3,goo.Scripts,goo.ScriptUtils,goo.Renderer,goo.SystemBus);
goo.BasicControlScript = (function (Vector3, Matrix3) {
	'use strict';

	/**
	 * Make an entity controllable via mouse and keyboard. WASD keys move the entity towards the back, left,
	 * front and right respectively. Shift causes speed to drop to a tenth. R and F move it up or down. Q and E roll it
	 * towards the left or right. The arrow keys cause the entity to rotate, as does dragging with the mouse.
	 *
	 * @param {Element} domElement Element to add mouse/key listeners to
	 */
	function BasicControlScript (properties) {
		properties = properties || {};
		this.domElement = properties.domElement === undefined ? null : properties.domElement.domElement || properties.domElement;

		this.name = 'BasicControlScript';

		/** The regular speed of the entity.
		 * @type {number}
		 * @default
		 */
		this.movementSpeed = 10.0;
		/** The regular speed of the entity when rolling.
		 * @type {number}
		 * @default
		 */
		this.rollSpeed = 2.0;
		this.movementSpeedMultiplier = 1.0;

		this.mouseStatus = 0;
		this.moveState = {
			up: 0,
			down: 0,
			left: 0,
			right: 0,
			forward: 0,
			back: 0,
			pitchUp: 0,
			pitchDown: 0,
			yawLeft: 0,
			yawRight: 0,
			rollLeft: 0,
			rollRight: 0
		};
		this.moveVector = new Vector3(0, 0, 0);
		this.rotationVector = new Vector3(0, 0, 0);
		this.multiplier = new Vector3(1, 1, 1);
		this.rotationMatrix = new Matrix3();
		this.tmpVec = new Vector3();

		this.handleEvent = function (event) {
			if (typeof this[event.type] === 'function') {
				this[event.type](event);
			}
		};

		this.keydown = function (event) {
			if (event.altKey) {
				return;
			}

			// event.preventDefault();
			switch (event.keyCode) {
				case 16: /* shift */
					this.movementSpeedMultiplier = 0.1;
					break;

				case 87: /* W */
					this.moveState.forward = 1;
					break;
				case 83: /* S */
					this.moveState.back = 1;
					break;

				case 65: /* A */
					this.moveState.left = 1;
					break;
				case 68: /* D */
					this.moveState.right = 1;
					break;

				case 82: /* R */
					this.moveState.up = 1;
					break;
				case 70: /* F */
					this.moveState.down = 1;
					break;

				case 38: /* up */
					this.moveState.pitchUp = 1;
					break;
				case 40: /* down */
					this.moveState.pitchDown = 1;
					break;
				case 37: /* left */
					this.moveState.yawLeft = 1;
					break;
				case 39: /* right */
					this.moveState.yawRight = 1;
					break;

				case 81: /* Q */
					this.moveState.rollLeft = 1;
					break;
				case 69: /* E */
					this.moveState.rollRight = 1;
					break;
			}

			this.updateMovementVector();
			this.updateRotationVector();
		};

		this.keyup = function (event) {
			switch (event.keyCode) {
				case 16: /* shift */
					this.movementSpeedMultiplier = 1;
					break;

				case 87: /* W */
					this.moveState.forward = 0;
					break;
				case 83: /* S */
					this.moveState.back = 0;
					break;

				case 65: /* A */
					this.moveState.left = 0;
					break;
				case 68: /* D */
					this.moveState.right = 0;
					break;

				case 82: /* R */
					this.moveState.up = 0;
					break;
				case 70: /* F */
					this.moveState.down = 0;
					break;

				case 38: /* up */
					this.moveState.pitchUp = 0;
					break;
				case 40: /* down */
					this.moveState.pitchDown = 0;
					break;

				case 37: /* left */
					this.moveState.yawLeft = 0;
					break;
				case 39: /* right */
					this.moveState.yawRight = 0;
					break;

				case 81: /* Q */
					this.moveState.rollLeft = 0;
					break;
				case 69: /* E */
					this.moveState.rollRight = 0;
					break;

			}

			this.updateMovementVector();
			this.updateRotationVector();
		};

		this.mousedown = function (event) {
			if (this.domElement !== document) {
				this.domElement.focus();
			}

			event.preventDefault();

			event = event.touches && event.touches.length === 1 ? event.touches[0] : event;

			this.mouseDownX = event.pageX;
			this.mouseDownY = event.pageY;
			this.mouseStatus = 1;

			document.addEventListener('mousemove', this.mousemove, false);
			document.addEventListener('mouseup', this.mouseup, false);
			document.addEventListener('touchmove', this.mousemove, false);
			document.addEventListener('touchend', this.mouseup, false);
		}.bind(this);

		this.mousemove = function (event) {
			if (this.mouseStatus > 0) {
				event = event.touches && event.touches.length === 1 ? event.touches[0] : event;

				this.moveState.yawLeft = event.pageX - this.mouseDownX;
				this.moveState.pitchDown = event.pageY - this.mouseDownY;

				this.updateRotationVector();

				this.mouseDownX = event.pageX;
				this.mouseDownY = event.pageY;
			}
		}.bind(this);

		this.mouseup = function (event) {
			if (!this.mouseStatus) {
				return;
			}

			event.preventDefault();

			this.mouseStatus = 0;
			this.moveState.yawLeft = this.moveState.pitchDown = 0;

			this.updateRotationVector();

			document.removeEventListener('mousemove', this.mousemove);
			document.removeEventListener('mouseup', this.mouseup);
			document.removeEventListener('touchmove', this.mousemove);
			document.removeEventListener('touchend', this.mouseup);
		}.bind(this);

		this.updateMovementVector = function () {
			var forward = this.moveState.forward || this.autoForward && !this.moveState.back ? 1 : 0;

			this.moveVector.x = -this.moveState.left + this.moveState.right;
			this.moveVector.y = -this.moveState.down + this.moveState.up;
			this.moveVector.z = -forward + this.moveState.back;
		};

		this.updateRotationVector = function () {
			this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp;
			this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft;
			this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft;
		};

		this.getContainerDimensions = function () {
			if (this.domElement !== document) {
				return {
					size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
					offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
				};
			} else {
				return {
					size: [window.innerWidth, window.innerHeight],
					offset: [0, 0]
				};
			}
		};

		if (this.domElement) {
			this.setupMouseControls();
		}
		this.updateMovementVector();
		this.updateRotationVector();
	}

	BasicControlScript.prototype.setupMouseControls = function () {
		this.domElement.setAttribute('tabindex', -1);
		this.domElement.addEventListener('mousedown', this.mousedown, false);
		this.domElement.addEventListener('touchstart', this.mousedown, false);
		this.domElement.addEventListener('keydown', this.keydown.bind(this), false);
		this.domElement.addEventListener('keyup', this.keyup.bind(this), false);
	};

	//! AT: what is this?!?!
	/*
	 * Test on how to expose variables to a tool.
	 * @returns {Array}
	 */
	BasicControlScript.prototype.externals = function () {
		return [{
			variable: 'movementSpeed',
			type: 'number'
		}, {
			variable: 'rollSpeed',
			type: 'number'
		}];
	};

	BasicControlScript.prototype.run = function (entity, tpf, env) {
		if (env) {
			if (!this.domElement && env.domElement) {
				this.domElement = env.domElement;
				this.setupMouseControls();
			}
		}
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		var delta = entity._world.tpf;

		var moveMult = delta * this.movementSpeed * this.movementSpeedMultiplier;
		var rotMult = delta * this.rollSpeed * this.movementSpeedMultiplier;

		if (!this.moveVector.equals(Vector3.ZERO) || !this.rotationVector.equals(Vector3.ZERO) || this.mouseStatus > 0) {
			transform.translation.x += this.moveVector.x * moveMult;
			transform.translation.y += this.moveVector.y * moveMult;
			transform.translation.z += this.moveVector.z * moveMult;

			this.tmpVec.x += -this.rotationVector.x * rotMult * this.multiplier.x;
			this.tmpVec.y += this.rotationVector.y * rotMult * this.multiplier.y;
			this.tmpVec.z += this.rotationVector.z * rotMult * this.multiplier.z;
			transform.rotation.fromAngles(this.tmpVec.x, this.tmpVec.y, this.tmpVec.z);

			if (this.mouseStatus > 0) {
				this.moveState.yawLeft = 0;
				this.moveState.pitchDown = 0;
				this.updateRotationVector();
			}

			transformComponent.setUpdated();
		}
	};

	return BasicControlScript;
})(goo.Vector3,goo.Matrix3);
goo.CannonPickScript = (function (
	Vector3,
	Scripts,
	ScriptUtils,
	Renderer,
	Plane
) {
	'use strict';

	var CANNON = window.CANNON;

	function CannonPickScript() {
		var pickButton;
		var mouseState;
		var cannonSystem;
		var plane = new Plane();

		function getTouchCenter(touches) {
			var x1 = touches[0].clientX;
			var y1 = touches[0].clientY;
			var x2 = touches[1].clientX;
			var y2 = touches[1].clientY;
			var cx = (x1 + x2) / 2;
			var cy = (y1 + y2) / 2;
			return [cx, cy];
		}

		function setup(parameters, env) {
			pickButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(parameters.pickButton) - 1;
			if (pickButton < -1) {
				pickButton = -1;
			}

			// Joint body
			cannonSystem = env.world.getSystem('CannonSystem');
			var shape = new CANNON.Sphere(0.1);
			var jointBody = env.jointBody = new CANNON.RigidBody(0, shape);
			jointBody.collisionFilterGroup = 2;
			jointBody.collisionFilterMask = 2;
			cannonSystem.world.add(jointBody);

			mouseState = {
				x: 0,
				y: 0,
				ox: 0,
				oy: 0,
				dx: 0,
				dy: 0,
				down: false
			};
			var listeners = env.listeners = {
				mousedown: function (event) {
					if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
						var button = event.button;
						if (button === 0) {
							if (event.altKey) {
								button = 2;
							} else if (event.shiftKey) {
								button = 1;
							}
						}
						if (button === pickButton || pickButton === -1) {
							mouseState.down = true;
							mouseState.ox = mouseState.x = event.clientX;
							mouseState.oy = mouseState.y = event.clientY;
						}
					}
				},
				mouseup: function (event) {
					var button = event.button;
					if (button === 0) {
						if (event.altKey) {
							button = 2;
						} else if (event.shiftKey) {
							button = 1;
						}
					}
					if (button === pickButton || pickButton === -1) {
						mouseState.down = false;
						mouseState.dx = mouseState.dy = 0;
					}
				},
				mousemove: function (event) {
					if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
						if (mouseState.down) {
							mouseState.x = event.clientX;
							mouseState.y = event.clientY;
							env.dirty = true;
						}
					}
				},
				mouseleave: function (/*event*/) {
					mouseState.down = false;
					mouseState.ox = mouseState.x;
					mouseState.oy = mouseState.y;
				},
				touchstart: function (event) {
					if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
						mouseState.down = (event.targetTouches.length === 2);
						if (!mouseState.down) { return; }

						var center = getTouchCenter(event.targetTouches);
						mouseState.ox = mouseState.x = center[0];
						mouseState.oy = mouseState.y = center[1];
					}
				},
				touchmove: function (event) {
					if (!parameters.whenUsed || env.entity === env.activeCameraEntity) {
						if (!mouseState.down) { return; }

						var center = getTouchCenter(event.targetTouches);
						mouseState.x = center[0];
						mouseState.y = center[1];
					}
				},
				touchend: function (/*event*/) {
					mouseState.down = false;
					mouseState.ox = mouseState.x;
					mouseState.oy = mouseState.y;
				}
			};
			for (var event in listeners) {
				env.domElement.addEventListener(event, listeners[event]);
			}
			env.dirty = true;
		}

		function update(params, env) {
			mouseState.dx = mouseState.x - mouseState.ox;
			mouseState.dy = mouseState.y - mouseState.oy;

			mouseState.ox = mouseState.x;
			mouseState.oy = mouseState.y;

			var mainCam = Renderer.mainCamera;

			if (mainCam && mouseState.down && !env.mouseConstraint) {
				// Shoot cannon.js ray. Not included in Goo Engine yet, so let's use it directly
				var bodies = [];
				var physicsEntities = env.world.by.system('CannonSystem').toArray();
				for (var i = 0; i < physicsEntities.length; i++) {
					var b = physicsEntities[i].cannonRigidbodyComponent.body;
					if (b && b.shape instanceof CANNON.Box && b.motionstate === CANNON.Body.DYNAMIC) { // Cannon only supports convex with ray intersection
						bodies.push(b);
					}
				}
				// Get pick ray
				var gooRay = mainCam.getPickRay(mouseState.x, mouseState.y, window.innerWidth, window.innerHeight);
				var origin = new CANNON.Vec3(gooRay.origin.x, gooRay.origin.y, gooRay.origin.z);
				var direction = new CANNON.Vec3(gooRay.direction.x, gooRay.direction.y, gooRay.direction.z);
				var r = new CANNON.Ray(origin, direction);
				var result = r.intersectBodies(bodies);
				if (result.length) {
					var b = result[0].body;
					var p = result[0].point;
					addMouseConstraint(params, env, p.x, p.y, p.z, b, gooRay.direction.scale(-1));
				}
			} else if (mainCam && mouseState.down && env.mouseConstraint && (mouseState.dx !== 0 || mouseState.dy !== 0)) {
				// Get the current mouse point on the moving plane
				var mainCam = Renderer.mainCamera;
				var gooRay = mainCam.getPickRay(mouseState.x, mouseState.y, window.innerWidth, window.innerHeight);
				var newPositionWorld = new Vector3();
				plane.rayIntersect(gooRay, newPositionWorld, true);
				moveJointToPoint(params, env, newPositionWorld);
			} else if (!mouseState.down) {
				// Remove constraint
				removeJointConstraint(params, env);
			}
		}

		function cleanup(parameters, environment) {
			for (var event in environment.listeners) {
				environment.domElement.removeEventListener(event, environment.listeners[event]);
			}
		}

		function addMouseConstraint(params, env, x, y, z, body, normal) {
			// The cannon body constrained by the mouse joint
			env.constrainedBody = body;

			// Vector to the clicked point, relative to the body
			var v1 = new CANNON.Vec3(x, y, z).vsub(env.constrainedBody.position);

			// Apply anti-quaternion to vector to tranform it into the local body coordinate system
			var antiRot = env.constrainedBody.quaternion.inverse();
			var pivot = antiRot.vmult(v1); // pivot is not in local body coordinates

			// Move the cannon click marker particle to the click position
			env.jointBody.position.set(x, y, z);

			// Create a new constraint
			// The pivot for the jointBody is zero
			env.mouseConstraint = new CANNON.PointToPointConstraint(env.constrainedBody, pivot, env.jointBody, new CANNON.Vec3(0, 0, 0));

			// Add the constriant to world
			cannonSystem.world.addConstraint(env.mouseConstraint);

			// Set plane distance from world origin by projecting world translation to plane normal
			var worldCenter = new Vector3(x, y, z);
			plane.constant = worldCenter.dot(normal);
			plane.normal.set(normal);
		}

		// This functions moves the transparent joint body to a new postion in space
		function moveJointToPoint(params, env, point) {
			// Move the joint body to a new position
			env.jointBody.position.set(point.x, point.y, point.z);
			env.mouseConstraint.update();
		}

		function removeJointConstraint(params, env) {
			// Remove constriant from world
			cannonSystem.world.removeConstraint(env.mouseConstraint);
			env.mouseConstraint = false;
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	CannonPickScript.externals = {
		key: 'CannonPickScript',
		name: 'Cannon.js Body Pick',
		description: 'Enables the user to physically pick a Cannon.js physics body and drag it around.',
		parameters: [{
			key: 'whenUsed',
			type: 'boolean',
			'default': true
		}, {
			key: 'pickButton',
			name: 'Pan button',
			description: 'Pick with this button',
			type: 'string',
			control: 'select',
			'default': 'Any',
			options: ['Any', 'Left', 'Middle', 'Right']
		}, {
			key: 'useForceNormal',
			name: 'Use force normal',
			type: 'boolean',
			'default': false
		}, {
			key: 'forceNormal',
			name: 'Force normal',
			'default': [0, 0, 1],
			type: 'vec3'
		}]
	};

	return CannonPickScript;
})(goo.Vector3,goo.Scripts,goo.ScriptUtils,goo.Renderer,goo.Plane);
goo.HeightMapBoundingScript = (function (
	MathUtils
) {
	'use strict';

	/**
	 * Handles the height data for a heightmap and
	 * provides functions for getting elevation at given coordinates.
	 * @param {Array} matrixData The height data. Needs to be power of two.
	 */
	function HeightMapBoundingScript(matrixData) {
		this.matrixData = matrixData;
		this.width = matrixData.length - 1;
	}

	/**
	 * Gets the terrain matrix data
	 * @returns {Array} the height data matrix
	 */
	HeightMapBoundingScript.prototype.getMatrixData = function () {
		return this.matrixData;
	};

	// get a height at point from matrix
	HeightMapBoundingScript.prototype.getPointInMatrix = function (x, y) {
		return this.matrixData[x][y];
	};

	// get the value at the precise integer (x, y) coordinates
	HeightMapBoundingScript.prototype.getAt = function (x, y) {
		if (x < 0 || x > this.width || y < 0 || y > this.width) {
			return 0;
		}
		else {
			return this.getPointInMatrix(x, y);
		}
	};

	// get the interpolated value
	HeightMapBoundingScript.prototype.getInterpolated = function (x, y) {
		var valueLeftUp = this.getAt(Math.ceil(x), Math.ceil(y));
		var valueLeftDown = this.getAt(Math.ceil(x), Math.floor(y));
		var valueRightUp = this.getAt(Math.floor(x), Math.ceil(y));
		var valueRightDown = this.getAt(Math.floor(x), Math.floor(y));

		var fracX = x - Math.floor(x);
		var fracY = y - Math.floor(y);

		var upAvg = valueLeftUp * fracX + valueRightUp * (1 - fracX);
		var downAvg = valueLeftDown * fracX + valueRightDown * (1 - fracX);

		var totalAvg = upAvg * fracY + downAvg * (1 - fracY);

		return totalAvg;
	};

	HeightMapBoundingScript.prototype.getTriangleAt = function (x, y) {
		var xc = Math.ceil(x);
		var xf = Math.floor(x);
		var yc = Math.ceil(y);
		var yf = Math.floor(y);

		var fracX = x - xf;
		var fracY = y - yf;

		var p1 = { x: xf, y: yc, z: this.getAt(xf, yc) };
		var p2 = { x: xc, y: yf, z: this.getAt(xc, yf) };

		var p3;

		if (fracX < 1 - fracY) {
			p3 = { x: xf, y: yf, z: this.getAt(xf, yf) };
		} else {
			p3 = { x: xc, y: yc, z: this.getAt(xc, yc) };
		}
		return [p1, p2, p3];
	};

	// get the exact height of the triangle at point
	HeightMapBoundingScript.prototype.getPreciseHeight = function (x, y) {
		var tri = this.getTriangleAt(x, y);
		var find = MathUtils.barycentricInterpolation(tri[0], tri[1], tri[2], { x: x, y: y, z: 0 });
		return find.z;
	};

	HeightMapBoundingScript.prototype.run = function (entity) {
		var translation = entity.transformComponent.transform.translation;
		translation.y = this.getInterpolated(translation.z, translation.x);
	};

	return HeightMapBoundingScript;
})(goo.MathUtils);
goo.GroundBoundMovementScript = (function (
	Vector3
) {
	'use strict';

	var calcVec = new Vector3();
	var _defaults = {
		gravity: -9.81,
		worldFloor: -Infinity,
		jumpImpulse: 95,
		accLerp: 0.1,
		rotLerp: 0.1,
		modForward: 1,
		modStrafe: 0.7,
		modBack: 0.4,
		modTurn: 0.3
	};

	/**
	 * A script for handling basic movement and jumping over a terrain.
	 * The standard usage of this script will likely also need some input listener and camera handling.
	 */
	function GroundBoundMovementScript(properties) {
		properties = properties || {};
		for (var key in _defaults) {
			if (typeof _defaults[key] === 'boolean') {
				this[key] = properties[key] !== undefined ? properties[key] === true : _defaults[key];
			} else if (!isNaN(_defaults[key])) {
				this[key] = !isNaN(properties[key]) ? properties[key] : _defaults[key];
			} else if (_defaults[key] instanceof Vector3) {
				this[key] = (properties[key]) ? new Vector3(properties[key]) : new Vector3().set(_defaults[key]);
			} else {
				this[key] = properties[key] || _defaults[key];
			}
		}

		this.groundContact = 1;
		this.targetVelocity = new Vector3();
		this.targetHeading = new Vector3();
		this.acceleration = new Vector3();
		this.torque = new Vector3();
		this.groundHeight = 0;
		this.groundNormal = new Vector3();
		this.controlState = {
			run: 0,
			strafe: 0,
			jump: 0,
			yaw: 0,
			roll: 0,
			pitch: 0
		};
	}

	/**
	 * Sets the terrain script. This class requires that the terrain system can provide
	 * height and normal for a given position when applicable. Without a terrain system the
	 * script will fallback to the worldFloor height. (Defaults to -Infinity).
	 * @param {WorldFittedTerrainScript} terrainScript
	 */
	GroundBoundMovementScript.prototype.setTerrainSystem = function (terrainScript) {
		this.terrainScript = terrainScript;
	};


	/**
	 * Returns the terrain system.
	 * @returns {WorldFittedTerrainScript} terrainScript
	 */
	GroundBoundMovementScript.prototype.getTerrainSystem = function () {
		return this.terrainScript;
	};


	/**
	 * Get the terrain height for a given translation. Or if no terrain is present
	 * return the world floor height.
	 * @private
	 * @param {Vector3} translation
	 * @returns {number} Height of ground
	 */
	GroundBoundMovementScript.prototype.getTerrainHeight = function (translation) {
		var height = this.getTerrainSystem().getTerrainHeightAt(translation);
		if (height === null) {
			height = this.worldFloor;
		}
		return height;
	};

	/**
	 * Get the ground normal for a given translation.
	 * @private
	 * @param {Vector3} translation
	 * @returns {Vector3} The terrain normal vector.
	 */
	GroundBoundMovementScript.prototype.getTerrainNormal = function (translation) {
		return this.getTerrainSystem().getTerrainNormalAt(translation);
	};

	/**
	 * Request script to move along its forward axis. Becomes
	 * backwards with negative amount.
	 * @param {number} amount
	 */
	GroundBoundMovementScript.prototype.applyForward = function (amount) {
		this.controlState.run = amount;
	};

	/**
	 * Applies strafe amount for sideways input.
	 * @param {number} amount
	 */
	GroundBoundMovementScript.prototype.applyStrafe = function (amount) {
		this.controlState.strafe = amount;
	};

	/**
	 * Applies jump input.
	 * @param {number} amount
	 */
	GroundBoundMovementScript.prototype.applyJump = function (amount) {
		this.controlState.jump = amount;
	};

	/**
	 * Applies turn input for rotation around the y-axis.
	 * @param {number} amount
	 */

	GroundBoundMovementScript.prototype.applyTurn = function (amount) {
		this.controlState.yaw = amount;
	};

	/**
	 * Called when movement state is updated if requirements for jumping are met.
	 * @private
	 * @param [number} up
	 * @returns {*}
	 */
	GroundBoundMovementScript.prototype.applyJumpImpulse = function (up) {
		if (this.groundContact) {
			if (this.controlState.jump) {
				up = this.jumpImpulse;
				this.controlState.jump = 0;
			} else {
				up = 0;
			}
		}
		return up;
	};


	/**
	 * Modulates the movement state with given circumstances and input
	 * @private
	 * @param {number} strafe
	 * @param {number} up
	 * @param {number} run
	 * @returns {Array} The modulated directional movement state
	 */
	GroundBoundMovementScript.prototype.applyDirectionalModulation = function (strafe, up, run) {
		strafe *= this.modStrafe;
		if (run > 0) {
			run *= this.modForward;
		} else {
			run *= this.modBack;
		}
		this.targetVelocity.setDirect(strafe, this.applyJumpImpulse(up), run); // REVIEW: this creates a new object every frame... I recommend to reuse a Vector3 object.
	};

	/**
	 * Modulates the rotational movement state.
	 * @private
	 * @param {number} pitch
	 * @param {number} yaw
	 * @param {number} roll
	 * @returns {Array}
	 */
	GroundBoundMovementScript.prototype.applyTorqueModulation = function (pitch, yaw, roll) {
		this.targetHeading.setDirect(pitch, yaw * this.modTurn, roll); // REVIEW: this creates a new object every frame... I recommend to reuse a Vector3 object.
	};

	/**
	 * Applies the angle of the ground to the directional target velocity. This is to
	 * prevent increase of absolute velocity when moving up or down sloping terrain.
	 * @private
	 */

	GroundBoundMovementScript.prototype.applyGroundNormalInfluence = function () {
		var groundModX = Math.abs(Math.cos(this.groundNormal.x));
		var groundModZ = Math.abs(Math.cos(this.groundNormal.z));
		this.targetVelocity.x *= groundModX;
		this.targetVelocity.z *= groundModZ;
	};


	/**
	 * Updates the movement vectors for this frame
	 * @private
	 * @param {Vector3} transform
	 */
	GroundBoundMovementScript.prototype.updateTargetVectors = function (transform) {
		this.applyDirectionalModulation(this.controlState.strafe, this.gravity, this.controlState.run);
		this.targetVelocity.applyPost(transform.rotation);
		this.applyGroundNormalInfluence();
		this.applyTorqueModulation(this.controlState.pitch, this.controlState.yaw, this.controlState.roll);
	};

	/**
	 * Computes the acceleration for the frame.
	 * @private
	 * @param {Entity} entity
	 * @param {Vector3} current
	 * @param {Vector3} target
	 * @returns {Vector3}
	 */
	GroundBoundMovementScript.prototype.computeAcceleration = function (entity, current, target) {
		calcVec.set(target);
		calcVec.applyPost(entity.transformComponent.transform.rotation);
		calcVec.sub(current);
		calcVec.lerp(target, this.accLerp);
		calcVec.y = target.y; // Ground is not soft...
		return calcVec;
	};


	/**
	 * Computes the torque for the frame.
	 * @private
	 * @param {Vector3} current
	 * @param {Vector3} target
	 * @returns {Vector3}
	 */
	GroundBoundMovementScript.prototype.computeTorque = function (current, target) {
		calcVec.set(target);
		calcVec.sub(current);
		calcVec.lerp(target, this.rotLerp);
		return calcVec;
	};

	/**
	 * Updates the velocity vectors for the frame.
	 * @private
	 * @param {Entity} entity
	 */
	GroundBoundMovementScript.prototype.updateVelocities = function (entity) {
		var currentVelocity = entity.movementComponent.getVelocity();
		var currentRotVel = entity.movementComponent.getRotationVelocity();
		this.acceleration.set(this.computeAcceleration(entity, currentVelocity, this.targetVelocity));
		this.torque.set(this.computeTorque(currentRotVel, this.targetHeading));
	};

	/**
	 * Applies the acceleration to the movement component of the entity
	 * @private
	 * @param {Entity} entity
	 */
	GroundBoundMovementScript.prototype.applyAccelerations = function (entity) {
		entity.movementComponent.addVelocity(this.acceleration);
		entity.movementComponent.addRotationVelocity(this.torque);
	};

	/**
	 * Updates the value of the ground normal
	 * @private
	 * @param {Transform} transform
	 */
	GroundBoundMovementScript.prototype.updateGroundNormal = function (transform) {
		this.groundNormal.set(this.getTerrainNormal(transform.translation));
	};

	/**
	 * Checks if the criteria of ground contact is relevant this frame.
	 * @private
	 * @param {Entity} entity
	 * @param {Transform} transform
	 */
	GroundBoundMovementScript.prototype.checkGroundContact = function (entity, transform) {
		this.groundHeight = this.getTerrainHeight(transform.translation);
		if (transform.translation.y <= this.groundHeight) {
			this.groundContact = 1;
			this.updateGroundNormal(transform);
		} else {
			this.groundContact = 0;
		}
	};

	/**
	 * Applies the rules of ground contact
	 * @private
	 * @param {Entity} entity
	 * @param {Transform} transform
	 */
	GroundBoundMovementScript.prototype.applyGroundContact = function (entity, transform) {
		if (this.groundHeight >= transform.translation.y) {
			transform.translation.y = this.groundHeight;
			if (entity.movementComponent.velocity.y < 0) {
				entity.movementComponent.velocity.y = 0;
			}
		}
	};

	/**
	 * Updates this script with a frame
	 * @private
	 * @param {Entity} entity
	 */
	GroundBoundMovementScript.prototype.run = function (entity) {
		var transform = entity.transformComponent.transform;
		this.checkGroundContact(entity, transform);
		this.updateTargetVectors(transform);
		this.updateVelocities(entity);
		this.applyAccelerations(entity);
		this.applyGroundContact(entity, transform);
	};

	return GroundBoundMovementScript;
})(goo.Vector3);
goo.PanCamScript = (function (
	Vector3,
	Scripts,
	ScriptUtils,
	Renderer,
	SystemBus,
	Camera
) {
	'use strict';

	function PanCamScript() {
		var fwdVector, leftVector, calcVector, calcVector2;
		var panButton;
		var lookAtPoint;
		var mouseState;
		var listeners;

		function getTouchCenter(touches) {
			var cx = 0;
			var cy = 0;

			var x1 = touches[0].clientX;
			var y1 = touches[0].clientY;
			if (touches.length >= 2) {
				var x2 = touches[1].clientX;
				var y2 = touches[1].clientY;
				cx = (x1 + x2) / 2;
				cy = (y1 + y2) / 2;
			} else {
				cx = x1;
				cy = y1;
			}
			return [cx, cy];
		}

		function setup(parameters, environment) {
			panButton = ['Any', 'Left', 'Middle', 'Right'].indexOf(parameters.panButton) - 1;
			if (panButton < -1) {
				panButton = -1;
			}
			lookAtPoint = environment.goingToLookAt;
			fwdVector = Vector3.UNIT_Y.clone();
			leftVector = Vector3.UNIT_X.clone().negate();
			calcVector = new Vector3();
			calcVector2 = new Vector3();

			var renderer = environment.world.gooRunner.renderer;
			environment.devicePixelRatio = renderer._useDevicePixelRatio && window.devicePixelRatio ?
				window.devicePixelRatio / renderer.svg.currentScale : 1;

			mouseState = {
				x: 0,
				y: 0,
				ox: 0,
				oy: 0,
				dx: 0,
				dy: 0,
				down: false
			};
			listeners = {
				mousedown: function (event) {
					if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
						var button = event.button;
						if (button === 0) {
							if (event.altKey) {
								button = 2;
							} else if (event.shiftKey) {
								button = 1;
							}
						}
						if (button === panButton || panButton === -1) {
							mouseState.down = true;
							var x = (event.offsetX !== undefined) ? event.offsetX : event.layerX;
							var y = (event.offsetY !== undefined) ? event.offsetY : event.layerY;
							mouseState.ox = mouseState.x = x;
							mouseState.oy = mouseState.y = y;
						}
					}
				},
				mouseup: function (event) {
					var button = event.button;
					if (button === 0) {
						if (event.altKey) {
							button = 2;
						} else if (event.shiftKey) {
							button = 1;
						}
					}
					mouseState.down = false;
					mouseState.dx = mouseState.dy = 0;
				},
				mousemove: function (event) {
					if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
						if (mouseState.down) {
							var x = (event.offsetX !== undefined) ? event.offsetX : event.layerX;
							var y = (event.offsetY !== undefined) ? event.offsetY : event.layerY;
							mouseState.x = x;
							mouseState.y = y;
							environment.dirty = true;
						}
					}
				},
				mouseleave: function (/*event*/) {
					mouseState.down = false;
					mouseState.ox = mouseState.x;
					mouseState.oy = mouseState.y;
				},
				touchstart: function (event) {
					if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
						mouseState.down = (parameters.touchMode === 'Any' || (parameters.touchMode === 'Single' && event.targetTouches.length === 1) || (parameters.touchMode === 'Double' && event.targetTouches.length === 2));
						if (!mouseState.down) { return; }

						var center = getTouchCenter(event.targetTouches);
						mouseState.ox = mouseState.x = center[0];
						mouseState.oy = mouseState.y = center[1];
					}
				},
				touchmove: function (event) {
					if (!parameters.whenUsed || environment.entity === environment.activeCameraEntity) {
						if (!mouseState.down) { return; }

						var center = getTouchCenter(event.targetTouches);
						mouseState.x = center[0];
						mouseState.y = center[1];
						environment.dirty = true;
					}
				},
				touchend: function (/*event*/) {
					mouseState.down = false;
					mouseState.ox = mouseState.x;
					mouseState.oy = mouseState.y;
				}
			};
			for (var event in listeners) {
				environment.domElement.addEventListener(event, listeners[event]);
			}
			environment.dirty = true;
		}

		function update(parameters, environment) {
			if (!environment.dirty) {
				return;
			}
			mouseState.dx = mouseState.x - mouseState.ox;
			mouseState.dy = mouseState.y - mouseState.oy;
			if (mouseState.dx === 0 && mouseState.dy === 0) {
				environment.dirty = !!environment.lookAtPoint;
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

			var mainCam = Renderer.mainCamera;

			var entity = environment.entity;
			var transform = entity.transformComponent.transform;

			var camera = entity.cameraComponent.camera;
			if (lookAtPoint && mainCam) {
				if (lookAtPoint.equals(mainCam.translation)) {
					return;
				}
				var width = environment.viewportWidth / environment.devicePixelRatio;
				var height = environment.viewportHeight / environment.devicePixelRatio;
				mainCam.getScreenCoordinates(lookAtPoint, width, height, calcVector);
				calcVector.subDirect(
					mouseState.dx,/// (environment.viewportWidth/devicePixelRatio),
					mouseState.dy,/// (environment.viewportHeight/devicePixelRatio),
					0
				);
				mainCam.getWorldCoordinates(
					calcVector.x,
					calcVector.y,
					width,
					height,
					calcVector.z,
					calcVector
				);
				lookAtPoint.set(calcVector);
			} else {
				calcVector.set(fwdVector).scale(mouseState.dy);
				calcVector2.set(leftVector).scale(mouseState.dx);

				//! schteppe: use world coordinates for both by default?
				//if (parameters.screenMove){
					// In the case of screenMove, we normalize the camera movement
					// to the near plane instead of using pixels. This makes the parallel
					// camera map mouse world movement to camera movement 1-1
				if (entity.cameraComponent && entity.cameraComponent.camera) {
					var camera = entity.cameraComponent.camera;
					calcVector.scale((camera._frustumTop - camera._frustumBottom) / environment.viewportHeight);
					calcVector2.scale((camera._frustumRight - camera._frustumLeft) / environment.viewportWidth);
				}
				//}
				calcVector.add(calcVector2);
				calcVector.applyPost(transform.rotation);
				//if (!parameters.screenMove){
					// panSpeed should be 1 in the screenMove case, to make movement sync properly
				if (camera.projectionMode === Camera.Perspective) {
					// RB: I know, very arbitrary but looks ok
					calcVector.scale(parameters.panSpeed * 20);
				} else {
					calcVector.scale(parameters.panSpeed);
				}
				entity.transformComponent.transform.translation.add(calcVector);
				entity.transformComponent.setUpdated();
				environment.dirty = false;
			}
			SystemBus.emit('goo.cameraPositionChanged', {
				translation: transform.translation.toArray(),
				lookAtPoint: lookAtPoint ? lookAtPoint.toArray() : null,
				id: entity.id
			});
		}

		function cleanup(parameters, environment) {
			for (var event in listeners) {
				environment.domElement.removeEventListener(event, listeners[event]);
			}
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	PanCamScript.externals = {
		key: 'PanCamControlScript',
		name: 'PanCamera Control',
		description: 'Enables camera to pan around a point in 3D space using the mouse',
		parameters: [{
			key: 'whenUsed',
			type: 'boolean',
			name: 'When Camera Used',
			description: 'Script only runs when the camera to which it is added is being used.',
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
			key: 'touchMode',
			description: 'Number of fingers needed to trigger panning.',
			type: 'string',
			control: 'select',
			'default': 'Double',
			options: ['Any', 'Single', 'Double']
		}, {
			key: 'panSpeed',
			type: 'float',
			'default': 1,
			scale: 0.01
		}/*, {
			key: 'screenMove',
			type: 'boolean',
			'default': false,
			description: 'Syncs camera movement with mouse world position 1-1, needed for parallel camera.'
		}*/]
	};

	return PanCamScript;
})(goo.Vector3,goo.Scripts,goo.ScriptUtils,goo.Renderer,goo.SystemBus,goo.Camera);
goo.OrbitNPanControlScript = (function (
	Scripts,
	OrbitCamControlScript,
	PanCamControlScript,
	_
) {
	'use strict';

	function OrbitNPan() {
		var orbitScript = Scripts.create(OrbitCamControlScript);
		var panScript = Scripts.create(PanCamControlScript);
		function setup(parameters, environment, goo) {
			orbitScript.setup(parameters, environment, goo);
			panScript.setup(parameters, environment, goo);
		}
		function update(parameters, environment, goo) {
			panScript.update(parameters, environment, goo);
			orbitScript.update(parameters, environment, goo);
		}
		function cleanup(parameters, environment, goo) {
			panScript.cleanup(parameters, environment, goo);
			orbitScript.cleanup(parameters, environment, goo);
		}

		return {
			setup: setup,
			cleanup: cleanup,
			update: update
		};
	}

	var orbitParams = OrbitCamControlScript.externals.parameters;
	var panParams = PanCamControlScript.externals.parameters;

	// Make sure we don't change parameters for the other scripts
	var params = _.deepClone(orbitParams.concat(panParams.slice(1)));

	// Remove the panSpeed and touchMode parameters
	for (var i = params.length - 1; i >= 0; i--) {
		var param = params[i];
		if (param.key === 'panSpeed' || param.key === 'touchMode') {
			params.splice(i, 1);
		}
	}

	for (var i = 0; i < params.length; i++) {
		var param = params[i];
		switch (param.key) {
			case 'dragButton':
				param.default = 'Left';
				break;
			case 'panButton':
				param.default = 'Right';
				break;
			case 'panSpeed':
				param.default = 1;
				break;
			case 'touchMode':
				param.default = 'Double';
				break;
		}
	}

	OrbitNPan.externals = {
		key: 'OrbitNPanControlScript',
		name: 'Orbit and Pan Control',
		description: 'This is a combo of orbitcamcontrolscript and pancamcontrolscript',
		parameters:	params
	};

	return OrbitNPan;
})(goo.Scripts,goo.OrbitCamControlScript,goo.PanCamScript,goo.ObjectUtils);
goo.LensFlareScript = (function (
	Vector3,
	ParticleSystemUtils,
	Material,
	ShaderLib,
	Quad,
	BoundingSphere
) {
	'use strict';

	/**
	 * This script makes an entity shine with some lensflare effect.
	 */
	function LensFlareScript() {
		var lightEntity;
		var flares = [];
		var world;
		var isActive;
		var quadData;
		var lightColor;
		var globalIntensity;
		var spriteTxSize = 64;
		var flareGeometry;
		var textures = {};

		var textureShapes = {
			splash: { trailStartRadius: 25, trailEndRadius: 0 },
			ring: [
				{ fraction: 0.00, value: 0 },
				{ fraction: 0.70, value: 0 },
				{ fraction: 0.92, value: 1 },
				{ fraction: 0.98, value: 0 }
			],
			dot: [
				{ fraction: 0.00, value: 1 },
				{ fraction: 0.30, value: 0.75 },
				{ fraction: 0.50, value: 0.45 },
				{ fraction: 0.65, value: 0.21 },
				{ fraction: 0.75, value: 0.1 },
				{ fraction: 0.98, value: 0 }
			],
			bell: [
				{ fraction: 0.00, value: 1 },
				{ fraction: 0.15, value: 0.75 },
				{ fraction: 0.30, value: 0.5 },
				{ fraction: 0.40, value: 0.25 },
				{ fraction: 0.75, value: 0.05 },
				{ fraction: 0.98, value: 0 }
			],
			none: [
				{ fraction: 0, value: 1 },
				{ fraction: 1, value: 0 }
			]
		};

		function generateTextures(txSize) {
			textures.size = txSize;
			textures.splash = ParticleSystemUtils.createSplashTexture(512, { trailStartRadius: 25, trailEndRadius: 0 });
			textures.ring = ParticleSystemUtils.createFlareTexture(txSize, { steps: textureShapes.ring, startRadius: txSize / 4, endRadius: txSize / 2 });
			textures.dot = ParticleSystemUtils.createFlareTexture(txSize, { steps: textureShapes.dot, startRadius: 0, endRadius: txSize / 2 });
			textures.bell = ParticleSystemUtils.createFlareTexture(txSize, { steps: textureShapes.bell, startRadius: 0, endRadius: txSize / 2 });
			textures['default'] = ParticleSystemUtils.createFlareTexture(txSize, { steps: textureShapes.none, startRadius: 0, endRadius: txSize / 2 });
		}

		function createFlareQuads(quads, lightColor, systemScale, edgeDampen, edgeScaling) {
			for (var i = 0; i < quads.length; i++) {
				var quad = quads[i];
				flares.push(
					new FlareQuad(
						lightColor,
						quad.tx,
						quad.displace,
						quad.size,
						quad.intensity * globalIntensity,
						systemScale,
						edgeDampen,
						edgeScaling,
						textures,
						world
					)
				);
			}
			return flares;
		}

		function removeFlareQuads(quads) {
			for (var i = 0; i < quads.length; i++) {
				quads[i].quad.removeFromWorld();
			}
		}

		function setup(args, ctx) {
			globalIntensity = args.intensity;
			flareGeometry = new FlareGeometry(args.edgeRelevance * 100);
			var baseSize = spriteTxSize;
			if (args.highRes) {
				baseSize *= 4;
			}
			if (textures.size !== baseSize) {
				generateTextures(baseSize);
			}
			flares = [];
			lightEntity = ctx.entity;

			world = ctx.world;
			isActive = false;

			lightColor = [args.color[0], args.color[1], args.color[2], 1];

			quadData = [
				{ size: 2.53, tx: 'bell', intensity: 0.70, displace: 1 },
				{ size: 0.53, tx: 'dot',  intensity: 0.70, displace: 1 },
				{ size: 0.83, tx: 'bell', intensity: 0.20, displace: 0.8 },
				{ size: 0.40, tx: 'ring', intensity: 0.10, displace: 0.6 },
				{ size: 0.30, tx: 'bell', intensity: 0.10, displace: 0.4 },
				{ size: 0.60, tx: 'bell', intensity: 0.10, displace: 0.3 },
				{ size: 0.30, tx: 'dot',  intensity: 0.10, displace: 0.15 },
				{ size: 0.22, tx: 'ring', intensity: 0.03, displace: -0.25 },
				{ size: 0.36, tx: 'dot',  intensity: 0.05, displace: -0.5 },
				{ size: 0.80, tx: 'ring', intensity: 0.10, displace: -0.8 },
				{ size: 0.86, tx: 'bell', intensity: 0.20, displace: -1.1 },
				{ size: 1.30, tx: 'ring', intensity: 0.05, displace: -1.5 }
			];

			ctx.bounds = new BoundingSphere(ctx.entity.transformComponent.worldTransform.translation, 0);
		}

		function cleanup(/*args, ctx*/) {
			removeFlareQuads(flares);
			flares = [];
		}

		function update(args, ctx) {
			ctx.bounds.center.copy(ctx.entity.transformComponent.worldTransform.translation);
			if (ctx.activeCameraEntity.cameraComponent.camera.contains(ctx.bounds)) {
				flareGeometry.updateFrameGeometry(lightEntity, ctx.activeCameraEntity);
				if (!isActive) {
					flares = createFlareQuads(quadData, lightColor, args.scale, args.edgeDampen, args.edgeScaling);
					isActive = true;
				}

				for (var i = 0; i < flares.length; i++) {
					flares[i].updatePosition(flareGeometry);
				}
			// # REVIEW: if the entity has ever been visible then the FlareQuads
			// are staying. Is it a problem with removeFlareQuads?
			} else {
				if (isActive) {
					removeFlareQuads(flares);
					isActive = false;
				}
			}
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	LensFlareScript.externals = {
		key: 'LensFlareScript',
		name: 'Lens Flare Script',
		description: 'Makes an entity shine with some lensflare effect.',
		parameters: [{
			key: 'scale',
			name: 'Scale',
			type: 'float',
			description: 'Scale of flare quads',
			control: 'slider',
			'default': 1,
			min: 0.01,
			max: 2
		}, {
			key: 'intensity',
			name: 'Intensity',
			type: 'float',
			description: 'Intensity of Effect',
			control: 'slider',
			'default': 1,
			min: 0.01,
			// REVIEW: why 2 for so many of these params? can they be normalized
			//! AT: [0, 1] might be the normal domain but the upper allowed bound is 2 because it allows for superbright/superfancy lens flares
			max: 2
		}, {
			key: 'edgeRelevance',
			name: 'Edge Relevance',
			type: 'float',
			description: 'How much the effect cares about being centered or not',
			control: 'slider',
			'default': 0,
			min: 0,
			max: 2
		}, {
			key: 'edgeDampen',
			name: 'Edge Dampening',
			type: 'float',
			description: 'Intensity adjustment by distance from center',
			control: 'slider',
			'default': 0.2,
			min: 0,
			max: 1
		}, {
			key: 'edgeScaling',
			name: 'Edge Scaling',
			type: 'float',
			description: 'Scale adjustment by distance from center',
			control: 'slider',
			'default': 0,
			min: -2,
			max: 2
		}, {
			key: 'color',
			name: 'Color',
			type: 'vec3',
			description: 'Effect Color',
			control: 'color',
			'default': [
				0.8,
				0.75,
				0.7
			]
		}, {
			key: 'highRes',
			name: 'High Resolution',
			type: 'boolean',
			description: 'Intensity of Effect',
			control: 'checkbox',
			'default': false
		}]
	};

	function FlareGeometry(edgeRelevance) {
		this.camRot = null;
		this.distance = 0;
		this.offset = 0;
		this.centerRatio = 0;
		this.positionVector = new Vector3();
		this.distanceVector = new Vector3();
		this.centerVector = new Vector3();
		this.displacementVector = new Vector3();
		this.edgeRelevance = edgeRelevance;
	}

	FlareGeometry.prototype.updateFrameGeometry = function (lightEntity, cameraEntity) {
		this.camRot = cameraEntity.transformComponent.transform.rotation;
		this.centerVector.set(cameraEntity.cameraComponent.camera.translation);
		this.displacementVector.set(lightEntity.transformComponent.worldTransform.translation);
		this.displacementVector.sub(this.centerVector);
		this.distance = this.displacementVector.length();
		this.distanceVector.setDirect(0, 0, -this.distance);
		this.distanceVector.applyPost(this.camRot);
		this.centerVector.add(this.distanceVector);
		this.positionVector.set(this.centerVector);
		this.displacementVector.set(lightEntity.transformComponent.worldTransform.translation);
		this.displacementVector.sub(this.positionVector);
		this.offset = this.displacementVector.length();
		var positionVectorLength = this.positionVector.length();
		if (positionVectorLength) {
			this.centerRatio = 1 - (this.offset * this.edgeRelevance) / this.positionVector.length();
		} else {
			this.centerRatio = 1 - (this.offset * this.edgeRelevance);
		}
		this.centerRatio = Math.max(0, this.centerRatio);
	};

	function FlareQuad(lightColor, tx, displace, size, intensity, systemScale, edgeDampen, edgeScaling, textures, world) {
		this.sizeVector = new Vector3(size, size, size);
		this.sizeVector.scale(systemScale);
		this.positionVector = new Vector3();
		this.flareVector = new Vector3();
		this.intensity = intensity;
		this.displace = displace;
		this.color = [lightColor[0] * intensity, lightColor[1] * intensity, lightColor[2] * intensity, 1];
		this.edgeDampen = edgeDampen;
		this.edgeScaling = edgeScaling;
		var material = new Material(ShaderLib.uber, 'flareShader');

		material.uniforms.materialEmissive = this.color;
		material.uniforms.materialDiffuse = [0, 0, 0, 1];
		material.uniforms.materialAmbient = [0, 0, 0, 1];
		material.uniforms.materialSpecular = [0, 0, 0, 1];

		var texture = textures[tx];

		material.setTexture('DIFFUSE_MAP', texture);
		material.setTexture('EMISSIVE_MAP', texture);
		material.blendState.blending = 'AdditiveBlending';
		material.blendState.blendEquation = 'AddEquation';
		material.blendState.blendSrc = 'OneFactor';
		material.blendState.blendDst = 'OneFactor';
		material.depthState.enabled = false;
		material.depthState.write = false;
		material.cullState.enabled = false;

		var meshData = new Quad(1, 1);
		var entity = world.createEntity(meshData, material);
		entity.meshRendererComponent.cullMode = 'Never';
		entity.addToWorld();

		this.material = material;
		this.quad = entity;
	}

	FlareQuad.prototype.updatePosition = function (flareGeometry) {
		this.flareVector.set(flareGeometry.displacementVector);
		this.positionVector.set(flareGeometry.positionVector);
		this.flareVector.scale(this.displace);
		this.positionVector.add(this.flareVector);

		this.material.uniforms.materialEmissive = [
			this.color[0] * flareGeometry.centerRatio * this.edgeDampen,
			this.color[1] * flareGeometry.centerRatio * this.edgeDampen,
			this.color[2] * flareGeometry.centerRatio * this.edgeDampen,
			1
		];

		var scaleFactor = flareGeometry.distance + flareGeometry.distance * flareGeometry.centerRatio * this.edgeScaling;

		var quadTransform = this.quad.transformComponent.transform;
		quadTransform.scale.set(this.sizeVector);
		quadTransform.scale.scale(scaleFactor);
		quadTransform.rotation.set(flareGeometry.camRot);
		quadTransform.translation.set(this.positionVector);
		this.quad.transformComponent.updateTransform();
		this.quad.transformComponent.updateWorldTransform();
	};

	return LensFlareScript;
})(goo.Vector3,goo.ParticleSystemUtils,goo.Material,goo.ShaderLib,goo.Quad,goo.BoundingSphere);
goo.PickAndRotateScript = (function () {
	'use strict';

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

		function update(args, ctx, goo) {}

		function cleanup(args, ctx, goo) {
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

	return PickAndRotateScript;
})();
goo.PolyBoundingScript = (function () {
	'use strict';

	/**
	 * Checks for collisions against a set of `collidables` and repositions the host object accordingly.
	 * This script uses the PolyK library which is not part of the engine; make sure you add it manually.<br>
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/PolyBoundingScript/PolyBoundingScript-vtest.html Working example
	 * @param {Array} collidables An array of `collidables` - objects with a bounding polygon on the XZ-plane, a top and a bottom Y coordinate
	 * @param {Array<number>} collidables[].poly An array of XZ coordinates representing the bounding polygon of the `collidable`
	 * @param {number} collidables[].bottom The bottom Y coordinate of the collidable
	 * @param {number} collidables[].top The top Y coordinate of the collidable
	 */
	function PolyBoundingScript(collidables) {
		this.collidables = collidables || [];
	}

	/**
	 * Adds a `collidable`
	 * @param {Object} collidable `Collidable` to add
	 * @param {Array<number>} collidables[].poly An array of XZ coordinates representing the bounding polygon of the `collidable`
	 * @param {number} collidables[].bottom The bottom Y coordinate of the collidable
	 * @param {number} collidables[].top The top Y coordinate of the collidable
	 */
	PolyBoundingScript.prototype.addCollidable = function (collidable) {
		this.collidables.push(collidable);
	};

	/**
	 * Removes all `collidables` that contain the given point (x, y, z)
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 */
	PolyBoundingScript.prototype.removeAllAt = function (x, y, z) {
		this.collidables = this.collidables.filter(function (collidable) {
			if (collidable.bottom <= z && collidable.top >= z) {
				return !window.PolyK.ContainsPoint(collidable.poly, x, y);
			}
		});
	};

	/**
	 * Checks if a point is inside any collidable
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 */
	PolyBoundingScript.prototype.inside = function (x, y, z) {
		for (var i = 0; i < this.collidables.length; i++) {
			var collidable = this.collidables[i];

			if (collidable.bottom <= y && collidable.top >= y) {
				if (window.PolyK.ContainsPoint(collidable.poly, x, z)) {
					return window.PolyK.ClosestEdge(collidable.poly, x, z);
				}
			}
		}
	};

	/**
	 * The standard `run` routine of the script. Checks for collisions and repositions the host entity accordingly.
	 * The entity's coordinates are obtained from the translation of its transformComponent. All collisions are performed against these coordinates only.
	 * @param {Entity} entity
	 */
	PolyBoundingScript.prototype.run = function (entity) {
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;

		for (var i = 0; i < this.collidables.length; i++) {
			var collidable = this.collidables[i];

			if (collidable.bottom <= translation.y && collidable.top >= translation.y) {
				if (window.PolyK.ContainsPoint(collidable.poly, translation.x, translation.z)) {
					var pointOutside = window.PolyK.ClosestEdge(
						collidable.poly,
						translation.x,
						translation.z
					);

					translation.x = pointOutside.point.x;
					translation.z = pointOutside.point.y;
					transformComponent.setUpdated();

					return;
				}
			}
		}
	};

	return PolyBoundingScript;
})();
goo.RotationScript = (function (
) {
	'use strict';

	function RotationScript() {
		var mouseState, actualState, entity;

		function setup(parameters, env) {
			mouseState = {
				x: 0,
				y: 0
			};

			actualState = {
				x: 0,
				y: 0
			};

			entity = env.entity;

			document.addEventListener('mousemove', onMouseMove);
		}

		function update(parameters/*, env*/) {
			actualState.x += (mouseState.x - actualState.x) * parameters.fraction;
			actualState.y += (mouseState.y - actualState.y) * parameters.fraction;

			entity.setRotation(actualState.y / 200, actualState.x / 200, 0);
		}

		function onMouseMove(e) {
			mouseState.x = e.x;
			mouseState.y = e.y;
		}

		function cleanup(/*parameters, env*/) {
			document.removeEventListener('mousemove', onMouseMove);
		}
		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	RotationScript.externals = {
		key: 'RotationScript',
		name: 'Mouse Rotation',
		description: '',
		parameters: [{
			key: 'fraction',
			name: 'Speed',
			'default': 0.01,
			type: 'float',
			control: 'slider',
			min: 0.01,
			max: 1
		}]
	};

	return RotationScript;
})();
goo.ScriptComponentHandler = (function (
	ComponentHandler,
	ScriptComponent,
	RSVP,
	_,
	PromiseUtils,
	SystemBus,

	Scripts,
	ScriptUtils
) {
	'use strict';

	/**
	 * @hidden
	 */
	function ScriptComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'ScriptComponent';
	}

	ScriptComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ScriptComponentHandler.prototype.constructor = ScriptComponentHandler;
	ComponentHandler._registerClass('script', ScriptComponentHandler);

	ScriptComponentHandler.ENGINE_SCRIPT_PREFIX = 'GOO_ENGINE_SCRIPTS/';

	ScriptComponentHandler.prototype._prepare = function (/*config*/) {};

	ScriptComponentHandler.prototype._create = function () {
		return new ScriptComponent();
	};

	ScriptComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;

		return ComponentHandler.prototype.update.call(this, entity, config, options)
		.then(function (component) {
			if (!component) { return; }

			return RSVP.all(_.map(config.scripts, function (instanceConfig) {
				return that._updateScriptInstance(instanceConfig, options);
			}, null, 'sortValue'))
			.then(function (scripts) {
				component.scripts = scripts;
				return component;
			});
		});
	};

	ScriptComponentHandler.prototype._updateScriptInstance = function (instanceConfig, options) {
		var that = this;

		return this._createOrLoadScript(instanceConfig)
		.then(function (script) {
			var newParameters = instanceConfig.options || {};
			if (script.parameters) {
				_.defaults(newParameters, script.parameters);
			}

			if (script.externals && script.externals.parameters) {
				ScriptUtils.fillDefaultValues(newParameters, script.externals.parameters);
			}

			// We need to duplicate the script so we can have multiple
			// similar scripts with different parameters.
			// TODO: Check if script exists in the component and just update it
			// instead of creating a new one.
			var newScript = Object.create(script);
			newScript.parameters = {};
			newScript.enabled = false;

			return that._setParameters(
				newScript.parameters,
				newParameters,
				script.externals,
				options
			)
			.then(_.constant(newScript));
		});
	};

	/**
	 * Depending on the reference specified in the script instance, creates an
	 * engine script or loads the referenced script.
	 *
	 * @param {object} instanceConfig
	 *        JSON configuration of the script instance. Should contain the
	 *        "scriptRef" property which refers to the script which is to be
	 *        loaded.
	 *
	 * @return {Promise}
	 *         A promise which is resolved with the referenced script.
	 *
	 * @private
	 */
	ScriptComponentHandler.prototype._createOrLoadScript = function (instanceConfig) {
		var ref = instanceConfig.scriptRef;
		var prefix = ScriptComponentHandler.ENGINE_SCRIPT_PREFIX;
		var isEngineScript = ref.indexOf(prefix) === 0;

		if (isEngineScript) {
			return this._createEngineScript(ref.slice(prefix.length));
		} else {
			return this._load(ref, { reload: true });
		}
	};

	/**
	 * Creates a new instance of one of the default scripts provided by the
	 * engine.
	 *
	 * @param {Object} scriptName
	 *		The name of the script which is to be created.
	 *
	 * @returns {RSVP.Promise}
	 *		A promise which is resolved with the new script.
	 *
	 * @private
	 */
	ScriptComponentHandler.prototype._createEngineScript = function (scriptName) {
		var script = Scripts.create(scriptName);
		if (!script) {
			throw new Error('Unrecognized script name');
		}

		script.id = ScriptComponentHandler.ENGINE_SCRIPT_PREFIX + scriptName;
		script.enabled = false;

		SystemBus.emit('goo.scriptExternals', {
			id: script.id,
			externals: script.externals
		});

		return PromiseUtils.resolve(script);
	};

	/**
	 * Sets the parameters of a script instance from the json configuration.
	 *
	 * @param {object} parameters
	 *        Parameters of the new script instance which are to be filled
	 *        out according to the json config and the script externals.
	 * @param {object}
	 *        json configuration from which the parameter values are to be
	 *        extracted.
	 * @param {object} externals
	 *        Parameter descriptor as defined in a script's external.parameters
	 *        object.
	 * @param options
	 *        DynamicLoader options.
	 *
	 * @returns {Promise}
	 *
	 * @private
	 */
	ScriptComponentHandler.prototype._setParameters = function (parameters, config, externals, options) {
		var that = this;

		// is externals ever falsy?
		if (!externals || !externals.parameters) {
			return PromiseUtils.resolve();
		}

		var promises = externals.parameters.map(function (external) {
			return that._setParameter(parameters, config[external.key], external, options);
		});

		parameters.enabled = config.enabled !== false;

		return RSVP.all(promises);
	};

	/**
	 * Sets a script parameter from the json configuration.
	 *
	 * @param {object} parameters
	 *        Script parameters object on which the parameter is to be set.
	 * @param {object} config
	 *        JSON configuration from which the parameter values are to be
	 *        extracted.
	 * @param {object} external
	 *        Parameter descriptor (type, key, etc).
	 * @param {object} options
	 *        DynamicLoader options.
	 *
	 * @returns {Promise}
	 *          A promise which is resolved when the parameter has been set.
	 *
	 * @private
	 */
	ScriptComponentHandler.prototype._setParameter = function (parameters, config, external, options) {
		var that = this;
		var key = external.key;
		var type = external.type;

		function setParam(value) {
			parameters[key] = value;
			return PromiseUtils.resolve();
		}

		function getInvalidParam() {
			if (external.default === undefined) {
				return _.deepClone(ScriptUtils.DEFAULTS_BY_TYPE[type]);
			} else {
				return _.deepClone(external.default);
			}
		}

		function setRefParam() {
			if (!config || config.enabled === false) {
				return setParam(null);
			}

			// Get wrapped ref (i.e. entityRef) and if none exists it is because
			// we got a direct ref.
			var ref = config[type + 'Ref'] || config;

			return that._load(ref, options).then(setParam);
		}

		if (!ScriptUtils.TYPE_VALIDATORS[type](config)) {
			return setParam(getInvalidParam());
		} else if (type === 'entity') {
			// For entities, because they can depend on themselves, we don't
			// wait for the load to be completed. It will eventually resolve
			// and the parameter will be set.
			setRefParam();
			return Promise.resolve();
		} else if (ScriptUtils.isRefType(type)) {
			return setRefParam();
		} else {
			return setParam(_.clone(config));
		}
	};

	return ScriptComponentHandler;
})(goo.ComponentHandler,goo.ScriptComponent,goo.rsvp,goo.ObjectUtils,goo.PromiseUtils,goo.SystemBus,goo.Scripts,goo.ScriptUtils);
goo.ScriptHandler = (function (
	ConfigHandler,
	RSVP,
	OrbitCamControlScript,
	OrbitNPanControlScript,
	FlyControlScript,
	WasdControlScript,
	BasicControlScript,
	PromiseUtils,
	_,
	ArrayUtils,
	SystemBus,

	ScriptUtils,
	Scripts
) {
	'use strict';

	var DEPENDENCY_LOAD_TIMEOUT = 6000;

	/**
	* 	* @private
	*/
	function ScriptHandler() {
		ConfigHandler.apply(this, arguments);
		this._scriptElementsByURL = new Map();
		this._bodyCache = {};
		this._dependencyPromises = {};
		this._currentScriptLoading = null;
		this._addGlobalErrorListener();
	}

	ScriptHandler.prototype = Object.create(ConfigHandler.prototype);
	ScriptHandler.prototype.constructor = ScriptHandler;
	ConfigHandler._registerClass('script', ScriptHandler);

	/**
	 * Creates a script data wrapper object to be used in the engine
	 */
	ScriptHandler.prototype._create = function () {
		return {
			externals: {},
			setup: null,
			update: null,
			run: null,
			cleanup: null,
			parameters: {},
			name: null
		};
	};


	/**
	 * Remove this script from the cache, and runs the cleanup method of the script.
	 * @param {string} ref the script guid
	 */
	ScriptHandler.prototype._remove = function (ref) {
		var script = this._objects.get(ref);
		if (script && script.cleanup && script.context) {
			try {
				script.cleanup(script.parameters, script.context, window.goo);
			} catch (e) {
				// Some cleanup error
			}
		}
		this._objects.delete(ref);
		delete this._bodyCache[ref];
	};

	var updateId = 1; // Ugly hack to prevent devtools from not updating its scripts

	/**
	 * Update a user-defined script (not a script available in the engine).
	 * If the new body (in the data model config) differs from the cached body,
	 * the script will be reloaded (by means of a script tag).
	 *
	 * @param {Object} script the cached engine script object
	 * @param {Object} config the data model config
	 */
	ScriptHandler.prototype._updateFromCustom = function (script, config) {
		// No change, do nothing
		if (this._bodyCache[config.id] === config.body) { return script; }

		delete script.errors;
		this._bodyCache[config.id] = config.body;

		// delete the old script tag and add a new one
		var oldScriptElement = document.getElementById(ScriptHandler.DOM_ID_PREFIX + config.id);
		if (oldScriptElement) {
			oldScriptElement.parentNode.removeChild(oldScriptElement);
		}

		// create this script collection if it does not exist yet
		if (!window._gooScriptFactories) {
			// this holds script factories in 'compiled' form
			window._gooScriptFactories = {};
		}


		// get a script factory in string form
		var scriptFactoryStr = [
			'//# sourceURL=goo://goo-custom-scripts/' + encodeURIComponent(config.name.replace(' ', '_')) + '.js?v=' + (updateId++),
			'',
			'// ' + config.name,
			'',
			'// <![CDATA[',
			"window._gooScriptFactories['" + config.id + "'] = function () {",
			config.body,
			' var obj = {',
			'  externals: {}',
			' };',
			' if (typeof parameters !== "undefined") {',
			'  obj.externals.parameters = parameters;',
			' }',
			' if (typeof setup !== "undefined") {',
			'  obj.setup = setup;',
			' }',
			' if (typeof cleanup !== "undefined") {',
			'  obj.cleanup = cleanup;',
			' }',
			' if (typeof update !== "undefined") {',
			'  obj.update = update;',
			' }',
			' return obj;',
			'};',
			'// ]]>'
		].join('\n');

		// create the element and add it to the page so the user can debug it
		// addition and execution of the script happens synchronously
		var newScriptElement = document.createElement('script');
		newScriptElement.id = ScriptHandler.DOM_ID_PREFIX + config.id;
		newScriptElement.innerHTML = scriptFactoryStr;
		newScriptElement.async = false;
		this._currentScriptLoading = config.id;

		var parentElement = this.world.gooRunner.renderer.domElement.parentElement || document.body;
		parentElement.appendChild(newScriptElement);

		var scriptFactory = window._gooScriptFactories[config.id];
		if (scriptFactory) {
			try {
				var newScript = scriptFactory();
				script.id = config.id;
				ScriptHandler.validateParameters(newScript, script);
				script.setup = newScript.setup;
				script.update = newScript.update;
				script.cleanup = newScript.cleanup;
				script.parameters = {};
				script.enabled = false;
			} catch (e) {
				var err = {
					message: e.toString()
				};
				// TODO Test if this works across browsers
				/**/
				if (e instanceof Error) {
					var lineNumbers = e.stack.split('\n')[1].match(/(\d+):\d+\)$/);
					if (lineNumbers) {
						err.line = parseInt(lineNumbers[1], 10) - 1;
					}
				}
				/**/
				setError(script, err);
			}
			this._currentScriptLoading = null;
		}
		// generate names from external variable names
		if (script.externals) {
			ScriptUtils.fillDefaultNames(script.externals.parameters);
		}

		return script;
	};

	/**
	 * Adds a reference pointing to the specified custom script into the specified
	 * script element/node.
	 *
	 * @param {HTMLScriptElement} scriptElement
	 *		The script element into which a reference is to be added.
	 * @param {string} scriptId
	 *		The identifier of the custom script whose reference is to be added.
	 */
	function addReference(scriptElement, scriptId) {
		if (!scriptElement.scriptRefs) {
			scriptElement.scriptRefs = [scriptId];
			return;
		}

		var index = scriptElement.scriptRefs.indexOf(scriptId);
		if (index === -1) {
			scriptElement.scriptRefs.push(scriptId);
		}
	}


	/**
	 * Removes a reference to the specified custom script from the specified
	 * script element/node.
	 *
	 * @param {HTMLScriptElement} scriptElement
	 *		The script element from which the reference is to be removed.
	 * @param {string} scriptId
	 *		The identifier of the custom script whose reference is to be removed.
	 */
	function removeReference(scriptElement, scriptId) {
		if (!scriptElement.scriptRefs) {
			return;
		}

		ArrayUtils.remove(scriptElement.scriptRefs, scriptId);
	}

	/**
	 * Gets whether the specified script element/node has any references to
	 * custom scripts.
	 *
	 * @param {HTMLScriptElement} scriptElement
	 *		The script element which is to be checked for references.
	 *
	 * @returns {boolean}
	 */
	function hasReferences(scriptElement) {
		return scriptElement.scriptRefs && scriptElement.scriptRefs.length > 0;
	}


	/**
	 * Gets whether the specified script element has a reference to the specified
	 * custom script.
	 *
	 * @param {HTMLScriptElement} scriptElement
	 *		The script element/node which is to be checked.
	 * @param {string} scriptId
	 *		The identifier of the custom script which is to be checked.
	 *
	 * @returns {boolean}
	 */
	function hasReferenceTo(scriptElement, scriptId) {
		return scriptElement.scriptRefs && scriptElement.scriptRefs.indexOf(scriptId) > -1;
	}


	/**
	 * Gets all the script elements that refer to the specified custom script.
	 *
	 * @param {string} scriptId
	 *		The identifier of the custom script whose dependencies are to be
	 *		returned.
	 *
	 * @returns {Array.<HTMLScriptElement>}
	 */
	function getReferringDependencies(scriptId) {
		var dependencies = [];
		var scriptElements = document.querySelectorAll('script');

		for (var i = 0; i < scriptElements.length; ++i) {
			var scriptElement = scriptElements[i];
			if (hasReferenceTo(scriptElement, scriptId)) {
				dependencies.push(scriptElement);
			}
		}

		return dependencies;
	}


	/**
	 * Update a script that is from the engine. Checks if the class name has changed
	 * and if so, creates a new script object from the new class.
	 * @param {Object} script needs to have a className property
	 * @param {Object} config data model config
	 * @deprecated
	 */
	ScriptHandler.prototype._updateFromClass = function (script, config) {
		if (!script.externals || script.externals.name !== config.className) {
			var newScript = Scripts.create(config.className);
			if (!newScript) {
				throw new Error('Unrecognized script name');
			}
			script.id = config.id;
			script.externals = newScript.externals;
			script.setup = newScript.setup;
			script.update = newScript.update;
			script.run = newScript.run;
			script.cleanup = newScript.cleanup;
			script.parameters = newScript.parameters || {};
			script.enabled = false;

			// generate names from external variable names
			ScriptUtils.fillDefaultNames(script.externals.parameters);
		}

		return script;
	};

	/**
	 * Loads an external javascript lib as a dependency to this script (if it's
	 * not already loaded). If the dependency fails to load, an error is set
	 * on the script.
	 * @param {Object} script config
	 * @param {string} url location of the javascript lib
	 * @param {string} scriptId the guid of the script
	 * @returns {RSVP.Promise} a promise that resolves when the dependency is loaded
	 */
	ScriptHandler.prototype._addDependency = function (script, url, scriptId) {
		var that = this;

		// check if element already exists
		// it might have been loaded by some other script first

		// does this work if the same script component/script reference the same script more than once?
		var scriptElem = document.querySelector('script[src="' + url + '"]');
		if (scriptElem) {
			addReference(scriptElem, scriptId);
			return this._dependencyPromises[url] || PromiseUtils.resolve();
		}

		scriptElem = document.createElement('script');
		scriptElem.src = url;
		scriptElem.setAttribute('data-script-id', scriptId);
		scriptElem.isDependency = true;
		scriptElem.async = false;

		this._scriptElementsByURL.set(url, scriptElem);
		addReference(scriptElem, scriptId);

		var promise = loadExternalScript(script, scriptElem, url)
			.then(function () {
				delete that._dependencyPromises[url];
			});

		this._dependencyPromises[url] = promise;

		return promise;
	};

	ScriptHandler.prototype._update = function (ref, config, options) {
		var that = this;

		return ConfigHandler.prototype._update.call(this, ref, config, options)
		.then(function (script) {
			if (!script) { return; }

			var addDependencyPromises = [];

			if (isCustomScript(config) && config.dependencies) {
				delete script.dependencyErrors;

				// Get all the script HTML elements which refer to the current
				// script. As we add dependencies, we remove the script elements
				// which are still needed. After everything, we remove the
				// reference to the current script from the remaining ones.
				var scriptsElementsToRemove = getReferringDependencies(config.id);

				_.forEach(config.dependencies, function (dependencyConfig) {
					var url = dependencyConfig.url;

					// If the dependency being added is already loaded in a script
					// element we remove it from the array of script elements to remove
					// because we still need it.
					var neededScriptElement = ArrayUtils.find(scriptsElementsToRemove, function (scriptElement) {
						return scriptElement.src === url;
					});
					if (neededScriptElement) {
						ArrayUtils.remove(scriptsElementsToRemove, neededScriptElement);
					}

					addDependencyPromises.push(that._addDependency(script, url, config.id));
				}, null, 'sortValue');

				// Remove references to the current script from all the script
				// elements that are not needed anymore.
				_.forEach(scriptsElementsToRemove, function (scriptElement) {
					removeReference(scriptElement, config.id);
				});
			}

			var parentElement = that.world.gooRunner.renderer.domElement.parentElement || document.body;

			_.forEach(config.dependencies, function (dependency) {
				var scriptElement = that._scriptElementsByURL.get(dependency.url);
				if (scriptElement) {
					parentElement.appendChild(scriptElement);
				}
			}, null, 'sortValue');

			return RSVP.all(addDependencyPromises)
			.then(function () {
				if (isEngineScript(config)) {
					that._updateFromClass(script, config, options);
				} else if (isCustomScript(config)) {
					that._updateFromCustom(script, config, options);
				}

				// Let the world (e.g. Create) know that there are new externals so
				// that things (e.g. UI) can get updated.
				if (config.body) {
					SystemBus.emit('goo.scriptExternals', {
						id: config.id,
						externals: script.externals
					});
				}

				script.name = config.name;

				if (script.errors || script.dependencyErrors) {
					SystemBus.emit('goo.scriptError', {
						id: ref,
						errors: script.errors,
						dependencyErrors: script.dependencyErrors
					});
					return script;
				}
				else {
					SystemBus.emit('goo.scriptError', { id: ref, errors: null });
				}

				_.extend(script.parameters, config.options);

				// Remove any script HTML elements that are not needed by any
				// script.
				removeDeadScriptElements();

				return script;
			});
		});
	};

	/**
	 * Gets whether the specified configuration object refers to a built-in
	 * engine script (i.e. not a custom script).
	 *
	 * @param {object} config
	 *        The configuration object which is to be checked.
	 *
	 * @return {Boolean}
	 */
	function isEngineScript(config) {
		return Boolean(config.className);
	}

	/**
	 * Gets whether the specified configuration object refers to a custom script
	 * script (i.e. not a built-in engine script).
	 *
	 * @param {object} config
	 *        The configuration object which is to be checked.
	 *
	 * @return {Boolean}
	 */
	function isCustomScript(config) {
		return !isEngineScript(config) && config.body !== undefined;
	}

	/**
	 * Removes all the script HTML elements that are not needed by any script
	 * anymore (i.e. have no references to scripts).
	 */
	function removeDeadScriptElements() {
		var scriptElements = document.querySelectorAll('script');

		for (var i = 0; i < scriptElements.length; ++i) {
			var scriptElement = scriptElements[i];
			if (scriptElement.isDependency && !hasReferences(scriptElement) && scriptElement.parentNode) {
				scriptElement.parentNode.removeChild(scriptElement);
			}
		}
	}

	/**
	 * Add a global error listener that catches script errors, and tries to match
	 * them to scripts loaded with this handler. If an error is registered, the
	 * script is reset and an error message is appended to it.
	 * @private
	 *
	 */
	ScriptHandler.prototype._addGlobalErrorListener = function () {
		var that = this;
		window.addEventListener('error', function (evt) {
			if (evt.filename) {
				var scriptElem = document.querySelector('script[src="' + evt.filename + '"]');
				if (scriptElem) {
					var scriptId = scriptElem.getAttribute('data-script-id');
					var script = that._objects.get(scriptId);
					if (script) {
						var error = {
							message: evt.message,
							line: evt.lineno,
							file: evt.filename
						};
						setError(script, error);
					}
					scriptElem.parentNode.removeChild(scriptElem);
				}
			}
			if (that._currentScriptLoading) {
				var oldScriptElement = document.getElementById(ScriptHandler.DOM_ID_PREFIX + that._currentScriptLoading);
				if (oldScriptElement) {
					oldScriptElement.parentNode.removeChild(oldScriptElement);
				}
				delete window._gooScriptFactories[that._currentScriptLoading];
				var script = that._objects.get(that._currentScriptLoading);
				var error = {
					message: evt.message,
					line: evt.lineno - 1
				};
				setError(script, error);
				that._currentScriptLoading = null;
			}
		});
	};

	// The allowed types for the script parameters.
	var PARAMETER_TYPES = [
		'string',
		'int',
		'float',
		'vec2',
		'vec3',
		'vec4',
		'boolean',
		'texture',
		'sound',
		'camera',
		'entity',
		'animation'
	];

	// Specifies which controls can be used with each type.
	var TYPE_CONTROLS = (function () {
		var typeControls = {
			'string': ['key'],
			'int': ['spinner', 'slider', 'jointSelector'],
			'float': ['spinner', 'slider'],
			'vec2': [],
			'vec3': ['color'],
			'vec4': ['color'],
			'boolean': ['checkbox'],
			'texture': [],
			'image': [],
			'sound': [],
			'camera': [],
			'entity': [],
			'animation': []
		};

		// Add the controls that can be used with any type to the mapping of
		// controls that ca be used for each type.
		for (var type in typeControls) {
			Array.prototype.push.apply(typeControls[type], ['dropdown', 'select']);
		}

		return typeControls;
	})();

	/**
	 * Load an external script
	 */
	function loadExternalScript(script, scriptElem, url) {
		return PromiseUtils.createPromise(function (resolve, reject) {
			var timeoutHandler;
			var handled = false;

			scriptElem.onload = function () {
				resolve();
				if (timeoutHandler) { clearTimeout(timeoutHandler); }
			};

			function fireError(message) {
				var err = {
					message: message,
					file: url
				};
				setError(script, err);

				// remove element if it was attached to the document
				if (scriptElem.parentNode) {
					scriptElem.parentNode.removeChild(scriptElem);
				}
				resolve();
			}

			scriptElem.onerror = function (e) {
				handled = true;
				if (timeoutHandler) { clearTimeout(timeoutHandler); }
				console.error(e);
				fireError('Could not load dependency ' + url);
			};

			if (!handled) {
				handled = true;
				// Some errors (notably https/http security ones) don't fire onerror, so we have to wait
				timeoutHandler = setTimeout(function () {
					fireError('Loading dependency ' + url + ' failed (time out)');
				}, DEPENDENCY_LOAD_TIMEOUT);
			}
		});
	}

	var TYPE_VALIDATORS = {
		string: function (key, value) {
			if (typeof value !== 'string' || value.length === 0) {
				return { message: 'Property "' + key + '" must be a non-empty string' };
			}
		},
		number: function (key, value) {
			if (typeof value !== 'number') {
				return { message: 'Property "' + key + '" must be a number' };
			}
		},
		boolean: function (key, value) {
			if (typeof value !== 'boolean') {
				return { message: 'Property "' + key + '" must be a boolean' };
			}
		},
		array: function (key, value) {
			if (!(value instanceof Array)) {
				return { message: 'Property "' + key + '" must be an array' };
			}
		}
	};

	var PROPERTY_VALIDATORS = [
		{ name: 'key', validator: TYPE_VALIDATORS.string },
		{ name: 'name', validator: TYPE_VALIDATORS.string },
		{ name: 'control', validator: TYPE_VALIDATORS.string },
		{ name: 'min', validator: TYPE_VALIDATORS.number },
		{ name: 'max', validator: TYPE_VALIDATORS.number },
		{ name: 'scale', validator: TYPE_VALIDATORS.number },
		{ name: 'decimals', validator: TYPE_VALIDATORS.number },
		{ name: 'precision', validator: TYPE_VALIDATORS.number },
		{ name: 'exponential', validator: TYPE_VALIDATORS.boolean }
	];

	/**
	 * Validates every property of a parameter defined by a user script.
	 * Exposed as a static method only for testing purposes.
	 * @hidden
	 * @param parameter
	 * @returns {{message: string}|undefined} May return an error
	 */
	ScriptHandler.validateParameter = function (parameter) {
		// treat key separately; this needs to always be defined
		if (typeof parameter.key !== 'string' || parameter.key.length === 0) {
			return { message: 'Property "key" must be a non-empty string' };
		}

		// check for types
		for (var i = 0; i < PROPERTY_VALIDATORS.length; i++) {
			var entry = PROPERTY_VALIDATORS[i];

			if (typeof parameter[entry.name] !== 'undefined') {
				var maybeError = entry.validator(entry.name, parameter[entry.name]);
				if (maybeError) {
					return maybeError;
				}
			}
		}

		// check for type in a list of allowed types; must be defined
		if (PARAMETER_TYPES.indexOf(parameter.type) === -1) {
			return { message: 'Property "type" must be one of: ' + PARAMETER_TYPES.join(', ') };
		}

		// check for controls in a list of controls; this depends on type
		var allowedControls = TYPE_CONTROLS[parameter.type];
		if (parameter.control !== undefined && allowedControls.indexOf(parameter.control) === -1) {
			return { message: 'Property "control" must be one of: ' + allowedControls.join(', ') };
		}
	};

	/**
	 * Validates every parameter defined in the `externalParameters` collection by a user script.
	 * Exposed as a static method only for testing purposes.
	 * @hidden
	 * @param script
	 * @param outScript
	 */
	ScriptHandler.validateParameters = function (script, outScript) {
		var errors = script.errors || [];
		if (typeof script.externals !== 'object') {
			outScript.externals = {};
			return;
		}
		var externals = script.externals;
		if (externals.parameters && !(externals.parameters instanceof Array)) {
			errors.push('externals.parameters must be an array');
		}
		if (errors.length) {
			outScript.errors = errors;
			return;
		}
		if (!externals.parameters) {
			return;
		}
		outScript.externals.parameters = [];
		for (var i = 0; i < externals.parameters.length; i++) {
			var parameter = externals.parameters[i];

			var maybeError = ScriptHandler.validateParameter(parameter);
			if (maybeError) {
				errors.push(maybeError);
			}

			// create cares about this, in order to build the control panel for the script
			if (parameter.default === null || parameter.default === undefined) {
				parameter.default = ScriptUtils.DEFAULTS_BY_TYPE[parameter.type];
			}

			outScript.externals.parameters.push(parameter);
		}
		if (errors.length) {
			outScript.errors = errors;
		}
	};

	/**
	 * Flag a script with an error. The script will be disabled.
	 * @param {Object} script
	 * @param {Object} error
	 * @param {string} error.message
	 * @param {number} [error.line]
	 * @param {string} [error.file]
	 */
	function setError(script, error) {
		if (error.file) {
			var message = error.message;
			if (error.line) {
				message += ' - on line ' + error.line; //! AT: this isn't used
			}
			script.dependencyErrors = script.dependencyErrors || {};
			script.dependencyErrors[error.file] = error;
		} else {
			script.errors = script.errors || [];
			var message = error.message;
			if (error.line) {
				message += ' - on line ' + error.line; //! AT: this isn't used
			}
			script.errors.push(error);

			script.setup = null;
			script.update = null;
			script.run = null;
			script.cleanup = null;

			script.parameters = {};
			script.enabled = false;
		}
	}

	ScriptHandler.DOM_ID_PREFIX = '_script_';

	return ScriptHandler;
})(goo.ConfigHandler,goo.rsvp,goo.OrbitCamControlScript,goo.OrbitNPanControlScript,goo.FlyControlScript,goo.WasdControlScript,goo.BasicControlScript,goo.PromiseUtils,goo.ObjectUtils,goo.ArrayUtils,goo.SystemBus,goo.ScriptUtils,goo.Scripts);
goo.ScriptHandlers = (function () {})(goo.ScriptHandler,goo.ScriptComponentHandler);
goo.ScriptRegister = (function (Scripts) {
	'use strict';

	for (var i = 1; i < arguments.length; i++) {
		Scripts.register(arguments[i]);
	}
})(goo.Scripts,goo.OrbitCamControlScript,goo.OrbitNPanControlScript,goo.FlyControlScript,goo.AxisAlignedCamControlScript,goo.PanCamScript,goo.MouseLookControlScript,goo.WasdControlScript,goo.ButtonScript,goo.PickAndRotateScript,goo.LensFlareScript);
goo.SparseHeightMapBoundingScript = (function () {
	'use strict';

	/**
	 * Bounds the host entity to a height map computed from a set of terrain points
	 * @param {Array<Number>} elevationData The array of height points given as a flat array
	 */
	function SparseHeightMapBoundingScript(elevationData) {
		this.elevationData = elevationData;
	}

	/**
	 * Returns the height of the closest terrain point to the given coordinates
	 * @param x
	 * @param z
	 * @returns {number} The height of the closest terrain point
	 */
	SparseHeightMapBoundingScript.prototype.getClosest = function (x, z) {
		var minDist = Number.MAX_VALUE;
		var minIndex = -1;
		for (var i = 0; i < this.elevationData.length; i += 3) {
			var dist =
				Math.pow(this.elevationData[i + 0] - x, 2) +
				Math.pow(this.elevationData[i + 2] - z, 2);
			if (dist < minDist) {
				minDist = dist;
				minIndex = i;
			}
		}
		return this.elevationData[minIndex + 1];
	};

	SparseHeightMapBoundingScript.prototype.run = function (entity) {
		var translation = entity.transformComponent.transform.translation;
		var closest = this.getClosest(translation.x, translation.z);
		var diff = translation.y - closest;
		translation.y -= diff * 0.1;
	};

	return SparseHeightMapBoundingScript;
})();
goo.WorldFittedTerrainScript = (function (
	HeightMapBoundingScript,
	Vector3
) {
	'use strict';

	var calcVec1 = new Vector3();
	var calcVec2 = new Vector3();

	var _defaults = {
		minX: 0,
		maxX: 100,
		minY: 0,
		maxY: 50,
		minZ: 0,
		maxZ: 100
	};

	function validateTerrainProperties(properties, heightMatrix) {
		if (properties.minX > properties.maxX) {
			throw new Error({ name: 'Terrain Exception', message: 'minX is larger than maxX' });
		}
		if (properties.minY > properties.maxY) {
			throw new Error({ name: 'Terrain Exception', message: 'minY is larger than maxY' });
		}
		if (properties.minZ > properties.maxZ) {
			throw new Error({ name: 'Terrain Exception', message: 'minZ is larger than maxZ' });
		}
		if (!heightMatrix) {
			throw new Error({ name: 'Terrain Exception', message: 'No heightmap data specified' });
		}
		if (heightMatrix.length !== heightMatrix[0].length) {
			throw new Error({ name: 'Terrain Exception', message: 'Heightmap data is not a square' });
		}

		return true;
	}

	function registerHeightData(heightMatrix, dimensions, heightMapData) {
		dimensions = dimensions || _defaults;
		validateTerrainProperties(dimensions, heightMatrix, heightMapData);
		var scriptContainer = {
			dimensions: dimensions,
			sideQuadCount: heightMatrix.length - 1,
			script: new HeightMapBoundingScript(heightMatrix)
		};
		return scriptContainer;
	}

	/**
	 * Creates and exposes a square heightmap terrain fitted within given world dimensions.
	 * This does not do any visualizing of the heightMap. That needs to be done elsewhere.
	 */
	function WorldFittedTerrainScript() {
		this.heightMapData = [];
		this.yMargin = 1;
	}

	/**
	 * Adds a block of height data from an image at given dimensions and stores the script in an array.
	 * @param {Array} [heightMatrix] file to load height data from
	 * @param {Object} [dimensions] dimensions to fit the data within
	 */
	WorldFittedTerrainScript.prototype.addHeightData = function (heightMatrix, dimensions) {
		var scriptContainer = registerHeightData(heightMatrix, dimensions, this.heightMapData);
		this.heightMapData.push(scriptContainer);
		return scriptContainer;
	};

	/**
	 * Returns the script relevant to a given position
	 * @param {Vector3} [pos] data, typically use entity transform
	 * @returns {Object} container object with script and its world dimensions
	 */
	WorldFittedTerrainScript.prototype.getHeightDataForPosition = function (pos) {
		for (var i = 0; i < this.heightMapData.length; i++) {
			var dim = this.heightMapData[i].dimensions;
			if (pos.x <= dim.maxX && pos.x >= dim.minX) {
				if (pos.y < dim.maxY + this.yMargin && pos.y > dim.minY - this.yMargin) {
					if (pos.z <= dim.maxZ && pos.z >= dim.minZ) {
						return this.heightMapData[i];
					}
				}
			}
		}
		return null;
	};

	/**
	 * Adjusts coordinates to from heightMap to fit the dimensions of raw displacement data.
	 * @param {Number} axPos
	 * @param {Number} axMin
	 * @param {Number} axMax
	 * @param {Number} quadCount
	 * @returns {Number}
	 */
	WorldFittedTerrainScript.prototype.displaceAxisDimensions = function (axPos, axMin, axMax, quadCount) {
		var matrixPos = axPos - axMin;
		return quadCount * matrixPos / (axMax - axMin);
	};

	/**
	 * Returns coordinates from raw displacement space to fit the dimensions of a registered heightMap.
	 * @param {Number} axPos
	 * @param {Number} axMin
	 * @param {Number} axMax
	 * @param {Number} quadCount
	 * @returns {Number}
	 */
	WorldFittedTerrainScript.prototype.returnToWorldDimensions = function (axPos, axMin, axMax, quadCount) {
		var quadSize = (axMax - axMin) / quadCount;
		var insidePos = axPos * quadSize;
		return axMin + insidePos;
	};

	/**
	 * Looks through height data and returns the elevation of the ground at a given position
	 * @param {Vector3} pos Position
	 * @returns {Number} height in units
	 */
	WorldFittedTerrainScript.prototype.getTerrainHeightAt = function (pos) {
		var heightData = this.getHeightDataForPosition(pos);
		if (heightData === null) {
			return null;
		}
		var dims = heightData.dimensions;

		var tx = this.displaceAxisDimensions(pos.x, dims.minX, dims.maxX, heightData.sideQuadCount);
		var tz = this.displaceAxisDimensions(pos.z, dims.minZ, dims.maxZ, heightData.sideQuadCount);
		var matrixHeight = heightData.script.getPreciseHeight(tx, tz);
		return matrixHeight * (dims.maxY - dims.minY) + dims.minY;
	};

	/**
	 * Returns the a normalized terrain normal for the provided position
	 * @param {Vector3} [pos] the position
	 * @returns {Vector3} the normal vector
	 */
	WorldFittedTerrainScript.prototype.getTerrainNormalAt = function (pos) {
		var heightData = this.getHeightDataForPosition(pos);
		if (!heightData) {
			return null;
		}
		var dims = heightData.dimensions;

		var x = this.displaceAxisDimensions(pos.x, dims.minX, dims.maxX, heightData.sideQuadCount);
		var y = this.displaceAxisDimensions(pos.z, dims.minZ, dims.maxZ, heightData.sideQuadCount);
		var tri = heightData.script.getTriangleAt(x, y);

		for (var i = 0; i < tri.length; i++) {
			tri[i].x = this.returnToWorldDimensions(tri[i].x, dims.minX, dims.maxX, heightData.sideQuadCount);
			tri[i].z = this.returnToWorldDimensions(tri[i].z, dims.minY, dims.maxY, 1);
			tri[i].y = this.returnToWorldDimensions(tri[i].y, dims.minZ, dims.maxZ, heightData.sideQuadCount);
		}

		calcVec1.setDirect((tri[1].x - tri[0].x), (tri[1].z - tri[0].z), (tri[1].y - tri[0].y));
		calcVec2.setDirect((tri[2].x - tri[0].x), (tri[2].z - tri[0].z), (tri[2].y - tri[0].y));
		calcVec1.cross(calcVec2);
		if (calcVec1.y < 0) {
			calcVec1.scale(-1);
		}

		calcVec1.normalize();
		return calcVec1;
	};

	return WorldFittedTerrainScript;
})(goo.HeightMapBoundingScript,goo.Vector3);
if (typeof require === "function") {
define("goo/scriptpack/AxisAlignedCamControlScript", [], function () { return goo.AxisAlignedCamControlScript; });
define("goo/scriptpack/WasdControlScript", [], function () { return goo.WasdControlScript; });
define("goo/scriptpack/MouseLookControlScript", [], function () { return goo.MouseLookControlScript; });
define("goo/scriptpack/FlyControlScript", [], function () { return goo.FlyControlScript; });
define("goo/scriptpack/ButtonScript", [], function () { return goo.ButtonScript; });
define("goo/scriptpack/BasicControlScript", [], function () { return goo.BasicControlScript; });
define("goo/scriptpack/CannonPickScript", [], function () { return goo.CannonPickScript; });
define("goo/scriptpack/HeightMapBoundingScript", [], function () { return goo.HeightMapBoundingScript; });
define("goo/scriptpack/GroundBoundMovementScript", [], function () { return goo.GroundBoundMovementScript; });
define("goo/scriptpack/PanCamScript", [], function () { return goo.PanCamScript; });
define("goo/scriptpack/OrbitNPanControlScript", [], function () { return goo.OrbitNPanControlScript; });
define("goo/scriptpack/LensFlareScript", [], function () { return goo.LensFlareScript; });
define("goo/scriptpack/PickAndRotateScript", [], function () { return goo.PickAndRotateScript; });
define("goo/scriptpack/PolyBoundingScript", [], function () { return goo.PolyBoundingScript; });
define("goo/scriptpack/RotationScript", [], function () { return goo.RotationScript; });
define("goo/scriptpack/ScriptComponentHandler", [], function () { return goo.ScriptComponentHandler; });
define("goo/scriptpack/ScriptHandler", [], function () { return goo.ScriptHandler; });
define("goo/scriptpack/ScriptHandlers", [], function () { return goo.ScriptHandlers; });
define("goo/scriptpack/ScriptRegister", [], function () { return goo.ScriptRegister; });
define("goo/scriptpack/SparseHeightMapBoundingScript", [], function () { return goo.SparseHeightMapBoundingScript; });
define("goo/scriptpack/WorldFittedTerrainScript", [], function () { return goo.WorldFittedTerrainScript; });
}
