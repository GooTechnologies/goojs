define([
	'goo/fsmpack/statemachine/actions/Action',
	'goo/entities/SystemBus'
], function (
	Action,
	SystemBus
) {
	'use strict';

	function TriggerLeaveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TriggerLeaveAction.prototype = Object.create(Action.prototype);
	TriggerLeaveAction.prototype.constructor = TriggerLeaveAction;

	TriggerLeaveAction.external = {
		name: 'TriggerLeave',
		type: 'collision',
		description: 'Transitions when a collider is leaving the entity trigger collider. This action only works if the entity has a Collider Component.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'leave',
			name: 'On leave',
			description: 'State to transition to when leave occurs'
		}]
	};

	TriggerLeaveAction.prototype.enter = function (fsm) {
		this.entity = fsm.getOwnerEntity();

		var that = this;
		this.listener = function (endContactEvent) {
			console.trace();
			if (that.entity && endContactEvent.entityA === that.entity || endContactEvent.entityB === that.entity) {
				that.entity = null;
				fsm.send(that.transitions.leave);
			}
		};
		SystemBus.addListener('goo.physics.triggerExit', this.listener);
	};

	TriggerLeaveAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerExit', this.listener);
	};

	return TriggerLeaveAction;
});