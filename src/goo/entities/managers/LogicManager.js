define(
	["goo/entities/managers/EntityManager"]
	,
	/** @lends */
	function (
		EntityManager
	) {
	
	"use strict";

	/**
	 * @class Handles the logic layer of the world in conjunction with the entity manager.
	 */
	function LogicManager(entityManager) {
		this.type = 'LogicManager';
		this.entityManager = entityManager;
		this._connections = [];
		console.log("Created logic manager");
	}
	
	LogicManager.prototype.addConnection = function(sourceEntity, sourcePort, targetEntity, targetPort) {
	
		// Assume immediate resolving is possible. It might be nice to have the entities by ID and 
		// then resolve them later. Unsure if dependencies are possible to resolve during loading.
		
		var connected = false;
		sourceEntity.forEachComponent(function(comp) {
			if (comp.connect(sourcePort, targetEntity, targetPort))
				connected = true;
		});
		
		if (!connected)
			console.warn("addConnection failed");
	}

	return LogicManager;
});