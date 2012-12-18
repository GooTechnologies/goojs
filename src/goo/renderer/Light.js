define(['goo/math/Vector3'], function (Vector3) {
	"use strict";

	/**
	 * @name Light
	 * @class It's a damn light
	 * @property {Vector3} translation Where it is at
	 */
	function Light() {
		this.translation = new Vector3();

		// this.constant = 1;
		// this.linear;
		// this.quadratic;
		this.shadowCaster = false;
	}

	return Light;
});