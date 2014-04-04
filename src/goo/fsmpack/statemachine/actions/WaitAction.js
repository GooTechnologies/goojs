define(['goo/fsmpack/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	function WaitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;

		/**
		 * Current time, in milliseconds.
		 * @type {Number}
		 */
		this.currentTime = 0;

		/**
		 * Wait time, in milliseconds.
		 * @type {Number}
		 */
		this.totalWait = 0;
	}

	WaitAction.prototype = Object.create(Action.prototype);
	WaitAction.prototype.constructor = WaitAction;

	WaitAction.external = {
		name: 'Wait',
		type: 'animation',
		description: 'Performs a transition after a specified amount of time',
		canTransition: true,
		parameters: [{
			name: 'Base Time',
			key: 'waitTime',
			type: 'number',
			description: 'Base time in milliseconds before transition fires',
			"default": 5000
		}, {
			name: 'Random Time',
			key: 'randomTime',
			type: 'number',
			description: 'A random number of milliseconds (between 0 and this value) will be added to the base wait time',
			"default": 0
		}],
		transitions: [{
			key: 'timeUp',
			name: 'Time up',
			description: 'State to transition to when time up'
		}]
	};

	WaitAction.prototype._setup = function() {
		this.currentTime = 0;
		this.totalWait = parseFloat(this.waitTime) + Math.random()*parseFloat(this.randomTime);
	};

	WaitAction.prototype._run = function(fsm) {
		this.currentTime += fsm.getTpf() * 1000;
		if (this.currentTime >= this.totalWait) {
			fsm.send(this.transitions.timeUp);
		}
	};

	return WaitAction;
});