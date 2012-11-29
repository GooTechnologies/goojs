define(['goo/animation/JointChannel', 'goo/animation/blendtree/ClipSource'], function(JointChannel, ClipSource) {
	"use strict";

	InclusiveClipSource.prototype = Object.create(ClipSource.prototype);

	/**
	 * @name InclusiveClipSource
	 * @class Similar to a ClipSource, this class samples and returns values from the channels of an AnimationClip. InclusiveClipSource further
	 *        filters this result set, excluding any channels whose names do not match those in our enabledChannels list.
	 * @param clip our source clip.
	 * @param manager the manager used to track clip state.
	 */
	function InclusiveClipSource(clip, manager) {
		ClipSource.call(this, clip, manager);

		this._enabledChannels = {};
	}

	InclusiveClipSource.prototype.clearEnabled = function() {
		// NB: doesn't handle is we have external ref to this property, but we really shouldn't.
		this._enabledChannels = {};
	};

	InclusiveClipSource.prototype.addEnabledChannels = function() { // String array
		for ( var i = 0, max = arguments.length; i < max; i++) {
			this._enabledChannels[arguments[i]] = true;
		}
	};

	InclusiveClipSource.prototype.addEnabledJoints = function() { // int array
		for ( var i = 0, max = arguments.length; i < max; i++) {
			var channelName = JointChannel.JOINT_CHANNEL_NAME + arguments[i];
			this._enabledChannels[channelName] = true;
		}
	};

	InclusiveClipSource.prototype.getSourceData = function(manager) {
		var orig = ClipSource.prototype.getSourceData.call(manager);

		// make a copy, removing specific channels
		var rVal = {};
		for ( var key in _enabledChannels) {
			if (_enabledChannels[key]) {
				rVal[key] = orig[key];
			}
		}

		return rVal;
	};

	return InclusiveClipSource;
});