define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function MouseMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.mouseOrTouch = null;

		this.mouseEventListener = function (/*event*/) {
			this.updated = true;
			this.mouseOrTouch = 'mouse';
		}.bind(this);

		this.touchEventListener = function (/*event*/) {
			this.updated = true;
			this.mouseOrTouch = 'touch';
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
		}, {
			key: 'touchmove',
			name: 'Touch move',
			description: 'State to transition to on touch movement'
		}]
	};

	MouseMoveAction.prototype._setup = function () {
		document.addEventListener('mousemove', this.mouseEventListener);
		document.addEventListener('touchmove', this.touchEventListener);
	};

	MouseMoveAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.mouseOrTouch === 'mouse') {
				fsm.send(this.transitions.mousemove);
			} else {
				fsm.send(this.transitions.touchmove);
			}
		}
	};

	MouseMoveAction.prototype.exit = function () {
		document.removeEventListener('mousemove', this.mouseEventListener);
		document.removeEventListener('touchmove', this.touchEventListener);
	};

	return MouseMoveAction;
});