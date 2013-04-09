define(['goo/animation/clip/JointChannel', 'goo/animation/blendtree/ClipSource'],
/** @lends */
function (JointChannel, ClipSource) {
	"use strict";

	/**
	 * @class Similar to a ClipSource, this class samples and returns values from the channels of an AnimationClip. InclusiveClipSource further
	 *        filters this result set, excluding any channels whose names do not match those in our enabledChannels list.
	 * @param clip our source clip.
	 * @param manager the manager used to track clip state.
	 */
	function InclusiveClipSource (clip, manager) {
		ClipSource.call(this, clip, manager);

		this._enabledChannels = {};
	}

	InclusiveClipSource.prototype = Object.create(ClipSource.prototype);

	InclusiveClipSource.prototype.clearEnabled = function () {
		// NB: doesn't handle is we have external ref to this property, but we really shouldn't.
		this._enabledChannels = {};
	};

	InclusiveClipSource.prototype.addEnabledChannels = function () {
		if (arguments.length === 1 && typeof (arguments[0]) === "object") {
			for ( var i = 0; i < arguments[0].length; i++) {
				this._enabledChannels[arguments[0][i]] = true;
			}
		} else {
			for ( var i = 0; i < arguments.length; i++) {
				this._enabledChannels[arguments[i]] = true;
			}
		}
	};

	InclusiveClipSource.prototype.addEnabledJoints = function () {
		if (arguments.length === 1 && typeof (arguments[0]) === "object") {
			for ( var i = 0; i < arguments[0].length; i++) {
				var channelName = JointChannel.JOINT_CHANNEL_NAME + arguments[0][i];
				this._enabledChannels[channelName] = true;
			}
		} else {
			for ( var i = 0; i < arguments.length; i++) {
				var channelName = JointChannel.JOINT_CHANNEL_NAME + arguments[i];
				this._enabledChannels[channelName] = true;
			}
		}
	};

	InclusiveClipSource.prototype.getSourceData = function (manager) {
		var orig = ClipSource.prototype.getSourceData.call(this, manager);

		// make a copy, removing specific channels
		var rVal = {};
		for ( var key in this._enabledChannels) {
			if (this._enabledChannels[key]) {
				rVal[key] = orig[key];
			}
		}

		return rVal;
	};

	return InclusiveClipSource;
});