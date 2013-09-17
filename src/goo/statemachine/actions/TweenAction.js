define([
	'goo/statemachine/actions/Action',
	'goo/statemachine/StateUtils'
	],
/** @lends */

function(
	Action,
	StateUtils
) {
	"use strict";

	function TweenAction(settings) {
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
		this.easing = settings.easing || window.TWEEN.Easing.Elastic.InOut;
		this.tween = new window.TWEEN.Tween();

		this.external = {
			script: ['string', 'Tween action'],
			time: ['int', 'Time'],
			event: ['string', 'Send event'],
			from: ['json', 'From'],
			to: ['json', 'To'],
			easing: ['function', 'Easing']
		};
	}

	TweenAction.prototype = Object.create(Action.prototype);

	TweenAction.prototype.onCreate = function(fsm) {
		var that = this;
		this.tween.from(StateUtils.clone(this.from)).to(this.to, this.time).easing(this.easing).onUpdate(function() {
			/* jshint evil: true */
			eval(that.script);
		}).onComplete(function() {
			fsm.handle(this.event);
			console.log('complete:', this.event);
		}.bind(this)).start();
	};

	TweenAction.prototype.onDestroy = function() {
		this.tween.stop();
	};

	return TweenAction;
});