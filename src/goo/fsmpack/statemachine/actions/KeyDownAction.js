var Action = require('../../../fsmpack/statemachine/actions/Action');
var FsmUtils = require('../../../fsmpack/statemachine/FsmUtils');

function KeyDownAction() {
	Action.apply(this, arguments);
}

KeyDownAction.prototype = Object.create(Action.prototype);
KeyDownAction.prototype.constructor = KeyDownAction;

KeyDownAction.external = {
	key: 'Key Down',
	name: 'Key Down',
	type: 'controls',
	description: 'Listens for a key press and performs a transition.',
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

KeyDownAction.getTransitionLabel = function (transitionKey, actionConfig) {
	return 'On Key ' + (actionConfig.options.key || '') + ' down';
};

KeyDownAction.prototype.configure = function (settings) {
	this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
	this.transitions = { keydown: settings.transitions.keydown };
};

KeyDownAction.prototype.enter = function () {
	this.eventListener = function (event) {
		if (this.key && event.which === +this.key) {
			this.sendEvent('keydown');
		}
	}.bind(this);
	document.addEventListener('keydown', this.eventListener);
};

KeyDownAction.prototype.exit = function () {
	document.removeEventListener('keydown', this.eventListener);
};

module.exports = KeyDownAction;