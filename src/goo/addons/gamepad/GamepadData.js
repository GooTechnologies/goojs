define([
	'goo/math/Vector2'
],
/** @lends */
function(
	Vector2
	) {

	'use strict';

	/**
	 * @class
	 * Used for storing derived data from gamepads
	 * @constructor
	 */
	function GamepadData() {
		this.leftStickDirection = new Vector2();
		this.rightStickDirection = new Vector2();

		this.leftAmount = 0.0;
		this.rightAmount = 0.0;
	}

	GamepadData.prototype.recalculateData = function(gamepad) {
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
		dirVector.setd(x, y);
		var length = dirVector.length();
		if (length > 0.0000001) {
			dirVector.data[0] /= length;
			dirVector.data[1] /= length;
		}
	};

	GamepadData.prototype.calculateStickAmount = function(x, y) {
		return Math.max(Math.abs(x), Math.abs(y));
	};

	return GamepadData
});