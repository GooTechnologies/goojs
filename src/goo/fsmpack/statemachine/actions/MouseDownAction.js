define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function MouseDownAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function(event) {
			this.button = event.button;
			this.updated = true;
		}.bind(this);
	}

	MouseDownAction.prototype = Object.create(Action.prototype);
	MouseDownAction.prototype.constructor = MouseDownAction;

	MouseDownAction.external = {
		name: 'Mouse Down',
		type: 'controls',
		description: 'Listens for a mouse button press and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseLeftDown',
			name: 'Left mouse down',
			description: 'State to transition to when the left mouse button is pressed'
		}, {
			key: 'middleMouseDown',
			name: 'Middle mouse down',
			description: 'State to transition to when the middle mouse button is pressed'
		}, {
			key: 'rightMouseDown',
			name: 'Right mouse down',
			description: 'State to transition to when the right mouse button is pressed'
		}]
	};

	// REVIEW: This should use gooRunner events, rather than attaching listeners to the document
	MouseDownAction.prototype._setup = function() {
		document.addEventListener('mousedown', this.eventListener);
	};

	MouseDownAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send([this.transitions.mouseLeftDown, this.transitions.middleMouseDown, this.transitions.rightMouseDown][this.button]);
		}
	};

	MouseDownAction.prototype.exit = function() {
		document.removeEventListener('mousedown', this.eventListener);
	};

	return MouseDownAction;
});