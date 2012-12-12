define(['goo/entities/systems/System'], function(System) {
	"use strict";

	/**
	 * @name LightingSystem
	 * @class Processes all entities with a light component making sure that lights are placed according to its transforms
	 */
	function LightingSystem() {
		System.call(this, 'LightingSystem', ['LightComponent']);
	}

	LightingSystem.prototype = Object.create(System.prototype);

	LightingSystem.prototype.process = function(entities) {
		for ( var i in entities) {
			var entity = entities[i];
			var transformComponent = entity.transformComponent;
			var lightComponent = entity.lightComponent;

			if (transformComponent._updated) {
				lightComponent.light.translation.copy(transformComponent.transform.translation);
			}
		}
	};

	return LightingSystem;
});