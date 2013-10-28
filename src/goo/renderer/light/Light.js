define([
        'goo/math/Vector3'
        ],
/** @lends */
function (
	Vector3
	) {
	"use strict";

	/**
	 * @class A plain lightsource in the scene, to be handled in the shader.
	 */
	function Light () {
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
		 * @property {number} size 2000
		 * @property {number} near 1
		 * @property {number} far 1000
		 * @property {number[]} resolution 512x512
		 * @property {Vector3} upVector UNIT_Y
		 * @property {number} darkness shadow contribution
		 * @property {string} shadowType possible values <strong>'VSM'</strong> = Variance Shadow Maps, 'PCF' = Percentage Closer Filtering, 'Basic' = No filtering
		 */
		this.shadowSettings = {
			size: 100,
			near: 1,
			far: 1000,
			resolution: [512, 512],
			upVector: Vector3.UNIT_Y,
			darkness: 0.0,
			shadowType: 'PCF'
		};

		this.changedProperties = false;
		this.changedColor =  false;
	}

	return Light;
});