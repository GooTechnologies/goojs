define([
	'goo/math/Vector3'
	],
/** @lends Triangle */
function (Vector3) {

	/*
		Send in vertices ( Vector3 ) CCW order. 

		The vertices must be in pixel space.
	*/
	function Triangle(v1, v2, v3) {

		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;
	};

	return Triangle;
});