define(['goo/entities/systems/System'],
	/** @lends */
	function (System) {
	"use strict";

	/**
	 * @class Processes all entities with script components, running the scripts where applicable
	 */
	function ScriptSystem() {
		System.call(this, 'ScriptSystem', ['ScriptComponent']);
	}

	ScriptSystem.prototype = Object.create(System.prototype);

	ScriptSystem.prototype.process = function (entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			var scriptComponent = entities[i].scriptComponent;
			scriptComponent.run(entities[i], tpf);
		}
	};

	return ScriptSystem;
});