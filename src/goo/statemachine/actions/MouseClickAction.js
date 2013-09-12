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
		this.jumpTo = settings.jumpTo || '';

		this.external = [
		{
			name: 'Store for click position',
			key: 'posVariable',
			type: 'string'
		}];

		this.currentTime = 0;

		this.updated = false;
		this.eventListener = function(event) {
			console.log(event);
			this.updated = true;
			/*
			if (this.posVariable) {
				if (fsm.localVariables[this.posVariable] !== undefined) {
					fsm.localVariables[this.posVariable] = [event.clientX, event.clientY];
				} else if (FSMComponent.globalVariables[this.posVariable] !== undefined) {
					FSMComponent.globalVariables[this.posVariable] = [event.clientX, event.clientY];
				}
			}
			*/
		}.bind(this);
	}

	MouseClickAction.prototype = {
		onEnter: function() {
			document.addEventListener('click', this.eventListener);
		},
		onUpdate: function(proxy) {
			if (this.updated) {
				this.updated = false;
				if (this.jumpTo !== '') {
					proxy.send('transition', this.jumpTo);
				}
			}
		},
		onExit: function() {
			document.removeEventListener('click', this.eventListener);
		}
	};

	Actions.register('MouseClickAction', MouseClickAction);
	return MouseClickAction;
});