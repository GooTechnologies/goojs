define([
	'goo/entities/systems/System',
	'goo/fsmpack/statemachine/actions/Actions'
], function (
	System
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
		this.entered = true;
		this.paused = false;

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

	StateMachineSystem.prototype._callMeMaybe = function (entities) {
		var component;

		if (this.resetRequest) {
			this.resetRequest = false;
			for (var i = 0; i < entities.length; i++) {
				component = entities[i].stateMachineComponent;
				component.kill();
				component.cleanup();
			}
			if (window.TWEEN) { window.TWEEN.removeAll(); } // this should not stay here
			this.passive = true;
			return;
		}

		if (this.entered) {
			this.entered = false;
			for (var i = 0; i < entities.length; i++) {
				component = entities[i].stateMachineComponent;
				component.init();
				component.doEnter();
			}
		}
	};

	StateMachineSystem.prototype.fixedProcess = function (entities /*, tpf */) {
		this._callMeMaybe(entities);
		this._updateComponents(entities, true);
	};

	StateMachineSystem.prototype.process = function (entities /*, tpf */) {
		this._callMeMaybe(entities);
		// This should not stay here. It should be updated in both the fixed loop and the render loop, but that would make other state machine actions update when they probably won't have to.
		if (window.TWEEN) { window.TWEEN.update(this.engine.world.time * 1000); }
		this._updateComponents(entities, false);
	};

	StateMachineSystem.prototype._updateComponents = function (entities, fixedUpdate) {
		for (var i = 0; i < entities.length; i++) {
			var component = entities[i].stateMachineComponent;
			component.update(fixedUpdate);
		}
	};

	StateMachineSystem.prototype.inserted = function (entity) {
		var component = entity.stateMachineComponent;

		component.entity = entity;
		component.system = this;
		component.init();
	};

	/**
	 * Stops updating the entities
	 */
	StateMachineSystem.prototype.pause = function () {
		this.passive = true;
		this.paused = true;
	};

	/**
	 * Resumes updating the entities
	 */
	StateMachineSystem.prototype.play = function () {
		this.passive = false;
		if (!this.paused) {
			this.entered = true;
		}
		this.paused = false;
	};

	/**
	 * Stop updating entities and resets the state machines to their initial state
	 */
	StateMachineSystem.prototype.reset = function () {
		this.passive = false;
		this.resetRequest = true;
		this.paused = false;
	};

	return StateMachineSystem;
});