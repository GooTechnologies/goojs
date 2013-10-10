define(['goo/animation/clip/JointChannel', 'goo/animation/blendtree/ClipSource'],
/** @lends */
function (JointChannel, ClipSource) {
	"use strict";

	/**
	 * @class Similar to a ClipSource, this class samples and returns values from the channels of an AnimationClip. ExclusiveClipSource further
	 *        filters this result set, excluding a given set of channels by name.
	 * @param clip our source clip.
	 * @param manager the manager used to track clip state.
	 */
	function ExclusiveClipSource (clip) {
		ClipSource.call(this, clip);

		this._disabledChannels = {};
	}

	ExclusiveClipSource.prototype = Object.create(ClipSource.prototype);

	ExclusiveClipSource.prototype.clearDisabled = function () {
		// NB: doesn't handle is we have external ref to this property, but we really shouldn't.
		this._disabledChannels = {};
	};

	ExclusiveClipSource.prototype.addDisabledChannels = function () {
		if (arguments.length === 1 && typeof (arguments[0]) === "object") {
			for ( var i = 0; i < arguments[0].length; i++) {
				this._disabledChannels[arguments[0][i]] = true;
			}
		} else {
			for ( var i = 0; i < arguments.length; i++) {
				this._disabledChannels[arguments[i]] = true;
			}
		}
	};

	ExclusiveClipSource.prototype.addDisabledJoints = function () {
		if (arguments.length === 1 && typeof (arguments[0]) === "object") {
			for ( var i = 0; i < arguments[0].length; i++) {
				var channelName = JointChannel.JOINT_CHANNEL_NAME + arguments[0][i];
				this._disabledChannels[channelName] = true;
			}
		} else {
			for ( var i = 0; i < arguments.length; i++) {
				var channelName = JointChannel.JOINT_CHANNEL_NAME + arguments[i];
				this._disabledChannels[channelName] = true;
			}
		}
	};

	ExclusiveClipSource.prototype.getSourceData = function () {
		var orig = ClipSource.prototype.getSourceData.call(this);

		// make a copy, removing specific channels
		var rVal = {};
		for ( var key in orig) {
			if (!this._disabledChannels[key]) {
				rVal[key] = orig[key];
			}
		}

		return rVal;
	};

	return ExclusiveClipSource;
});