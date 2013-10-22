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
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseup',
			name: 'Mouse up',
			description: 'Fired on mouse up'
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