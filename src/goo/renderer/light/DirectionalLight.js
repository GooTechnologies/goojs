define([
	'goo/renderer/light/ProjectionalLight'
], function (
	ProjectionalLight
) {
	'use strict';

	/**
	 * A directional light
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example
	 * @extends ProjectionalLight
	 * @param {Vector3} [color=(1, 1, 1)] The color of the light
	 */
	function DirectionalLight(color) {
		ProjectionalLight.call(this, color);
		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	DirectionalLight.prototype = Object.create(ProjectionalLight.prototype);
	
	DirectionalLight.prototype.constructor = DirectionalLight;

	DirectionalLight.prototype.clone = function () {
		var clone = new DirectionalLight(this.color.clone());
		clone.copy(this);
		return clone;
	};

	return DirectionalLight;
});