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
		 * @property {string} type possible values <strong>'Blur'</strong> = VSM, 'Pcf' = Pcf, 'None' = Regular
		 * @property {number} size 2000
		 * @property {number} near 1
		 * @property {number} far 1000
		 */
		this.shadowSettings = {
			type: 'None',
			// type: 'Blur',
			size: 1000,
			near: 1,
			far: 1000,
			resolution: [512, 512],
			upVector: Vector3.UNIT_Y
		};

		this.changedProperties = false;
		this.changedColor =  false;
	}

	return Light;
});