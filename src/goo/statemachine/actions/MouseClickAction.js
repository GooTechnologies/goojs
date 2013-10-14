define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function MouseClickAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.currentTime = 0;

		this.updated = false;
		this.eventListener = function(/*event*/) {
			this.updated = true;
		}.bind(this);
	}

	MouseClickAction.prototype = Object.create(Action.prototype);

	MouseClickAction.prototype.configure = function(settings) {
		this.everyFrame = true;
		this.eventToEmit = { channel: settings.transitions.click };
		this.positionVariable = settings.positionVariable || null;
	};

	MouseClickAction.external = {
		parameters: [{
			name: 'Position variable',
			key: 'positionVariable',
			type: 'identifier'
		}],
		transitions: [{
			name: 'click',
			description: 'Fired on click'
		}]
	};

	MouseClickAction.prototype._setup = function() {
		document.addEventListener('click', this.eventListener);
	};

	MouseClickAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmit) {
				fsm.send(this.eventToEmit.channel, this.eventToEmit.data);
			}
		}
	};

	MouseClickAction.prototype.exit = function() {
		document.removeEventListener('click', this.eventListener);
	};

	return MouseClickAction;
});