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

		this.listener = function (beginContactEvent) {
			if (beginContactEvent.entityA === this.entity || beginContactEvent.entityB === this.entity) {
				this.entered = true;
			}
		}.bind(this);
	}

	TriggerEnterAction.prototype = Object.create(Action.prototype);
	TriggerEnterAction.prototype.constructor = TriggerEnterAction;

	TriggerEnterAction.external = {
		name: 'TriggerEnter',
		type: 'collision',
		description: 'Transitions when a trigger volume is entered.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'enter',
			name: 'On enter',
			description: 'State to transition to when enter occurs'
		}]
	};

	TriggerEnterAction.prototype._setup = function (fsm) {
		this.entity = fsm.getOwnerEntity();
		this.entered = false;
		SystemBus.addListener('goo.physics.beginContact', this.listener);
	};

	TriggerEnterAction.prototype._cleanup = function () {
		this.entity = null;
	};

	TriggerEnterAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.beginContact', this.listener);
		this.entered = false;
	};

	TriggerEnterAction.prototype._run = function (fsm) {
		if (this.entered) {
			fsm.send(this.transitions.enter);
			this.entered = false;
		}
	};

	return TriggerEnterAction;
});