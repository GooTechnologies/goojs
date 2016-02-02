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

		this.leaved = false;
		this.everyFrame = true;

		var that = this;
		this.listener = function (endContactEvent) {
			if (endContactEvent.entityA === that.entity || endContactEvent.entityB === that.entity) {
				that.leaved = true;
			}
		};
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

	TriggerLeaveAction.prototype._setup = function (fsm) {
		this.entity = fsm.getOwnerEntity();
		this.leaved = false;
		SystemBus.addListener('goo.physics.triggerExit', this.listener);
	};

	TriggerLeaveAction.prototype._cleanup = function () {
		this.entity = null;
	};

	TriggerLeaveAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerExit', this.listener);
		this.leaved = false;
	};

	TriggerLeaveAction.prototype._run = function (fsm) {
		if (this.leaved) {
			fsm.send(this.transitions.leave);
			this.leaved = false;
		}
	};

	return TriggerLeaveAction;
});