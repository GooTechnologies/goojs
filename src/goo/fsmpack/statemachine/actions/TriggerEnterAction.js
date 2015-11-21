var Action = require('../../../fsmpack/statemachine/actions/Action');
var SystemBus = require('../../../entities/SystemBus');

	'use strict';

	function TriggerEnterAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.entered = false;
		this.everyFrame = true;

		var that = this;
		this.listener = function (beginContactEvent) {
			if (beginContactEvent.entityA === that.entity || beginContactEvent.entityB === that.entity) {
				that.entered = true;
			}
		};
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
		SystemBus.addListener('goo.physics.triggerEnter', this.listener);
	};

	TriggerEnterAction.prototype._cleanup = function () {
		this.entity = null;
	};

	TriggerEnterAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerEnter', this.listener);
		this.entered = false;
	};

	TriggerEnterAction.prototype._run = function (fsm) {
		if (this.entered) {
			fsm.send(this.transitions.enter);
			this.entered = false;
		}
	};

	module.exports = TriggerEnterAction;