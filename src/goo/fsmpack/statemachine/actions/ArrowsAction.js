define([
	'goo/fsmpack/statemachine/actions/Action'
], function (
	Action
) {
	'use strict';

	function ArrowsAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.updated = false;
		this.keysPressed = {};

		this.eventListener = function(event) {
			var keyname = ArrowsAction._keys[event.which];
			if (keyname !== undefined) {
				this.updated = true;
				this.keysPressed[keyname] = true;
			}
		}.bind(this);
	}

	ArrowsAction.prototype = Object.create(Action.prototype);

	ArrowsAction.prototype.configure = function(settings) {
		this.everyFrame = true;
		this.targets = settings.transitions;
	};

	ArrowsAction._keys = {
		38: 'up',
		37: 'left',
		40: 'down',
		39: 'right'
	};

	ArrowsAction.external = (function() {
		var transitions = [];
		for (var keycode in ArrowsAction._keys) {
			var keyname = ArrowsAction._keys[keycode];
			transitions.push({
				name: 'Key ' + keyname.toUpperCase(),
				key: keyname,
				description: "Key '" + keyname + "' pressed"
			});
		}

		return {
			key: 'Arrow Keys Listener',
			name: 'Arrow Keys',
			type: 'controls',
			description: 'Transitions to other states when arrow keys are pressed',
			canTransition: true,
			parameters: [],
			transitions: transitions
		};
	})();

	ArrowsAction.prototype._setup = function() {
		document.addEventListener('keydown', this.eventListener);
	};

	ArrowsAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			//var keyKeys = _.keys(ArrowAction._keys); // unused

			for (var keyname in this.keysPressed) {
				var target = this.targets[keyname];
				if (typeof target === 'string') {
					fsm.send(target);
				}
			}
			this.keysPressed = [];
		}
	};

	ArrowsAction.prototype.exit = function() {
		document.removeEventListener('keydown', this.eventListener);
	};

	return ArrowsAction;
});