define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function MouseUpAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.updated = false;
		this.eventListener = function(/*event*/) {
			this.updated = true;
		}.bind(this);
	}

	MouseUpAction.prototype = Object.create(Action.prototype);

	MouseUpAction.prototype.configure = function(settings) {
		this.everyFrame = true;
		this.eventToEmit = { channel: settings.transitions.click };
	};

	MouseUpAction.external = {
		parameters: [],
		transitions: [{
			name: 'click',
			description: 'Fired on mouse up'
		}]
	};

	MouseUpAction.prototype._setup = function() {
		document.addEventListener('mouseup', this.eventListener);
	};

	MouseUpAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.eventToEmit) {
				fsm.send(this.eventToEmit.channel, this.eventToEmit.data);
			}
		}
	};

	MouseUpAction.prototype.exit = function() {
		document.removeEventListener('mouseup', this.eventListener);
	};

	return MouseUpAction;
});