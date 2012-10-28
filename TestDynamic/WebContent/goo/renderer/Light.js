define(function() {
	"use strict";

	/**
	 * Creates a new light object
	 * 
	 * @name Light
	 * @class It's a damn light
	 * @property {Vector3} translation Where it is at
	 */
	function Light() {
		this.translation = new THREE.Vector3();

		// this.constant = 1;
		// this.linear;
		// this.quadratic;
		this.shadowCaster = false;
	}

	return Light;
});