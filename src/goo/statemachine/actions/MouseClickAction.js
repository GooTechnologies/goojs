define([
	'goo/statemachine/FSMComponent'
],
/** @lends */
function(
	FSMComponent
) {
	"use strict";

	/**
	 * @class
	 */
	function MouseClickAction(settings) {
		this.type = 'MouseClickAction';

		settings = settings || {};

		this.posVariable = settings.posVariable || null;

		this.external = [
		{
			name: 'Store for click position',
			key: 'posVariable',
			type: 'string'
		}];

		this.currentTime = 0;
	}

	MouseClickAction.prototype = {
		create: function(fsm) {
			$(document).click(function(event) {
				console.log(event);
				if (this.posVariable) {
					if (fsm.localVariables[this.posVariable] !== undefined) {
						fsm.localVariables[this.posVariable] = [event.clientX, event.clientY];
					} else if (FSMComponent.globalVariables[this.posVariable] !== undefined) {
						FSMComponent.globalVariables[this.posVariable] = [event.clientX, event.clientY];
					}
				}
			}.bind(this));
		},
		destroy: function() {
			$(document).off('click');
		}
	};

	return MouseClickAction;
});