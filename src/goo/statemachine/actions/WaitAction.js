define(['goo/statemachine/actions/Action'],
/** @lends */
function(Action) {
	"use strict";

	/**
	 * @class
	 */
	function WaitAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		this.time = settings.time || 1000;
		this.event = settings.event || 'dummy';

		this.external = {
			time: ['int', 'Time'],
			event: ['string', 'Send event']
		};

		this.currentTime = 0;
	}

	WaitAction.prototype = Object.create(Action.prototype);

	WaitAction.prototype.onCreate = function(/*fsm*/) {
		this.currentTime = 0;
	};

	WaitAction.prototype.onUpdate = function(fsm) {
		/* jshint -W052 */
		this.currentTime += ~~(fsm.getTpf() * 1000);
		if (this.currentTime >= this.time) {
			fsm.handle(this.event);
		}
	};

	return WaitAction;
});