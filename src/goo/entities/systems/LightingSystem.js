define(['goo/entities/systems/System'],
	/** @lends */
	function (System) {
	"use strict";

	/**
	 * @class Processes all entities with a light component making sure that lights are placed according to its transforms
	 */
	function LightingSystem() {
		System.call(this, 'LightingSystem', ['LightComponent', 'TransformComponent']);

	}

	LightingSystem.prototype = Object.create(System.prototype);

	LightingSystem.prototype.process = function (entities) {
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var transformComponent = entity.transformComponent;
			var lightComponent = entity.lightComponent;

			if (transformComponent._updated) {
				var m = transformComponent.worldTransform.matrix;
				lightComponent.light.translation.setd(m[12], m[13], m[14]);
			}
		}
	};

	return LightingSystem;
});