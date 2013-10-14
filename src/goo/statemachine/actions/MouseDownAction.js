define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function MouseDownAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.updated = false;
		this.eventListener = function(/*event*/) {
			this.updated = true;
		}.bind(this);
	}

	MouseDownAction.prototype = Object.create(Action.prototype);

	MouseDownAction.prototype.configure = function(settings) {
		this.everyFrame = true;
		this.eventToEmit = { channel: settings.transitions.click };
	};

	MouseDownAction.external = {
		parameters: [],
		transitions: [{
			name: 'click',
			description: 'Fired on mouse down'
		}]
	};

	MouseDownAction.prototype._setup = function() {
		document.addEventListener('mousedown', this.eventListener);
	};

	MouseDownAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmit) {
				fsm.send(this.eventToEmit.channel, this.eventToEmit.data);
			}
		}
	};

	MouseDownAction.prototype.exit = function() {
		document.removeEventListener('mousedown', this.eventListener);
	};

	return MouseDownAction;
});