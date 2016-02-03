goo.GamepadComponent = (function (
	Component
) {
	'use strict';

	/**
	 * @extends Component
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Gamepad/Gamepad-example.html Working example
	 * @param gamepadIndex
	 */
	function GamepadComponent(gamepadIndex) {
		Component.apply(this, arguments);

		this.type = 'GamepadComponent';

		this.buttonDownFunctions = {};

		this.buttonUpFunctions = {};

		this.buttonPressedFunctions = {};

		this.leftStickFunction = null;
		this.rightStickFunction = null;

		this.gamepadIndex = gamepadIndex || 0;
	}

	GamepadComponent.prototype = Object.create(Component.prototype);
	GamepadComponent.prototype.constructor = GamepadComponent;

	GamepadComponent.prototype.setButtonDownFunction = function (buttonIndex, buttonFunction) {
		this.buttonDownFunctions[buttonIndex] = buttonFunction;
	};

	GamepadComponent.prototype.setButtonUpFunction = function (buttonIndex, buttonFunction) {
		this.buttonUpFunctions[buttonIndex] = buttonFunction;
	};

	GamepadComponent.prototype.setButtonPressedFunction = function (buttonIndex, buttonFunction) {
		this.buttonPressedFunctions[buttonIndex] = buttonFunction;
	};

	GamepadComponent.prototype.setLeftStickFunction = function (stickFunction) {
		this.leftStickFunction = stickFunction;
	};

	GamepadComponent.prototype.setRightStickFunction = function (stickFunction) {
		this.rightStickFunction = stickFunction;
	};

	return GamepadComponent;
})(goo.Component);
goo.GamepadData = (function (
	Vector2,
	MathUtils
) {
	'use strict';

	/**
	 * Used for storing derived data from gamepads
	 */
	function GamepadData() {
		this.leftStickDirection = new Vector2();
		this.rightStickDirection = new Vector2();

		// TODO: Redo buttondata when Gamepad API is done. probably will be true for other things as well.
		this.buttonData = {};
		var BUTTON_BUFFER = 20;
		for (var i = 0; i < BUTTON_BUFFER; i++) {
			this.buttonData[i] = {
				pressed: false,
				down: false,
				value: 0
			};
		}

		this.leftAmount = 0.0;
		this.rightAmount = 0.0;
	}

	GamepadData.prototype.recalculateData = function (gamepad) {
		this.recalculateSticks(gamepad);
		this.recalculateButtons(gamepad);
	};

	GamepadData.prototype.resetData = function (gamepad) {
		var activeButtonLength = gamepad.buttons.length;
		for (var i = 0; i < activeButtonLength; i++) {
			this.buttonData[i].pressed = false;
		}
	};

	GamepadData.prototype.recalculateButtons = function (gamepad) {
		var buttons = gamepad.buttons;
		var numOfButtons = buttons.length;
		for (var i = 0; i < numOfButtons; i++) {
			// Might only be chrome specific, that the value is right in the array.
			var buttonValue = buttons[i];
			if (buttonValue === 1) {
				this.buttonData[i].down = true;
			} else {
				// A press; button going from down to up.
				if (this.buttonData[i].down === true) {
					this.buttonData[i].pressed = true;
				}
				this.buttonData[i].down = false;
			}
			this.buttonData[i].value = buttonValue;
		}
	};

	GamepadData.prototype.recalculateSticks = function (gamepad) {
		var axes = gamepad.axes;

		var leftX = axes[0];
		var leftY = axes[1];
		this.calculateStickDirection(this.leftStickDirection, leftX, leftY);
		this.leftAmount = this.calculateStickAmount(leftX, leftY);

		var rightX = axes[2];
		var rightY = axes[3];
		this.calculateStickDirection(this.rightStickDirection, rightX, rightY);
		this.rightAmount = this.calculateStickAmount(rightX, rightY);
	};

	/**
	 *
	 * @param {Vector2} dirVector
	 * @param {number} x
	 * @param {number} y
	 */
	GamepadData.prototype.calculateStickDirection = function (dirVector, x, y) {
		dirVector.setDirect(x, y);
		var length = dirVector.length();
		if (length > MathUtils.EPSILON) {
			dirVector.scale(1 / length);
		}
	};

	GamepadData.prototype.calculateStickAmount = function (x, y) {
		return Math.max(Math.abs(x), Math.abs(y));
	};

	return GamepadData;
})(goo.Vector2,goo.MathUtils);
goo.GamepadSystem = (function (
	System,
	GamepadData
) {
	'use strict';

	/**
	 * @extends System
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Gamepad/Gamepad-example.html Working example
	 */
	function GamepadSystem() {
		System.call(this, 'GamepadSystem', ['GamepadComponent']);

		this.gamepads = [];

		this.gamepadData = [];
		var BUFFER_COUNT = 4;
		for (var i = 0; i < BUFFER_COUNT; i++) {
			this.gamepadData[i] = new GamepadData();
		}


		if (navigator.webkitGetGamepads) {
			this.updateGamepads = this.chromeGamepadUpdate;
		} else {
			this.updateGamepads = function () {};

			window.addEventListener('gamepadconnected', function (e) {
				this.mozGamepadHandler(e, true);
			}.bind(this), false);
			window.addEventListener('gamepaddisconnected', function (e) {
				this.mozGamepadHandler(e, false);
			}.bind(this), false);
		}
	}

	GamepadSystem.prototype.checkGamepadMapping = function (gamepad) {
		if (!gamepad.mapping) {
			console.warn('No mapping set on gamepad #' + gamepad.index);
		} else if (gamepad.mapping !== 'standard') {
			console.warn('Non-standard mapping set on gamepad #' + gamepad.index);
		}
	};

	GamepadSystem.prototype = Object.create(System.prototype);
	GamepadSystem.prototype.constructor = GamepadSystem;

	GamepadSystem.prototype.mozGamepadHandler = function (event, connecting) {
		var gamepad = event.gamepad;
		if (connecting) {
			this.gamepads[gamepad.index] = gamepad;
			this.checkGamepadMapping(gamepad);
		} else {
			delete this.gamepads[gamepad.index];
		}
	};

	GamepadSystem.prototype.chromeGamepadUpdate = function () {
		var updatedGamepads = navigator.webkitGetGamepads();
		var numOfGamePads = updatedGamepads.length;
		for (var i = 0; i < numOfGamePads; i++) {
			var gamepad = updatedGamepads[i];
			if (gamepad) {
				this.gamepads[gamepad.index] = gamepad;
			}
		}
	};


	GamepadSystem.prototype.updateGamepadData = function () {
		this.updateGamepads();

		var numOfGamePads = this.gamepads.length;
		for (var i = 0; i < numOfGamePads; i++) {
			var gamepad = this.gamepads[i];
			if (gamepad) {
				this.gamepadData[gamepad.index].recalculateData(gamepad);
			}
		}
	};

	GamepadSystem.prototype.resetGamepadData = function () {
		var numOfGamePads = this.gamepads.length;
		for (var i = 0; i < numOfGamePads; i++) {
			var gamepad = this.gamepads[i];
			if (gamepad) {
				this.gamepadData[gamepad.index].resetData(gamepad);
			}
		}
	};

	GamepadSystem.prototype._processEntity = function (entity) {
		var gamepadComponent = entity.gamepadComponent;
		var gamepadIndex = gamepadComponent.gamepadIndex;
		var data = this.gamepadData[gamepadIndex];
		var gamepad = this.gamepads[gamepadIndex];

		if (!gamepad) {
			return;
		}

		// TODO: Refactor the functions to be in an array in the component.
		var rawX, rawY, rawData;
		if (gamepadComponent.leftStickFunction) {
			rawX = gamepad.axes[0];
			rawY = gamepad.axes[1];
			rawData = [rawX, rawY];
			gamepadComponent.leftStickFunction(entity, data.leftStickDirection, data.leftAmount, rawData);
		}

		if (gamepadComponent.rightStickFunction) {
			rawX = gamepad.axes[2];
			rawY = gamepad.axes[3];
			rawData = [rawX, rawY];
			gamepadComponent.rightStickFunction(entity, data.rightStickDirection, data.rightAmount, rawData);
		}

		var buttonIndex, buttonData;
		for (buttonIndex in gamepadComponent.buttonDownFunctions) {
			buttonData = data.buttonData[buttonIndex];
			if (buttonData.down === true) {
				gamepadComponent.buttonDownFunctions[buttonIndex](entity, buttonData.value);
			}
		}

		for (buttonIndex in gamepadComponent.buttonUpFunctions) {
			buttonData = data.buttonData[buttonIndex];
			if (buttonData.down === false) {
				gamepadComponent.buttonUpFunctions[buttonIndex](entity, buttonData.value);
			}
		}

		for (buttonIndex in gamepadComponent.buttonPressedFunctions) {
			buttonData = data.buttonData[buttonIndex];
			if (buttonData.pressed === true) {
				gamepadComponent.buttonPressedFunctions[buttonIndex](entity, buttonData.value);
			}
		}
	};

	GamepadSystem.prototype.process = function (entities) {
		this.updateGamepadData();

		var numOfEntities = entities.length;
		for (var i = 0; i < numOfEntities; i++) {
			this._processEntity(entities[i]);
		}

		this.resetGamepadData();
	};

	return GamepadSystem;
})(goo.System,goo.GamepadData);
if (typeof require === "function") {
define("goo/addons/gamepadpack/GamepadComponent", [], function () { return goo.GamepadComponent; });
define("goo/addons/gamepadpack/GamepadData", [], function () { return goo.GamepadData; });
define("goo/addons/gamepadpack/GamepadSystem", [], function () { return goo.GamepadSystem; });
}
