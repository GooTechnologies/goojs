define(['goo/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	/**
	 * @class
	 */
	function WaitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.currentTime = 0;
		this.increment = 1;
	}

	WaitAction.prototype = Object.create(Action.prototype);
	WaitAction.prototype.constructor = WaitAction;

	WaitAction.external = {
		parameters: [{
			name: 'Wait Time',
			key: 'waitTime',
			type: 'number',
			description: 'Time to wait before transition fires',
			"default": 5
		}],
		transitions: [{
			name: 'TimeUp',
			description: 'Fired on time up'
		}]
	};

	WaitAction.prototype._setup = function() {
		this.currentTime = 0;
	};

	WaitAction.prototype._run = function(fsm) {
		this.currentTime += fsm.getTpf() * this.increment;
		if (this.currentTime >= this.waitTime) {
			fsm.send(this.transitions.TimeUp);
		}
	};

	return WaitAction;
});