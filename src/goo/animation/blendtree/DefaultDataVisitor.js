define([
	'goo/math/Transform',
	'goo/math/Matrix4x4'
	],
/** @lends */
function (
	Transform,
	Matrix4x4
	) {
	"use strict";

	/**
	 * @class Representation of a Joint in a Skeleton. Meant to be used within a specific Skeleton object.
	 * @param {String} name Name of joint
	 */
	function DefaultDataVisitor (data) {
		this.data = data;
	}

	DefaultDataVisitor.prototype.visitClipSource = function (clipSource) {
		for (var i = 0; i < clipSource._clip._channels.length; i++) {
			var channel = clipSource._clip._channels[i];
			channel.setDefaultData(this.data[channel._jointIndex].localTransform);
		}
	};

	return DefaultDataVisitor;
});