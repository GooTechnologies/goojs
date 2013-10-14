define([
	'goo/statemachine/actions/Action'
],
/** @lends */
function(
	Action
) {
	"use strict";

	function ArrowAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.updated = false;
		this.keysPressed = {};

		this.eventListener = function(event) {
			var keyname = ArrowAction._keys[event.which];
			if (keyname !== undefined) {
				this.updated = true;
				this.keysPressed[keyname] = true;
			}
		}.bind(this);
	}

	ArrowAction.prototype = Object.create(Action.prototype);

	ArrowAction.prototype.configure = function(settings) {
		this.everyFrame = true;
		this.targets = settings.transitions;
	};

	ArrowAction._keys = {
		38:'up',
		37:'left',
		40:'down',
		39:'right'
	};

	ArrowAction.external = (function(){
		var transitions = [];
		for (var keycode in ArrowAction._keys) {
			var keyname = ArrowAction._keys[keycode];
			transitions.push({
				name: keyname,
				description: "Key '" + keyname + "' pressed"
			});
		}

		return {
			parameters: [],
			transitions: transitions
		};
	})();

	ArrowAction.prototype._setup = function() {
		document.addEventListener('keydown', this.eventListener);
	};

	ArrowAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			//var keyKeys = _.keys(ArrowAction._keys); // unused

			for (var keyname in this.keysPressed) {
				var target = this.targets[keyname];
				if (typeof target === 'string') {
					fsm.send(target, {});
				}
			}
			this.keysPressed = [];
		}
	};

	ArrowAction.prototype.exit = function() {
		document.removeEventListener('keydown', this.eventListener);
	};

	return ArrowAction;
});