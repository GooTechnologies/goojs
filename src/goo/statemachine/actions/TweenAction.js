define([
	'goo/statemachine/StateUtils',
	'goo/statemachine/actions/Actions'
	],
/** @lends */

function(
StateUtils,
Actions
) {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function TweenAction(settings) {
		this.type = 'TweenAction';

		settings = settings || {};

		this.script = settings.script || "$('button').css('padding-left', this.x + 'px');";
		this.time = settings.time || 1000;
		this.event = settings.event || 'dummy';
		this.from = settings.from || {
			x: 0
		};
		this.to = settings.to || {
			x: 100
		};
		this.easing = settings.easing || TWEEN.Easing.Elastic.InOut;
		this.tween = new TWEEN.Tween();

		this.external = {
			script: ['string', 'Tween action'],
			time: ['int', 'Time'],
			event: ['string', 'Send event'],
			from: ['json', 'From'],
			to: ['json', 'To'],
			easing: ['function', 'Easing']
		};
	}

	TweenAction.prototype = {
		create: function(fsm) {
			var that = this;
			this.tween.from(StateUtils.clone(this.from)).to(this.to, this.time).easing(this.easing).onUpdate(function() {
				eval(that.script);
			}).onComplete(function() {
				fsm.handle(this.event);
				console.log('complete:', this.event);
			}.bind(this)).start();
		},
		destroy: function() {
			this.tween.stop();
		}
	};

	Actions.register('TweenAction', TweenAction);
	return TweenAction;
});