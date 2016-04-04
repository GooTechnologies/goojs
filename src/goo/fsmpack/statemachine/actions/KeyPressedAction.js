var Action = require('../../../fsmpack/statemachine/actions/Action');
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

function KeyPressedAction(/*id, settings*/) {
	Action.apply(this, arguments);
}

KeyPressedAction.prototype = Object.create(Action.prototype);
KeyPressedAction.prototype.constructor = KeyPressedAction;

KeyPressedAction.external = {
	key: 'Key Pressed',
	name: 'Key Pressed',
	type: 'controls',
	description: 'Listens for a key press event and performs a transition. Works over transition boundaries.',
	canTransition: true,
	parameters: [{
		name: 'Key',
		key: 'key',
		type: 'string',
		control: 'key',
		description: 'Key to listen for.',
		'default': 'A'
	}],
	transitions: [{
		key: 'keydown',
		description: 'State to transition to when the key is pressed.'
	}]
};

KeyPressedAction.getTransitionLabel = function (transitionKey, actionConfig){
	return 'On Key ' + (actionConfig.options.key || '') + ' pressed';
};

KeyPressedAction.prototype.configure = function (settings) {
	this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
	this.transitions = { keydown: settings.transitions.keydown };
};

KeyPressedAction.prototype.enter = function (fsm) {
	if (fsm.getInputState(this.key)) {
		fsm.send(this.transitions.keydown);
	}
};

KeyPressedAction.prototype.update = function (fsm) {
	if (fsm.getInputState(this.key)) {
		fsm.send(this.transitions.keydown);
	}
};

module.exports = KeyPressedAction;