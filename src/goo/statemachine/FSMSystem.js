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
		this.active = true;

		//window.goor = engine;
	}

	FSMSystem.prototype = Object.create(System.prototype);

	FSMSystem.prototype.process = function (entities, tpf) {
		var fsmComponent;

		if (this.resetRequest) {
			this.resetRequest = false;
			for (var i = 0; i < entities.length; i++) {
				fsmComponent = entities[i].fSMComponent;
				fsmComponent.init();
			}
		}
		if (this.active) {
			for (var i = 0; i < entities.length; i++) {
				fsmComponent = entities[i].fSMComponent;
				fsmComponent.update(tpf);
			}
		}
	};

	FSMSystem.prototype.inserted = function(entity) {
		var fsmComponent = entity.fSMComponent;

		fsmComponent.entity = entity;
		fsmComponent.init();
	};

	FSMSystem.prototype.pause = function() {
		this.active = false;
	};

	FSMSystem.prototype.play = function() {
		this.active = true;
	};

	FSMSystem.prototype.reset = function() {
		this.resetRequest = true;
		this.active = false;
	};

	return FSMSystem;
});