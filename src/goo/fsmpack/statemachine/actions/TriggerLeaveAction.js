var Action = require('../../../fsmpack/statemachine/actions/Action');
var SystemBus = require('../../../entities/SystemBus');

function TriggerLeaveAction() {
	Action.apply(this, arguments);
	this.entity = null;
}

TriggerLeaveAction.prototype = Object.create(Action.prototype);
TriggerLeaveAction.prototype.constructor = TriggerLeaveAction;

TriggerLeaveAction.external = {
	key: 'TriggerLeave',
	name: 'TriggerLeave',
	type: 'collision',
	description: 'Transitions when a collider is leaving the entity trigger collider. This action only works if the entity has a Collider Component.',
	canTransition: true,
	parameters: [],
	transitions: [{
		key: 'leave',
		description: 'State to transition to when leave occurs.'
	}]
};

TriggerLeaveAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
	return transitionKey === 'leave' ? 'On Trigger Leave' : undefined;
};

TriggerLeaveAction.prototype.enter = function () {
	this.entity = this.getEntity();
	var that = this;
	this.listener = function (endContactEvent) {
		if (that.entity && endContactEvent.entityA === that.entity || endContactEvent.entityB === that.entity) {
			that.entity = null;
			// TODO: should this happen on postStep instead? Maybe the user will remove the entity here...
			that.sendEvent('leave');
		}
	};
	SystemBus.addListener('goo.physics.triggerExit', this.listener);
};

TriggerLeaveAction.prototype.exit = function () {
	SystemBus.removeListener('goo.physics.triggerExit', this.listener);
	this.entity = null;
};

module.exports = TriggerLeaveAction;