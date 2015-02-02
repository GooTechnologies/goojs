define([
	'goo/entities/components/Component',
	'goo/util/ObjectUtil',
	'goo/physicspack/joints/PhysicsJoint',
	'goo/math/Vector3'
],
function (
	Component,
	_,
	PhysicsJoint,
	Vector3
) {
	'use strict';

	/**
	 * A physics ball joint. A ball joint (or "constraint") will try to keep a point in each of two connected bodies the same.
	 * @param {object} [settings]
	 * @param {Vector3} [settings.localPivot]
	 * @extends PhysicsJoint
	 */
	function BallJoint(settings) {
		settings = settings || {};
		PhysicsJoint.call(this, settings);

		/**
		 * @type {Vector3}
		 */
		this.localPivot = settings.localPivot ? settings.localPivot.clone() : new Vector3();
	}
	BallJoint.prototype = Object.create(PhysicsJoint.prototype);
	BallJoint.prototype.constructor = BallJoint;

	return BallJoint;
});
