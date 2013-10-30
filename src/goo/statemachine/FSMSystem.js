define([
	'goo/entities/systems/System',
	'goo/statemachine/actions/Actions'
],
/** @lends */
function (
	System
) {
	"use strict";

	/**
	 * @class Processes all entities with a FSM component
	 */
	function FSMSystem(engine) {
		System.call(this, 'FSMSystem', ['FSMComponent']);

		this.engine = engine;
		this.resetRequest = false;
		this.passive = false;
		this.entered = true;
		this.paused = false;
		this.time = 0;

		//window.goor = engine;
	}

	FSMSystem.prototype = Object.create(System.prototype);

	FSMSystem.prototype.process = function (entities, tpf) {
		var fsmComponent;

		if (this.resetRequest) {
			this.resetRequest = false;
			for (var i = 0; i < entities.length; i++) {
				fsmComponent = entities[i].fSMComponent;
				fsmComponent.kill();
				fsmComponent.cleanup();
			}
			this.time = 0;
			if (window.TWEEN) { window.TWEEN.removeAll(); } // this should not stay here
			this.passive = true;
			return;
		}

		this.time += tpf;

		if (this.entered) {
			this.entered = false;
			for (var i = 0; i < entities.length; i++) {
				fsmComponent = entities[i].fSMComponent;
				fsmComponent.init();
				fsmComponent.doEnter();
			}
		}

		if (window.TWEEN) { window.TWEEN.update(this.time * 1000); } // this should not stay here

		for (var i = 0; i < entities.length; i++) {
			fsmComponent = entities[i].fSMComponent;
			fsmComponent.update(tpf);
		}
	};

	FSMSystem.prototype.inserted = function (entity) {
		var fsmComponent = entity.fSMComponent;

		fsmComponent.entity = entity;
		fsmComponent.system = this;
		fsmComponent.init();
	};

	/**
	 * Stops updating the entities
	 */
	FSMSystem.prototype.pause = function () {
		this.passive = true;
		this.paused = true;
	};

	/**
	 * Resumes updating the entities
	 */
	FSMSystem.prototype.play = function () {
		this.passive = false;
		if (!this.paused) {
			this.entered = true;
		}
		this.paused = false;
	};

	/**
	 * Stop updating entities and resets the state machines to their initial state
	 */
	FSMSystem.prototype.reset = function () {
		this.passive = false;
		this.resetRequest = true;
		this.paused = false;
	};

	return FSMSystem;
});