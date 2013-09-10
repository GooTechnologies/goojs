define([
	'goo/statemachine/actions/Actions'
],
/** @lends */
function(
	Actions
) {
	"use strict";

	/**
	 * @class
	 */
	function WaitAction(settings) {
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
		onCreate: function(/*fsm*/) {
			this.currentTime = 0;
		},
		onUpdate: function(fsm, state, tpf) {
			/* jshint -W052 */
			this.currentTime += ~~(tpf * 1000);
			if (this.currentTime >= this.time) {
				fsm.handle(this.event);
			}
		}
	};

	Actions.register('WaitAction', WaitAction);
	return WaitAction;
});