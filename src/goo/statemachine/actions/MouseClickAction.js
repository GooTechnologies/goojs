define([
	'goo/statemachine/FSMComponent',
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
	FSMComponent,
	Actions
) {
	"use strict";

	/**
	 * @class
	 */
	function MouseClickAction(settings) {
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
		onCreate: function(fsm) {
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
		onDestroy: function() {
			$(document).off('click');
		}
	};

	Actions.register('MouseClickAction', MouseClickAction);
	return MouseClickAction;
});