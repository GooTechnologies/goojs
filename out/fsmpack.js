goo.State = (function (
	ArrayUtils
) {
	'use strict';

	function State(uuid) {
		this.uuid = uuid;
		this._fsm = null;
		this.parent = null;
		this._actions = [];
		this._machines = [];
		this._transitions = {};
		this.vars = {};

		this.transitionTarget = null;

		this.proxy = {
			getTpf: function () {
				return this._fsm.entity._world.tpf;
			}.bind(this),
			getWorld: function () {
				return this._fsm.entity._world;
			}.bind(this),
			getTime: function () {
				return this._fsm.system.time;
			}.bind(this),
			getState: function () {
				return this;
			}.bind(this),
			getFsm: function () {
				return this._fsm;
			}.bind(this),
			getOwnerEntity: function () {
				return this._fsm && this._fsm.entity;
			}.bind(this),
			getEntityById: function (id) {
				return this._fsm.entity._world.by.id(id).first();
			}.bind(this),
			send: function (channels/*, data*/) {
				if (channels) {
					if (typeof channels === 'string' && this._transitions[channels]) {
						this.requestTransition(this._transitions[channels]);
					}
				}
			}.bind(this),
			addListener: function (channelName, callback) {
				this._fsm._bus.addListener(channelName, callback);
			}.bind(this),
			removeListener: function (channelName, callback) {
				this._fsm._bus.removeListener(channelName, callback);
			}.bind(this),
			defineVariable: function (name, initialValue) {
				this.vars[name] = initialValue;
			}.bind(this),
			removeVariable: function (name) {
				delete this.vars[name];
			}.bind(this),
			getVariable: function (name) {
				if (this.vars[name] !== undefined) {
					return this.vars[name];
				} else {
					return this._fsm.getVariable(name);
				}
			}.bind(this),
			applyOnVariable: function (name, fun) {
				if (this.vars[name] !== undefined) {
					this.vars[name] = fun(this.vars[name]);
				} else {
					this._fsm.applyOnVariable(name, fun);
				}
			}.bind(this),
			getEvalProxy: function () {
				return this._fsm.system.evalProxy;
			}.bind(this)
		};
	}

	State.prototype.setRefs = function (parentFSM) {
		this._fsm = parentFSM;
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.setRefs(parentFSM);
		}
	};

	State.prototype.isCurrentState = function () {
		return this === this.parent.getCurrentState();
	};

	State.prototype.requestTransition = function (target) {
		if (this.isCurrentState()) {
			this.transitionTarget = target;
		}
	};

	State.prototype.setTransition = function (eventName, target) {
		this._transitions[eventName] = target;
	};

	State.prototype.clearTransition = function (eventName) {
		delete this._transitions[eventName];
	};

	State.prototype.update = function () {
		// do on update of self
		for (var i = 0; i < this._actions.length; i++) {
			this._actions[i].update(this.proxy);
			if (this.transitionTarget) {
				var tmp = this.transitionTarget;
				this.transitionTarget = null;
				return tmp;
			}
		}

		var jump;
		// propagate on update
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			jump = machine.update();
			if (jump) {
				return jump;
			}
		}
	};

	State.prototype.reset = function () {
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].reset();
		}
	};

	State.prototype.kill = function () {
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].kill();
		}
		for (var i = 0; i < this._actions.length; i++) {
			this._actions[i].exit(this.proxy);
		}
	};

	State.prototype.ready = function () {
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].ready();
		}
		for (var i = 0; i < this._actions.length; i++) {
			this._actions[i].ready(this.proxy);
		}
	};

	State.prototype.cleanup = function () {
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].cleanup();
		}
		for (var i = 0; i < this._actions.length; i++) {
			this._actions[i].cleanup(this.proxy);
		}
	};

	State.prototype.enter = function () {
		// on enter of self
		for (var i = 0; i < this._actions.length; i++) {
			this._actions[i].enter(this.proxy);
		}

		// propagate on enter
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].enter();
		}
	};

	State.prototype.getAction = function (id) {
		if (!this._actions) {
			return undefined;
		}
		for (var i = 0; i < this._actions.length; i++) {
			var action = this._actions[i];
			if (id !== undefined && action.id === id) {
				return action;
			}
		}
		return undefined;
	};

	State.prototype.addAction = function (action) {
		// check if action is already added
		if (this._actions[action.id]) {
			return;
		}

		if (action.onCreate) {
			action.onCreate(this.proxy);
		}
		this._actions.push(action);
	};

	State.prototype.recursiveRemove = function () {
		this.removeAllActions();
		for (var i = 0; i < this._machines.length; i++) {
			this._machines[i].recursiveRemove();
		}
		this._machines = [];
	};

	State.prototype.removeAllActions = function () {
		for (var i = 0; i < this._actions.length; i++) {
			var action = this._actions[i];
			if (action.onDestroy) {
				action.onDestroy(this.proxy);
			}
		}
		this._actions = [];
	};

	State.prototype.removeAction = function (action) {
		if (action.onDestroy) {
			action.onDestroy(this.proxy);
		}

		ArrayUtils.remove(this._actions, action);
	};

	State.prototype.addMachine = function (machine) {
		var index = this._machines.indexOf(machine);
		if (index === -1) {
			machine._fsm = this._fsm;
			machine.parent = this;
			this._machines.push(machine);
		}
	};

	State.prototype.removeMachine = function (machine) {
		machine.recursiveRemove();
		ArrayUtils.remove(this._machines, machine);
	};

	return State;
})(goo.ArrayUtils);
goo.Machine = (function (

) {
	'use strict';

	function Machine(name) {
		this.name = name;
		this._states = {};
		this._fsm = null;
		this.initialState = 'entry';
		this.currentState = null;
		this.parent = null;
	}

	Machine.prototype.setRefs = function (parentFSM) {
		this._fsm = parentFSM;
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.setRefs(parentFSM);
		}
	};

	Machine.prototype.update = function () {
		if (this.currentState) {
			var jump = this.currentState.update();

			if (jump && this.contains(jump)) {
				this.currentState.kill();
				this.setState(this._states[jump]);
			}

			return jump;
		}
	};

	Machine.prototype.contains = function (uuid) {
		return !!this._states[uuid];
	};

	Machine.prototype.setState = function (state) {
		// change state
		this.currentState = state;

		// reset initial state of child machines
		this.currentState.reset();

		// do on enter of new state
		this.currentState.enter();
	};

	Machine.prototype.reset = function () {
		// reset self
		this.currentState = this._states[this.initialState];

		// propagate reset
		if (this.currentState) {
			this.currentState.reset();
		}
	};

	Machine.prototype.kill = function () {
		if (this.currentState) {
			this.currentState.kill();
		}
	};

	Machine.prototype.ready = function () {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.ready();
		}
	};

	Machine.prototype.cleanup = function () {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.cleanup();
		}
	};

	Machine.prototype.enter = function () {
		if (this.currentState) {
			this.currentState.enter();
		}
	};

	Machine.prototype.getCurrentState = function () {
		return this.currentState;
	};

	Machine.prototype.addState = function (state) {
		if (Object.keys(this._states).length === 0) {
			this.initialState = state.uuid;
		}
		state.parent = this;
		state._fsm = this._fsm;
		this._states[state.uuid] = state;
	};

	Machine.prototype.removeFromParent = function () {
		if (this.parent) {
			this.parent.removeMachine(this);
		}
	};

	Machine.prototype.recursiveRemove = function () {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.recursiveRemove();
		}
		this._states = {};
	};

	Machine.prototype.removeState = function (id) {
		if (!this._states[id]) { return; }
		if (this.initialState === id) { throw new Error('Cannot remove initial state'); }
		if (this.currentState === this._states[id]) {
			this.reset();
		}
		delete this._states[id];
	};

	Machine.prototype.setInitialState = function (initialState) {
		this.initialState = initialState;
	};

	return Machine;
})();
goo.FsmUtils = (function () {
	'use strict';

	function FsmUtils() {
	}

	FsmUtils.setParameters = function (settings, externalParameters) {
		for (var i = 0; i < externalParameters.length; i++) {
			var externalParameter = externalParameters[i];
			var key = externalParameter.key;

			if (typeof settings[key] !== 'undefined') {
				this[key] = settings[key];
			} else {
				this[key] = externalParameter['default'];
			}
		}
	};

	FsmUtils.setTransitions = function (settings, externalTransitions) {
		for (var i = 0; i < externalTransitions.length; i++) {
			var externalTransition = externalTransitions[i];
			var key = externalTransition.key;

			this.transitions = this.transitions || {};
			this.transitions[key] = settings.transitions[key];
		}
	};

	FsmUtils.getKey = function (str) {
		if (FsmUtils.keys[str]) {
			return FsmUtils.keys[str];
		} else {
			return str.charCodeAt(0);
		}
	};

	FsmUtils.keys = {
		'Backspace': 8,
		'Tab': 9,
		'Enter': 13,
		'Shift': 16,
		'Ctrl': 17,
		'Alt': 18,
		'Pause': 19,
		'Capslock': 20,
		'Esc': 27,
		'Space':32,
		'Pageup': 33,
		'Pagedown': 34,
		'End': 35,
		'Home': 36,
		'Leftarrow': 37,
		'Uparrow': 38,
		'Rightarrow': 39,
		'Downarrow': 40,
		'Insert': 45,
		'Delete': 46,
		'0': 48,
		'1': 49,
		'2': 50,
		'3': 51,
		'4': 52,
		'5': 53,
		'6': 54,
		'7': 55,
		'8': 56,
		'9': 57,
		'a': 65,
		'b': 66,
		'c': 67,
		'd': 68,
		'e': 69,
		'f': 70,
		'g': 71,
		'h': 72,
		'i': 73,
		'j': 74,
		'k': 75,
		'l': 76,
		'm': 77,
		'n': 78,
		'o': 79,
		'p': 80,
		'q': 81,
		'r': 82,
		's': 83,
		't': 84,
		'u': 85,
		'v': 86,
		'w': 87,
		'x': 88,
		'y': 89,
		'z': 90,
		'A': 65,
		'B': 66,
		'C': 67,
		'D': 68,
		'E': 69,
		'F': 70,
		'G': 71,
		'H': 72,
		'I': 73,
		'J': 74,
		'K': 75,
		'L': 76,
		'M': 77,
		'N': 78,
		'O': 79,
		'P': 80,
		'Q': 81,
		'R': 82,
		'S': 83,
		'T': 84,
		'U': 85,
		'V': 86,
		'W': 87,
		'X': 88,
		'Y': 89,
		'Z': 90,
		'0numpad': 96,
		'1numpad': 97,
		'2numpad': 98,
		'3numpad': 99,
		'4numpad': 100,
		'5numpad': 101,
		'6numpad': 102,
		'7numpad': 103,
		'8numpad': 104,
		'9numpad': 105,
		'Multiply': 106,
		'Plus': 107,
		'Minus': 109,
		'Dot': 110,
		'Slash1': 111,
		'F1': 112,
		'F2': 113,
		'F3': 114,
		'F4': 115,
		'F5': 116,
		'F6': 117,
		'F7': 118,
		'F8': 119,
		'F9': 120,
		'F10': 121,
		'F11': 122,
		'F12': 123,
		'Equals': 187,
		'Comma': 188,
		'Slash': 191,
		'Backslash': 220
	};

	FsmUtils.keyInverse = [];

	function buildKeyInverse(assoc) {
		var inverseAssoc = [];

		var keys = Object.keys(assoc);
		for (var i = 0; i < keys.length; i++) {
			inverseAssoc[assoc[keys[i]]] = keys[i];
		}

		return inverseAssoc;
	}

	FsmUtils.keyInverse = buildKeyInverse(FsmUtils.keys);

	FsmUtils.keyForCode = function(code) {
		if (FsmUtils.keyInverse[code]) {
			return FsmUtils.keyInverse[code];
		}
		return 'FsmUtils.keyForCode: key not found for code ' + code;
	};

	var s4 = function () {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	};

	// Random unique id
	FsmUtils.guid = function() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	};

	FsmUtils.getValue = function(par, fsm) {
		if (typeof par === 'number') {
			return par;
		} else {
			return fsm.getVariable(par);
		}
	};

	return FsmUtils;
})();
goo.Action = (function (
	FsmUtils
) {
	'use strict';

	/**
	 * @param {string} id
	 * @param {Object} settings
	 * @private
	 */
	function Action(id, settings) {
		this.id = id;
		this.configure(settings || {});
	}

	/* this gets executed on enter - override this if needed */
	Action.prototype._setup = function (/*fsm*/) {
	};

	/* this gets executed on enter or on update depending on `everyFrame` - override this */
	Action.prototype._run = function (/*fsm*/) {
	};

	/* this should be called by the constructor and by the handlers when new options are loaded */
	Action.prototype.configure = function (settings) {
		FsmUtils.setParameters.call(this, settings, this.constructor.external.parameters);
		FsmUtils.setTransitions.call(this, settings, this.constructor.external.transitions);
	};

	/* this is called by external functions - called once, when the host state becomes active */
	Action.prototype.enter = function (fsm) {
		this._setup(fsm);
		if (!this.everyFrame) {
			this._run(fsm);
		}
	};

	/* this is called by external functions - called on every frame */
	Action.prototype.update = function (fsm) {
		if (this.everyFrame) {
			this._run(fsm);
		}
	};

	/* this is called when the machine just started */
	Action.prototype.ready = function (/*fsm*/) {
	};

	/* this is called when the machine stops and makes sure that any changes not undone by exit methods get undone */
	Action.prototype.cleanup = function (/*fsm*/) {
	};

	/* this is called by external functions; also the place to cleanup whatever _setup did */
	Action.prototype.exit = function (/*fsm*/) {
	};

	return Action;
})(goo.FsmUtils);
goo.ArrowsAction = (function (
	Action
) {
	'use strict';

	function ArrowsAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.updated = false;
		this.keysPressed = {};

		this.eventListener = function (event) {
			var keyname = ArrowsAction._keys[event.which];
			if (keyname !== undefined) {
				this.updated = true;
				this.keysPressed[keyname] = true;
			}
		}.bind(this);
	}

	ArrowsAction.prototype = Object.create(Action.prototype);

	ArrowsAction.prototype.configure = function (settings) {
		this.everyFrame = true;
		this.targets = settings.transitions;
	};

	ArrowsAction._keys = {
		38: 'up',
		37: 'left',
		40: 'down',
		39: 'right'
	};

	ArrowsAction.external = (function () {
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

	ArrowsAction.prototype._setup = function () {
		document.addEventListener('keydown', this.eventListener);
	};

	ArrowsAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;

			for (var keyname in this.keysPressed) {
				var target = this.targets[keyname];
				if (typeof target === 'string') {
					fsm.send(target);
				}
			}
			this.keysPressed = {};
		}
	};

	ArrowsAction.prototype.exit = function () {
		document.removeEventListener('keydown', this.eventListener);
	};

	return ArrowsAction;
})(goo.Action);
goo.MouseUpAction = (function (
	Action
) {
	'use strict';

	function MouseUpAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.button = null;

		this.mouseEventListener = function (event) {
			this.button = event.button;
			this.updated = true;
		}.bind(this);

		this.touchEventListener = function (event) {
			this.button = 'touch';
			this.updated = true;
		}.bind(this);
	}

	MouseUpAction.prototype = Object.create(Action.prototype);
	MouseUpAction.prototype.constructor = MouseUpAction;

	MouseUpAction.external = {
		name: 'Mouse Up / Touch end',
		type: 'controls',
		description: 'Listens for a mouseup event (or touchend) and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseLeftUp',
			name: 'Left mouse up',
			description: 'State to transition to when the left mouse button is released'
		}, {
			key: 'middleMouseUp',
			name: 'Middle mouse up',
			description: 'State to transition to when the middle mouse button is released'
		}, {
			key: 'rightMouseUp',
			name: 'Right mouse up',
			description: 'State to transition to when the right mouse button is released'
		}, {
			key: 'touchUp',
			name: 'Touch release',
			description: 'State to transition to when the touch event ends'
		}]
	};

	MouseUpAction.prototype._setup = function () {
		document.addEventListener('mouseup', this.mouseEventListener);
		document.addEventListener('touchend', this.touchEventListener);
	};

	MouseUpAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.button === 'touch') {
				fsm.send(this.transitions.touchUp);
			} else {
				fsm.send([
					this.transitions.mouseLeftUp,
					this.transitions.middleMouseUp,
					this.transitions.rightMouseUp
				][this.button]);
			}
		}
	};

	MouseUpAction.prototype.exit = function () {
		document.removeEventListener('mouseup', this.mouseEventListener);
		document.removeEventListener('touchend', this.touchEventListener);
	};

	return MouseUpAction;
})(goo.Action);
goo.MouseDownAction = (function (
	Action
) {
	'use strict';

	function MouseDownAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.button = null;

		this.mouseEventListener = function (event) {
			this.button = event.button;
			this.updated = true;
		}.bind(this);

		this.touchEventListener = function (event) {
			this.button = 'touch';
			this.updated = true;
		}.bind(this);
	}

	MouseDownAction.prototype = Object.create(Action.prototype);
	MouseDownAction.prototype.constructor = MouseDownAction;

	MouseDownAction.external = {
		name: 'Mouse Down / Touch Start',
		type: 'controls',
		description: 'Listens for a mousedown event (or touchstart) and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mouseLeftDown',
			name: 'Left mouse down',
			description: 'State to transition to when the left mouse button is pressed'
		}, {
			key: 'middleMouseDown',
			name: 'Middle mouse down',
			description: 'State to transition to when the middle mouse button is pressed'
		}, {
			key: 'rightMouseDown',
			name: 'Right mouse down',
			description: 'State to transition to when the right mouse button is pressed'
		}, {
			key: 'touchDown',
			name: 'Touch begin',
			description: 'State to transition to when the touch event begins'
		}]
	};

	MouseDownAction.prototype._setup = function () {
		document.addEventListener('mousedown', this.mouseEventListener);
		document.addEventListener('touchstart', this.touchEventListener);
	};

	MouseDownAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.button === 'touch') {
				fsm.send(this.transitions.touchDown);
			} else {
				fsm.send([
					this.transitions.mouseLeftDown,
					this.transitions.middleMouseDown,
					this.transitions.rightMouseDown
				][this.button]);
			}
		}
	};

	MouseDownAction.prototype.exit = function () {
		document.removeEventListener('mousedown', this.mouseEventListener);
		document.removeEventListener('touchstart', this.touchEventListener);
	};

	return MouseDownAction;
})(goo.Action);
goo.MouseMoveAction = (function (
	Action
) {
	'use strict';

	function MouseMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.mouseOrTouch = null;

		this.mouseEventListener = function (/*event*/) {
			this.updated = true;
			this.mouseOrTouch = 'mouse';
		}.bind(this);

		this.touchEventListener = function (/*event*/) {
			this.updated = true;
			this.mouseOrTouch = 'touch';
		}.bind(this);
	}

	MouseMoveAction.prototype = Object.create(Action.prototype);
	MouseMoveAction.prototype.constructor = MouseMoveAction;

	MouseMoveAction.external = {
		name: 'Mouse / Touch Move',
		type: 'controls',
		description: 'Listens for mouse movement (mousemove) or touch movement (touchmove) and performs a transition',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'mousemove',
			name: 'Mouse move',
			description: 'State to transition to on mouse movement'
		}, {
			key: 'touchmove',
			name: 'Touch move',
			description: 'State to transition to on touch movement'
		}]
	};

	MouseMoveAction.prototype._setup = function () {
		document.addEventListener('mousemove', this.mouseEventListener);
		document.addEventListener('touchmove', this.touchEventListener);
	};

	MouseMoveAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			if (this.mouseOrTouch === 'mouse') {
				fsm.send(this.transitions.mousemove);
			} else {
				fsm.send(this.transitions.touchmove);
			}
		}
	};

	MouseMoveAction.prototype.exit = function () {
		document.removeEventListener('mousemove', this.mouseEventListener);
		document.removeEventListener('touchmove', this.touchEventListener);
	};

	return MouseMoveAction;
})(goo.Action);
goo.KeyUpAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function KeyUpAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function (event) {
			if (!this.key || event.which === +this.key) {
				this.updated = true;
			}
		}.bind(this);
	}

	KeyUpAction.prototype = Object.create(Action.prototype);
	KeyUpAction.prototype.constructor = KeyUpAction;

	KeyUpAction.external = {
		name: 'Key Up',
		type: 'controls',
		description: 'Listens for a key release and performs a transition',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'string',
			control: 'key',
			description: 'Key to listen for',
			'default': 'A'
		}],
		transitions: [{
			key: 'keyup',
			name: 'Key up',
			description: 'State to transition to when the key is released'
		}]
	};

	KeyUpAction.prototype.configure = function (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keyup: settings.transitions.keyup };
	};

	KeyUpAction.prototype._setup = function () {
		document.addEventListener('keyup', this.eventListener);
	};

	KeyUpAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.keyup);
		}
	};

	KeyUpAction.prototype.exit = function () {
		document.removeEventListener('keyup', this.eventListener);
	};

	return KeyUpAction;
})(goo.Action,goo.FsmUtils);
goo.KeyDownAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function KeyDownAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function (event) {
			if (this.key) {
				if (event.which === +this.key) {
					this.updated = true;
				}
			}
		}.bind(this);
	}

	KeyDownAction.prototype = Object.create(Action.prototype);
	KeyDownAction.prototype.constructor = KeyDownAction;

	KeyDownAction.external = {
		name: 'Key Down',
		type: 'controls',
		description: 'Listens for a key press and performs a transition',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'string',
			control: 'key',
			description: 'Key to listen for',
			'default': 'A'
		}],
		transitions: [{
			key: 'keydown',
			name: 'Key down',
			description: 'State to transition to when the key is pressed'
		}]
	};

	KeyDownAction.prototype.configure = function (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keydown: settings.transitions.keydown };
	};

	KeyDownAction.prototype._setup = function () {
		document.addEventListener('keydown', this.eventListener);
	};

	KeyDownAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.keydown);
		}
	};

	KeyDownAction.prototype.exit = function () {
		document.removeEventListener('keydown', this.eventListener);
	};

	return KeyDownAction;
})(goo.Action,goo.FsmUtils);
goo.KeyPressedAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function KeyPressedAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.keyIsDown = false;
		this.eventListenerDown = function (event) {
			if (event.which === +this.key) {
				this.keyIsDown = true;
			}
		}.bind(this);
		this.eventListenerUp = function (event) {
			if (event.which === +this.key) {
				document.removeEventListener('keydown', this.eventListenerUp);
				this.keyIsDown = false;
			}
		}.bind(this);
	}

	KeyPressedAction.prototype = Object.create(Action.prototype);
	KeyPressedAction.prototype.constructor = KeyPressedAction;

	KeyPressedAction.external = {
		name: 'Key Pressed',
		type: 'controls',
		description: 'Listens for a key press event and performs a transition. Works over transition boundaries.',
		canTransition: true,
		parameters: [{
			name: 'Key',
			key: 'key',
			type: 'string',
			control: 'key',
			description: 'Key to listen for'
		}],
		transitions: [{
			key: 'keydown',
			name: 'Key pressed',
			description: 'State to transition to when the key is pressed'
		}]
	};

	KeyPressedAction.prototype.configure = function (settings) {
		this.key = settings.key ? FsmUtils.getKey(settings.key) : null;
		this.transitions = { keydown: settings.transitions.keydown };
	};

	KeyPressedAction.prototype._setup = function () {
		document.addEventListener('keydown', this.eventListenerDown);
		document.addEventListener('keyup', this.eventListenerUp);
	};

	KeyPressedAction.prototype._run = function (fsm) {
		if (this.keyIsDown) {
			fsm.send(this.transitions.keydown);
		}
	};

	KeyPressedAction.prototype.exit = function () {
		document.removeEventListener('keydown', this.eventListenerDown);
	};

	return KeyPressedAction;
})(goo.Action,goo.FsmUtils);
goo.PickAction = (function (
	Action
) {
	'use strict';

	function PickAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		var that = this;
		this.eventListener = function (evt) {
			if (!evt.entity) {
				return;
			}

			evt.entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					that.updated = true;
					return false;
				}
			});
		};
	}

	PickAction.prototype = Object.create(Action.prototype);
	PickAction.prototype.constructor = PickAction;

	PickAction.external = {
		name: 'Pick',
		type: 'controls',
		description: 'Listens for a picking event on the entity and performs a transition',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'pick',
			name: 'Pick',
			description: 'State to transition to when entity is picked'
		}]
	};

	PickAction.prototype._setup = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.goo.addEventListener('click', this.eventListener);
		this.goo.addEventListener('touchstart', this.eventListener);
	};

	PickAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.pick);
		}
	};

	PickAction.prototype.exit = function () {
		if (this.goo) {
			this.goo.removeEventListener('click', this.eventListener);
			this.goo.removeEventListener('touchstart', this.eventListener);
		}
	};

	return PickAction;
})(goo.Action);
goo.PickAndExitAction = (function (
	Action
) {
	'use strict';

	function PickAndExitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.eventListener = function (event) {
			var htmlCmp = this.ownerEntity.getComponent('HtmlComponent');
			var clickedHtmlCmp = (htmlCmp && htmlCmp.domElement.contains(event.target));
			if (clickedHtmlCmp) {
				this.handleExit();
				return;
			}

			if (event.target !== this.canvasElement) {
				return;
			}

			var x, y;
			if (event.touches) {
				x = event.touches[0].clientX;
				y = event.touches[0].clientY;
			} else {
				x = event.offsetX;
				y = event.offsetY;
			}

			var pickResult = this.goo.pickSync(x, y);
			if (pickResult.id === -1) {
				return;
			}

			var entity = this.goo.world.entityManager.getEntityByIndex(pickResult.id);
			var descendants = [];
			this.ownerEntity.traverse(descendants.push.bind(descendants));
			if (descendants.indexOf(entity) === -1) {
				return;
			}

			this.handleExit();
		}.bind(this);
	}

	PickAndExitAction.prototype = Object.create(Action.prototype);
	PickAndExitAction.prototype.constructor = PickAndExitAction;

	PickAndExitAction.external = {
		name: 'Pick and Exit',
		type: 'controls',
		description: 'Listens for a picking event on the entity and opens a new browser window',
		canTransition: true,
		parameters: [{
			name: 'URL',
			key: 'url',
			type: 'string',
			description: 'URL to open',
			'default': 'http://www.goocreate.com/'
		}, {
			name: 'Exit name',
			key: 'exitName',
			type: 'string',
			description: 'Name of the exit, used to track this exit in Ads.',
			'default': 'clickEntityExit'
		}],
		transitions: []
	};

	PickAndExitAction.prototype._setup = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.canvasElement = this.goo.renderer.domElement;
		//
		// ASSUMPTION: HtmlComponents will be attached in the DOM as siblings
		// to the canvas.
		//
		this.domElement = this.canvasElement.parentNode;
		this.domElement.addEventListener('click', this.eventListener, false);
		this.domElement.addEventListener('touchstart', this.eventListener, false);
	};

	PickAndExitAction.prototype._run = function () {
		// Don't really need it.
	};

	PickAndExitAction.prototype.handleExit = function () {
		var handler = window.gooHandleExit || function (url) {
			window.open(url, '_blank');
		};

		handler(this.url, this.exitName);
	};

	PickAndExitAction.prototype.exit = function () {
		if (this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
			this.domElement.removeEventListener('touchstart', this.eventListener);
		}
	};

	return PickAndExitAction;
})(goo.Action);
goo.ClickAction = (function (
	Action
) {
	'use strict';

	function ClickAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;

		this.selected = false;
		this.x = 0;
		this.y = 0;

		var that = this;
		this.downListener = function (evt) {
			if (!evt.entity) {
				return;
			}

			evt.entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					that.x = evt.x;
					that.y = evt.y;
					that.selected = true;
					return false;
				}
			});
		};
		this.upListener = function (evt) {
			if (!that.selected) {
				return;
			}

			that.selected = false;
			if (!evt.entity) {
				return;
			}

			var diffx = that.x - evt.x;
			var diffy = that.y - evt.y;
			if (Math.abs(diffx) > 10 || Math.abs(diffy) > 10) {
				return;
			}

			evt.entity.traverseUp(function (entity) {
				if (entity === that.ownerEntity) {
					that.updated = true;
					return false;
				}
			});
		};
	}

	ClickAction.prototype = Object.create(Action.prototype);
	ClickAction.prototype.constructor = ClickAction;

	ClickAction.external = {
		name: 'Click/Tap',
		type: 'controls',
		description: 'Listens for a click/tap event on the entity and performs a transition',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'click',
			name: 'On Click/Tap',
			description: 'State to transition to when entity is clicked'
		}]
	};

	ClickAction.prototype._setup = function (fsm) {
		this.ownerEntity = fsm.getOwnerEntity();
		this.goo = this.ownerEntity._world.gooRunner;
		this.goo.addEventListener('mousedown', this.downListener);
		this.goo.addEventListener('touchstart', this.downListener);
		this.goo.addEventListener('mouseup', this.upListener);
		this.goo.addEventListener('touchend', this.upListener);
		this.updated = false;
		this.selected = false;
	};

	ClickAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.click);
		}
	};

	ClickAction.prototype.exit = function () {
		if (this.goo) {
			this.goo.removeEventListener('mousedown', this.downListener);
			this.goo.removeEventListener('touchstart', this.downListener);
			this.goo.removeEventListener('mouseup', this.upListener);
			this.goo.removeEventListener('touchend', this.upListener);
		}
	};

	return ClickAction;
})(goo.Action);
goo.WasdAction = (function (
	Action
) {
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

	return WasdAction;
})(goo.Action);
goo.MoveAction = (function (
	Action,
	Vector3
) {
	'use strict';

	function MoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MoveAction.prototype = Object.create(Action.prototype);
	MoveAction.prototype.constructor = MoveAction;

	MoveAction.external = {
		name: 'Move',
		type: 'animation',
		description: 'Moves the entity',
		parameters: [{
			name: 'Translation',
			key: 'translation',
			type: 'position',
			description: 'Move',
			'default': [0, 0, 0]
		}, {
			name: 'Oriented',
			key: 'oriented',
			type: 'boolean',
			description: 'If true translate with rotation',
			'default': true
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add to current translation',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	MoveAction.prototype._setup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		this.forward = Vector3.fromArray(this.translation);
		var orientation = transform.rotation;
		this.forward.applyPost(orientation);
	};

	MoveAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		var translation = transform.translation;

		if (this.oriented) {
			if (this.relative) {
				var forward = Vector3.fromArray(this.translation);
				var orientation = transform.rotation;
				forward.applyPost(orientation);

				if (this.everyFrame) {
					forward.scale(fsm.getTpf() * 10);
					translation.add(forward);
				} else {
					translation.add(forward);
				}
			} else {
				translation.set(this.forward);
			}
		} else {
			if (this.relative) {
				if (this.everyFrame) {
					var tpf = fsm.getTpf() * 10;
					translation.addDirect(this.translation[0] * tpf, this.translation[1] * tpf, this.translation[2] * tpf);
				} else {
					translation.addDirect(this.translation[0], this.translation[1], this.translation[2]);
				}
			} else {
				translation.setDirect(this.translation[0], this.translation[1], this.translation[2]);
			}
		}

		entity.transformComponent.setUpdated();
	};

	return MoveAction;
})(goo.Action,goo.Vector3);
goo.RotateAction = (function (
	Action,
	MathUtils
) {
	'use strict';

	function RotateAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RotateAction.prototype = Object.create(Action.prototype);
	RotateAction.prototype.constructor = RotateAction;

	RotateAction.external = {
		name: 'Rotate',
		type: 'animation',
		description: 'Rotates the entity with the set angles (in degrees).',
		parameters: [{
			name: 'Rotation',
			key: 'rotation',
			type: 'rotation',
			description: 'Rotate',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add to current rotation',
			'default': true
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	RotateAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		var transform = entity.transformComponent.transform;
		if (this.relative) {
			if (this.everyFrame) {
				var tpf = fsm.getTpf();
				transform.rotation.rotateX(this.rotation[0] * MathUtils.DEG_TO_RAD * tpf);
				transform.rotation.rotateY(this.rotation[1] * MathUtils.DEG_TO_RAD * tpf);
				transform.rotation.rotateZ(this.rotation[2] * MathUtils.DEG_TO_RAD * tpf);
			} else {
				transform.rotation.rotateX(this.rotation[0] * MathUtils.DEG_TO_RAD);
				transform.rotation.rotateY(this.rotation[1] * MathUtils.DEG_TO_RAD);
				transform.rotation.rotateZ(this.rotation[2] * MathUtils.DEG_TO_RAD);
			}
		} else {
			if (this.everyFrame) {
				var tpf = fsm.getTpf();
				transform.setRotationXYZ(
					this.rotation[0] * MathUtils.DEG_TO_RAD * tpf,
					this.rotation[1] * MathUtils.DEG_TO_RAD * tpf,
					this.rotation[2] * MathUtils.DEG_TO_RAD * tpf
				);
			} else {
				transform.setRotationXYZ(
					this.rotation[0] * MathUtils.DEG_TO_RAD,
					this.rotation[1] * MathUtils.DEG_TO_RAD,
					this.rotation[2] * MathUtils.DEG_TO_RAD
				);
			}
		}

		entity.transformComponent.setUpdated();
	};

	return RotateAction;
})(goo.Action,goo.MathUtils);
goo.ScaleAction = (function (
	Action
) {
	'use strict';

	function ScaleAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ScaleAction.prototype = Object.create(Action.prototype);
	ScaleAction.prototype.constructor = ScaleAction;

	ScaleAction.external = {
		name: 'Scale',
		type: 'animation',
		description: 'Scales the entity',
		parameters: [{
			name: 'Scale',
			key: 'scale',
			type: 'position',
			description: 'Scale',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true, add/multiply the current scaling',
			'default': true
		}, {
			name: 'Multiply',
			key: 'multiply',
			type: 'boolean',
			description: 'If true multiply, otherwise add',
			'default': false
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': false
		}],
		transitions: []
	};

	ScaleAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transform = entity.transformComponent.transform;
		if (this.relative) {
			if (this.multiply) {
				if (this.everyFrame) {
					var tpf = fsm.getTpf() * 10;
					transform.scale.x *= this.scale[0] * tpf;
					transform.scale.y *= this.scale[1] * tpf;
					transform.scale.z *= this.scale[2] * tpf;
				} else {
					transform.scale.mulDirect(this.scale[0], this.scale[1], this.scale[2]);
				}
			} else {
				if (this.everyFrame) {
					var tpf = fsm.getTpf() * 10;
					transform.scale.x += this.scale[0] * tpf;
					transform.scale.y += this.scale[1] * tpf;
					transform.scale.z += this.scale[2] * tpf;
				} else {
					transform.scale.addDirect(this.scale[0], this.scale[1], this.scale[2]);
				}
			}
		} else {
			transform.scale.set(this.scale);
		}

		entity.transformComponent.setUpdated();
	};

	return ScaleAction;
})(goo.Action);
goo.LookAtAction = (function (
	Action,
	Vector3
) {
	'use strict';

	function LookAtAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	LookAtAction.prototype = Object.create(Action.prototype);
	LookAtAction.prototype.constructor = LookAtAction;

	LookAtAction.external = {
		name: 'Look At',
		type: 'animation',
		description: 'Reorients an entity so that it\'s facing a specific point',
		parameters: [{
			name: 'Look at',
			key: 'lookAt',
			type: 'position',
			description: 'Position to look at',
			'default': [0, 0, 0]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	LookAtAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;

		transformComponent.transform.lookAt(new Vector3(this.lookAt), Vector3.UNIT_Y);
		transformComponent.setUpdated();
	};

	return LookAtAction;
})(goo.Action,goo.Vector3);
goo.TweenMoveAction = (function (
	Action,
	Vector3,
	TWEEN
) {
	'use strict';

	function TweenMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenMoveAction.prototype = Object.create(Action.prototype);
	TweenMoveAction.prototype.constructor = TweenMoveAction;

	TweenMoveAction.external = {
		name: 'Tween Move',
		type: 'animation',
		description: 'Transition to the set location.',
		canTransition: true,
		parameters: [{
			name: 'Translation',
			key: 'to',
			type: 'position',
			description: 'Move',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set',
			'default': true
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for this movement to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the movement completes'
		}]
	};

	TweenMoveAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenMoveAction.prototype._setup = function (/*fsm*/) {
		this.tween = new TWEEN.Tween();
	};

	TweenMoveAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenMoveAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;
		var initialTranslation = translation.clone();
		var time = entity._world.time * 1000;

		var fakeFrom = { x: initialTranslation.x, y: initialTranslation.y, z: initialTranslation.z };
		var fakeTo;

		var old = { x: fakeFrom.x, y: fakeFrom.y, z: fakeFrom.z };

		if (this.relative) {
			var to = Vector3.fromArray(this.to).add(initialTranslation);
			fakeTo = { x: to.x, y: to.y, z: to.z };

			// it's a string until property controls are fixed
			if (this.time === '0') {
				// have to do this manually since tween.js chokes for time = 0
				translation.x += fakeTo.x - old.x;
				translation.y += fakeTo.y - old.y;
				translation.z += fakeTo.z - old.z;
				transformComponent.setUpdated();
				fsm.send(this.eventToEmit.channel);
			} else {
				this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
					translation.x += this.x - old.x;
					translation.y += this.y - old.y;
					translation.z += this.z - old.z;

					old.x = this.x;
					old.y = this.y;
					old.z = this.z;

					transformComponent.setUpdated();
				}).onComplete(function () {
					fsm.send(this.eventToEmit.channel);
				}.bind(this)).start(time);
			}
		} else {
			fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };

			if (this.time === '0') {
				// have to do this manually since tween.js chokes for time = 0
				translation.x += fakeTo.x - old.x;
				translation.y += fakeTo.y - old.y;
				translation.z += fakeTo.z - old.z;
				transformComponent.setUpdated();
				fsm.send(this.eventToEmit.channel);
			} else {
				this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
					translation.x += this.x - old.x;
					translation.y += this.y - old.y;
					translation.z += this.z - old.z;

					old.x = this.x;
					old.y = this.y;
					old.z = this.z;

					transformComponent.setUpdated();
				}).onComplete(function () {
					fsm.send(this.eventToEmit.channel);
				}.bind(this)).start(time);
			}
		}
	};

	return TweenMoveAction;
})(goo.Action,goo.Vector3,goo.TWEEN);
goo.TweenRotationAction = (function (
	Action,
	Quaternion,
	Matrix3,
	MathUtils,
	TWEEN
) {
	'use strict';

	function TweenRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenRotationAction.prototype = Object.create(Action.prototype);
	TweenRotationAction.prototype.constructor = TweenRotationAction;

	TweenRotationAction.external = {
		key: 'Tween Rotation',
		name: 'Tween Rotate',
		type: 'animation',
		description: 'Transition to the set rotation, in angles.',
		canTransition: true,
		parameters: [{
			name: 'Rotation',
			key: 'to',
			type: 'rotation',
			description: 'Rotation',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set',
			'default': true
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for this movement to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the rotation completes'
		}]
	};

	TweenRotationAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenRotationAction.prototype._setup = function () {
		this.tween = new TWEEN.Tween();
	};

	TweenRotationAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenRotationAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var rotation = transformComponent.transform.rotation;

		var initialRotation = new Quaternion().fromRotationMatrix(rotation);
		var finalRotation = new Quaternion().fromRotationMatrix(new Matrix3().fromAngles(this.to[0] * MathUtils.DEG_TO_RAD, this.to[1] * MathUtils.DEG_TO_RAD, this.to[2] * MathUtils.DEG_TO_RAD));
		var workQuaternion = new Quaternion();
		var time = entity._world.time * 1000;

		if (this.relative) {
			finalRotation.mul(initialRotation);
		}

		this.tween.from({ t: 0 }).to({ t: 1 }, +this.time).easing(this.easing).onUpdate(function () {
			Quaternion.slerp(initialRotation, finalRotation, this.t, workQuaternion);
			rotation.copyQuaternion(workQuaternion);
			transformComponent.setUpdated();
		}).onComplete(function () {
			fsm.send(this.eventToEmit.channel);
		}.bind(this)).start(time);
	};

	return TweenRotationAction;
})(goo.Action,goo.Quaternion,goo.Matrix3,goo.MathUtils,goo.TWEEN);
goo.TweenScaleAction = (function (
	Action,
	Vector3,
	TWEEN
) {
	'use strict';

	function TweenScaleAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenScaleAction.prototype = Object.create(Action.prototype);
	TweenScaleAction.prototype.constructor = TweenScaleAction;

	TweenScaleAction.external = {
		name: 'Tween Scale',
		type: 'animation',
		description: 'Transition to the set scale.',
		canTransition: true,
		parameters: [{
			name: 'Scale',
			key: 'to',
			type: 'position',
			description: 'Scale',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set',
			'default': true
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for this movement to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the scaling completes'
		}]
	};

	TweenScaleAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenScaleAction.prototype._setup = function () {
		this.tween = new TWEEN.Tween();
	};

	TweenScaleAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenScaleAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var scale = transformComponent.transform.scale;
		var initialScale = scale.clone();

		var fakeFrom = { x: initialScale.x, y: initialScale.y, z: initialScale.z };
		var fakeTo;
		var time = entity._world.time * 1000;

		if (this.relative) {
			var to = Vector3.fromArray(this.to).add(initialScale);
			fakeTo = { x: to.x, y: to.y, z: to.z };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				scale.setDirect(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function () {
					fsm.send(this.eventToEmit.channel);
				}.bind(this)).start(time);
		} else {
			fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				scale.setDirect(this.x, this.y, this.z);
				transformComponent.setUpdated();
			}).onComplete(function () {
					fsm.send(this.eventToEmit.channel);
				}.bind(this)).start(time);
		}
	};

	return TweenScaleAction;
})(goo.Action,goo.Vector3,goo.TWEEN);
goo.TweenLookAtAction = (function (
	Action,
	Vector3,
	TWEEN
) {
	'use strict';

	function TweenLookAtAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenLookAtAction.prototype = Object.create(Action.prototype);
	TweenLookAtAction.prototype.constructor = TweenLookAtAction;

	TweenLookAtAction.external = {
		name: 'Tween Look At',
		type: 'animation',
		description: 'Transition the entity\'s rotation to face the set position.',
		canTransition: true,
		parameters: [{
			name: 'Position',
			key: 'to',
			type: 'position',
			description: 'Look at point',
			'default': [0, 0, 0]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for this movement to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On completion',
			description: 'State to transition to when the transition completes'
		}]
	};

	TweenLookAtAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenLookAtAction.prototype._setup = function () {
		this.tween = new TWEEN.Tween();
	};

	TweenLookAtAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenLookAtAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;

		var distance = Vector3.fromArray(this.to).distance(transform.translation);
		var time = entity._world.time * 1000;

		var initialLookAt = new Vector3(0, 0, 1);
		var orientation = transform.rotation;
		initialLookAt.applyPost(orientation);
		initialLookAt.scale(distance);

		var fakeFrom = { x: initialLookAt.x, y: initialLookAt.y, z: initialLookAt.z };
		var fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };
		var tmpVec3 = new Vector3();

		this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
			tmpVec3.x = this.x;
			tmpVec3.y = this.y;
			tmpVec3.z = this.z;
			transform.lookAt(tmpVec3, Vector3.UNIT_Y);
			transformComponent.setUpdated();
		}).onComplete(function () {
			fsm.send(this.eventToEmit.channel);
		}.bind(this)).start(time);
	};

	return TweenLookAtAction;
})(goo.Action,goo.Vector3,goo.TWEEN);
goo.ShakeAction = (function (
	Action,
	Vector3,
	TWEEN
) {
	'use strict';

	function ShakeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ShakeAction.prototype = Object.create(Action.prototype);
	ShakeAction.prototype.constructor = ShakeAction;

	ShakeAction.external = {
		name: 'Shake',
		type: 'animation',
		description: 'Shakes the entity. Optionally performs a transition.',
		canTransition: true,
		parameters: [{
			name: 'Start level',
			key: 'startLevel',
			type: 'float',
			description: 'Shake amount at start',
			'default': 0
		}, {
			name: 'End level',
			key: 'endLevel',
			type: 'float',
			description: 'Shake amount at the end',
			'default': 10
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			description: 'Shake time amount',
			'default': 1000
		}, {
			name: 'Speed',
			key: 'speed',
			type: 'string',
			control: 'dropdown',
			description: 'Speed of shaking',
			'default': 'Fast',
			options: ['Fast', 'Medium', 'Slow']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the shake completes'
		}]
	};

	ShakeAction.prototype.configure = function (settings) {
		this.startLevel = settings.startLevel;
		this.endLevel = settings.endLevel;
		this.time = settings.time;
		this.speed = { 'Fast': 1, 'Medium': 2, 'Slow': 4 }[settings.speed];
		this.easing = TWEEN.Easing.Quadratic.InOut;
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	ShakeAction.prototype._setup = function () {
		this.tween = new TWEEN.Tween();
	};

	ShakeAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	ShakeAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;
		var time = entity._world.time * 1000;

		var oldVal = new Vector3();
		var target = new Vector3();
		var vel = new Vector3();

		var that = this;
		var iter = 0;
		this.tween.from({ level: +this.startLevel }).to({ level: +this.endLevel }, +this.time).easing(this.easing).onUpdate(function () {
			iter++;
			if (iter > that.speed) {
				iter = 0;

				target.setDirect(
					-oldVal.x + (Math.random() - 0.5) * this.level * 2,
					-oldVal.y + (Math.random() - 0.5) * this.level * 2,
					-oldVal.z + (Math.random() - 0.5) * this.level * 2
				);
			}

			vel.setDirect(
				vel.x * 0.98 + (target.x) * 0.1,
				vel.y * 0.98 + (target.y) * 0.1,
				vel.z * 0.98 + (target.z) * 0.1
			);

			translation.add(vel).sub(oldVal);
			oldVal.copy(vel);
			transformComponent.setUpdated();
		}).onComplete(function () {
			translation.sub(oldVal);
			transformComponent.setUpdated();
			fsm.send(this.eventToEmit.channel);
		}.bind(this)).start(time);
	};

	return ShakeAction;
})(goo.Action,goo.Vector3,goo.TWEEN);
goo.PauseAnimationAction = (function (
	Action
) {
	'use strict';

	function PauseAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PauseAnimationAction.prototype = Object.create(Action.prototype);
	PauseAnimationAction.prototype.constructor = PauseAnimationAction;

	PauseAnimationAction.external = {
		name: 'Pause Animation',
		type: 'animation',
		description: 'Pauses skeleton animations',
		parameters: [{
			name: 'On all entities',
			key: 'onAll',
			type: 'boolean',
			description: 'Pause animation on all entities or just one',
			'default': false
		}],
		transitions: []
	};

	PauseAnimationAction.prototype._run = function (fsm) {
		if (this.onAll) {
			var world = fsm.getWorld();
			var animationSystem = world.getSystem('AnimationSystem');
			animationSystem.pause();
		} else {
			var entity = fsm.getOwnerEntity();
			if (entity.animationComponent) {
				entity.animationComponent.pause();
			}
		}
	};

	return PauseAnimationAction;
})(goo.Action);
goo.ResumeAnimationAction = (function (
	Action
) {
	'use strict';

	function ResumeAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ResumeAnimationAction.prototype = Object.create(Action.prototype);
	ResumeAnimationAction.prototype.constructor = ResumeAnimationAction;

	ResumeAnimationAction.external = {
		name: 'Resume Animation',
		type: 'animation',
		description: 'Continues playing a skeleton animation',
		parameters: [{
			name: 'On all entities',
			key: 'onAll',
			type: 'boolean',
			description: 'Resume animation on all entities or just one',
			'default': false
		}],
		transitions: []
	};

	ResumeAnimationAction.prototype._run = function (fsm) {
		if (this.onAll) {
			var world = fsm.getWorld();
			var animationSystem = world.getSystem('AnimationSystem');
			animationSystem.resume();
		} else {
			var entity = fsm.getOwnerEntity();
			if (entity.animationComponent) {
				entity.animationComponent.resume();
			}
		}
	};

	return ResumeAnimationAction;
})(goo.Action);
goo.SetAnimationAction = (function (
	Action
	) {
	'use strict';

	function SetAnimationAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.everyFrame = false;
	}

	SetAnimationAction.prototype = Object.create(Action.prototype);
	SetAnimationAction.prototype.constructor = SetAnimationAction;

	SetAnimationAction.external = {
		name: 'Set Animation',
		type: 'animation',
		description: 'Transitions to a selected animation',
		parameters: [{
			name: 'Animation',
			key: 'animation',
			type: 'animation'
		}],
		transitions: [{
			key: 'complete',
			name: 'On completion',
			description: 'State to transition to when the target animation completes'
		}]
	};

	SetAnimationAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var that = this;
		if (typeof this.animation === 'string' && entity.animationComponent) {
			entity.animationComponent.transitionTo(this.animation, true, function () {
				fsm.send(that.transitions.complete);
			});
		}
	};

	return SetAnimationAction;
})(goo.Action);
goo.SetTimeScale = (function (
	Action
) {
	'use strict';

	function SetTimeScale(/*id, settings*/) {
		Action.apply(this, arguments);
		this.everyFrame = false;
	}

	SetTimeScale.prototype = Object.create(Action.prototype);
	SetTimeScale.prototype.constructor = SetTimeScale;

	SetTimeScale.external = {
		name: 'Set Animation Time Scale',
		type: 'animation',
		description: 'Sets the time scale for the current animation',
		parameters: [{
			name: 'Scale',
			key: 'scale',
			type: 'number',
			description: 'Scale factor for the animation timer',
			'default': 1
		}],
		transitions: []
	};

	SetTimeScale.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.animationComponent) {
			entity.animationComponent.setTimeScale(this.scale);
		}
	};

	return SetTimeScale;
})(goo.Action);
goo.WaitAction = (function (
	Action
) {
	'use strict';

	/**
	 * @private
	 * @extends Action
	 */
	function WaitAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;

		/**
		 * Current time, in milliseconds.
		 * @type {number}
		 */
		this.currentTime = 0;

		/**
		 * Wait time, in milliseconds.
		 * @type {number}
		 */
		this.totalWait = 0;
	}

	WaitAction.prototype = Object.create(Action.prototype);
	WaitAction.prototype.constructor = WaitAction;

	WaitAction.external = {
		name: 'Wait',
		type: 'animation',
		description: 'Performs a transition after a specified amount of time. ' +
			'A random time can be set, this will add between 0 and the set random time to the specified wait time.',
		canTransition: true,
		parameters: [{
			name: 'Time (ms)',
			key: 'waitTime',
			type: 'number',
			description: 'Base time in milliseconds before transition fires',
			'default': 5000
		}, {
			name: 'Random (ms)',
			key: 'randomTime',
			type: 'number',
			description: 'A random number of milliseconds (between 0 and this value) will be added to the base wait time',
			'default': 0
		}],
		transitions: [{
			key: 'timeUp',
			name: 'Time up',
			description: 'State to transition to when time up'
		}]
	};

	WaitAction.prototype._setup = function () {
		this.currentTime = 0;
		this.totalWait = parseFloat(this.waitTime) + Math.random() * parseFloat(this.randomTime);
	};

	WaitAction.prototype._run = function (fsm) {
		this.currentTime += fsm.getTpf() * 1000;
		if (this.currentTime >= this.totalWait) {
			fsm.send(this.transitions.timeUp);
		}
	};

	return WaitAction;
})(goo.Action);
goo.TransitionAction = (function (
	Action
) {
	'use strict';

	function TransitionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TransitionAction.prototype = Object.create(Action.prototype);
	TransitionAction.prototype.constructor = TransitionAction;

	TransitionAction.external = {
		name: 'Transition',
		type: 'transitions',
		description: 'Transition to a selected state',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'transition',
			name: 'To',
			description: 'State to transition to'
		}]
	};

	TransitionAction.prototype._run = function (fsm) {
		fsm.send(this.transitions.transition);
	};

	return TransitionAction;
})(goo.Action);
goo.RandomTransitionAction = (function (
	Action
) {
	'use strict';

	function RandomTransitionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RandomTransitionAction.prototype = Object.create(Action.prototype);
	RandomTransitionAction.prototype.constructor = RandomTransitionAction;

	RandomTransitionAction.external = {
		name: 'Random Transition',
		type: 'transitions',
		description: 'Performs a random transition',
		canTransition: true,
		parameters: [{
			name: 'Skewness',
			key: 'skewness',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1,
			description: 'Determines the chance that the first destination is picked over the second',
			'default': 1
		}],
		transitions: [{
			key: 'transition1',
			name: 'Destination 1',
			description: 'First choice'
		}, {
			key: 'transition2',
			name: 'Destination 2',
			description: 'Second choice'
		}]
	};

	RandomTransitionAction.prototype._run = function (fsm) {
		if (Math.random() < +this.skewness) {
			fsm.send(this.transitions.transition1);
		} else {
			fsm.send(this.transitions.transition2);
		}
	};

	return RandomTransitionAction;
})(goo.Action);
goo.EmitAction = (function (
	Action,
	SystemBus
) {
	'use strict';

	function EmitAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	EmitAction.prototype = Object.create(Action.prototype);
	EmitAction.prototype.constructor = EmitAction;

	EmitAction.external = {
		key: 'Emit message',
		name: 'Emit Message',
		type: 'transitions',
		description: 'Emits a message (a ping) to a channel on the bus. Messages can be listened to by the Listen action, or by scripts using the SystemBus.addListener(channel, callback) function.',
		parameters: [{
			name: 'Channel',
			key: 'channel',
			type: 'string',
			description: 'Channel to transmit a message (a ping) on',
			'default': ''
		}],
		transitions: []
	};

	EmitAction.prototype._run = function (/*fsm*/) {
		SystemBus.emit(this.channel, this.data);
	};

	return EmitAction;
})(goo.Action,goo.SystemBus);
goo.TransitionOnMessageAction = (function (
	Action,
	SystemBus
) {
	'use strict';

	function TransitionOnMessageAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function (/*data*/) {
			this.updated = true;
		}.bind(this);
	}

	TransitionOnMessageAction.prototype = Object.create(Action.prototype);
	TransitionOnMessageAction.prototype.constructor = TransitionOnMessageAction;

	TransitionOnMessageAction.external = {
		key: 'Transition on Message',
		name: 'Listen',
		type: 'transitions',
		description: 'Performs a transition on receiving a system bus message (a ping) on a specific channel',
		canTransition: true,
		parameters: [{
			name: 'Message channel',
			key: 'channel',
			type: 'string',
			description: 'Channel to listen to',
			'default': ''
		}],
		transitions: [{
			key: 'transition',
			name: 'To',
			description: 'State to transition to'
		}]
	};

	TransitionOnMessageAction.prototype._setup = function (/*fsm*/) {
		SystemBus.addListener(this.channel, this.eventListener, false);
	};

	TransitionOnMessageAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.transition);
		}
	};

	TransitionOnMessageAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener(this.channel, this.eventListener);
	};

	return TransitionOnMessageAction;
})(goo.Action,goo.SystemBus);
goo.EvalAction = (function (
	Action
) {
	'use strict';

	function EvalAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.expressionFunction = null;
	}

	EvalAction.prototype = Object.create(Action.prototype);
	EvalAction.prototype.constructor = EvalAction;

	EvalAction.external = {
		name: 'Eval',
		description: 'Evaluates a JS expression',
		parameters: [{
			name: 'expression',
			key: 'expression',
			type: 'string',
			description: 'JavaScript expression to evaluate',
			'default': ''
		}],
		transitions: []
	};

	EvalAction.prototype._setup = function () {
		/* jshint evil: true */
		this.expressionFunction = new Function('goo', this.expression);
	};

	EvalAction.prototype._run = function (fsm) {
		/* jshint evil: true */
		if (this.expressionFunction) {
			try {
				this.expressionFunction(fsm.getEvalProxy());
			} catch (e) {
				console.warn('Eval code error: ' + e.message);
			}
		}
	};

	return EvalAction;
})(goo.Action);
goo.HideAction = (function (
	Action
) {
	'use strict';

	function HideAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	HideAction.prototype = Object.create(Action.prototype);
	HideAction.prototype.constructor = HideAction;

	HideAction.external = {
		name: 'Hide',
		type: 'display',
		description: 'Hides an entity and its children',
		parameters: [],
		transitions: []
	};

	HideAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.hide();
	};

	return HideAction;
})(goo.Action);
goo.ShowAction = (function (
	Action
) {
	'use strict';

	function ShowAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ShowAction.prototype = Object.create(Action.prototype);
	ShowAction.prototype.constructor = ShowAction;

	ShowAction.external = {
		name: 'Show',
		type: 'display',
		description: 'Makes an entity visible',
		parameters: [],
		transitions: []
	};

	ShowAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.show();
	};

	return ShowAction;
})(goo.Action);
goo.RemoveAction = (function (
	Action
) {
	'use strict';

	function RemoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveAction.prototype = Object.create(Action.prototype);
	RemoveAction.prototype.constructor = RemoveAction;

	RemoveAction.external = {
		name: 'Remove',
		type: 'display',
		description: 'Removes the entity from the world',
		parameters: [{
			name: 'Recursive',
			key: 'recursive',
			type: 'boolean',
			description: 'Remove children too',
			'default': false
		}],
		transitions: []
	};

	RemoveAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.removeFromWorld(this.recursive);
	};

	return RemoveAction;
})(goo.Action);
goo.AddLightAction = (function (
	Action,
	LightComponent,
	PointLight,
	DirectionalLight,
	SpotLight
) {
	'use strict';

	function AddLightAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddLightAction.prototype = Object.create(Action.prototype);
	AddLightAction.prototype.constructor = AddLightAction;

	AddLightAction.external = {
		name: 'Add Light',
		description: 'Adds a point light to the entity',
		type: 'light',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Color of the light',
			'default': [1, 1, 1]
		}, {
			name: 'Light type',
			key: 'type',
			type: 'string',
			control: 'dropdown',
			description: 'Light type',
			'default': 'Point',
			options: ['Point', 'Directional', 'Spot']
		}, {
			name: 'Range',
			key: 'range',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1000,
			description: 'Range of the light',
			'default': 200
		}, {
			name: 'Cone Angle',
			key: 'angle',
			type: 'float',
			control: 'slider',
			min: 1,
			max: 170,
			description: 'Cone angle (applies only to spot lights)',
			'default': 30
		}, {
			name: 'Penumbra',
			key: 'penumbra',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 170,
			description: 'Penumbra (applies only to spot lights)',
			'default': 30
		}],
		transitions: []
	};

	AddLightAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.lightComponent) {
			this._untouched = true;
			return;
		}

		var light;
		if (this.type === 'Directional') {
			light = new DirectionalLight();
		} else if (this.type === 'Spot') {
			light = new SpotLight();
			light.range = +this.range;
			light.angle = +this.angle;
			light.penumbra = +this.penumbra;
		} else {
			light = new PointLight();
			light.range = +this.range;
		}

		light.color.setDirect(this.color[0], this.color[1], this.color[2]);

		entity.setComponent(new LightComponent(light));
	};

	AddLightAction.prototype.cleanup = function (fsm) {
		if (this._untouched) { return; }

		var entity = fsm.getOwnerEntity();
		if (entity) {
			entity.clearComponent('LightComponent');
		}
	};

	return AddLightAction;
})(goo.Action,goo.LightComponent,goo.PointLight,goo.DirectionalLight,goo.SpotLight);
goo.RemoveLightAction = (function (
	Action
) {
	'use strict';

	function RemoveLightAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveLightAction.prototype = Object.create(Action.prototype);
	RemoveLightAction.prototype.constructor = RemoveLightAction;

	RemoveLightAction.external = {
		name: 'Remove Light',
		type: 'light',
		description: 'Removes the light attached to the entity',
		parameters: [],
		transitions: []
	};

	RemoveLightAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('LightComponent')) {
			entity.clearComponent('LightComponent');
		}
	};

	return RemoveLightAction;
})(goo.Action);
goo.TweenLightColorAction = (function (
	Action,
	TWEEN
) {
	'use strict';

	function TweenLightColorAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenLightColorAction.prototype = Object.create(Action.prototype);
	TweenLightColorAction.prototype.constructor = TweenLightColorAction;

	TweenLightColorAction.external = {
		key: 'Tween Light Color',
		name: 'Tween Light',
		type: 'light',
		description: 'Tweens the color of the light',
		parameters: [{
			name: 'Color',
			key: 'to',
			type: 'vec3',
			control: 'color',
			description: 'Color of the light',
			'default': [1, 1, 1]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for the transition to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the transition completes'
		}]
	};

	TweenLightColorAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenLightColorAction.prototype._setup = function (/*fsm*/) {
		this.tween = new TWEEN.Tween();
	};

	TweenLightColorAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenLightColorAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.lightComponent) {
			var lightComponent = entity.lightComponent;
			var color = lightComponent.light.color;
			var time = entity._world.time * 1000;

			var fakeFrom = { x: color.x, y: color.y, z: color.z };
			var fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };

			var old = { x: fakeFrom.x, y: fakeFrom.y, z: fakeFrom.z };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				color.x += this.x - old.x;
				color.y += this.y - old.y;
				color.z += this.z - old.z;

				old.x = this.x;
				old.y = this.y;
				old.z = this.z;
			}).onComplete(function () {
					fsm.send(this.eventToEmit.channel);
				}.bind(this)).start(time);
		}
	};

	return TweenLightColorAction;
})(goo.Action,goo.TWEEN);
goo.SetClearColorAction = (function (
	Action
) {
	'use strict';

	function SetClearColorAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this._oldClearColor = [];
	}

	SetClearColorAction.prototype = Object.create(Action.prototype);
	SetClearColorAction.prototype.constructor = SetClearColorAction;

	SetClearColorAction.external = {
		key: 'Set Clear Color',
		name: 'Background Color',
		description: 'Sets the clear color',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Color',
			'default': [1, 1, 1]
		}],
		transitions: []
	};

	SetClearColorAction.prototype.ready = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var goo = entity._world.gooRunner;
		this._oldClearColor[0] = goo.renderer._clearColor.x;
		this._oldClearColor[1] = goo.renderer._clearColor.y;
		this._oldClearColor[2] = goo.renderer._clearColor.z;
		this._oldClearColor[3] = goo.renderer._clearColor.w;
	};

	SetClearColorAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var goo = entity._world.gooRunner;
		goo.renderer.setClearColor(this.color[0], this.color[1], this.color[2], 1);
	};

	SetClearColorAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity) {
			var goo = entity._world.gooRunner;
			goo.renderer.setClearColor(
				this._oldClearColor[0],
				this._oldClearColor[1],
				this._oldClearColor[2],
				this._oldClearColor[3]
			);
		}
	};

	return SetClearColorAction;
})(goo.Action);
goo.SwitchCameraAction = (function (
	Action,
	SystemBus,
	Renderer
) {
	'use strict';

	function SwitchCameraAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this._camera = null;
	}

	SwitchCameraAction.prototype = Object.create(Action.prototype);
	SwitchCameraAction.prototype.constructor = SwitchCameraAction;

	SwitchCameraAction.external = {
		name: 'Switch Camera',
		type: 'camera',
		description: 'Switches to a selected camera',
		parameters: [{
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Camera to switch to',
			'default': null
		}],
		transitions: []
	};

	SwitchCameraAction.prototype.ready = function (/*fsm*/) {
		this._camera = Renderer.mainCamera;
	};

	SwitchCameraAction.prototype._run = function (fsm) {
		var world = fsm.getOwnerEntity()._world;
		var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
		if (cameraEntity && cameraEntity.cameraComponent) {
			SystemBus.emit('goo.setCurrentCamera', {
				camera: cameraEntity.cameraComponent.camera,
				entity: cameraEntity
			});
		}
	};

	SwitchCameraAction.prototype.cleanup = function (/*fsm*/) {
	};

	return SwitchCameraAction;
})(goo.Action,goo.SystemBus,goo.Renderer);
goo.InFrustumAction = (function (
	Action,
	Camera,
	BoundingSphere
) {
	'use strict';

	function InFrustumAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	InFrustumAction.prototype = Object.create(Action.prototype);
	InFrustumAction.prototype.constructor = InFrustumAction;

	InFrustumAction.external = {
		key: 'In Frustum',
		name: 'In View',
		type: 'camera',
		description: 'Performs a transition based on whether the entity is in a camera\'s frustum or not',
		canTransition: true,
		parameters: [{
			name: 'Current camera',
			key: 'current',
			type: 'boolean',
			description: 'Check this to always use the current camera',
			'default': true
		}, {
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Other camera; Will be ignored if the previous option is checked',
			'default': null
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'inside',
			name: 'Inside',
			description: 'State to transition to if entity is in the frustum'
		}, {
			key: 'outside',
			name: 'Outside',
			description: 'State to transition to if entity is outside the frustum'
		}]
	};

	InFrustumAction.prototype._setup = function (fsm) {
		if (!this.current) {
			var world = fsm.getOwnerEntity()._world;
			var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
			this.camera = cameraEntity.cameraComponent.camera;
		}
	};

	InFrustumAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (this.current) {
			if (entity.isVisible) {
				fsm.send(this.transitions.inside);
			} else {
				fsm.send(this.transitions.outside);
			}
		} else {
			var boundingVolume = entity.meshRendererComponent ? entity.meshRendererComponent.worldBound : new BoundingSphere(entity.transformComponent.worldTransform.translation, 0.001);
			if (this.camera.contains(boundingVolume) === Camera.Outside) {
				fsm.send(this.transitions.outside);
			} else {
				fsm.send(this.transitions.inside);
			}
		}
	};

	return InFrustumAction;
})(goo.Action,goo.Camera,goo.BoundingSphere);
goo.DollyZoomAction = (function (
	Action,
	Vector3,
	TWEEN
) {
	'use strict';

	function DollyZoomAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	DollyZoomAction.prototype = Object.create(Action.prototype);
	DollyZoomAction.prototype.constructor = DollyZoomAction;

	DollyZoomAction.external = {
		name: 'Dolly Zoom',
		type: 'camera',
		description: 'Performs dolly zoom',
		parameters: [{
			name: 'Forward',
			key: 'forward',
			type: 'number',
			description: 'Number of units to move towards the focus point. Enter negative values to move away.',
			'default': 100
		}, {
			name: 'Focus point',
			key: 'lookAt',
			type: 'position',
			description: 'Point to focus on while transitioning',
			'default': [0, 0, 0]
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time',
			'default': 10000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the transition completes'
		}]
	};

	DollyZoomAction.prototype.configure = function (settings) {
		this.forward = settings.forward;
		this.lookAt = settings.lookAt;
		this.time = settings.time;

		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	DollyZoomAction.prototype._setup = function (fsm) {
		this.tween = new TWEEN.Tween();
		var entity = fsm.getOwnerEntity();

		if (entity.cameraComponent && entity.cameraComponent.camera) {
			var camera = entity.cameraComponent.camera;
			this.initialDistance = new Vector3(this.lookAt).distance(camera.translation);
			this.eyeTargetScale = Math.tan(camera.fov * (Math.PI / 180) / 2) * this.initialDistance;
		} else {
			this.eyeTargetScale = null;
		}
	};

	DollyZoomAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	DollyZoomAction.prototype._run = function (fsm) {
		if (this.eyeTargetScale) {
			var entity = fsm.getOwnerEntity();
			var transformComponent = entity.transformComponent;
			var translation = transformComponent.transform.translation;
			var initialTranslation = new Vector3().copy(translation);
			var camera = entity.cameraComponent.camera;
			var time = entity._world.time * 1000;

			var to = Vector3.fromArray(this.lookAt)
				.sub(initialTranslation)
				.normalize()
				.scale(this.forward)
				.add(initialTranslation);

			var fakeFrom = { x: initialTranslation.x, y: initialTranslation.y, z: initialTranslation.z, d: this.initialDistance };
			var fakeTo = { x: to.x, y: to.y, z: to.z, d: +this.initialDistance - +this.forward };

			var old = { x: fakeFrom.x, y: fakeFrom.y, z: fakeFrom.z };
			var that = this;

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				translation.x += this.x - old.x;
				translation.y += this.y - old.y;
				translation.z += this.z - old.z;

				old.x = this.x;
				old.y = this.y;
				old.z = this.z;

				transformComponent.setUpdated();

				var fov = (180 / Math.PI) * 2 * Math.atan(that.eyeTargetScale / this.d);
				camera.setFrustumPerspective(fov);
			}).onComplete(function () {
				fsm.send(this.eventToEmit.channel);
			}.bind(this)).start(time);
		}
	};

	return DollyZoomAction;
})(goo.Action,goo.Vector3,goo.TWEEN);
goo.InBoxAction = (function (
	Action
) {
	'use strict';

	function InBoxAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	InBoxAction.prototype = Object.create(Action.prototype);
	InBoxAction.prototype.constructor = InBoxAction;

	InBoxAction.external = {
		name: 'In Box',
		type: 'collision',
		description: 'Performs a transition based on whether an entity is inside a user defined box volume or not.' +
			'The volume is defined by setting two points which, when connected, form a diagonal through the box volume.',
		canTransition: true,
		parameters: [{
			name: 'Point1',
			key: 'point1',
			type: 'position',
			description: 'First box point',
			'default': [-1, -1, -1]
		}, {
			name: 'Point2',
			key: 'point2',
			type: 'position',
			description: 'Second box point',
			'default': [1, 1, 1]
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'inside',
			name: 'Inside',
			description: 'State to transition to if the entity is inside the box'
		}, {
			key: 'outside',
			name: 'Outside',
			description: 'State to transition to if the entity is outside the box'
		}]
	};


	// TODO: Find this in some Util class
	function checkInside(pos, pt1, pt2) {
		var inside = false;

		var inOnAxis = function (pos, pt1, pt2) {
			if (pt1 > pt2) {
				if (pos < pt1 && pos > pt2) {
					return true;
				}
			} else if (pt2 > pt1) {
				if (pos < pt2 && pos > pt1) {
					return true;
				}
			} else {
				if (pos === pt2) {
					return true;
				}
			}
			return false;
		};

		var isInsideX = inOnAxis(pos[0], pt1[0], pt2[0]);
		var isInsideY = inOnAxis(pos[1], pt1[1], pt2[1]);
		var isInsideZ = inOnAxis(pos[2], pt1[2], pt2[2]);

		if (isInsideX && isInsideY && isInsideZ) {
			inside = true;
		}

		return inside;
	}

	InBoxAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var translation = entity.transformComponent.worldTransform.translation;

		var inside = checkInside([translation.x, translation.y, translation.z], this.point1, this.point2);

		if (inside) {
			fsm.send(this.transitions.inside);
		} else {
			fsm.send(this.transitions.outside);
		}
	};

	return InBoxAction;
})(goo.Action);
goo.CompareDistanceAction = (function (
	Action,
	Vector3,
	Renderer
) {
	'use strict';

	function CompareDistanceAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CompareDistanceAction.prototype = Object.create(Action.prototype);
	CompareDistanceAction.prototype.constructor = CompareDistanceAction;

	CompareDistanceAction.external = {
		key: 'Compare Distance',
		name: 'Camera Distance',
		type: 'collision',
		description: 'Performs a transition based on the distance to the main camera or to a location',
		canTransition: true,
		parameters: [{
			name: 'Current camera',
			key: 'camera',
			type: 'boolean',
			description: 'Measure the distance to the current camera or to an arbitrary point',
			'default': true
		}, {
			name: 'Position',
			key: 'position',
			type: 'position',
			description: 'Position to measure the distance to; Will be ignored if previous option is selected',
			'default': [0, 0, 0]
		}, {
			name: 'Value',
			key: 'value',
			type: 'number',
			description: 'Value to compare to',
			'default': 0
		}, {
			name: 'Tolerance',
			key: 'tolerance',
			type: 'number',
			'default': 0.1
		}, {
			name: 'Type',
			key: 'distanceType',
			type: 'string',
			control: 'dropdown',
			description: 'The type of distance',
			'default': 'Euclidean',
			options: ['Euclidean', 'Manhattan']
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'less',
			name: 'Less',
			description: 'State to transition to if the measured distance is smaller than the specified value'
		}, {
			key: 'equal',
			name: 'Equal',
			description: 'State to transition to if the measured distance is about the same as the specified value'
		}, {
			key: 'greater',
			name: 'Greater',
			description: 'State to transition to if the measured distance is greater than the specified value'
		}]
	};

	CompareDistanceAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var translation = entity.transformComponent.worldTransform.translation;
		var delta;

		if (this.camera) {
			delta = translation.clone().sub(Renderer.mainCamera.translation);
		} else {
			delta = translation.clone().subDirect(this.position[0], this.position[1], this.position[2]);
		}

		var distance;
		if (this.type === 'Euclidean') {
			distance = delta.length();
		} else {
			distance = Math.abs(delta.x) + Math.abs(delta.y) + Math.abs(delta.z);
		}
		var diff = this.value - distance;

		if (Math.abs(diff) <= this.tolerance) {
			fsm.send(this.transitions.equal);
		} else if (diff > 0) {
			fsm.send(this.transitions.less);
		} else {
			fsm.send(this.transitions.greater);
		}
	};

	return CompareDistanceAction;
})(goo.Action,goo.Vector3,goo.Renderer);
goo.ProximitySystem = (function (
	System,
	SystemBus,
	StringUtils
) {
	'use strict';

	/**
	 * Processes all entities with a proximity component
	 * @param {Renderer} renderer
	 * @param {RenderSystem} renderSystem
	 * @private
	 * @extends System
	 */
	function ProximitySystem() {
		System.call(this, 'ProximitySystem', ['ProximityComponent']);

		this.collections = {
			Red: { name: 'Red', collection: [] },
			Blue: { name: 'Blue', collection: [] },
			Green: { name: 'Green', collection: [] },
			Yellow: { name: 'Yellow', collection: [] }
		};
	}

	ProximitySystem.prototype = Object.create(System.prototype);

	ProximitySystem.prototype._collides = function (first, second) {
		// really non-optimal
		for (var i = 0; i < first.collection.length; i++) {
			var firstElement = first.collection[i];
			for (var j = 0; j < second.collection.length; j++) {
				var secondElement = second.collection[j];

				if (firstElement.meshRendererComponent.worldBound.intersects(secondElement.meshRendererComponent.worldBound)) {
					SystemBus.send('collides.' + first.name + '.' + second.name);
				}
			}
		}
	};

	function formatTag(tag) {
		return StringUtils.capitalize(tag);
	}

	ProximitySystem.prototype.getFor = function (tag) {
		tag = formatTag(tag);
		if (this.collections[tag]) {
			return this.collections[tag].collection;
		} else {
			return [];
		}
	};

	ProximitySystem.prototype.add = function (entity, tag) {
		tag = formatTag(tag);
		if (!this.collections[tag]) {
			this.collections[tag] = { name: tag, collection: [] };
		}
		this.collections[tag].collection.push(entity);
	};

	ProximitySystem.prototype.remove = function (entity, tag) {
		tag = formatTag(tag);
		var collection = this.collections[tag].collection;
		var index = collection.indexOf(entity);
		collection.splice(index, 1);
	};

	ProximitySystem.prototype.process = function (/*entities*/) {
		/*
		this._collides(this.collections.red, this.collections.blue);
		this._collides(this.collections.red, this.collections.green);
		this._collides(this.collections.red, this.collections.yellow);

		this._collides(this.collections.blue, this.collections.green);
		this._collides(this.collections.blue, this.collections.yellow);

		this._collides(this.collections.green, this.collections.yellow);
		*/
	};

	return ProximitySystem;
})(goo.System,goo.SystemBus,goo.StringUtils);
goo.CollidesAction = (function (
	EntitySelection,
	Action,
	ProximitySystem
) {
	'use strict';

	function CollidesAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
	}

	CollidesAction.prototype = Object.create(Action.prototype);
	CollidesAction.prototype.constructor = CollidesAction;

	CollidesAction.external = {
		key: 'Collides',
		name: 'Collision',
		type: 'collision',
		description: 'Checks for collisions or non-collisions with other entities. Collisions are based on the entities\' bounding volumes. Before using collisions you first need to tag entities via the entity panel or using the \'Tag\' action.',
		canTransition: true,
		parameters: [{
			name: 'Tag',
			key: 'tag',
			type: 'string',
			description: 'Checks for collisions with other objects having this tag',
			'default': 'red'
		}],
		transitions: [{
			key: 'collides',
			name: 'On Collision',
			description: 'State to transition to when a collision occurs'
		}, {
			key: 'notCollides',
			name: 'On Divergence',
			description: 'State to transition to when a collision is not occurring'
		}]
	};

	CollidesAction.prototype.ready = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		if (!world.getSystem('ProximitySystem')) {
			world.setSystem(new ProximitySystem());
		}
	};

	CollidesAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		var proximitySystem = world.getSystem('ProximitySystem');

		var entities = new EntitySelection(proximitySystem.getFor(this.tag))
			.and(world.by.tag(this.tag))
			.toArray();

		var collides = false;

		entity.traverse(function (entity) {
			// Stop traversing when the entity can't collide with anything.
			if (!entity.meshRendererComponent || entity.particleComponent) {
				return false;
			}

			var worldBound = entity.meshRendererComponent.worldBound;

			for (var i = 0; i < entities.length; i++) {
				entities[i].traverse(function (entity) {
					if (!entity.meshRendererComponent || entity.particleComponent) {
						return true; // Move on to other entities.
					}

					var otherBound = entity.meshRendererComponent.worldBound;
					if (otherBound && worldBound.intersects(otherBound)) {
						collides = true;
						return false; // Stop traversing.
					}
				});

				if (collides) {
					return false; // Stop traversing.
				}
			}
		});

		fsm.send(collides ? this.transitions.collides : this.transitions.notCollides);
	};

	return CollidesAction;
})(goo.EntitySelection,goo.Action,goo.ProximitySystem);
goo.ProximityComponent = (function (
	Component
) {
	'use strict';

	/**
	 * @private
	 */
	function ProximityComponent(tag) {
		Component.apply(this, arguments);

		this.type = 'ProximityComponent';

		Object.defineProperty(this, 'tag', {
			value: tag || 'red',
			writable: false
		});
	}

	ProximityComponent.prototype = Object.create(Component.prototype);
	ProximityComponent.prototype.constructor = ProximityComponent;

	ProximityComponent.prototype.attached = function (entity) {
		var world = entity._world;
		if (!world) { return; }

		var proximitySystem = world.getSystem('ProximitySystem');
		if (!proximitySystem) { return; }

		proximitySystem.add(entity, this.tag);
	};

	ProximityComponent.prototype.detached = function (entity) {
		var world = entity._world;
		if (!world) { return; }

		var proximitySystem = world.getSystem('ProximitySystem');
		if (!proximitySystem) { return; }

		proximitySystem.remove(entity, this.tag);
	};

	return ProximityComponent;
})(goo.Component);
goo.TagAction = (function (
	Action,
	ProximityComponent
) {
	'use strict';

	function TagAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TagAction.prototype = Object.create(Action.prototype);
	TagAction.prototype.constructor = TagAction;

	TagAction.external = {
		name: 'Tag',
		type: 'collision',
		description: 'Sets a tag on the entity. Use tags to be able to capture collision events with the \'Collides\' action',
		parameters: [{
			name: 'Tag',
			key: 'tag',
			type: 'string',
			control: 'dropdown',
			description: 'Checks for collisions with other objects having this tag',
			'default': 'red',
			options: ['red', 'blue', 'green', 'yellow']
		}],
		transitions: []
	};

	TagAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.proximityComponent) {
			if (entity.proximityComponent.tag !== this.tag) {
				entity.clearComponent('ProximityComponent');
				entity.setComponent(new ProximityComponent(this.tag));
			}
		} else {
			entity.setComponent(new ProximityComponent(this.tag));
		}
	};

	TagAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity) {
			entity.clearComponent('ProximityComponent');
		}
	};

	return TagAction;
})(goo.Action,goo.ProximityComponent);
goo.SmokeAction = (function (
	Action,
	Material,
	ShaderLib,
	TextureCreator,
	ParticleLib,
	ParticleSystemUtils
) {
	'use strict';

	function SmokeAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.smokeEntity = null;
	}

	SmokeAction.material = null;

	SmokeAction.prototype = Object.create(Action.prototype);
	SmokeAction.prototype.constructor = SmokeAction;

	SmokeAction.external = {
		key: 'Smoke',
		name: 'Smoke FX',
		type: 'fx',
		description: 'Makes the entity emit smoke. To cancel the smoke emitter use the "Remove Particles" action.',
		parameters: [{
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Smoke color',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	SmokeAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (this.smokeEntity && entity.transformComponent.children.indexOf(this.smokeEntity.transformComponent) !== -1) {
			return;
		}

		var gooRunner = entity._world.gooRunner;

		if (!SmokeAction.material) {
			SmokeAction.material = new Material(ShaderLib.particles);
			var texture = ParticleSystemUtils.createFlareTexture();
			texture.generateMipmaps = true;
			SmokeAction.material.setTexture('DIFFUSE_MAP', texture);
			SmokeAction.material.blendState.blending = 'TransparencyBlending';
			SmokeAction.material.cullState.enabled = false;
			SmokeAction.material.depthState.write = false;
			SmokeAction.material.renderQueue = 2001;
		}

		var entityScale = entity.transformComponent.worldTransform.scale;
		var scale = (entityScale.x + entityScale.y + entityScale.z) / 3;
		this.smokeEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner.world,
			ParticleLib.getSmoke({
				scale: scale,
				color: this.color
			}),
			SmokeAction.material
		);
		this.smokeEntity.meshRendererComponent.isPickable = false;
		this.smokeEntity.meshRendererComponent.castShadows = false;
		this.smokeEntity.meshRendererComponent.receiveShadows = false;
		this.smokeEntity.name = '_ParticleSystemSmoke';
		entity.transformComponent.attachChild(this.smokeEntity.transformComponent);

		this.smokeEntity.addToWorld();
	};

	SmokeAction.prototype.cleanup = function (/*fsm*/) {
		if (this.smokeEntity) {
			this.smokeEntity.removeFromWorld();
			this.smokeEntity = null;
		}
	};

	return SmokeAction;
})(goo.Action,goo.Material,goo.ShaderLib,goo.TextureCreator,goo.ParticleLib,goo.ParticleSystemUtils);
goo.FireAction = (function (
	Action,
	Material,
	ShaderLib,
	ParticleLib,
	ParticleSystemUtils
) {
	'use strict';

	function FireAction(/*id, settings*/) {
		Action.apply(this, arguments);
		this.fireEntity = null;
	}

	FireAction.material = null;

	FireAction.prototype = Object.create(Action.prototype);
	FireAction.prototype.constructor = FireAction;

	FireAction.external = {
		key: 'Fire',
		name: 'Fire FX',
		type: 'fx',
		description: 'Makes the entity emit fire. To "extinguish" the fire use the "Remove Particles" action.',
		parameters: [{
			name: 'Start Color',
			key: 'startColor',
			type: 'vec3',
			control: 'color',
			description: 'Flame color at source',
			'default': [1, 1, 0]
		}, {
			name: 'End color',
			key: 'endColor',
			type: 'vec3',
			control: 'color',
			description: 'Color near the end of a flame\'s life',
			'default': [1, 0, 0]
		}],
		transitions: []
	};

	FireAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (this.fireEntity && entity.transformComponent.children.indexOf(this.fireEntity.transformComponent) !== -1) {
			return;
		}

		var gooRunner = entity._world.gooRunner;

		if (!FireAction.material) {
			FireAction.material = new Material(ShaderLib.particles);
			var texture = ParticleSystemUtils.createFlareTexture();
			texture.generateMipmaps = true;
			FireAction.material.setTexture('DIFFUSE_MAP', texture);
			FireAction.material.blendState.blending = 'AdditiveBlending';
			FireAction.material.cullState.enabled = false;
			FireAction.material.depthState.write = false;
			FireAction.material.renderQueue = 2002;
		}

		var entityScale = entity.transformComponent.worldTransform.scale;
		var scale = (entityScale.x + entityScale.y + entityScale.z) / 3;
		this.fireEntity = ParticleSystemUtils.createParticleSystemEntity(
			gooRunner.world,
			ParticleLib.getFire({
				scale: scale,
				startColor: this.startColor,
				endColor: this.endColor
			}),
			FireAction.material
		);
		this.fireEntity.meshRendererComponent.isPickable = false;
		this.fireEntity.meshRendererComponent.castShadows = false;
		this.fireEntity.meshRendererComponent.receiveShadows = false;
		this.fireEntity.name = '_ParticleSystemFire';
		entity.transformComponent.attachChild(this.fireEntity.transformComponent);

		this.fireEntity.addToWorld();
	};

	FireAction.prototype.cleanup = function (/*fsm*/) {
		if (this.fireEntity) {
			this.fireEntity.removeFromWorld();
			this.fireEntity = null;
		}
	};

	return FireAction;
})(goo.Action,goo.Material,goo.ShaderLib,goo.ParticleLib,goo.ParticleSystemUtils);
goo.RemoveParticlesAction = (function (
	Action
) {
	'use strict';

	function RemoveParticlesAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	RemoveParticlesAction.prototype = Object.create(Action.prototype);
	RemoveParticlesAction.prototype.constructor = RemoveParticlesAction;

	RemoveParticlesAction.external = {
		name: 'Remove Particles',
		type: 'fx',
		description: 'Removes any particle emitter attached to the entity',
		parameters: [],
		transitions: []
	};

	RemoveParticlesAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		entity.children().each(function (child) {
			if (child.name.indexOf('_ParticleSystem') !== -1 && child.hasComponent('ParticleComponent')) {
				child.removeFromWorld();
			}
		});
	};

	return RemoveParticlesAction;
})(goo.Action);
goo.TogglePostFxAction = (function (
	Action
) {
	'use strict';

	function TogglePostFxAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TogglePostFxAction.prototype = Object.create(Action.prototype);
	TogglePostFxAction.prototype.constructor = TogglePostFxAction;

	TogglePostFxAction.external = {
		name: 'Toggle Post FX',
		type: 'fx',
		description: 'Enabled/disables post fx globally',
		parameters: [{
			name: 'Set Post FX state',
			key: 'enabled',
			type: 'boolean',
			description: 'Set Post FX on/off',
			'default': true
		}],
		transitions: []
	};

	TogglePostFxAction.prototype._run = function (fsm) {
		var renderSystem = fsm.getWorld().gooRunner.renderSystem;
		if (renderSystem) {
			renderSystem.enableComposers(this.enabled);
		}
	};

	return TogglePostFxAction;
})(goo.Action);
goo.PlaySoundAction = (function (
	Action,
	PromiseUtil
) {
	'use strict';

	function PlaySoundAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PlaySoundAction.prototype = Object.create(Action.prototype);
	PlaySoundAction.prototype.constructor = PlaySoundAction;

	PlaySoundAction.external = {
		name: 'Play Sound',
		type: 'sound',
		description: 'Plays a sound. NOTE: will not work on iOS devices.',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound',
			'default': 0
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the sound finishes playing'
		}]
	};

	PlaySoundAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('SoundComponent')) { return; }

		var sound = entity.soundComponent.getSoundById(this.sound);
		if (!sound) { return; }

		var endPromise;
		try {
			endPromise = sound.play();
		} catch (e) {
			console.warn('Could not play sound: ' + e);
			endPromise = PromiseUtil.resolve();
		}

		endPromise.then(function () {
			fsm.send(this.transitions.complete);
		}.bind(this));
	};

	return PlaySoundAction;
})(goo.Action,goo.PromiseUtil);
goo.PauseSoundAction = (function (
	Action
) {
	'use strict';

	function PauseSoundAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PauseSoundAction.prototype = Object.create(Action.prototype);
	PauseSoundAction.prototype.constructor = PauseSoundAction;

	PauseSoundAction.external = {
		name: 'Pause Sound',
		type: 'sound',
		description: 'Pauses a sound.',
		canTransition: false,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound',
			'default': 0
		}],
		transitions: []
	};

	PauseSoundAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.pause();
			}
		}
	};

	return PauseSoundAction;
})(goo.Action);
goo.StopSoundAction = (function (
	Action
) {
	'use strict';

	function StopSoundAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	StopSoundAction.prototype = Object.create(Action.prototype);
	StopSoundAction.prototype.constructor = StopSoundAction;

	StopSoundAction.external = {
		name: 'Stop Sound',
		type: 'sound',
		description: 'Stops a sound.',
		canTransition: false,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound',
			'default': 0
		}],
		transitions: []
	};

	StopSoundAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.stop();
			}
		}
	};

	return StopSoundAction;
})(goo.Action);
goo.SoundFadeInAction = (function (
	Action,
	PromiseUtil
) {
	'use strict';

	function SoundFadeInAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SoundFadeInAction.prototype = Object.create(Action.prototype);
	SoundFadeInAction.prototype.constructor = SoundFadeInAction;

	SoundFadeInAction.external = {
		name: 'Sound Fade In',
		type: 'sound',
		description: 'Fades in a sound. NOTE: will not work on iOS devices.',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound',
			'default': 0
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for the fading to complete',
			'default': 1000
		}, {
			name: 'On Sound End',
			key: 'onSoundEnd',
			type: 'boolean',
			description: 'Whether to transition when the sound finishes playing, regardless of the specified transition time',
			'default': false
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the time expires or when the sound finishes playing'
		}]
	};

	SoundFadeInAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('SoundComponent')) { return; }

		var sound = entity.soundComponent.getSoundById(this.sound);
		if (!sound) { return; }

		var endPromise;
		try {
			sound.fadeIn(this.time / 1000);

			if (this.onSoundEnd) {
				endPromise = sound.play();
			} else {
				endPromise = PromiseUtil.delay(null, this.time);
			}
		} catch (e) {
			console.warn('Could not play sound: ' + e);
			endPromise = PromiseUtil.resolve();
		}

		endPromise.then(function () {
			fsm.send(this.transitions.complete);
		}.bind(this));
	};

	return SoundFadeInAction;
})(goo.Action,goo.PromiseUtil);
goo.SoundFadeOutAction = (function (
	Action
) {
	'use strict';

	function SoundFadeOutAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SoundFadeOutAction.prototype = Object.create(Action.prototype);
	SoundFadeOutAction.prototype.constructor = SoundFadeOutAction;

	SoundFadeOutAction.external = {
		name: 'Sound Fade Out',
		type: 'sound',
		description: 'Fades out a sound and stops it.',
		canTransition: true,
		parameters: [{
			name: 'Sound',
			key: 'sound',
			type: 'sound',
			description: 'Sound',
			'default': 0
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for the fading to complete',
			'default': 1000
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the movement completes'
		}]
	};

	SoundFadeOutAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.hasComponent('SoundComponent')) {
			var sound = entity.soundComponent.getSoundById(this.sound);
			if (sound) {
				sound.fadeOut(this.time / 1000).then(function () {
					fsm.send(this.transitions.complete);
				}.bind(this));
			}
		}
		// if howler's fade out method is not behaving nice then we can switch to tweening the volume 'manually'
	};

	return SoundFadeOutAction;
})(goo.Action);
goo.SetRenderTargetAction = (function (
	Action,
	PortalComponent,
	PortalSystem,
	Vector3,
	CameraComponent,
	Camera,
	Material,
	ShaderLib
) {
	'use strict';

	function SetRenderTargetAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetRenderTargetAction.prototype = Object.create(Action.prototype);
	SetRenderTargetAction.prototype.constructor = SetRenderTargetAction;

	SetRenderTargetAction.external = {
		name: 'Set Render Target',
		type: 'texture',
		description: 'Renders what a camera sees on the current entity\'s texture',
		parameters: [{
			name: 'Camera',
			key: 'cameraEntityRef',
			type: 'camera',
			description: 'Camera to use as source',
			'default': null
		}],
		transitions: []
	};

	SetRenderTargetAction.prototype.ready = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;
		if (!world.getSystem('PortalSystem')) {
			var renderSystem = world.getSystem('RenderSystem');
			var renderer = world.gooRunner.renderer;
			world.setSystem(new PortalSystem(renderer, renderSystem));
		}
	};

	SetRenderTargetAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var world = entity._world;

		var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);

		if (!cameraEntity || !cameraEntity.cameraComponent || !cameraEntity.cameraComponent.camera) { return; }
		var camera = cameraEntity.cameraComponent.camera;

		var portalMaterial = new Material(ShaderLib.textured);

		if (!entity.meshRendererComponent) { return; }
		this.oldMaterials = entity.meshRendererComponent.materials;
		entity.meshRendererComponent.materials = [portalMaterial];

		var portalComponent = new PortalComponent(camera, 500, { preciseRecursion: true });
		entity.setComponent(portalComponent);
	};

	SetRenderTargetAction.prototype.cleanup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity) {
			if (this.oldMaterials && entity.meshRendererComponent) {
				entity.meshRendererComponent.materials = this.oldMaterials;
			}
			entity.clearComponent('portalComponent');
		}

		this.oldMaterials = null;

		// would remove the entire system, but the engine does not support that
	};

	return SetRenderTargetAction;
})(goo.Action,goo.PortalComponent,goo.PortalSystem,goo.Vector3,goo.CameraComponent,goo.Camera,goo.Material,goo.ShaderLib);
goo.TweenTextureOffsetAction = (function (
	Action,
	TWEEN
) {
	'use strict';

	function TweenTextureOffsetAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenTextureOffsetAction.prototype = Object.create(Action.prototype);
	TweenTextureOffsetAction.prototype.constructor = TweenTextureOffsetAction;

	TweenTextureOffsetAction.external = {
		key: 'Tween Texture Offset',
		name: 'Tween Texture Offset',
		type: 'texture',
		description: 'Smoothly changes the texture offset of the entity',
		canTransition: true,
		parameters: [{
			name: 'X Offset',
			key: 'toX',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1,
			description: 'X Offset',
			'default': 1
		}, {
			name: 'Y Offset',
			key: 'toY',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1,
			description: 'Y Offset',
			'default': 1
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'number',
			description: 'Time it takes for this transition to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the transition completes'
		}]
	};

	TweenTextureOffsetAction.prototype.configure = function (settings) {
		this.toX = +settings.toX;
		this.toY = +settings.toY;
		this.time = +settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenTextureOffsetAction.prototype._setup = function () {
		this.tween = new TWEEN.Tween();
	};

	TweenTextureOffsetAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenTextureOffsetAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.meshRendererComponent && entity.meshRendererComponent.materials.length > 0) {
			var meshRendererComponent = entity.meshRendererComponent;
			var material = meshRendererComponent.materials[0];
			var texture = material.getTexture('DIFFUSE_MAP');
			if (!texture) { return; }
			var initialOffset = texture.offset;
			var time = entity._world.time * 1000;

			var fakeFrom = { x: initialOffset.x, y: initialOffset.y };
			var fakeTo = { x: this.toX, y: this.toY };

			this.tween.from(fakeFrom).to(fakeTo, this.time).easing(this.easing).onUpdate(function () {
				texture.offset.setDirect(this.x, this.y);
			}).onComplete(function () {
				fsm.send(this.eventToEmit.channel);
			}.bind(this)).start(time);
		}
	};

	return TweenTextureOffsetAction;
})(goo.Action,goo.TWEEN);
goo.SetMaterialColorAction = (function (
	Action
) {
	'use strict';

	function SetMaterialColorAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetMaterialColorAction.prototype = Object.create(Action.prototype);
	SetMaterialColorAction.prototype.constructor = SetMaterialColorAction;

	SetMaterialColorAction.external = {
		name: 'Set Material Color',
		type: 'texture',
		description: 'Sets the color of a material',
		parameters: [{
			name: 'Entity (optional)',
			key: 'entity',
			type: 'entity',
			description: 'Entity that has a material'
		}, {
			name: 'Color type',
			key: 'type',
			type: 'string',
			control: 'dropdown',
			description: 'Color type',
			'default': 'Diffuse',
			options: ['Diffuse', 'Emissive', 'Specular', 'Ambient']
		}, {
			name: 'Color',
			key: 'color',
			type: 'vec3',
			control: 'color',
			description: 'Color',
			'default': [1, 1, 1]
		}],
		transitions: []
	};

	SetMaterialColorAction.MAPPING = {
		'Diffuse': 'materialDiffuse',
		'Emissive': 'materialEmissive',
		'Specular': 'materialSpecular',
		'Ambient': 'materialAmbient'
	};

	SetMaterialColorAction.prototype._run = function (fsm) {
		var entity = (this.entity && fsm.getEntityById(this.entity.entityRef)) || fsm.getOwnerEntity();
		if (entity && entity.meshRendererComponent) {
			var material = entity.meshRendererComponent.materials[0];
			var typeName = SetMaterialColorAction.MAPPING[this.type];
			material.uniforms[typeName] = material.uniforms[typeName] || [1, 1, 1, 1];
			var col = material.uniforms[typeName];
			col[0] = this.color[0];
			col[1] = this.color[1];
			col[2] = this.color[2];
		}
	};

	return SetMaterialColorAction;
})(goo.Action);
goo.LogMessageAction = (function (
	Action
) {
	'use strict';

	function LogMessageAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	LogMessageAction.prototype = Object.create(Action.prototype);
	LogMessageAction.prototype.constructor = LogMessageAction;

	LogMessageAction.external = {
		name: 'Log Message',
		description: 'Prints a message in the debug console of your browser',
		parameters: [{
			name: 'Message',
			key: 'message',
			type: 'string',
			description: 'Message to print',
			'default': 'hello'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': false
		}],
		transitions: []
	};

	LogMessageAction.prototype._run = function (/*fsm*/) {
		console.log(this.message);
	};

	return LogMessageAction;
})(goo.Action);
goo.TweenOpacityAction = (function (
	Action,
	TWEEN
) {
	'use strict';

	function TweenOpacityAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenOpacityAction.prototype = Object.create(Action.prototype);
	TweenOpacityAction.prototype.constructor = TweenOpacityAction;

	TweenOpacityAction.external = {
		key: 'Tween Opacity',
		name: 'Tween Material Opacity',
		type: 'texture',
		description: 'Tweens the opacity of a material',
		parameters: [{
			name: 'Opacity',
			key: 'to',
			type: 'float',
			control: 'spinner',
			description: 'Opacity',
			'default': 1
		}, {
			name: 'Time (ms)',
			key: 'time',
			type: 'float',
			control: 'spinner',
			description: 'Time it takes for the transition to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'string',
			control: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'string',
			control: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the transition completes'
		}]
	};

	TweenOpacityAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = TWEEN.Easing.Linear.None;
		} else {
			this.easing = TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenOpacityAction.prototype._setup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var meshRendererComponent = entity.meshRendererComponent;

		if (meshRendererComponent) {
			this.tween = new TWEEN.Tween();

			this.material = meshRendererComponent.materials[0];
			this.oldBlending = this.material.blendState.blending;
			this.oldQueue = this.material.renderQueue;
			this.oldOpacity = this.material.uniforms.opacity;

			if (this.material.blendState.blending === 'NoBlending') {
				this.material.blendState.blending = 'TransparencyBlending';
			}
			if (this.material.renderQueue < 2000) {
				this.material.renderQueue = 2000;
			}

			if (this.material.uniforms.opacity === undefined) {
				this.material.uniforms.opacity = 1;
			}
		}
	};

	TweenOpacityAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();

			this.material.blendState.blending = this.oldBlending;
			this.material.renderQueue = this.oldQueue;
			this.material.uniforms.opacity = this.oldOpacity;
		}
	};

	TweenOpacityAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (entity.meshRendererComponent) {
			var uniforms = this.material.uniforms;

			var time = entity._world.time * 1000;

			var fakeFrom = { opacity: uniforms.opacity };
			var fakeTo = { opacity: this.to };

			var old = { opacity: fakeFrom.opacity };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function () {
				uniforms.opacity += this.opacity - old.opacity;

				old.opacity = this.opacity;
			}).onComplete(function () {
				fsm.send(this.eventToEmit.channel);
			}.bind(this)).start(time);
		}
	};

	return TweenOpacityAction;
})(goo.Action,goo.TWEEN);
goo.HtmlAction = (function (
	Action
) {
	'use strict';

	function HtmlAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.everyFrame = true;
		this.updated = false;
		this.eventListener = function () {
			this.updated = true;
		}.bind(this);
	}

	HtmlAction.prototype = Object.create(Action.prototype);
	HtmlAction.prototype.constructor = HtmlAction;

	HtmlAction.external = {
		name: 'HTMLPick',
		type: 'controls',
		description: 'Listens for a picking event and performs a transition. Can only be used on HTML entities.',
		canTransition: true,
		parameters: [], // but not farther than some value
		transitions: [{
			key: 'pick',
			name: 'Pick',
			description: 'State to transition to when the HTML entity is picked'
		}]
	};

	HtmlAction.prototype._setup = function (fsm) {
		var ownerEntity = fsm.getOwnerEntity();
		if (ownerEntity.htmlComponent) {
			this.domElement = ownerEntity.htmlComponent.domElement;
			this.domElement.addEventListener('click', this.eventListener);
		}
	};

	HtmlAction.prototype._run = function (fsm) {
		if (this.updated) {
			this.updated = false;
			fsm.send(this.transitions.pick);
		}
	};

	HtmlAction.prototype.exit = function () {
		if (this.domElement) {
			this.domElement.removeEventListener('click', this.eventListener);
		}
	};

	return HtmlAction;
})(goo.Action);
goo.CopyJointTransformAction = (function (
	Action
) {
	'use strict';

	function CopyJointTransformAction() {
		Action.apply(this, arguments);
		this.everyFrame = true;
	}

	CopyJointTransformAction.prototype = Object.create(Action.prototype);
	CopyJointTransformAction.prototype.constructor = CopyJointTransformAction;

	CopyJointTransformAction.external = {
		name: 'Copy Joint Transform',
		type: 'animation',
		description: 'Copies a joint\'s transform from another entity, and applies it to this entity. This entity must be a child of an entity with an animation component',
		parameters: [{
			name: 'Joint',
			key: 'jointIndex',
			type: 'int',
			control: 'jointSelector',
			'default': null,
			description: 'Joint transform to copy'
		}],
		transitions: []
	};

	CopyJointTransformAction.prototype._run = function (fsm) {
		if (this.jointIndex === null) { return; }

		var entity = fsm.getOwnerEntity();
		var parent = entity.transformComponent.parent;
		if (!parent) { return; }

		parent = parent.entity;
		if (!parent.animationComponent || !parent.animationComponent._skeletonPose) { return; }
		var pose = parent.animationComponent._skeletonPose;
		var jointTransform = pose._globalTransforms[this.jointIndex];
		if (!jointTransform) { return; }

		entity.transformComponent.transform.matrix.copy(jointTransform.matrix);
		jointTransform.matrix.getTranslation(entity.transformComponent.transform.translation);
		jointTransform.matrix.getScale(entity.transformComponent.transform.scale);
		jointTransform.matrix.getRotation(entity.transformComponent.transform.rotation);
		updateWorldTransform(entity.transformComponent);
		entity.transformComponent._dirty = true;
	};

	function updateWorldTransform(transformComponent) {
		transformComponent.updateWorldTransform();
		var entity = transformComponent.entity;
		if (entity && entity.meshDataComponent && entity.meshRendererComponent) {
			entity.meshRendererComponent.updateBounds(
				entity.meshDataComponent.modelBound,
				transformComponent.worldTransform
			);
		}

		for (var i = 0; i < transformComponent.children.length; i++) {
			updateWorldTransform(transformComponent.children[i]);
		}
	}

	return CopyJointTransformAction;
})(goo.Action);
goo.TriggerEnterAction = (function (
	Action,
	SystemBus
) {
	'use strict';

	function TriggerEnterAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.entered = false;
		this.everyFrame = true;

		var that = this;
		this.listener = function (triggerEnterEvent) {
			if (triggerEnterEvent.entityA === that.entity || triggerEnterEvent.entityB === that.entity) {
				that.entered = true;
			}
		};
	}

	TriggerEnterAction.prototype = Object.create(Action.prototype);
	TriggerEnterAction.prototype.constructor = TriggerEnterAction;

	TriggerEnterAction.external = {
		name: 'TriggerEnter',
		type: 'collision',
		description: 'Transitions when the trigger collider is entered. This action only works if the entity has a Collider Component.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'enter',
			name: 'On enter',
			description: 'State to transition to when enter occurs'
		}]
	};

	TriggerEnterAction.prototype._setup = function (fsm) {
		this.entity = fsm.getOwnerEntity();
		this.entered = false;
		SystemBus.addListener('goo.physics.triggerEnter', this.listener);
	};

	TriggerEnterAction.prototype._cleanup = function () {
		this.entity = null;
	};

	TriggerEnterAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerEnter', this.listener);
		this.entered = false;
	};

	TriggerEnterAction.prototype._run = function (fsm) {
		if (this.entered) {
			fsm.send(this.transitions.enter);
			this.entered = false;
		}
	};

	return TriggerEnterAction;
})(goo.Action,goo.SystemBus);
goo.TriggerLeaveAction = (function (
	Action,
	SystemBus
) {
	'use strict';

	function TriggerLeaveAction(/*id, settings*/) {
		Action.apply(this, arguments);

		this.leaved = false;
		this.everyFrame = true;

		var that = this;
		this.listener = function (endContactEvent) {
			if (endContactEvent.entityA === that.entity || endContactEvent.entityB === that.entity) {
				that.leaved = true;
			}
		};
	}

	TriggerLeaveAction.prototype = Object.create(Action.prototype);
	TriggerLeaveAction.prototype.constructor = TriggerLeaveAction;

	TriggerLeaveAction.external = {
		name: 'TriggerLeave',
		type: 'collision',
		description: 'Transitions when a collider is leaving the entity trigger collider. This action only works if the entity has a Collider Component.',
		canTransition: true,
		parameters: [],
		transitions: [{
			key: 'leave',
			name: 'On leave',
			description: 'State to transition to when leave occurs'
		}]
	};

	TriggerLeaveAction.prototype._setup = function (fsm) {
		this.entity = fsm.getOwnerEntity();
		this.leaved = false;
		SystemBus.addListener('goo.physics.triggerExit', this.listener);
	};

	TriggerLeaveAction.prototype._cleanup = function () {
		this.entity = null;
	};

	TriggerLeaveAction.prototype.exit = function (/*fsm*/) {
		SystemBus.removeListener('goo.physics.triggerExit', this.listener);
		this.leaved = false;
	};

	TriggerLeaveAction.prototype._run = function (fsm) {
		if (this.leaved) {
			fsm.send(this.transitions.leave);
			this.leaved = false;
		}
	};

	return TriggerLeaveAction;
})(goo.Action,goo.SystemBus);
goo.ApplyImpulseAction = (function (
	Action,
	Vector3
) {
	'use strict';

	function ApplyImpulseAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ApplyImpulseAction.prototype = Object.create(Action.prototype);
	ApplyImpulseAction.prototype.constructor = ApplyImpulseAction;

	ApplyImpulseAction.external = {
		name: 'ApplyImpulse',
		type: 'physics',
		description: 'Apply an impulse to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Impulse',
			key: 'impulse',
			type: 'position',
			description: 'Impulse to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Apply point',
			key: 'point',
			type: 'position',
			description: 'Where on the body to apply the impulse, relative to the center of mass.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'The space where the impulse and apply point are defined.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	var impulseVector = new Vector3();
	var applyPoint = new Vector3();
	ApplyImpulseAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity.rigidBodyComponent) { return; }

		impulseVector.setArray(this.impulse);
		applyPoint.setArray(this.point);
		if (this.space === 'World') {
			entity.rigidBodyComponent.applyImpulse(impulseVector, applyPoint);
		} else {
			entity.rigidBodyComponent.applyImpulseLocal(impulseVector, applyPoint);
		}
	};

	return ApplyImpulseAction;
})(goo.Action,goo.Vector3);
goo.ApplyForceAction = (function (
	Action,
	Vector3,
	SystemBus
) {
	'use strict';

	function ApplyForceAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ApplyForceAction.prototype = Object.create(Action.prototype);
	ApplyForceAction.prototype.constructor = ApplyForceAction;

	ApplyForceAction.external = {
		name: 'ApplyForce',
		type: 'physics',
		description: 'Apply a force to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Force',
			key: 'force',
			type: 'position',
			description: 'Force to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Apply point',
			key: 'point',
			type: 'position',
			description: 'Where on the body to apply the force, relative to the center of mass.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'The space where the force and apply point are defined.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	var forceVector = new Vector3();
	var applyPoint = new Vector3();
	ApplyForceAction.prototype._setup = function (fsm) {
		SystemBus.addListener('goo.physics.substep', this.substepListener = function () {
			var entity = fsm.getOwnerEntity();
			if (!entity || !entity.rigidBodyComponent) { return; }

			forceVector.setArray(this.force);
			applyPoint.setArray(this.point);
			if (this.space === 'World') {
				entity.rigidBodyComponent.applyForce(forceVector, applyPoint);
			} else {
				entity.rigidBodyComponent.applyForceLocal(forceVector, applyPoint);
			}
		}.bind(this));
	};

	ApplyForceAction.prototype.exit = function () {
		SystemBus.removeListener('goo.physics.substep', this.substepListener);
	};

	return ApplyForceAction;
})(goo.Action,goo.Vector3,goo.SystemBus);
goo.ApplyTorqueAction = (function (
	Action,
	Vector3,
	SystemBus
) {
	'use strict';

	function ApplyTorqueAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ApplyTorqueAction.prototype = Object.create(Action.prototype);
	ApplyTorqueAction.prototype.constructor = ApplyTorqueAction;

	ApplyTorqueAction.external = {
		name: 'ApplyTorque',
		type: 'physics',
		description: 'Apply a torque to the attached rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Torque',
			key: 'torque',
			type: 'position',
			description: 'Torque to apply to the body.',
			'default': [0, 0, 0]
		}, {
			name: 'Space',
			key: 'space',
			type: 'string',
			control: 'dropdown',
			description: 'Whether to apply the torque in local or world space.',
			'default': 'World',
			options: ['World', 'Local']
		}],
		transitions: []
	};

	var torqueVector = new Vector3();
	ApplyTorqueAction.prototype._setup = function (fsm) {
		SystemBus.addListener('goo.physics.substep', this.substepListener = function () {
			var entity = fsm.getOwnerEntity();
			if (!entity || !entity.rigidBodyComponent) { return; }

			torqueVector.setArray(this.torque);
			if (this.space === 'World') {
				entity.rigidBodyComponent.applyTorque(torqueVector);
			} else {
				entity.rigidBodyComponent.applyTorqueLocal(torqueVector);
			}
		}.bind(this));
	};

	ApplyTorqueAction.prototype.exit = function () {
		SystemBus.removeListener('goo.physics.substep', this.substepListener);
	};

	return ApplyTorqueAction;
})(goo.Action,goo.Vector3,goo.SystemBus);
goo.SetRigidBodyPositionAction = (function (
	Action,
	Vector3
) {
	'use strict';

	function SetRigidBodyPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	SetRigidBodyPositionAction.prototype = Object.create(Action.prototype);
	SetRigidBodyPositionAction.prototype.constructor = SetRigidBodyPositionAction;

	SetRigidBodyPositionAction.external = {
		name: 'Set Rigid Body Position',
		type: 'physics',
		description: 'Set the position of the rigid body.',
		canTransition: false,
		parameters: [{
			name: 'Position',
			key: 'position',
			type: 'position',
			description: 'Absolute world position to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	var tmpVector = new Vector3();
	SetRigidBodyPositionAction.prototype._setup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }
		tmpVector.setArray(this.position);
		entity.rigidBodyComponent.setPosition(tmpVector);
	};

	return SetRigidBodyPositionAction;
})(goo.Action,goo.Vector3);
goo.SetRigidBodyVelocityAction = (function (
	Action,
	Vector3
) {
	'use strict';

	function SetRigidBodyVelocityAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	SetRigidBodyVelocityAction.prototype = Object.create(Action.prototype);
	SetRigidBodyVelocityAction.prototype.constructor = SetRigidBodyVelocityAction;

	SetRigidBodyVelocityAction.external = {
		name: 'Set Rigid Body Velocity',
		type: 'physics',
		description: 'Set the linear velocity of the rigid body component.',
		canTransition: false,
		parameters: [{
			name: 'Velocity',
			key: 'velocity',
			type: 'position',
			description: 'Velocity to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	var tmpVector = new Vector3();
	SetRigidBodyVelocityAction.prototype._setup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }
		tmpVector.setArray(this.velocity);
		entity.rigidBodyComponent.setVelocity(tmpVector);
	};

	return SetRigidBodyVelocityAction;
})(goo.Action,goo.Vector3);
goo.SetRigidBodyAngularVelocityAction = (function (
	Action,
	Vector3
) {
	'use strict';

	function SetRigidBodyAngularVelocityAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	SetRigidBodyAngularVelocityAction.prototype = Object.create(Action.prototype);
	SetRigidBodyAngularVelocityAction.prototype.constructor = SetRigidBodyAngularVelocityAction;

	SetRigidBodyAngularVelocityAction.external = {
		name: 'Set Rigid Body Angular Velocity',
		type: 'physics',
		description: 'Set the angular velocity of the rigid body component.',
		canTransition: false,
		parameters: [{
			name: 'Angular velocity',
			key: 'velocity',
			type: 'position',
			description: 'Angular velocity to set.',
			'default': [0, 0, 0]
		}],
		transitions: []
	};

	var tmpVector = new Vector3();
	SetRigidBodyAngularVelocityAction.prototype._setup = function (fsm) {
		var entity = fsm.getOwnerEntity();
		if (!entity || !entity.rigidBodyComponent) { return; }
		tmpVector.setArray(this.velocity);
		entity.rigidBodyComponent.setAngularVelocity(tmpVector);
	};

	return SetRigidBodyAngularVelocityAction;
})(goo.Action,goo.Vector3);
goo.CompareCounterAction = (function (
	Action
) {
	'use strict';

	function CompareCounterAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CompareCounterAction.prototype = Object.create(Action.prototype);
	CompareCounterAction.prototype.constructor = CompareCounterAction;

	CompareCounterAction.external = {
		key: 'Compare Counter',
		name: 'Compare Counter',
		type: 'transitions',
		description: 'Compares a counter with a value',
		canTransition: true,
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name'
		}, {
			name: 'Value',
			key: 'value',
			type: 'number',
			description: 'Value to compare the counter with',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'less',
			name: 'Less',
			description: 'State to transition to if the counter is smaller than the specified value'
		}, {
			key: 'equal',
			name: 'Equal',
			description: 'State to transition to if the counter is the same as the specified value'
		}, {
			key: 'greater',
			name: 'Greater',
			description: 'State to transition to if the counter is greater than the specified value'
		}]
	};

	CompareCounterAction.prototype._run = function (fsm) {
		var value1 = +fsm.getFsm().getVariable(this.name);
		var value2 = +this.value;

		if (value1 > value2) {
			fsm.send(this.transitions.greater);
		} else if (value1 === value2) {
			fsm.send(this.transitions.equal);
		} else {
			fsm.send(this.transitions.less);
		}
	};

	return CompareCounterAction;
})(goo.Action);
goo.CompareCountersAction = (function (
	Action
) {
	'use strict';

	function CompareCountersAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	CompareCountersAction.prototype = Object.create(Action.prototype);
	CompareCountersAction.prototype.constructor = CompareCountersAction;

	CompareCountersAction.external = {
		key: 'Compare 2 Counters',
		name: 'Compare 2 Counters',
		type: 'transitions',
		description: 'Compares the value of 2 counters',
		canTransition: true,
		parameters: [{
			name: 'First counter',
			key: 'name1',
			type: 'string',
			description: 'First counter name'
		}, {
			name: 'Second counter',
			key: 'name2',
			type: 'string',
			description: 'Second counter name'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: [{
			key: 'less',
			name: 'Less',
			description: 'State to transition to if the first counter is smaller than the second counter'
		}, {
			key: 'equal',
			name: 'Equal',
			description: 'State to transition to if the first counter is the same as the second counter'
		}, {
			key: 'greater',
			name: 'Greater',
			description: 'State to transition to if the first counter is greater than the second counter'
		}]
	};

	CompareCountersAction.prototype._run = function (fsm) {
		var value1 = +fsm.getFsm().getVariable(this.name1);
		var value2 = +fsm.getFsm().getVariable(this.name2);

		if (value1 > value2) {
			fsm.send(this.transitions.greater);
		} else if (value1 === value2) {
			fsm.send(this.transitions.equal);
		} else {
			fsm.send(this.transitions.less);
		}
	};

	return CompareCountersAction;
})(goo.Action);
goo.SetCounterAction = (function (
	Action
) {
	'use strict';

	function SetCounterAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetCounterAction.prototype = Object.create(Action.prototype);
	SetCounterAction.prototype.constructor = SetCounterAction;

	SetCounterAction.external = {
		key: 'Set Counter',
		name: 'Set Counter',
		type: 'transitions',
		description: 'Sets a counter to a value',
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name'
		}, {
			name: 'Value',
			key: 'value',
			type: 'number',
			description: 'Value to set the counter to',
			'default': 0
		}],
		transitions: []
	};

	SetCounterAction.prototype._run = function (fsm) {
		fsm.getFsm().defineVariable(this.name, +this.value);
	};

	SetCounterAction.prototype.cleanup = function (fsm) {
		fsm.getFsm().removeVariable(this.name);
	};

	return SetCounterAction;
})(goo.Action);
goo.IncrementCounterAction = (function (
	Action
) {
	'use strict';

	function IncrementCounterAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	IncrementCounterAction.prototype = Object.create(Action.prototype);
	IncrementCounterAction.prototype.constructor = IncrementCounterAction;

	IncrementCounterAction.external = {
		key: 'Increment Counter',
		name: 'Increment Counter',
		type: 'transitions',
		description: 'Increments a counter with a value',
		parameters: [{
			name: 'Name',
			key: 'name',
			type: 'string',
			description: 'Counter name'
		}, {
			name: 'Increment',
			key: 'increment',
			type: 'number',
			description: 'Value to increment the counter with',
			'default': 1
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	IncrementCounterAction.prototype._run = function (fsm) {
		var increment = +this.increment;

		if (fsm.getFsm().vars[this.name] === undefined) {
			fsm.getFsm().defineVariable(this.name, increment);
			return;
		}

		fsm.getFsm().applyOnVariable(this.name, function (oldValue) {
			return oldValue + increment;
		});
	};

	IncrementCounterAction.prototype.cleanup = function (fsm) {
		fsm.getFsm().removeVariable(this.name);
	};

	return IncrementCounterAction;
})(goo.Action);
goo.MuteAction = (function (
	Action
) {
	'use strict';

	function MuteAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	MuteAction.prototype = Object.create(Action.prototype);
	MuteAction.prototype.constructor = MuteAction;

	MuteAction.external = {
		name: 'Mute sounds',
		type: 'sound',
		description: 'Mute all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	MuteAction.prototype._setup = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.mute();
		}
	};

	return MuteAction;
})(goo.Action);
goo.UnmuteAction = (function (
	Action
) {
	'use strict';

	function UnmuteAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	UnmuteAction.prototype = Object.create(Action.prototype);
	UnmuteAction.prototype.constructor = UnmuteAction;

	UnmuteAction.external = {
		name: 'Unmute sounds',
		type: 'sound',
		description: 'Unmute all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	UnmuteAction.prototype._setup = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			soundSystem.unmute();
		}
	};

	return UnmuteAction;
})(goo.Action);
goo.ToggleMuteAction = (function (
	Action
) {
	'use strict';

	function UnmuteAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}
	UnmuteAction.prototype = Object.create(Action.prototype);
	UnmuteAction.prototype.constructor = UnmuteAction;

	UnmuteAction.external = {
		name: 'Toggle mute sounds',
		type: 'sound',
		description: 'Toggles mute of all sounds globally.',
		canTransition: false,
		parameters: [],
		transitions: []
	};

	UnmuteAction.prototype._setup = function (fsm) {
		var world = fsm.getWorld();
		if (!world) { return; }

		var soundSystem = world.getSystem('SoundSystem');
		if (soundSystem) {
			if(soundSystem.muted){
				soundSystem.unmute();
			} else {
				soundSystem.mute();
			}
		}
	};

	return UnmuteAction;
})(goo.Action);
goo.StartTimelineAction = (function (
	Action
) {
	'use strict';

	function StartTimelineAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	StartTimelineAction.prototype = Object.create(Action.prototype);
	StartTimelineAction.prototype.constructor = StartTimelineAction;

	StartTimelineAction.external = {
		name: 'Start Timeline',
		type: 'fx',
		description: 'Starts or resumes the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	StartTimelineAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.start();
	};

	return StartTimelineAction;
})(goo.Action);
goo.PauseTimelineAction = (function (
	Action
) {
	'use strict';

	function PauseTimelineAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	PauseTimelineAction.prototype = Object.create(Action.prototype);
	PauseTimelineAction.prototype.constructor = PauseTimelineAction;

	PauseTimelineAction.external = {
		name: 'Pause Timeline',
		type: 'fx',
		description: 'Pauses the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	PauseTimelineAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.pause();
	};

	return PauseTimelineAction;
})(goo.Action);
goo.StopTimelineAction = (function (
	Action
) {
	'use strict';

	function StopTimelineAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	StopTimelineAction.prototype = Object.create(Action.prototype);
	StopTimelineAction.prototype.constructor = StopTimelineAction;

	StopTimelineAction.external = {
		name: 'Stop Timeline',
		type: 'fx',
		description: 'Stops the timeline.',
		canTransition: true,
		parameters: [],
		transitions: []
	};

	StopTimelineAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.stop();
	};

	return StopTimelineAction;
})(goo.Action);
goo.SetTimelineTimeAction = (function (
	Action
) {
	'use strict';

	function SetTimelineTimeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetTimelineTimeAction.prototype = Object.create(Action.prototype);
	SetTimelineTimeAction.prototype.constructor = SetTimelineTimeAction;

	SetTimelineTimeAction.external = {
		name: 'Set Timeline Time',
		type: 'fx',
		description: 'Sets the current time of the timeline.',
		canTransition: true,
		parameters: [{
			name: 'Time',
			key: 'time',
			type: 'number',
			description: 'Timeline time to set',
			'default': 0
		}],
		transitions: []
	};

	SetTimelineTimeAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();

		if (!entity.hasComponent('TimelineComponent')) { return; }

		entity.timelineComponent.setTime(this.time);
	};

	return SetTimelineTimeAction;
})(goo.Action);
goo.Actions = (function (
	_ // placeholder // what for?
) {
	'use strict';

	var _actions = {};

	var Actions = {};

	var IGNORED_ACTIONS = [
		'Eval',
		'HTMLPick',
		'Remove',
		'Collides',
		'Tag'
	];

	Actions.register = function (name, actionClass) {
		_actions[name] = actionClass;
	};

	Actions.actionForType = function (name) {
		return _actions[name];
	};

	Actions.allActions = function () {
		var actions = {};
		var keys = Object.keys(_actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (IGNORED_ACTIONS.indexOf(key) === -1) {
				actions[key] = _actions[key];
			}
		}
		return actions;
	};

	Actions.allActionsArray = function () {
		var actions = [];
		var keys = Object.keys(_actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (key === 'Eval' || key === 'HTMLPick' || key === 'Remove') {
				continue;
			}
			actions.push(_actions[key]);
		}
		return actions;
	};

	function registerAll(args) {
		var actionsStartIndex = 0;
		for (var i = actionsStartIndex; i < args.length; i++) {
			var arg = args[i];
			Actions.register(arg.external.key || arg.external.name, arg);
		}
	}

	registerAll(arguments);

	return Actions;
})(goo.ArrowsAction,goo.MouseUpAction,goo.MouseDownAction,goo.MouseMoveAction,goo.KeyUpAction,goo.KeyDownAction,goo.KeyPressedAction,goo.PickAction,goo.PickAndExitAction,goo.ClickAction,goo.WasdAction,goo.MoveAction,goo.RotateAction,goo.ScaleAction,goo.LookAtAction,goo.TweenMoveAction,goo.TweenRotationAction,goo.TweenScaleAction,goo.TweenLookAtAction,goo.ShakeAction,goo.PauseAnimationAction,goo.ResumeAnimationAction,goo.SetAnimationAction,goo.SetTimeScale,goo.WaitAction,goo.TransitionAction,goo.RandomTransitionAction,goo.EmitAction,goo.TransitionOnMessageAction,goo.EvalAction,goo.HideAction,goo.ShowAction,goo.RemoveAction,goo.AddLightAction,goo.RemoveLightAction,goo.TweenLightColorAction,goo.SetClearColorAction,goo.SwitchCameraAction,goo.InFrustumAction,goo.DollyZoomAction,goo.InBoxAction,goo.CompareDistanceAction,goo.CollidesAction,goo.TagAction,goo.SmokeAction,goo.FireAction,goo.RemoveParticlesAction,goo.TogglePostFxAction,goo.PlaySoundAction,goo.PauseSoundAction,goo.StopSoundAction,goo.SoundFadeInAction,goo.SoundFadeOutAction,goo.SetRenderTargetAction,goo.TweenTextureOffsetAction,goo.SetMaterialColorAction,goo.LogMessageAction,goo.TweenOpacityAction,goo.HtmlAction,goo.CopyJointTransformAction,goo.TweenOpacityAction,goo.TriggerEnterAction,goo.TriggerLeaveAction,goo.ApplyImpulseAction,goo.ApplyForceAction,goo.ApplyTorqueAction,goo.SetRigidBodyPositionAction,goo.SetRigidBodyVelocityAction,goo.SetRigidBodyAngularVelocityAction,goo.CompareCounterAction,goo.CompareCountersAction,goo.SetCounterAction,goo.IncrementCounterAction,goo.MuteAction,goo.UnmuteAction,goo.ToggleMuteAction,goo.StartTimelineAction,goo.PauseTimelineAction,goo.StopTimelineAction,goo.SetTimelineTimeAction);
goo.MachineHandler = (function (
	ConfigHandler,
	_,
	State,
	Machine,
	Actions,
	RSVP
) {
	'use strict';

	/**
	 * Handler for loading materials into engine
	 * @hidden
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 */
	function MachineHandler() {
		ConfigHandler.apply(this, arguments);
	}

	MachineHandler.prototype = Object.create(ConfigHandler.prototype);
	MachineHandler.prototype.constructor = MachineHandler;

	ConfigHandler._registerClass('machine', MachineHandler);

	/**
	 * Creates an empty machine
	 * @returns {Machine}
	 * @private
	 */
	MachineHandler.prototype._create = function () {
		return new Machine();
	};

	/**
	 * Adds/updates/removes a machine
	 * @param {string} ref
	 * @param {Object} config
	 * @param {Object} options
	 * @private
	 * @returns {RSVP.Promise} Resolves with the updated machine or null if removed
	 */
	MachineHandler.prototype._update = function (ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (machine) {
			if (!machine) { return; }
			machine.name = config.name;

			// Remove old states
			for (var key in machine._states) {
				if (!config.states[key]) {
					machine.removeState(key);
				}
			}
			// Update existing states and create new ones
			var promises = [];
			for (var key in config.states) {
				promises.push(that._updateState(machine, config.states[key], options));
			}
			return RSVP.all(promises).then(function () {
				machine.setInitialState(config.initialState);
				return machine;
			});
		});
	};

	/**
	 * Update actions on a state
	 * @param {State} state
	 * @param {Object} config
	 * @private
	 */
	MachineHandler.prototype._updateActions = function (state, stateConfig) {
		// Remove old actions
		for (var i = 0; i < state._actions.length; i++) {
			var action = state._actions[i];
			if (!stateConfig.actions || !stateConfig.actions[action.id]) {
				state.removeAction(action);
				i--;
			}
		}

		// Update new and existing ones
		// For actions, order is (or will be) important
		var actions = [];
		_.forEach(stateConfig.actions, function (actionConfig) {
			var action = state.getAction(actionConfig.id);
			if (!action) {
				var Action = Actions.actionForType(actionConfig.type);
				action = new Action(actionConfig.id, actionConfig.options);
				if (action.onCreate) {
					action.onCreate(state.proxy);
				}
				//state.addAction(action);
			} else {
				action.configure(actionConfig.options);
			}
			actions.push(action);
		}, null, 'sortValue');
		state._actions = actions;
	};

	/**
	 * Update transitions on the machine
	 * @param {State} state
	 * @param {Object} config
	 * @private
	 */
	MachineHandler.prototype._updateTransitions = function (state, stateConfig) {
		state._transitions = {};
		for (var key in stateConfig.transitions) {
			var transition = stateConfig.transitions[key];
			state.setTransition(transition.id, transition.targetState);
		}
	};

	/**
	 * Update states on the machine. This includes loading childMachines
	 * @param {State} state
	 * @param {Object} config
	 * @private
	 */
	MachineHandler.prototype._updateState = function (machine, stateConfig, options) {
		var state;
		if (machine._states && machine._states[stateConfig.id]) {
			state = machine._states[stateConfig.id];
		} else {
			state = new State(stateConfig.id);
			machine.addState(state);
		}
		state.name = stateConfig.name;

		// Actions
		this._updateActions(state, stateConfig);
		// Transitions
		this._updateTransitions(state, stateConfig);
		// Child machines
		// Removing
		for (var i = 0; i < state._machines; i++) {
			var childMachine = state._machines[i];
			if (!stateConfig.childMachines[childMachine.id]) {
				state.removeMachine(childMachine);
				i--;
			}
		}
		// Updating
		var promises = [];
		for (var key in stateConfig.childMachines) {
			promises.push(this._load(stateConfig.childMachines[key].machineRef, options));
		}

		/*
		// TODO: Test and use this. Will make the promises sorted correctly.
		_.forEach(stateConfig.childMachines, function (childMachineConfig) {
			promises.push(that._load(childMachineConfig.machineRef, options));
		}, null, 'sortValue');
		*/

		return RSVP.all(promises).then(function (machines) {
			for (var i = 0; i < machines; i++) {
				state.addMachine(machines[i]);
			}
			return state;
		});
	};


	return MachineHandler;
})(goo.ConfigHandler,goo.ObjectUtils,goo.State,goo.Machine,goo.Actions,goo.rsvp);
goo.StateMachineComponent = (function (
	Component,
	ArrayUtils,
	SystemBus
) {
	'use strict';

	/**
	 * StateMachineComponent
	 * @private
	 */
	function StateMachineComponent() {
		Component.apply(this, arguments);

		this.type = 'StateMachineComponent';

		this._machines = [];
		this.entity = null;
		this.vars = {};
		this.system = null;
		this.time = 0;
		this.entered = false;

		this.active = true;
	}

	StateMachineComponent.prototype = Object.create(Component.prototype);

	StateMachineComponent.vars = {};

	StateMachineComponent.getVariable = function (name) {
		return StateMachineComponent.vars[name];
	};

	StateMachineComponent.prototype.getVariable = function (name) {
		if (this.vars[name] !== undefined) {
			return this.vars[name];
		} else {
			return StateMachineComponent.getVariable(name);
		}
	};

	StateMachineComponent.applyOnVariable = function (name, fun) {
		StateMachineComponent.vars[name] = fun(StateMachineComponent.vars[name]);
	};

	StateMachineComponent.prototype.applyOnVariable = function (name, fun) {
		if (this.vars[name] !== undefined) {
			this.vars[name] = fun(this.vars[name]);
		} else {
			StateMachineComponent.applyOnVariable(name, fun);
		}
	};

	StateMachineComponent.prototype.defineVariable = function (name, initialValue) {
		this.vars[name] = initialValue;
	};

	StateMachineComponent.prototype.removeVariable = function (name) {
		delete this.vars[name];
	};

	StateMachineComponent.applyOnVariable = function (name, fun) {
		if (this.vars[name]) {
			this.vars[name] = fun(this.vars[name]);
		} else if (StateMachineComponent.vars[name]) {
			StateMachineComponent.applyOnVariable(name, fun);
		}
	};

	StateMachineComponent.prototype.addMachine = function (machine) {
		machine._fsm = this;
		machine.parent = this;
		this._machines.push(machine);
	};

	StateMachineComponent.prototype.removeMachine = function (machine) {
		machine.recursiveRemove();
		ArrayUtils.remove(this._machines, machine);
	};

	/**
	 * Resets all state machines to their initial state
	 */
	StateMachineComponent.prototype.init = function () {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.setRefs(this);
			machine.reset();
			machine.ready();
		}
	};

	StateMachineComponent.prototype.doEnter = function () {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.enter();
		}
	};

	/**
	 * Kills the state machines triggering exit functions in all current states
	 */
	StateMachineComponent.prototype.kill = function () {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.kill();
		}
	};

	/**
	 * Performs a cleanup; undoes any changes not undone by exit methods
	 */
	StateMachineComponent.prototype.cleanup = function () {
		for (var i = 0; i < this._machines.length; i++) {
			var machine = this._machines[i];
			machine.cleanup();
		}
	};

	/**
	 * Updates the state machines
	 */
	StateMachineComponent.prototype.update = function () {
		if (this.active) {
			for (var i = 0; i < this._machines.length; i++) {
				var machine = this._machines[i];
				machine.update();
			}
		}
	};

	/**
	 * Stops updating the state machines
	 */
	StateMachineComponent.prototype.pause = function () {
		this.active = false;
		SystemBus.emit('goo.entity.' + this.entity.name + '.fsm.pause');
	};

	/**
	 * Resumes updating the state machines
	 */
	StateMachineComponent.prototype.play = function () {
		this.active = true;
		SystemBus.emit('goo.entity.' + this.entity.name + '.fsm.play');
	};

	return StateMachineComponent;
})(goo.Component,goo.ArrayUtils,goo.SystemBus);
goo.StateMachineComponentHandler = (function (
	ComponentHandler,
	StateMachineComponent,
	RSVP,
	_
) {
	'use strict';

	/**
	 * For handling loading of state machine components
	 * @param {World} world The goo world
	 * @param {Function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {Function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function StateMachineComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'StateMachineComponent';
	}

	StateMachineComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	StateMachineComponentHandler.prototype.constructor = StateMachineComponentHandler;
	ComponentHandler._registerClass('stateMachine', StateMachineComponentHandler);

	/**
	 * Create statemachine component
	 * @returns {StateMachineComponent} the created component object
	 * @hidden
	 */
	StateMachineComponentHandler.prototype._create = function () {
		return new StateMachineComponent();
	};

	StateMachineComponentHandler.prototype._remove = function (entity) {
		var component = entity.stateMachineComponent;
		if (component) {
			for (var i = component._machines.length - 1; i >= 0; i--) {
				var machine = component._machines[i];
				machine.cleanup();
				component.removeMachine(machine);
			}

			component.cleanup();
		}

		entity.clearComponent(this._type);
	};

	/**
	 * Update engine statemachine component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	StateMachineComponentHandler.prototype.update = function (entity, config, options) {
		var that = this;
		options = options || {};
		options.reload = true;
		options.instantiate = true;

		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			var promises = [];
			_.forEach(config.machines, function (machineConfig) {
				promises.push(that._load(machineConfig.machineRef, options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function (machines) {
				// Adding new machines
				for (var i = 0; i < machines.length; i++) {
					if (component._machines.indexOf(machines[i]) === -1) {
						component.addMachine(machines[i]);
					}
				}
				// Removing old machines
				for (var i = component._machines.length - 1; i >= 0; i--) {
					if (machines.indexOf(component._machines[i]) === -1) {
						component.removeMachine(component._machines[i]);
					}
				}
				return component;
			});
		});
	};

	return StateMachineComponentHandler;
})(goo.ComponentHandler,goo.StateMachineComponent,goo.rsvp,goo.ObjectUtils);
goo.StateMachineHandlers = (function () {})(goo.StateMachineComponentHandler,goo.MachineHandler);
goo.FSMUtil = (function (FsmUtils) {
	return FsmUtils;
})(goo.FsmUtils);
goo.StateMachineSystem = (function (
	System,
	TWEEN
) {
	'use strict';

	/**
	 * Processes all entities with a FSM component
	 * @private
	 */
	function StateMachineSystem(engine) {
		System.call(this, 'StateMachineSystem', ['StateMachineComponent']);

		this.engine = engine;
		this.resetRequest = false;
		this.passive = false;
		this.paused = false;

		/**
		 * Current time, in seconds.
		 * @type {number}
		 */
		this.time = 0;

		this.evalProxy = {
			// Add things that are useful from user scripts
			test: function () {
				console.log('test');
			}
		};

		// actions triggered by this system typically need to run after all other systems do their job
		this.priority = 1000;
	}

	StateMachineSystem.prototype = Object.create(System.prototype);

	StateMachineSystem.prototype.process = function (entities, tpf) {
		var component;

		if (this.resetRequest) {
			this.resetRequest = false;
			for (var i = 0; i < entities.length; i++) {
				component = entities[i].stateMachineComponent;
				component.kill();
				component.cleanup();
			}
			this.time = 0;
			// remove all sounds a bit hard but in reality no tween should remain alive between runs
			TWEEN.removeAll();
			this.passive = true;
			return;
		}

		this.time += tpf;

		// Enter unentered components
		for (var i = 0; i < entities.length; i++) {
			component = entities[i].stateMachineComponent;
			if (!component.entered) {
				component.init();
				component.doEnter();
				component.entered = true;
			}
		}

		TWEEN.update(this.engine.world.time * 1000); // this should not stay here

		for (var i = 0; i < entities.length; i++) {
			component = entities[i].stateMachineComponent;
			component.update(tpf);
		}
	};

	StateMachineSystem.prototype.inserted = function (entity) {
		var component = entity.stateMachineComponent;

		component.entity = entity;
		component.system = this;
		component.init();
	};

	/**
	 * Resumes updating the entities
	 */
	StateMachineSystem.prototype.play = function () {
		this.passive = false;
		if (!this.paused) {
			// Un-enter entered components
			var entities = this._activeEntities;
			for (var i = 0; i < entities.length; i++) {
				var component = entities[i].stateMachineComponent;
				component.entered = false;
			}
		}
		this.paused = false;
	};

	/**
	 * Stops updating the entities
	 */
	StateMachineSystem.prototype.pause = function () {
		this.passive = true;
		this.paused = true;
	};

	/**
	 * Resumes updating the entities; an alias for `.play`
	 */
	StateMachineSystem.prototype.resume = StateMachineSystem.prototype.play;

	/**
	 * Stop updating entities and resets the state machines to their initial state
	 */
	StateMachineSystem.prototype.stop = function () {
		this.passive = false;
		this.resetRequest = true;
		this.paused = false;
	};

	return StateMachineSystem;
})(goo.System,goo.TWEEN,goo.Actions);
goo.AddPositionAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function AddPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddPositionAction.prototype = Object.create(Action.prototype);

	AddPositionAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.entity = settings.entity || null;
		this.amountX = settings.amountX || 0;
		this.amountY = settings.amountY || 0;
		this.amountZ = settings.amountZ || 0;
		this.speed = settings.speed || 1;
	};

	AddPositionAction.external = {
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Amount to move on the X axis',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Amount to move on the Y axis',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Amount to move on the Z axis',
			'default': 0
		}, {
			name: 'Speed',
			key: 'speed',
			type: 'float',
			description: 'Speed to multiply',
			'default': 1
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	AddPositionAction.prototype._run = function (fsm) {
		if (this.entity !== null) {
			var tpf = fsm.getTpf();

			var dx = FsmUtils.getValue(this.amountX, fsm);
			var dy = FsmUtils.getValue(this.amountY, fsm);
			var dz = FsmUtils.getValue(this.amountZ, fsm);

			this.entity.transformComponent.transform.translation.addDirect(
				dx * this.speed * tpf,
				dy * this.speed * tpf,
				dz * this.speed * tpf
			);

			this.entity.transformComponent.setUpdated();
		}
	};

	return AddPositionAction;
})(goo.Action,goo.FsmUtils);
goo.GetPositionAction = (function (
	Action
) {
	'use strict';

	function GetPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	GetPositionAction.prototype = Object.create(Action.prototype);

	GetPositionAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.entity = settings.entity || null;
		this.variableX = settings.variableX || null;
		this.variableY = settings.variableY || null;
		this.variableZ = settings.variableZ || null;
	};

	GetPositionAction.external = {
		parameters: [{
			name: 'VariableX',
			key: 'variableX',
			type: 'identifier'
		}, {
			name: 'VariableY',
			key: 'variableY',
			type: 'identifier'
		}, {
			name: 'VariableZ',
			key: 'variableZ',
			type: 'identifier'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	GetPositionAction.prototype._run = function (fsm) {
		var translation = this.entity.transformComponent.transform.translation;
		if (this.entity !== null) {
			if (this.variableX) {  // !== undefined
				fsm.applyOnVariable(this.variableX, function () {
					return translation.x;
				});
			}
			if (this.variableY) {
				fsm.applyOnVariable(this.variableY, function () {
					return translation.y;
				});
			}
			if (this.variableZ) {
				fsm.applyOnVariable(this.variableZ, function () {
					return translation.z;
				});
			}
		}
	};

	return GetPositionAction;
})(goo.Action);
goo.AddVariableAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function AddVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	AddVariableAction.prototype = Object.create(Action.prototype);

	AddVariableAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.variable = settings.variable || null;
		this.amount = settings.amount || 1;
	};

	AddVariableAction.external = {
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'identifier'
		}, {
			name: 'Amount',
			key: 'amount',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': false
		}],
		transitions: []
	};

	AddVariableAction.prototype._run = function (fsm) {
		fsm.applyOnVariable(this.variable, function (v) {
			return v + FsmUtils.getValue(this.amount, fsm);
		}.bind(this));
	};

	return AddVariableAction;
})(goo.Action,goo.FsmUtils);
goo.MultiplyVariableAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function MultiplyVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	MultiplyVariableAction.prototype = Object.create(Action.prototype);

	MultiplyVariableAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.variable = settings.variable || null;
		this.amount = settings.amount || 1;
	};

	MultiplyVariableAction.external = {
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'identifier'
		}, {
			name: 'Amount',
			key: 'amount',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': false
		}],
		transitions: []
	};

	MultiplyVariableAction.prototype._run = function (fsm) {
		fsm.applyOnVariable(this.variable, function (v) {
			return v * FsmUtils.getValue(this.amount, fsm);
		}.bind(this));
	};

	return MultiplyVariableAction;
})(goo.Action,goo.FsmUtils);
goo.NumberCompareAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function NumberCompareAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	NumberCompareAction.prototype = Object.create(Action.prototype);

	NumberCompareAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.leftHand = settings.leftHand || 0;
		this.rightHand = settings.rightHand || 0;
		this.tolerance = settings.tolerance || 0.0001;
		this.lessThanEvent = { channel: settings.transitions.less };
		this.equalEvent = { channel: settings.transitions.equal };
		this.greaterThanEvent = { channel: settings.transitions.greater };
	};

	NumberCompareAction.external = {
		parameters: [{
			name: 'Left hand value',
			key: 'leftHand',
			type: 'float'
		}, {
			name: 'Right hand value',
			key: 'rightHand',
			type: 'float'
		}, {
			name: 'Tolerance',
			key: 'tolerance',
			type: 'float',
			'default': 0.001
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: [{
			name: 'less',
			description: 'Event fired if left hand argument is smaller than right hand argument'
		}, {
			name: 'equal',
			description: 'Event fired if both sides are approximately equal'
		}, {
			name: 'greater',
			description: 'Event fired if left hand argument is greater than right hand argument'
		}]
	};

	NumberCompareAction.prototype._run = function (fsm) {
		var leftHand = FsmUtils.getValue(this.leftHand, fsm);
		var rightHand = FsmUtils.getValue(this.rightHand, fsm);
		var diff = rightHand - leftHand;

		if (Math.abs(diff) <= this.tolerance) {
			if (this.equalEvent.channel) { fsm.send(this.equalEvent.channel); }
		} else if (diff > 0) {
			if (this.lessThanEvent.channel) { fsm.send(this.lessThanEvent.channel); }
		} else {
			if (this.greaterThanEvent.channel) { fsm.send(this.greaterThanEvent.channel); }
		}
	};

	return NumberCompareAction;
})(goo.Action,goo.FsmUtils);
goo.SetLightRangeAction = (function (Action) {
	'use strict';

	function SetLightRangeAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetLightRangeAction.prototype = Object.create(Action.prototype);

	SetLightRangeAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.range = settings.range || 100;
	};

	SetLightRangeAction.external = {
		name: 'Set Light Range',
		description: 'Sets the range of a light',
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Light entity'
		}, {
			name: 'Range',
			key: 'range',
			type: 'real',
			description: 'Light range',
			'default': 100,
			min: 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	SetLightRangeAction.prototype._run = function (/*fsm*/) {
		if (this.entity &&
			this.entity.lightComponent &&
			this.entity.lightComponent.light) {
			this.entity.lightComponent.light.range = this.range;
		}
	};

	return SetLightRangeAction;
})(goo.Action);
goo.SetPositionAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function SetPositionAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetPositionAction.prototype = Object.create(Action.prototype);

	SetPositionAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.amountX = settings.amountX || 0;
		this.amountY = settings.amountY || 0;
		this.amountZ = settings.amountZ || 0;
	};

	SetPositionAction.external = {
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Position on the X axis',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Position on the Y axis',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Position on the Z axis',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	SetPositionAction.prototype._run = function (fsm) {
		if (this.entity !== null) {
			this.entity.transformComponent.transform.translation.setDirect(
				FsmUtils.getValue(this.amountX, fsm),
				FsmUtils.getValue(this.amountY, fsm),
				FsmUtils.getValue(this.amountZ, fsm)
			);
			this.entity.transformComponent.setUpdated();

			/*
			// Hack for box2d physics, tmp
			if (this.entity.body) {
				var translation = this.entity.transformComponent.transform.translation;
				this.entity.body.SetTransform(new window.Box2D.b2Vec2(translation.x, translation.y), this.entity.body.GetAngle());
			}
			*/
		}
	};

	return SetPositionAction;
})(goo.Action,goo.FsmUtils);
goo.SetRotationAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function SetRotationAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetRotationAction.prototype = Object.create(Action.prototype);

	SetRotationAction.prototype.configure = function (settings) {
		this.everyFrame = !!settings.everyFrame;
		this.entity = settings.entity || null;
		this.amountX = settings.amountX || 0;
		this.amountY = settings.amountY || 0;
		this.amountZ = settings.amountZ || 0;
	};

	SetRotationAction.external = {
		parameters: [{
			name: 'Entity',
			key: 'entity',
			type: 'entity',
			description: 'Entity to move'
		}, {
			name: 'Amount X',
			key: 'amountX',
			type: 'float',
			description: 'Amount to rotate on the X axis',
			'default': 0
		}, {
			name: 'Amount Y',
			key: 'amountY',
			type: 'float',
			description: 'Amount to rotate on the Y axis',
			'default': 0
		}, {
			name: 'Amount Z',
			key: 'amountZ',
			type: 'float',
			description: 'Amount to rotate on the Z axis',
			'default': 0
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': true
		}],
		transitions: []
	};

	SetRotationAction.prototype._run = function (fsm) {
		if (this.entity !== null) {
			this.entity.transformComponent.transform.setRotationXYZ(
				FsmUtils.getValue(this.amountX, fsm),
				FsmUtils.getValue(this.amountY, fsm),
				FsmUtils.getValue(this.amountZ, fsm)
			);
			this.entity.transformComponent.setUpdated();
		}
	};

	return SetRotationAction;
})(goo.Action,goo.FsmUtils);
goo.SetVariableAction = (function (
	Action,
	FsmUtils
) {
	'use strict';

	function SetVariableAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	SetVariableAction.prototype = Object.create(Action.prototype);

	SetVariableAction.prototype.configure = function (settings) {
		this.everyFrame = settings.everyFrame !== false;
		this.variable = settings.variable || null;
		this.amount = settings.amount || 0;
	};

	SetVariableAction.external = {
		parameters: [{
			name: 'Variable',
			key: 'variable',
			type: 'identifier'
		}, {
			name: 'Amount',
			key: 'amount',
			type: 'float'
		}, {
			name: 'On every frame',
			key: 'everyFrame',
			type: 'boolean',
			description: 'Repeat this action every frame',
			'default': false
		}],
		transitions: []
	};

	SetVariableAction.prototype._run = function (fsm) {
		if (this.variable) {
			fsm.applyOnVariable(this.variable, function () {
				return FsmUtils.getValue(this.amount, fsm);
			}.bind(this));
		}
	};

	return SetVariableAction;
})(goo.Action,goo.FsmUtils);
goo.ToggleFullscreenAction = (function (
	Action,
	GameUtils
) {
	'use strict';

	function ToggleFullscreenAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	ToggleFullscreenAction.prototype = Object.create(Action.prototype);
	ToggleFullscreenAction.prototype.constructor = ToggleFullscreenAction;

	ToggleFullscreenAction.external = {
		name: 'Toggle Fullscreen',
		type: 'display',
		description: 'Toggles fullscreen on/off',
		parameters: [],
		transitions: []
	};

	ToggleFullscreenAction.prototype._run = function (/*fsm*/) {
		GameUtils.toggleFullScreen();
	};

	return ToggleFullscreenAction;
})(goo.Action,goo.GameUtils);
if (typeof require === "function") {
define("goo/fsmpack/statemachine/State", [], function () { return goo.State; });
define("goo/fsmpack/statemachine/Machine", [], function () { return goo.Machine; });
define("goo/fsmpack/statemachine/FsmUtils", [], function () { return goo.FsmUtils; });
define("goo/fsmpack/statemachine/actions/Action", [], function () { return goo.Action; });
define("goo/fsmpack/statemachine/actions/ArrowsAction", [], function () { return goo.ArrowsAction; });
define("goo/fsmpack/statemachine/actions/MouseUpAction", [], function () { return goo.MouseUpAction; });
define("goo/fsmpack/statemachine/actions/MouseDownAction", [], function () { return goo.MouseDownAction; });
define("goo/fsmpack/statemachine/actions/MouseMoveAction", [], function () { return goo.MouseMoveAction; });
define("goo/fsmpack/statemachine/actions/KeyUpAction", [], function () { return goo.KeyUpAction; });
define("goo/fsmpack/statemachine/actions/KeyDownAction", [], function () { return goo.KeyDownAction; });
define("goo/fsmpack/statemachine/actions/KeyPressedAction", [], function () { return goo.KeyPressedAction; });
define("goo/fsmpack/statemachine/actions/PickAction", [], function () { return goo.PickAction; });
define("goo/fsmpack/statemachine/actions/PickAndExitAction", [], function () { return goo.PickAndExitAction; });
define("goo/fsmpack/statemachine/actions/ClickAction", [], function () { return goo.ClickAction; });
define("goo/fsmpack/statemachine/actions/WasdAction", [], function () { return goo.WasdAction; });
define("goo/fsmpack/statemachine/actions/MoveAction", [], function () { return goo.MoveAction; });
define("goo/fsmpack/statemachine/actions/RotateAction", [], function () { return goo.RotateAction; });
define("goo/fsmpack/statemachine/actions/ScaleAction", [], function () { return goo.ScaleAction; });
define("goo/fsmpack/statemachine/actions/LookAtAction", [], function () { return goo.LookAtAction; });
define("goo/fsmpack/statemachine/actions/TweenMoveAction", [], function () { return goo.TweenMoveAction; });
define("goo/fsmpack/statemachine/actions/TweenRotationAction", [], function () { return goo.TweenRotationAction; });
define("goo/fsmpack/statemachine/actions/TweenScaleAction", [], function () { return goo.TweenScaleAction; });
define("goo/fsmpack/statemachine/actions/TweenLookAtAction", [], function () { return goo.TweenLookAtAction; });
define("goo/fsmpack/statemachine/actions/ShakeAction", [], function () { return goo.ShakeAction; });
define("goo/fsmpack/statemachine/actions/PauseAnimationAction", [], function () { return goo.PauseAnimationAction; });
define("goo/fsmpack/statemachine/actions/ResumeAnimationAction", [], function () { return goo.ResumeAnimationAction; });
define("goo/fsmpack/statemachine/actions/SetAnimationAction", [], function () { return goo.SetAnimationAction; });
define("goo/fsmpack/statemachine/actions/SetTimeScale", [], function () { return goo.SetTimeScale; });
define("goo/fsmpack/statemachine/actions/WaitAction", [], function () { return goo.WaitAction; });
define("goo/fsmpack/statemachine/actions/TransitionAction", [], function () { return goo.TransitionAction; });
define("goo/fsmpack/statemachine/actions/RandomTransitionAction", [], function () { return goo.RandomTransitionAction; });
define("goo/fsmpack/statemachine/actions/EmitAction", [], function () { return goo.EmitAction; });
define("goo/fsmpack/statemachine/actions/TransitionOnMessageAction", [], function () { return goo.TransitionOnMessageAction; });
define("goo/fsmpack/statemachine/actions/EvalAction", [], function () { return goo.EvalAction; });
define("goo/fsmpack/statemachine/actions/HideAction", [], function () { return goo.HideAction; });
define("goo/fsmpack/statemachine/actions/ShowAction", [], function () { return goo.ShowAction; });
define("goo/fsmpack/statemachine/actions/RemoveAction", [], function () { return goo.RemoveAction; });
define("goo/fsmpack/statemachine/actions/AddLightAction", [], function () { return goo.AddLightAction; });
define("goo/fsmpack/statemachine/actions/RemoveLightAction", [], function () { return goo.RemoveLightAction; });
define("goo/fsmpack/statemachine/actions/TweenLightColorAction", [], function () { return goo.TweenLightColorAction; });
define("goo/fsmpack/statemachine/actions/SetClearColorAction", [], function () { return goo.SetClearColorAction; });
define("goo/fsmpack/statemachine/actions/SwitchCameraAction", [], function () { return goo.SwitchCameraAction; });
define("goo/fsmpack/statemachine/actions/InFrustumAction", [], function () { return goo.InFrustumAction; });
define("goo/fsmpack/statemachine/actions/DollyZoomAction", [], function () { return goo.DollyZoomAction; });
define("goo/fsmpack/statemachine/actions/InBoxAction", [], function () { return goo.InBoxAction; });
define("goo/fsmpack/statemachine/actions/CompareDistanceAction", [], function () { return goo.CompareDistanceAction; });
define("goo/fsmpack/proximity/ProximitySystem", [], function () { return goo.ProximitySystem; });
define("goo/fsmpack/statemachine/actions/CollidesAction", [], function () { return goo.CollidesAction; });
define("goo/fsmpack/proximity/ProximityComponent", [], function () { return goo.ProximityComponent; });
define("goo/fsmpack/statemachine/actions/TagAction", [], function () { return goo.TagAction; });
define("goo/fsmpack/statemachine/actions/SmokeAction", [], function () { return goo.SmokeAction; });
define("goo/fsmpack/statemachine/actions/FireAction", [], function () { return goo.FireAction; });
define("goo/fsmpack/statemachine/actions/RemoveParticlesAction", [], function () { return goo.RemoveParticlesAction; });
define("goo/fsmpack/statemachine/actions/TogglePostFxAction", [], function () { return goo.TogglePostFxAction; });
define("goo/fsmpack/statemachine/actions/PlaySoundAction", [], function () { return goo.PlaySoundAction; });
define("goo/fsmpack/statemachine/actions/PauseSoundAction", [], function () { return goo.PauseSoundAction; });
define("goo/fsmpack/statemachine/actions/StopSoundAction", [], function () { return goo.StopSoundAction; });
define("goo/fsmpack/statemachine/actions/SoundFadeInAction", [], function () { return goo.SoundFadeInAction; });
define("goo/fsmpack/statemachine/actions/SoundFadeOutAction", [], function () { return goo.SoundFadeOutAction; });
define("goo/fsmpack/statemachine/actions/SetRenderTargetAction", [], function () { return goo.SetRenderTargetAction; });
define("goo/fsmpack/statemachine/actions/TweenTextureOffsetAction", [], function () { return goo.TweenTextureOffsetAction; });
define("goo/fsmpack/statemachine/actions/SetMaterialColorAction", [], function () { return goo.SetMaterialColorAction; });
define("goo/fsmpack/statemachine/actions/LogMessageAction", [], function () { return goo.LogMessageAction; });
define("goo/fsmpack/statemachine/actions/TweenOpacityAction", [], function () { return goo.TweenOpacityAction; });
define("goo/fsmpack/statemachine/actions/HtmlAction", [], function () { return goo.HtmlAction; });
define("goo/fsmpack/statemachine/actions/CopyJointTransformAction", [], function () { return goo.CopyJointTransformAction; });
define("goo/fsmpack/statemachine/actions/TriggerEnterAction", [], function () { return goo.TriggerEnterAction; });
define("goo/fsmpack/statemachine/actions/TriggerLeaveAction", [], function () { return goo.TriggerLeaveAction; });
define("goo/fsmpack/statemachine/actions/ApplyImpulseAction", [], function () { return goo.ApplyImpulseAction; });
define("goo/fsmpack/statemachine/actions/ApplyForceAction", [], function () { return goo.ApplyForceAction; });
define("goo/fsmpack/statemachine/actions/ApplyTorqueAction", [], function () { return goo.ApplyTorqueAction; });
define("goo/fsmpack/statemachine/actions/SetRigidBodyPositionAction", [], function () { return goo.SetRigidBodyPositionAction; });
define("goo/fsmpack/statemachine/actions/SetRigidBodyVelocityAction", [], function () { return goo.SetRigidBodyVelocityAction; });
define("goo/fsmpack/statemachine/actions/SetRigidBodyAngularVelocityAction", [], function () { return goo.SetRigidBodyAngularVelocityAction; });
define("goo/fsmpack/statemachine/actions/CompareCounterAction", [], function () { return goo.CompareCounterAction; });
define("goo/fsmpack/statemachine/actions/CompareCountersAction", [], function () { return goo.CompareCountersAction; });
define("goo/fsmpack/statemachine/actions/SetCounterAction", [], function () { return goo.SetCounterAction; });
define("goo/fsmpack/statemachine/actions/IncrementCounterAction", [], function () { return goo.IncrementCounterAction; });
define("goo/fsmpack/statemachine/actions/MuteAction", [], function () { return goo.MuteAction; });
define("goo/fsmpack/statemachine/actions/UnmuteAction", [], function () { return goo.UnmuteAction; });
define("goo/fsmpack/statemachine/actions/ToggleMuteAction", [], function () { return goo.ToggleMuteAction; });
define("goo/fsmpack/statemachine/actions/StartTimelineAction", [], function () { return goo.StartTimelineAction; });
define("goo/fsmpack/statemachine/actions/PauseTimelineAction", [], function () { return goo.PauseTimelineAction; });
define("goo/fsmpack/statemachine/actions/StopTimelineAction", [], function () { return goo.StopTimelineAction; });
define("goo/fsmpack/statemachine/actions/SetTimelineTimeAction", [], function () { return goo.SetTimelineTimeAction; });
define("goo/fsmpack/statemachine/actions/Actions", [], function () { return goo.Actions; });
define("goo/fsmpack/MachineHandler", [], function () { return goo.MachineHandler; });
define("goo/fsmpack/statemachine/StateMachineComponent", [], function () { return goo.StateMachineComponent; });
define("goo/fsmpack/StateMachineComponentHandler", [], function () { return goo.StateMachineComponentHandler; });
define("goo/fsmpack/StateMachineHandlers", [], function () { return goo.StateMachineHandlers; });
define("goo/fsmpack/statemachine/FSMUtil", [], function () { return goo.FSMUtil; });
define("goo/fsmpack/statemachine/StateMachineSystem", [], function () { return goo.StateMachineSystem; });
define("goo/fsmpack/statemachine/actions/AddPositionAction", [], function () { return goo.AddPositionAction; });
define("goo/fsmpack/statemachine/actions/GetPositionAction", [], function () { return goo.GetPositionAction; });
define("goo/fsmpack/statemachine/actions/AddVariableAction", [], function () { return goo.AddVariableAction; });
define("goo/fsmpack/statemachine/actions/MultiplyVariableAction", [], function () { return goo.MultiplyVariableAction; });
define("goo/fsmpack/statemachine/actions/NumberCompareAction", [], function () { return goo.NumberCompareAction; });
define("goo/fsmpack/statemachine/actions/SetLightRangeAction", [], function () { return goo.SetLightRangeAction; });
define("goo/fsmpack/statemachine/actions/SetPositionAction", [], function () { return goo.SetPositionAction; });
define("goo/fsmpack/statemachine/actions/SetRotationAction", [], function () { return goo.SetRotationAction; });
define("goo/fsmpack/statemachine/actions/SetVariableAction", [], function () { return goo.SetVariableAction; });
define("goo/fsmpack/statemachine/actions/ToggleFullscreenAction", [], function () { return goo.ToggleFullscreenAction; });
}
