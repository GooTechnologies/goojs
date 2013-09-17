define([],
/** @lends */
function() {
	"use strict";

	/**
	 * @class
	 */
	function MouseMoveAction(settings) {
		settings = settings || {};

		this.posVariable = settings.posVariable || null;
		this.eventToEmmit = settings.eventToEmmit || null;

		this.external = [
		{
			name: 'Store for click position',
			key: 'posVariable',
			type: 'string'
		}];

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

	MouseMoveAction.prototype = {
		onEnter: function() {
			document.addEventListener('mousemove', this.eventListener);
		},
		onUpdate: function(proxy) {
			if (this.updated) {
				this.updated = false;
				if (this.eventToEmmit) {
					proxy.send(this.eventToEmmit.channel, this.eventToEmmit.data);
				}
			}
		},
		onExit: function() {
			document.removeEventListener('mousemove', this.eventListener);
		}
	};

	return MouseMoveAction;
});