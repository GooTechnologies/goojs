define([
	'goo/math/Vector2'
], function (
	Vector2
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

	GamepadData.prototype.recalculateData = function(gamepad) {
		this.recalculateSticks(gamepad);
		this.recalculateButtons(gamepad);
	};

	GamepadData.prototype.resetData = function(gamepad) {
		var activeButtonLength = gamepad.buttons.length;
		for (var i = 0; i < activeButtonLength; i++) {
			this.buttonData[i].pressed = false;
		}
	};

	GamepadData.prototype.recalculateButtons = function(gamepad) {

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

	GamepadData.prototype.recalculateSticks = function(gamepad) {
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
	 * @param {Number} x
	 * @param {Number} y
	 */
	GamepadData.prototype.calculateStickDirection = function(dirVector, x, y) {
		dirVector.setDirect(x, y);
		var length = dirVector.length();
		if (length > 0.0000001) {
			dirVector.x /= length;
			dirVector.y /= length;
		}
	};

	GamepadData.prototype.calculateStickAmount = function(x, y) {
		return Math.max(Math.abs(x), Math.abs(y));
	};

	return GamepadData;
});