define([
	'goo/entities/components/Component'
],
function(
	Component
	) {
	'use strict';

	/**
	 * @class
	 * @extends Component
	 * @param gamepadIndex
	 * @constructor
	 */
	function GamepadComponent(gamepadIndex) {

		this.type = 'GamepadComponent';

		this.buttoncallbacks = {};

		this.leftStickFunction = null;
		this.rightStickFunction = null;

		this.gamepadIndex = gamepadIndex || 0;
	}

	GamepadComponent.prototype = Object.create(Component.prototype);
	GamepadComponent.prototype.constructor = GamepadComponent;

	GamepadComponent.prototype.setButtonCallback = function(buttonIndex, callback) {
		this.buttoncallbacks[buttonIndex] = callback;
	};

	GamepadComponent.prototype.setLeftStickFunction = function (callback) {
		this.leftStickFunction = callback;
	};

	GamepadComponent.prototype.setRightStickFunction = function (callback) {
		this.rightStickFunction = callback;
	};


	return GamepadComponent;
});