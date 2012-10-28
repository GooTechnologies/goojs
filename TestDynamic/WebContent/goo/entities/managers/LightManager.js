define(function() {
	"use strict";

	function LightManager() {
		this.type = 'LightManager';

		this.lights = [];
	}

	LightManager.prototype.addedComponent = function(entity, component) {
		if (component.type !== 'LightComponent') {
			return;
		}

		if (this.lights.indexOf(component.light) === -1) {
			lights.push(component.light);
		}
	};

	LightManager.prototype.removedComponent = function(entity, component) {
		if (component.type !== 'LightComponent') {
			return;
		}

		var index = this.lights.indexOf(component.light);
		if (index !== -1) {
			this.lights.splice(index, 1);
		}
	};

	return LightManager;
});