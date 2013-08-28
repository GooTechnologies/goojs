define([
],
/** @lends */
function(
) {
	"use strict";

	/**
	 * @class
	 */
	function WaitAction(settings) {
		this.type = 'WaitAction';

		settings = settings || {};

		this.time = settings.time || 1000;
		this.event = settings.event || 'dummy';

		this.external = {
			time: ['int', 'Time'],
			event: ['string', 'Send event']
		};

		this.currentTime = 0;
	}

	WaitAction.prototype = {
		create: function(fsm) {
			this.currentTime = 0;
		},
		update: function(fsm, state, tpf) {
			this.currentTime += ~~(tpf * 1000);
			if (this.currentTime >= this.time) {
				fsm.handle(this.event);
			}
		},
		destroy: function() {
		}
	};

	return WaitAction;
});