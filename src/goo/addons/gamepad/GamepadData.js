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


		this.leftStickDirection.setd(leftX, -leftY);
		var length = this.leftStickDirection.length();
		if (length > 0.0000001) {
			this.leftStickDirection.data[0] /= length;
			this.leftStickDirection.data[1] /= length;
		}

		this.leftAmount = Math.max(Math.abs(leftX), Math.abs(leftY));

		var rightX = axes[2];
		var rightY = axes[3];

	};



	return GamepadData
});