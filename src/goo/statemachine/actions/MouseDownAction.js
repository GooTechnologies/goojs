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

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function(/*event*/) {
			this.updated = true;
		}.bind(this);
	}

	MouseDownAction.prototype = Object.create(Action.prototype);
	MouseDownAction.prototype.constructor = MouseDownAction;

	MouseDownAction.external = {
		name: 'Mouse down',
		description: 'Listens for a mouse button press and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mousedown',
			name: 'Mouse down',
			description: 'Fired on mouse down'
		}]
	};

	MouseDownAction.prototype._setup = function() {
		document.addEventListener('mousedown', this.eventListener);
	};

	MouseDownAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.mousedown);
		}
	};

	MouseDownAction.prototype.exit = function() {
		document.removeEventListener('mousedown', this.eventListener);
	};

	return MouseDownAction;
});