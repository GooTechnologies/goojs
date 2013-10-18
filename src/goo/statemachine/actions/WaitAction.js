define(['goo/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	/**
	 * @class
	 */
	function WaitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.currentTime = 0;
		this.increment = 1;

	}

	WaitAction.prototype = Object.create(Action.prototype);
	WaitAction.prototype.constructor = WaitAction;


	WaitAction.external = {
		parameters: [{
			name: 'Wait Time',
			key: 'waitTime',
			type: 'float',
			description: 'Time to wait before transition fires',
			"default": 5
		}],
		transitions: [{
			name: 'TimeUp',
			description: 'Fired on time up'
		}]
	};

	WaitAction.prototype.configure = function(settings) {
		this.everyFrame = true;
		this.waitTime = settings.waitTime;
		this.eventToEmit = { channel: settings.transitions.TimeUp };
	};

	WaitAction.prototype.pause = function() {
		this.increment = 0;
	};

	WaitAction.prototype.resume = function() {
		this.increment = 1;
	};
	WaitAction.prototype._setup = function() {
		this.currentTime = 0;
	};

	WaitAction.prototype._run = function(fsm) {
		/* jshint -W052 */
	//	console.log(this.currentTime, this.waitTime)
		this.currentTime += fsm.getTpf() * this.increment;
		if (this.currentTime >= this.waitTime) {
			fsm.send(this.eventToEmit.channel);
		}
	};



	return WaitAction;
});