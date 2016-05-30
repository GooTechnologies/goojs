class Machine {
	id: string;
	name: string;
	_states: any;
	_fsm: any;
	initialState: string;
	currentState: any;
	parent: any;
	maxLoopDepth: number;
	asyncMode: boolean;

	constructor(id, name) {
		this.id = id;
		this.name = name;
		this._states = {};
		this._fsm = null;
		this.initialState = 'entry';
		this.currentState = null;
		this.parent = null;

		this.maxLoopDepth = 100;
		this.asyncMode = false;
	}

	setRefs(parentFSM) {
		this._fsm = parentFSM;
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.setRefs(parentFSM);
		}
	};

	contains(uuid) {
		return !!this._states[uuid];
	};

	setState(state) {
		// change state
		this.currentState = state;

		// reset initial state of child machines
		this.currentState.reset();

		// do on enter of new state
		this.currentState.enter();
	};

	reset() {
		// reset self
		this.currentState = this._states[this.initialState];

		// propagate reset
		if (this.currentState) {
			this.currentState.reset();
		}
	};

	ready() {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.ready();
		}
	};

	cleanup() {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.cleanup();
		}
	};

	enter() {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.resetDepth();
		}
		if (this.currentState) {
			this.currentState.enter();
		}
	};

	update() {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.resetDepth();
		}
		if (this.currentState) {
			if (!this.asyncMode) {
				this.currentState.update();
			} else {
				// old async mode
				var jump = this.currentState.update();

				if (jump && this.contains(jump)) {
					this.currentState.kill();
					this.setState(this._states[jump]);
				}

				return jump;
			}
		}
	};

	kill() {
		if (this.currentState) {
			this.currentState.kill();
		}
	};

	getCurrentState() {
		return this.currentState;
	};

	addState(state) {
		if (Object.keys(this._states).length === 0) {
			this.initialState = state.uuid;
		}
		state.parent = this;
		state._fsm = this._fsm;
		this._states[state.uuid] = state;
	};

	removeFromParent() {
		if (this.parent) {
			this.parent.removeMachine(this);
		}
	};

	recursiveRemove() {
		var keys = Object.keys(this._states);
		for (var i = 0; i < keys.length; i++) {
			var state = this._states[keys[i]];
			state.recursiveRemove();
		}
		this._states = {};
	};

	removeState(id) {
		if (!this._states[id]) { return; }
		if (this.initialState === id) { throw new Error('Cannot remove initial state'); }
		if (this.currentState === this._states[id]) {
			this.reset();
		}
		delete this._states[id];
	};

	setInitialState(initialState) {
		this.initialState = initialState;
	};
}

export = Machine;
