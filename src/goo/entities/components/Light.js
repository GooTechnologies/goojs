define([
	'goo/entities/components/Component',
	'goo/math/Vector3'
],
/** @lends */
function (
	Component,
	Vector3
) {
	"use strict";

	/**
	 * @class A plain lightsource in the scene, to be handled in the shader.
	 */
	function Light () {
		Component.call(this, 'Light', false);

		/** @type {Vector3} */
		this.translation = new Vector3();

		/** @type {Vector3} */
		this.color = new Vector3(1, 1, 1);

		/** @type {number} */
		this.intensity = 1;

		/** @type {number} */
		this.specularIntensity = 1;

		/**
		 * @type boolean
		 * @default
		 */
		this.shadowCaster = false;

		/**
		 * @type {object}
		 * @property {string} type possible values <strong>'Blur'</strong> = VSM, 'Pcf' = Pcf, 'None' = Regular
		 * @property {number} size 2000
		 * @property {number} near 1
		 * @property {number} far 1000
		 * @property {number[]} resolution 512x512
		 * @property {Vector3} upVector UNIT_Y
		 */
		this.shadowSettings = {
			size: 100,
			near: 1,
			far: 1000,
			resolution: [512, 512],
			upVector: Vector3.UNIT_Y
		};

		this.changedProperties = false;
		this.changedColor = false;
	}

	Light.prototype = Object.create(Component.prototype);

	return Light;
});