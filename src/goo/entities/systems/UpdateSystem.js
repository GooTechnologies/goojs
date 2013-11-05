define(['goo/entities/systems/System'],
	/** @lends */
	function (System) {
	"use strict";

	/**
	 * @class Processes all entities with script components, running the scripts where applicable
	 */
	function UpdateSystem(renderer) {
		System.call(this, 'UpdatetSystem', null);
	}

	UpdateSystem.prototype = Object.create(System.prototype);

	UpdateSystem.prototype.process = function (entities, tpf) {
		
		for (var i = 0; i < entities.length; i++) {
			entities[i].forEachComponent(function(comp) {
				if (comp.updateComponent !== undefined)
					comp.updateComponent(tpf);
			});
		}
	};

	return UpdateSystem;
});