define([
        'goo/math/Vector3',
        'goo/math/Vector4'
        ],
/** @lends Light */
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
		this.attenuate = true;
		this.constant = 1;
		//this.linear;
		//this.quadratic;

		this.shadowCaster = false;
		this.shadowSettings = {
			type: 'Blur' // 'Blur', 'None'
			//TODO: add camera frustum settings and sizes
		};
	}

	return Light;
});