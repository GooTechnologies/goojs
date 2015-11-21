var Action = require('../../../fsmpack/statemachine/actions/Action');

	'use strict';

	function WasdAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.updated = false;
		this.keysPressed = {};

		this.eventListener = function (event) {
			var keyname = WasdAction._keys[event.which];
			if (keyname !== undefined) {
				this.updated = true;
				this.keysPressed[keyname] = true;
			}
		}.bind(this);
	}

	WasdAction.prototype = Object.create(Action.prototype);

	WasdAction.prototype.configure = function (settings) {
		this.everyFrame = true;
		this.targets = settings.transitions;
	};

	WasdAction._keys = {
		87: 'w',
		65: 'a',
		83: 's',
		68: 'd'
	};

	WasdAction.external = (function () {
		var transitions = [];
		for (var keycode in WasdAction._keys) {
			var keyname = WasdAction._keys[keycode];
			transitions.push({
				key: keyname,
				name: 'Key ' + keyname.toUpperCase(),
				description: "Key '" + keyname + "' pressed"
			});
		}

		return {
			key: 'WASD Keys Listener',
			name: 'WASD Keys',
			type: 'controls',
			description: 'Transitions to other states when the WASD keys are pressed',
			canTransition: true,
			parameters: [],
			transitions: transitions
		};
	})();

	WasdAction.prototype._setup = function () {
		document.addEventListener('keydown', this.eventListener);
	};

	WasdAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			//var keyKeys = _.keys(WasdAction._keys); // unused

			for (var keyname in this.keysPressed) {
				var target = this.targets[keyname];
				if (typeof target === 'string') {
					fsm.send(target);
				}
			}
			this.keysPressed = [];
		}
	};

	WasdAction.prototype.exit = function () {
		document.removeEventListener('keydown', this.eventListener);
	};

	module.exports = WasdAction;