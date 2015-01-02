define([
	'goo/entities/components/Component',
	'goo/util/ObjectUtil',
	'goo/physicspack/joints/Joint',
	'goo/math/Vector3'
],
/** @lends */
function (
	Component,
	_,
	Joint,
	Vector3
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

		this.localPivot = settings.localPivot ? settings.localPivot.clone() : new Vector3();
	}
	BallJoint.prototype = Object.create(Joint.prototype);
	BallJoint.constructor = BallJoint;

	return BallJoint;
});
