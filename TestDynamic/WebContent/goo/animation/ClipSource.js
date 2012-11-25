define(['goo/math/Transform'], function(Transform) {
	"use strict";

	/**
	 * @name ClipSource
	 * @class A blend tree leaf node that samples and returns values from the channels of an AnimationClip.
	 * @param clip the clip to use.
	 * @param manager the manager to track clip state with.
	 */
	function ClipSource(clip, manager) {
		this.clip = clip;

		manager.getClipInstance(clip);
	}

	return ClipSource;
});