define(function () {
	/** @lends */
	"use strict";

	/**
	 * @class Abstract blend tree source that takes two child sources and a blend weight [0.0, 1.0]. The subclass is responsible for implementing how
	 *        these two sources are combined.
	 * @param sourceA our first source.
	 * @param sourceB our second source.
	 * @param blendKey A key into the related AnimationManager's values store for pulling blend weighting. What blend weighting is used for is up to
	 *            the subclass.
	 */
	function AbstractTwoPartSource (sourceA, sourceB, blendWeight) {
		this._sourceA = sourceA ? sourceA : null;
		this._sourceB = sourceB ? sourceB : null;
		this.blendWeight = blendWeight ? blendWeight : null;
	}

	return AbstractTwoPartSource;
});