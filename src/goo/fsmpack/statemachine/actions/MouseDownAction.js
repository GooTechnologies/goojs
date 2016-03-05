define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function MouseDownAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MouseDownAction.prototype = Object.create(Action.prototype);
	MouseDownAction.prototype.constructor = MouseDownAction;

	MouseDownAction.external = {
		name: 'Mouse Down / Touch Start',
		type: 'controls',
		description: 'Listens for a mousedown event (or touchstart) on the canvas and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseLeftDown',
			description: 'State to transition to when the left mouse button is pressed'
		}, {
			key: 'middleMouseDown',
			description: 'State to transition to when the middle mouse button is pressed'
		}, {
			key: 'rightMouseDown',
			description: 'State to transition to when the right mouse button is pressed'
		}, {
			key: 'touchDown',
			description: 'State to transition to when the touch event begins'
		}]
	};

	var labels = {
		mouseLeftDown: 'Left mouse down',
		middleMouseDown: 'Middle mouse down',
		rightMouseDown: 'Right mouse down',
		touchDown: 'Touch begin'
	};

	MouseDownAction.getTransitionLabel = function(transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	MouseDownAction.prototype.enter = function (fsm) {
		var update = function (button) {
			if (button === 'touch') {
				fsm.send(this.transitions.touchDown);
			} else {
				fsm.send([
					this.transitions.mouseLeftDown,
					this.transitions.middleMouseDown,
					this.transitions.rightMouseDown
				][button]);
			}
		}.bind(this);

		this.mouseEventListener = function (event) {
			update(event.button);
		}.bind(this);

		this.touchEventListener = function () {
			update('touch');
		}.bind(this);

		document.addEventListener('mousedown', this.mouseEventListener);
		document.addEventListener('touchstart', this.touchEventListener);
	};

	MouseDownAction.prototype.exit = function () {
		document.removeEventListener('mousedown', this.mouseEventListener);
		document.removeEventListener('touchstart', this.touchEventListener);
	};

	return MouseDownAction;
});