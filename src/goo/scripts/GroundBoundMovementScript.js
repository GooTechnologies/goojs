define([

],
	function() {
		"use strict";

		function GroundBoundMovementScript() {

		}

		GroundBoundMovementScript.prototype.setTerrainSystem = function(terrainSystem) {
			this.terrainSystem = terrainSystem;
		};

		GroundBoundMovementScript.prototype.getTerrainSystem = function() {
			return this.terrainSystem;
		};

		GroundBoundMovementScript.prototype.getTerrainHeightBeneath = function(entity) {
			return this.getTerrainSystem().getTerrainHeightAt(entity.transformComponent.transform.translation.data);
		};

		GroundBoundMovementScript.prototype.run = function(entity) {
			var transform = entity.transformComponent.transform;
			var groundHeight = this.getTerrainHeightBeneath(entity);
			if (groundHeight !== null) {
				transform.translation.data[1] = groundHeight;
			}
		};

		return GroundBoundMovementScript;
});


