var Action = require('../../../fsmpack/statemachine/actions/Action');
var SystemBus = require('../../../entities/SystemBus');

function TriggerEnterAction() {
	Action.apply(this, arguments);
	this.entity = null;
}

TriggerEnterAction.prototype = Object.create(Action.prototype);
TriggerEnterAction.prototype.constructor = TriggerEnterAction;

TriggerEnterAction.external = {
	key: 'TriggerEnter',
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

TriggerEnterAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
	return transitionKey === 'enter' ? 'On Trigger Enter' : undefined;
};

TriggerEnterAction.prototype.enter = function () {
	this.entity = this.getEntity();
	var that = this;
	this.listener = function (triggerEnterEvent) {
		if (that.entity && triggerEnterEvent.entityA === that.entity || triggerEnterEvent.entityB === that.entity) {
			that.entity = null;
			// TODO: should this happen on postStep instead? Maybe the user will remove the entity here...
			that.sendEvent('enter');
		}
	};
	SystemBus.addListener('goo.physics.triggerEnter', this.listener);
};

TriggerEnterAction.prototype.exit = function (/*fsm*/) {
	SystemBus.removeListener('goo.physics.triggerEnter', this.listener);
	this.entity = null;
};

module.exports = TriggerEnterAction;