define(['goo/fsmpack/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	function WaitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.currentTime = 0;
		this.totalWait = 0;
	}

	WaitAction.prototype = Object.create(Action.prototype);
	WaitAction.prototype.constructor = WaitAction;

	WaitAction.external = {
		name: 'Wait',
		description: 'Performs a transition after a specified amount of time',
		canTransition: true,
		parameters: [{
			name: 'Base Time',
			key: 'waitTime',
			type: 'number',
			description: 'Base time in seconds before transition fires',
			"default": 5
		}, {
			name: 'Random Time',
			key: 'randomTime',
			type: 'number',
			description: 'Add up to this much Random time to the base time',
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
		this.currentTime += fsm.getTpf();
		if (this.currentTime >= this.totalWait) {
			fsm.send(this.transitions.timeUp);
		}
	};

	return WaitAction;
});