define([
	'goo/entities/systems/System',
	'goo/entities/EventHandler'
],
/** @lends */
function (
	System,
	EventHandler
) {
	"use strict";

	/**
	 * @class Processes all entities with a light component making sure that lights are placed according to its transforms
	 */
	function LightingSystem() {
		System.call(this, 'LightingSystem', ['LightComponent']);

		this.lights = [];
		this.overrideLights = null;
	}

	LightingSystem.prototype = Object.create(System.prototype);

	LightingSystem.prototype.addedComponent = function (entity, component) {
		if (component.type !== 'LightComponent') {
			return;
		}

		if (this.lights.indexOf(component) === -1) {
			this.lights.push(component);
			if (!this.overrideLights) {
				EventHandler.dispatch("setLights", this.lights);
			}
		}
	};

	LightingSystem.prototype.removedComponent = function (entity, component) {
		if (component.type !== 'LightComponent') {
			return;
		}

		var index = this.lights.indexOf(component);
		if (index !== -1) {
			this.lights.splice(index, 1);
			if(!this.overrideLights) {
				EventHandler.dispatch("setLights", this.lights);
			}
		}
	};

	LightingSystem.prototype.setOverrideLights = function(lights) {
		this.overrideLights = lights;
		EventHandler.dispatch("setLights", this.overrideLights || this.lights);
	};

	LightingSystem.prototype.process = function (entities) {
		if (!this.overrideLights) {
			for (var i = 0; i < entities.length; i++) {
				var entity = entities[i];
				var lightComponent = entity.lightComponent;

				if (entity._updated) {
					lightComponent.update(entity.worldTransform);
				}
			}
		}
	};

	return LightingSystem;
});