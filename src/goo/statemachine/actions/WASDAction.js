define([
	'goo/statemachine/actions/Action',
	'goo/statemachine/FSMUtil',
	'goo/util/ObjectUtil'
],
/** @lends */
function(
	Action,
	FSMUtil,
	_
) {
	"use strict";

	function WASDAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.updated = false;
		this.keysPressed = {};

		this.eventListener = function(event) {
			var keyname = WASDAction._keys[event.which];
			if (keyname !== undefined) {
				this.updated = true;
				this.keysPressed[keyname] = true;
			}
		}.bind(this);
	}

	WASDAction.prototype = Object.create(Action.prototype);

	WASDAction.prototype.configure = function(settings) {
		this.everyFrame = true;
		this.targets = settings.transitions;
	};

	WASDAction._keys = {
		87:'w',
		65:'a',
		83:'s',
		68:'d',
		38:'up',
		37:'left',
		40:'down',
		39:'right',
		32:'space'
	};

	WASDAction.external = (function(){
		var transitions = [];
		for (var keycode in WASDAction._keys) {
			var keyname = WASDAction._keys[keycode];
			transitions.push({
				name: keyname,
				description: "Key '" + keyname + "' pressed"
			});
		}

		return {
			transitions:transitions,
			parameters: []
		};
	})();

	WASDAction.prototype._setup = function() {
		document.addEventListener('keydown', this.eventListener);
	};

	WASDAction.prototype._run = function(fsm) {
		if (this.updated) {
			this.updated = false;
			var keyKeys = _.keys(WASDAction._keys);

			for (var keyname in this.keysPressed) {
				var target = this.targets[keyname];
				if (typeof target === 'string') {
					fsm.send(target, {});
				}
			}
			this.keysPressed = [];
		}
	};

	WASDAction.prototype.exit = function() {
		document.removeEventListener('keydown', this.eventListener);
	};

	return WASDAction;
});