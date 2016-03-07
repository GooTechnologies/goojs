define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function WasdAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	WasdAction.prototype = Object.create(Action.prototype);
	WasdAction.prototype.constructor = WasdAction;

	WasdAction.prototype.configure = function (settings) {
		this.targets = settings.transitions;
	};

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
		w: 'Key W Pressed',
		a: 'Key A Pressed',
		s: 'Key S Pressed',
		d: 'Key D Pressed'
	};

	WasdAction.getTransitionLabel = function(transitionKey/*, actionConfig*/){
		return labels[transitionKey];
	};

	WasdAction.prototype.enter = function (fsm) {
		this.eventListener = function (event) {
			var keyname = keys[event.which];
			if (keyname) {
				var target = this.targets[keyname];
				if (typeof target === 'string') {
					fsm.send(target);
				}
			}
		}.bind(this);

		document.addEventListener('keydown', this.eventListener);
	};

	WasdAction.prototype.exit = function () {
		document.removeEventListener('keydown', this.eventListener);
	};

	return WasdAction;
});