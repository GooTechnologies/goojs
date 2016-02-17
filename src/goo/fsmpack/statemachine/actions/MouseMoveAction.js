define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function MouseMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MouseMoveAction.prototype = Object.create(Action.prototype);
	MouseMoveAction.prototype.constructor = MouseMoveAction;

	MouseMoveAction.external = {
		name: 'Mouse / Touch Move',
		type: 'controls',
		description: 'Listens for mouse movement (mousemove) or touch movement (touchmove) on the canvas and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mousemove',
			name: 'Mouse move',
			description: 'State to transition to on mouse movement'
		}, {
			key: 'touchmove',
			name: 'Touch move',
			description: 'State to transition to on touch movement'
		}]
	};

	MouseMoveAction.prototype.enter = function (fsm) {
		var update = function (type) {
			if (type === 'mouse') {
				fsm.send(this.transitions.mousemove);
			} else {
				fsm.send(this.transitions.touchmove);
			}
		}.bind(this);

		this.mouseEventListener = function (/*event*/) {
			update('mouse');
		}.bind(this);

		this.touchEventListener = function (/*event*/) {
			update('touch');
		}.bind(this);

		document.addEventListener('mousemove', this.mouseEventListener);
		document.addEventListener('touchmove', this.touchEventListener);
	};

	MouseMoveAction.prototype.exit = function () {
		document.removeEventListener('mousemove', this.mouseEventListener);
		document.removeEventListener('touchmove', this.touchEventListener);
	};

	return MouseMoveAction;
});