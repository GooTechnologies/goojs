var System = require('../../entities/systems/System');

/**
 * StateMachine system.
 */
function StateMachineSystem() {
	System.call(this, 'StateMachineSystem', ['StateMachineComponent']);

	this.passive = false;
	this.paused = false;

	/**
	 * Current time, in seconds.
	 * @type {number}
	 */
	this.time = 0;

	// actions triggered by this system typically need to run after all other systems do their job
	this.priority = 1000;

	// Input handling
	var buttonNames = ['Left', 'Middle', 'Right'];
	this._inputStates = new Set();
	this._listeners = {
		keydown: function (event) {
			this._inputStates.add(event.which);
		}.bind(this),
		keyup: function (event) {
			this._inputStates.delete(event.which);
		}.bind(this),
		mousedown: function (event) {
			this._inputStates.add(buttonNames[event.button]);
		}.bind(this),
		mouseup: function (event) {
			this._inputStates.delete(buttonNames[event.button]);
		}.bind(this)
	};
}

StateMachineSystem.prototype = Object.create(System.prototype);

StateMachineSystem.prototype.getInputState = function (key) {
	return this._inputStates.has(key);
};

StateMachineSystem.prototype.process = function (entities, tpf) {
	this.time += tpf;

	// Enter unentered components
	for (var i = 0; i < entities.length; i++) {
		var component = entities[i].stateMachineComponent;
		if (!component.entered) {
			// component.init(); // why was this done?
			component.doEnter();
			component.entered = true;
		}
	}

	for (var i = 0; i < entities.length; i++) {
		var component = entities[i].stateMachineComponent;
		component.update(tpf);
	}
};

StateMachineSystem.prototype.inserted = function (entity) {
	var component = entity.stateMachineComponent;
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

		for (var key in this._listeners) {
			document.addEventListener(key, this._listeners[key]);
		}
		this._inputStates.clear();
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
	this.passive = true;
	this.paused = false;

	for (var i = 0; i < this._activeEntities.length; i++) {
		var component = this._activeEntities[i].stateMachineComponent;
		component.exit();
		component.cleanup();
	}
	this.time = 0;

	for (var key in this._listeners) {
		document.removeEventListener(key, this._listeners[key]);
	}
};

module.exports = StateMachineSystem;