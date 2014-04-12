define([
	'goo/entities/systems/System',
	'goo/addons/gamepad/GamepadData'
],
/** @lends */
	function(
	System,
	GamepadData
	) {

	'use strict';

	/**
	 * @class
	 * @extends System
	 * @constructor
	 */
	function GamepadSystem() {

		System.call(this, 'GamepadSystem', ['GamepadComponent']);

		this.gamepads = [];

		this.gamepadData = [];
		for (var i = 0; i < 4; i++) {
			this.gamepadData[i] = new GamepadData();
		}


		if (navigator.webkitGetGamepads) {
			this.updateGamepads = this.chromeGamepadUpdate;
		} else {
			this.updateGamepads = function(){};

			var that = this;
			window.addEventListener('gamepadconnected', function(e) {
					that.mozGamepadHandler(e, true); }
				, false);
			window.addEventListener('gamepaddisconnected', function(e) {
					that.mozGamepadHandler(e, false); }
				, false);
		}
	}

	GamepadSystem.prototype = Object.create(System.prototype);

	GamepadSystem.prototype.mozGamepadHandler = function(event, connecting) {
		var gamepad = event.gamepad;
		if (connecting) {
			this.gamepads[gamepad.index] = gamepad;
		} else {
			delete this.gamepads[gamepad.index];
		}
	};

	GamepadSystem.prototype.chromeGamepadUpdate = function() {

		var updatedGamepads = navigator.webkitGetGamepads();
		var numOfGamePads = updatedGamepads.length;
		for (var i = 0; i < numOfGamePads; i++) {
			var gamepad = updatedGamepads[i];
			if (gamepad) {
				this.gamepads[gamepad.index] = gamepad;
			}
		}
	};


	GamepadSystem.prototype.updateGamepadData = function() {

		this.updateGamepads();

		var numOfGamePads = this.gamepads.length;
		for (var i = 0; i < numOfGamePads; i++) {
			var gamepad = this.gamepads[i];
			if (gamepad) {
				// Update the retrieved data.
				this.gamepadData[gamepad.index].recalculateData(gamepad);
			}
		}
	};


	GamepadSystem.prototype.process = function(entities) {

		this.updateGamepadData();

		var numOfEntities = entities.length;
		for (var i = 0; i < numOfEntities; i++) {
			var entity = entities[i];
			var gamepadComponent = entity.gamepadComponent;

			var gamepadIndex = gamepadComponent.gamepadIndex;
			var data = this.gamepadData[gamepadIndex];

			if (gamepadComponent.leftStickFunction) {
				gamepadComponent.leftStickFunction(entity, data.leftStickDirection, data.leftAmount);
			}

			if (gamepadComponent.rightStickFunction) {
				gamepadComponent.rightStickFunction(entity, data.rightStickDirection, data.rightAmount);
			}

		}

	};

	return GamepadSystem;
});
