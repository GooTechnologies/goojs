define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function MouseMoveAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

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

	MouseMoveAction.prototype = Object.create(Action.prototype);

	MouseMoveAction.external = [
		{
			name: 'Store for click position',
			key: 'posVariable',
			type: 'string'
		}];

	MouseMoveAction.prototype._setup = function() {
		document.addEventListener('mousemove', this.eventListener);
	};

	MouseMoveAction.prototype._run = function(proxy) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmmit) {
				proxy.send(this.eventToEmmit.channel, this.eventToEmmit.data);
			}
		}
	};

	MouseMoveAction.prototype.exit = function() {
		document.removeEventListener('mousemove', this.eventListener);
	};

	return MouseMoveAction;
});