var System = require('../../entities/systems/System');
var GamepadData = require('../../addons/gamepadpack/GamepadData');



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

	module.exports = GamepadSystem;
