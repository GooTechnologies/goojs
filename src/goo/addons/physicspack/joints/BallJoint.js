define([
	'goo/addons/physicspack/joints/PhysicsJoint',
	'goo/math/Vector3'
], function (
	PhysicsJoint,
	Vector3
) {
	'use strict';

	/**
	 * A physics ball joint. A ball joint (or "constraint") will try to keep a point in each of two connected bodies the same.
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.localPivot]
	 * @param {Entity} [settings.connectedEntity]
	 * @param {boolean} [settings.collideConnected=false]
	 * @extends PhysicsJoint
	 */
	function BallJoint(settings) {
		settings = settings || {};
		PhysicsJoint.call(this, settings);

		/**
		 * @type {Vector3}
		 */
		this.localPivot = settings.localPivot ? Vector3.fromAny(settings.localPivot) : new Vector3(0, 0.5, 0);

		/**
		 * Automatically compute the connectedLocalPivot by using the entities initial transforms.
		 * @type {boolean}
		 * @default true
		 */
		this.autoConfigureConnectedPivot = settings.autoConfigureConnectedPivot ? settings.autoConfigureConnectedPivot : true;

		/**
		 * The pivot point defined inside the connected entity.
		 * @type {Vector3}
		 */
		this.connectedLocalPivot = settings.connectedLocalPivot ? Vector3.fromAny(settings.connectedLocalPivot) : new Vector3(0, 0.5, 0);
	}

	BallJoint.prototype = Object.create(PhysicsJoint.prototype);
	BallJoint.prototype.constructor = BallJoint;

	return BallJoint;
});
