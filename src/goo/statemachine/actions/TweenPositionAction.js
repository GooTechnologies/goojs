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
	function TweenPositionAction(settings) {
		settings = settings || {};

		this.entity = settings.entity || null;
		this.time = settings.time || 2000;
		this.event = settings.event || 'dummy';
		this.from = settings.from || {
			x: -5,
			y: 0,
			z: 0
		};
		this.to = settings.to || {
			x: 5,
			y: 0,
			z: 0
		};
		this.easing = settings.easing || window.TWEEN.Easing.Elastic.InOut;
		this.tween = new window.TWEEN.Tween();

		this.external = {
			entity: ['entity', 'Entity'],
			time: ['int', 'Time'],
			event: ['string', 'Send event'],
			from: ['json', 'From'],
			to: ['json', 'To'],
			easing: ['function', 'Easing']
		};
	}

	TweenPositionAction.prototype = {
		onCreate: function(fsm) {
			var that = this;
			this.tween.from(StateUtils.clone(this.from)).to(this.to, this.time).easing(this.easing).onUpdate(function() {
				if (that.entity !== null) {
					that.entity.transformComponent.transform.translation.setd(this.x, this.y, this.z);
					that.entity.transformComponent.setUpdated();
				}
			}).onComplete(function() {
				fsm.handle(this.event);
				console.log('complete:', this.event);
			}.bind(this)).start();
		},
		onDestroy: function() {
			this.tween.stop();
		}
	};

	Actions.register('TweenPositionAction', TweenPositionAction);
	return TweenPositionAction;
});