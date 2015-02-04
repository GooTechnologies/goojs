define([
	'goo/renderer/Capabilities',
	'goo/entities/systems/System',
	'goo/entities/SystemBus'
], function (
	Capabilities,
	System,
	SystemBus
) {
	'use strict';

	/**
	 * Processes all entities with a light component making sure that lights are placed according to its transforms
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example
	 * @extends System
	 */
	function LightingSystem_() {
		System.call(this, 'LightingSystem', ['LightComponent', 'TransformComponent']);

		this._needsUpdate = true;

		this.lights = [];
	}

	var LightingSystem = LightingSystem_;

	LightingSystem.prototype = Object.create(System.prototype);
	LightingSystem.prototype.constructor = LightingSystem;

	LightingSystem.prototype.inserted = function (entity) {
		entity.lightComponent.updateLight(entity.transformComponent.worldTransform);
	};

	LightingSystem.prototype.process = function (entities) {
		this.lights.length = 0;

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var transformComponent = entity.transformComponent;
			var lightComponent = entity.lightComponent;

			if (transformComponent._updated || this._needsUpdate) {
				lightComponent.updateLight(transformComponent.worldTransform);
			}

			if (!lightComponent.hidden) {
				var light = lightComponent.light;
				light.shadowCaster = light.shadowCaster && Capabilities.TextureFloat; // Needs float texture for shadows (for now)
				this.lights.push(light);
			}
		}
		this._needsUpdate = false;

		SystemBus.emit('goo.setLights', this.lights);
	};

	LightingSystem.prototype.invalidateHandles = function (renderer) {
		this._activeEntities.forEach(function (entity) {
			entity.lightComponent.light.invalidateHandles(renderer);
		});
	};

	return LightingSystem;
});