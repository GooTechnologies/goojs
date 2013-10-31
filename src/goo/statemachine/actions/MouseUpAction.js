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

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function(/*event*/) {
			this.updated = true;
		}.bind(this);
	}

	MouseUpAction.prototype = Object.create(Action.prototype);
	MouseUpAction.prototype.constructor = MouseUpAction;

	MouseUpAction.external = {
		name: 'Mouse Up',
		description: 'Listens for a mouse button release and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseup',
			name: 'Mouse up',
			description: 'State to transition to when the mouse button is pressed'
		}]
	};

	MouseUpAction.prototype._setup = function() {
		document.addEventListener('mouseup', this.eventListener);
	};

	MouseUpAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.mouseup);
		}
	};

	MouseUpAction.prototype.exit = function() {
		document.removeEventListener('mouseup', this.eventListener);
	};

	return MouseUpAction;
});