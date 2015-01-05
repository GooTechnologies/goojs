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
	 * @extends Joint(2)
	 */
	function HingeJoint(settings) {
		settings = settings || {};
		Joint.call(this, settings);

		/**
		 * @type {Vector3}
		 */
		this.localPivot = settings.localPivot ? settings.localPivot.clone() : new Vector3();

		/**
		 * @type {Vector3}
		 */
		this.localAxis = settings.localAxis ? settings.localAxis.clone() : new Vector3(0, 1, 0);
	}
	HingeJoint.prototype = Object.create(Joint.prototype);
	HingeJoint.constructor = HingeJoint;

	return HingeJoint;
});
