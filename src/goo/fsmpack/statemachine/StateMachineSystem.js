define([
	'goo/entities/systems/System',
	'goo/util/TWEEN',
	'goo/fsmpack/statemachine/actions/Actions'
], function (
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

		/**
		 * System-global variables: maps id string to variable instance
		 * @type {Map}
		 */
		this._variables = new Map();
	}
	StateMachineSystem.prototype = Object.create(System.prototype);

	/**
	 * @param  {string} id
	 * @return {?Variable}
	 */
	StateMachineSystem.prototype.getVariable = function (id) {
		return this._variables.get(id);
	};

	/**
	 * @param {string} id
	 * @param {Variable} variable
	 * @return {?Variable}
	 */
	StateMachineSystem.prototype.setVariable = function (id, variable) {
		return this._variables.set(id, variable);
	};

	StateMachineSystem.prototype.getInputState = function (key) {
		return this._inputStates.has(key);
	};

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
				// component.init(); // why was this done?
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
		this.passive = false;
		this.resetRequest = true;
		this.paused = false;

		for (var key in this._listeners) {
			document.removeEventListener(key, this._listeners[key]);
		}
	};

	return StateMachineSystem;
});