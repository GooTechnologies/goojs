define(['goo/entities/systems/System'], function(System) {
	"use strict";

	/**
	 * @name ScriptSystem
	 * @class Processes all entities with script components, running the scripts where applicable
	 */
	function ScriptSystem() {
		System.call(this, 'ScriptSystem', ['ScriptComponent']);
	}

	ScriptSystem.prototype = Object.create(System.prototype);

	ScriptSystem.prototype.process = function(entities) {
		for ( var i in entities) {
			var scriptComponent = entities[i].scriptComponent;
			scriptComponent.run(entities[i]);
		}
	};

	return ScriptSystem;
});