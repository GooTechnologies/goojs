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
	 * @class Processes all entities with transform components, making sure they are up to date and valid according to the "scenegraph"
	 */
	function FSMSystem(engine) {
		System.call(this, 'FSMSystem', ['FSMComponent']);

		this.engine = engine;
	}

	FSMSystem.prototype = Object.create(System.prototype);

	FSMSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			var fsmComponent = entities[i].fSMComponent;
			fsmComponent.update(tpf);
		}
	};

	FSMSystem.prototype.inserted = function(entity) {
		var fSMComponent = entity.fSMComponent;

		fSMComponent.entity = entity;
		fSMComponent.init();
	};

	return FSMSystem;
});