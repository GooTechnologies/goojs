define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus'
],
/** @lends */
function (
	System,
	SystemBus
) {
	'use strict';

	/**
	 * @class Processes all entities with a light component making sure that lights are placed according to its transforms<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example}
	 * @extends System
	 */
	function LightingSystem() {
		System.call(this, 'LightingSystem', ['LightComponent', 'TransformComponent']);

		this.overrideLights = null;
		this._needsUpdate = true;

		this.lights = [];
	}

	LightingSystem.prototype = Object.create(System.prototype);

	/**
	 * Replaces the lights tracked by the system with custom ones.
	 * @param overrideLights
	 */
	LightingSystem.prototype.setOverrideLights = function (overrideLights) {
		this.overrideLights = overrideLights;
		SystemBus.emit('goo.setLights', this.overrideLights);
		this._needsUpdate = true;
	};

	/**
	 * Disables overriding of lights tracked by the system
	 */
	LightingSystem.prototype.clearOverrideLights = function () {
		this.overrideLights = undefined;
		this._needsUpdate = true;
	};

	LightingSystem.prototype.inserted = function (entity) {
		entity.lightComponent.updateLight(entity.transformComponent.worldTransform);
	};

	LightingSystem.prototype.process = function (entities) {
		// do we use this anymore?
		// we used to have this feature for the early days of create
		if (!this.overrideLights) {
			this.lights.length = 0;

			for (var i = 0; i < entities.length; i++) {
				var entity = entities[i];
				var transformComponent = entity.transformComponent;
				var lightComponent = entity.lightComponent;

				if (transformComponent._updated || this._needsUpdate) {
					lightComponent.updateLight(transformComponent.worldTransform);
				}

				if (!lightComponent.hidden) {
					this.lights.push(lightComponent.light);
				}
			}
			this._needsUpdate = false;

			SystemBus.emit('goo.setLights', this.lights);
		}
	};

	LightingSystem.prototype.invalidateHandles = function (renderer) {
		this._activeEntities.forEach(function (entity) {
			entity.lightComponent.light.invalidateHandles(renderer);
		});
	};

	return LightingSystem;
});