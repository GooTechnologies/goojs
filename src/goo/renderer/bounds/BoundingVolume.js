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
	function BoundingVolume(center) {
		//! AT: this is one of the few classes that's cloning its input
		// I don't dare change the behaviour since there's no telling what will break
		this.center = new Vector3();
		if (center) {
			this.center.setVector(center);
		}

		//! AT: can these be private?
		this.min = new Vector3(Infinity, Infinity, Infinity);
		this.max = new Vector3(-Infinity, -Infinity, -Infinity);
	}

	/**
	 * Copies data from another bounding volume
	 * @param {BoundingVolume} source
	 * @returns {BoundingVolume}
	 */
	BoundingVolume.prototype.copy = function (source) {
		this.center.copy(source.center);
		this.min.copy(source.min);
		this.min.copy(source.min);
		return this;
	};

	/**
	 * Intersection type
	 */
	BoundingVolume.Outside = 0;
	BoundingVolume.Inside = 1;
	BoundingVolume.Intersects = 2;

	return BoundingVolume;
});