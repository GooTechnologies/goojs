define([
        'goo/math/Vector3',
        'goo/math/Vector4'
        ],
/** @lends */
function (
	Vector3,
	Vector4
	) {
	"use strict";

	/**
	 * @class A plain lightsource in the scene, to be handled in the shader.
	 */
	function Light () {
		/** @type {Vector3} */
		this.translation = new Vector3();

		/** @type {Vector4} */
		this.color = new Vector4(1, 1, 1, 1);

		/** @type {number} */
		this.intensity = 1;

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
			size: 100,
			near: 1,
			/** @type {number} */
			far: 1000
		};
	}

	return Light;
});