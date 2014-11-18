define([
	'goo/math/Vector3'
],
/** @lends */
function(
	Vector3
) {
	'use strict';

	/**
	 * @class <code>BoundingVolume</code> Base class for boundings
	 */
	function BoundingVolume_(center) {
		this.center = new Vector3();
		if (center) {
			this.center.setv(center);
		}

		this.min = new Vector3(Infinity, Infinity, Infinity);
		this.max = new Vector3(-Infinity, -Infinity, -Infinity);
	}

	var BoundingVolume = BoundingVolume_;

	/**
	 * Intersection type
	 */
	BoundingVolume.Outside = 0;
	BoundingVolume.Inside = 1;
	BoundingVolume.Intersects = 2;

	return BoundingVolume;
});