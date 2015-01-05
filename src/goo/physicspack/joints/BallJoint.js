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
	 * @param {object} [settings]
	 * @extends Joint
	 */
	function BallJoint(settings) {
		settings = settings || {};
		Joint.call(this, settings);

		/**
		 * @type {Vector3}
		 */
		this.localPivot = settings.localPivot ? settings.localPivot.clone() : new Vector3();
	}
	BallJoint.prototype = Object.create(Joint.prototype);
	BallJoint.constructor = BallJoint;

	return BallJoint;
});
