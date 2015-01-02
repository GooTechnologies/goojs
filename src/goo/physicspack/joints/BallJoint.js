define([
	'goo/entities/components/Component',
	'goo/util/ObjectUtil',
	'goo/physicspack/joints/Joint'
],
/** @lends */
function (
	Component,
	_,
	Joint
) {
	'use strict';

	/**
	 * @class
	 * @extends Joint
	 * @param {object} [settings]
	 */
	function BallJoint(settings) {
		settings = settings || {};
		Joint.call(this, settings);
	}
	BallJoint.prototype = Object.create(Joint.prototype);
	BallJoint.constructor = BallJoint;

	return BallJoint;
});
