define([
	'goo/entities/components/Component',
	'goo/util/ObjectUtil',
	'goo/physicspack/joints/PhysicsJoint',
	'goo/math/Vector3'
],
/** @lends */
function (
	Component,
	_,
	PhysicsJoint,
	Vector3
) {
	'use strict';

	/**
	 * Physics hinge joint. To be added to a {@link RigidbodyComponent} or {@link AmmoRigidbodyComponent}.
	 * @param {object} [settings]
	 * @param {Vector3} [settings.localPivot]
	 * @param {Vector3} [settings.localAxis]
	 * @extends PhysicsJoint
	 */
	function HingeJoint(settings) {
		settings = settings || {};
		PhysicsJoint.call(this, settings);

		/**
		 * @type {Vector3}
		 */
		this.localPivot = settings.localPivot ? settings.localPivot.clone() : new Vector3();

		/**
		 * @type {Vector3}
		 */
		this.localAxis = settings.localAxis ? settings.localAxis.clone() : new Vector3(0, 1, 0);
	}
	HingeJoint.prototype = Object.create(PhysicsJoint.prototype);
	HingeJoint.constructor = HingeJoint;

	return HingeJoint;
});
