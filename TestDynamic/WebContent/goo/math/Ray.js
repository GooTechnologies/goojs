define(['goo/math/Vector3'], function(Vector3) {
	"use strict";

	/**
	 * @name Ray
	 * @class Constructs a new ray with an origin at (0,0,0) and a direction of (0,0,1).
	 */
	function Ray() {
		this.origin = new Vector3();
		this.direction = new Vector3().copy(Vector3.UNIT_Z);
	}

	Ray.prototype.multiply = function(a, b) {
	};

	return Ray;
});