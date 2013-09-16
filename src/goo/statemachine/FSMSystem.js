define([
	'goo/entities/systems/System'
],
/** @lends */
function (
	System
) {
	"use strict";

	/**
	 * @class Processes all entities with transform components, making sure they are up to date and valid according to the "scenegraph"
	 */
	function FSMSystem(engine) {
		System.call(this, 'FSMSystem', ['FSMComponent']);

		this.engine = engine;
	}

	FSMSystem.prototype = Object.create(System.prototype);

	FSMSystem.prototype.process = function (entities, tpf) {
		var i, fsmComponent;
		for (i = 0; i < entities.length; i++) {
			fsmComponent = entities[i].fSMComponent;
			fsmComponent.update(tpf);
		}
	};

	FSMSystem.prototype.addedComponent = function (entity, component) {
		if (component.type !== 'FSMComponent') {
			return;
		}

		component.engine = this.engine;
		component.entity = entity;

		component.init();
	};

	FSMSystem.prototype.removedComponent = function (entity, component) {
		if (component.type !== 'FSMComponent') {
			return;
		}
	};

	return FSMSystem;
});