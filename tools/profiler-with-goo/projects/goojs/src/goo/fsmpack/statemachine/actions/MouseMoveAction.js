define([
	'goo/fsmpack/statemachine/actions/Action'
],
/** @lends */
	function(
	Action
	) {
	'use strict';

	function MouseMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function(/*event*/) {
			this.updated = true;
		}.bind(this);
	}

	MouseMoveAction.prototype = Object.create(Action.prototype);
	MouseMoveAction.prototype.constructor = MouseMoveAction;

	MouseMoveAction.external = {
		name: 'Mouse Move',
		type: 'controls',
		description: 'Listens for mouse movement and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mousemove',
			name: 'Mouse move',
			description: 'State to transition to on mouse movement'
		}]
	};

	MouseMoveAction.prototype._setup = function () {
		document.addEventListener('mousemove', this.eventListener);
	};

	MouseMoveAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.mousemove);
		}
	};

	MouseMoveAction.prototype.exit = function () {
		document.removeEventListener('mousemove', this.eventListener);
	};

	return MouseMoveAction;
});