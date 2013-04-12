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
	 * @class It's a damn light
	 * @property {Vector3} translation Where it is at
	 */
	function Light () {
		this.translation = new Vector3();

		this.color = new Vector4(1, 1, 1, 1);
		this.intensity = 1;

		this.shadowCaster = false;
		this.shadowSettings = {
			type: 'Blur', // 'Blur', 'None'
			projection: 'Perspective', // 'Perspective', 'Parallel'
			fov: 55,
			size: 100,
			near: 1,
			far: 1000
		};
	}

	return Light;
});