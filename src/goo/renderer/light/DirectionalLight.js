var Vector3 = require('../../math/Vector3');
var Light = require('../../renderer/light/Light');

	'use strict';

	/**
	 * A directional light
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example
	 * @extends Light
	 * @param {Vector3} [color=(1, 1, 1)] The color of the light
	 */
	function DirectionalLight(color) {
		Light.call(this, color);

		/**
		 * The direction vector of the light
		 * @readonly
		 * @type {Vector3}
		 */
		this.direction = new Vector3();

		// @ifdef DEBUG
		Object.seal(this);
		// @endif
	}

	DirectionalLight.prototype = Object.create(Light.prototype);
	DirectionalLight.prototype.constructor = DirectionalLight;

	/**
	 * Updates the light's translation and orientation
	 * @hidden
	 * @param {Transform} transform
	 */
	DirectionalLight.prototype.update = function (transform) {
		transform.matrix.getTranslation(this.translation);
		this.direction.setDirect(0.0, 0.0, -1.0);
		this.direction.applyPostVector(transform.matrix);
	};

	DirectionalLight.prototype.copy = function (source) {
		Light.prototype.copy.call(this, source);

		this.direction.copy(source.direction);

		return this;
	};

	DirectionalLight.prototype.clone = function () {
		var clone = new DirectionalLight(this.color.clone());
		clone.copy(this);
		return clone;
	};

	module.exports = DirectionalLight;