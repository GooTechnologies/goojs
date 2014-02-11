define([
        'goo/math/Vector3'
        ],
/** @lends */
function (
	Vector3
	) {
	'use strict';

	/**
	 * @class A plain light source in the scene, to be handled in the shader.
	 * @param {Vector3} [color=(1, 1, 1)] The color of the light
	 */
	function Light (color) {
		/** @type {Vector3} */
		this.translation = new Vector3();

		/** @type {Vector3} */
		this.color = color || new Vector3(1, 1, 1);

		/** @type {number} */
		this.intensity = 1;

		/** @type {number} */
		this.specularIntensity = 1;

		/**
		 * @type boolean
		 * @default
		 */
		this.shadowCaster = false;

		this.lightCookie = null;

		/**
		 * @type {object}
		 * @property {number} size 2000
		 * @property {number} near 1
		 * @property {number} far 1000
		 * @property {number[]} resolution 512x512
		 * @property {Vector3} upVector UNIT_Y
		 * @property {number} darkness shadow contribution
		 * @property {string} shadowType possible values 'VSM' = Variance Shadow Maps, 'PCF' = Percentage Closer Filtering, 'Basic' = No filtering
		 */
		this.shadowSettings = {
			size: 100,
			near: 1,
			far: 1000,
			resolution: [512, 512],
			upVector: Vector3.UNIT_Y,
			darkness: 0.0,
			shadowType: 'VSM'
		};

		this.changedProperties = false;
		this.changedColor =  false;
	}

	return Light;
});