define([
		'goo/math/Vector3',
		'goo/renderer/light/Light'
		],
/** @lends */
function (
	Vector3,
	Light
	) {
	'use strict';

	/**
	 * @class A directional light<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example}
	 * @constructor
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
	}

	DirectionalLight.prototype = Object.create(Light.prototype);
	DirectionalLight.prototype.constructor = DirectionalLight;

	/**
	 * Updates the light's translation and orientation
	 * @private
	 * @param {Transform} transform
	 */
	DirectionalLight.prototype.update = function (transform) {
		transform.matrix.getTranslation(this.translation);
		this.direction.setDirect(0.0, 0.0, -1.0);
		transform.matrix.applyPostVector(this.direction);
	};

	DirectionalLight.prototype.copy = function (source) {
		Light.prototype.copy.call(this, source);

		this.direction.copy(source.direction);
	};

	DirectionalLight.prototype.clone = function () {
		var clone = new DirectionalLight(this.color);
		clone.copy(this);
		return clone;
	};

	return DirectionalLight;
});