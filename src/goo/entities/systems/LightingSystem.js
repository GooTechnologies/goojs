define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus'
],
/** @lends */
function (
	System,
	SystemBus
) {
	"use strict";

	/**
	 * @class Processes all entities with a light component making sure that lights are placed according to its transforms
	 */
	function LightingSystem() {
		System.call(this, 'LightingSystem', ['LightComponent', 'TransformComponent']);

		this.overrideLights = null;
		this._needsUpdate = true;
	}

	LightingSystem.prototype = Object.create(System.prototype);

	// does this really need exist? can't inserted and deleted be used instead?
	/*
	LightingSystem.prototype.addedComponent = function (entity, component) {
		if (component.type !== 'LightComponent') {
			return;
		}

		if (this.lights.indexOf(component.light) === -1) {
			entity.transformComponent.setUpdated();
			this.lights.push(component.light);
			if (!this.overrideLights) {
				SystemBus.emit('goo.setLights', this.lights);
			}
		}
	};

	LightingSystem.prototype.removedComponent = function (entity, component) {
		if (component.type !== 'LightComponent') {
			return;
		}

		var index = this.lights.indexOf(component.light);
		if (index !== -1) {
			this.lights.splice(index, 1);
			if (!this.overrideLights) {
				SystemBus.emit('goo.setLights', this.lights);
			}
		}
	};
	//*/

	//
	/*
	LightingSystem.prototype.inserted = function() {
		if (this.lights.indexOf(component.light) === -1) {
			entity.transformComponent.setUpdated();
			this.lights.push(component.light);
			if (!this.overrideLights) {
				SystemBus.emit('goo.setLights', this.lights);
			}
		}
	};

	LightingSystem.prototype.deleted = function() {
		var index = this.lights.indexOf(component.light);
		if (index !== -1) {
			this.lights.splice(index, 1);
			if(!this.overrideLights) {
				SystemBus.emit('goo.setLights', this.lights);
			}
		}
	};
	*/

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
		//SystemBus.emit('goo.setLights', this.lights);
		this._needsUpdate = true;
	};

	LightingSystem.prototype.process = function (entities) {
		if (!this.overrideLights) {
			var lights = [];

			for (var i = 0; i < entities.length; i++) {
				var entity = entities[i];
				var transformComponent = entity.transformComponent;
				var lightComponent = entity.lightComponent;

				if (transformComponent._updated || this._needsUpdate) {
					lightComponent.updateLight(transformComponent.worldTransform);
				}

				if (!lightComponent.hidden) {
					lights.push(lightComponent.light);
				}
			}
			this._needsUpdate = false;

			SystemBus.emit('goo.setLights', lights);
		}
	};

	return LightingSystem;
});