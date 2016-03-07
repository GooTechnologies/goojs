define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/entities/SystemBus'
], function (
	Action,
	SystemBus
) {
	'use strict';

	function TriggerEnterAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.entered = false;
		this.everyFrame = true;

		var that = this;
		this.listener = function (triggerEnterEvent) {
			if (triggerEnterEvent.entityA === that.entity || triggerEnterEvent.entityB === that.entity) {
				that.entered = true;
			}
		};
	}

	TriggerEnterAction.prototype = Object.create(Action.prototype);
	TriggerEnterAction.prototype.constructor = TriggerEnterAction;

	TriggerEnterAction.external = {
		name: 'TriggerEnter',
		type: 'collision',
		description: 'Transitions when the trigger collider is entered. This action only works if the entity has a Collider Component.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'enter',
			description: 'State to transition to when enter occurs.'
		}]
	};

	TriggerEnterAction.getTransitionLabel = function(transitionKey/*, actionConfig*/){
		return transitionKey === 'enter' ? 'On Trigger Enter' : undefined;
	};

	TriggerEnterAction.prototype.enter = function (fsm) {
		this.entity = fsm.getOwnerEntity();
		this.entered = false;
		SystemBus.addListener('goo.physics.triggerEnter', this.listener);
	};

	TriggerEnterAction.prototype._cleanup = function () {
		this.entity = null;
	};

	TriggerEnterAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerEnter', this.listener);
		this.entered = false;
	};

	TriggerEnterAction.prototype.update = function (fsm) {
		if (this.entered) {
			fsm.send(this.transitions.enter);
			this.entered = false;
		}
	};

	return TriggerEnterAction;
});