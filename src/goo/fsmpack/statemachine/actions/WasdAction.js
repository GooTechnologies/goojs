var Action = require('../../../fsmpack/statemachine/actions/Action');

function WasdAction() {
	Action.apply(this, arguments);
}

WasdAction.prototype = Object.create(Action.prototype);
WasdAction.prototype.constructor = WasdAction;

var keys = {
	87: 'w',
	65: 'a',
	83: 's',
	68: 'd'
};

WasdAction.external = (function () {
	var transitions = [];
	for (var keycode in keys) {
		var keyname = keys[keycode];
		transitions.push({
			key: keyname,
			name: 'On key ' + keyname.toUpperCase(),
			description: "On key '" + keyname + "' pressed."
		});
	}

	return {
		key: 'WASD Keys Listener',
		name: 'WASD Keys',
		type: 'controls',
		description: 'Transitions to other states when the WASD keys are pressed.',
		canTransition: true,
		parameters: [],
		transitions: transitions
	};
})();

var labels = {
	w: 'On Key W Pressed',
	a: 'On Key A Pressed',
	s: 'On Key S Pressed',
	d: 'On Key D Pressed'
};

WasdAction.getTransitionLabel = function (transitionKey/*, actionConfig*/){
	return labels[transitionKey];
};

WasdAction.prototype.enter = function () {
	this.eventListener = function (event) {
		var keyname = keys[event.which];
		if (keyname) {
			this.sendEvent(keyname);
		}
	}.bind(this);

	document.addEventListener('keydown', this.eventListener);
};

WasdAction.prototype.exit = function () {
	document.removeEventListener('keydown', this.eventListener);
};

module.exports = WasdAction;