define(['goo/math/Vector3'],
	/** @lends Light */
	function (Vector3) {
	"use strict";

	/**
	 * @class It's a damn light
	 * @property {Vector3} translation Where it is at
	 */
	function Light() {
		this.translation = new Vector3();

		// this.constant = 1;
		// this.linear;
		// this.quadratic;
		
		this.shadowCaster = false;
		this.shadowSettings = {
			type: 'Blur' // 'Blur', 'None'
		};
	}

	return Light;
});