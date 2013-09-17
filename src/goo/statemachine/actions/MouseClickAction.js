define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function MouseClickAction(settings) {
		settings = settings || {};

		this.everyFrame = true;

		this.posVariable = settings.posVariable || null;
		this.eventToEmmit = settings.eventToEmmit || null;

		this.currentTime = 0;

		this.updated = false;
		this.eventListener = function(/*event*/) {
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

	MouseClickAction.prototype = Object.create(Action.prototype);

	MouseClickAction.external = [
		{
			name: 'Store for click position',
			key: 'posVariable',
			type: 'string'
		}];

	MouseClickAction.prototype._setup = function() {
		document.addEventListener('click', this.eventListener);
	};

	MouseClickAction.prototype._run = function(proxy) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmmit) {
				proxy.send(this.eventToEmmit.channel, this.eventToEmmit.data);
			}
		}
	};

	MouseClickAction.prototype.exit = function() {
		document.removeEventListener('click', this.eventListener);
	};

	return MouseClickAction;
});