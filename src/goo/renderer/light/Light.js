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
		 * @property {string} type possible values <strong>'Blur'</strong>, 'None'
		 * @property {string} projection possible values <strong>'Perspective'</strong>, 'Parallel'
		 * @property {number} fov 55
		 * @property {number} near 1
		 * @property {number} far 1000
		 */
		this.shadowSettings = {
			type: 'Blur',
			projection: 'Perspective',
			fov: 55,
			size: 2000,
			near: 1,
			/** @type {number} */
			far: 1000
		};

		this.changedProperties = false;
		this.changedColor =  false;
	}

	return Light;
});