define([
	'goo/addons/physicspack/joints/PhysicsJoint',
	'goo/math/Vector3'
],
function (
	PhysicsJoint,
	Vector3
) {
	'use strict';

	/**
	 * Physics hinge joint. To be added to a {@link RigidBodyComponent}.
	 * @param {Object} [settings]
	 * @param {Vector3} [settings.localPivot]
	 * @param {Vector3} [settings.localAxis]
	 * @param {Entity} [settings.connectedEntity]
	 * @param {boolean} [settings.collideConnected=false]
	 * @extends PhysicsJoint
	 */
	function HingeJoint(settings) {
		settings = settings || {};
		PhysicsJoint.call(this, settings);

		/**
		 * A point defined locally in the entity that the Hinge should rotate around.
		 * @type {Vector3}
		 */
		this.localPivot = settings.localPivot ? new Vector3(settings.localPivot) : new Vector3(0, 0.5, 0);

		/**
		 * Automatically compute the connectedLocalPivot
		 * @type {boolean}
		 * @default true
		 */
		this.autoConfigureConnectedPivot = settings.autoConfigureConnectedPivot ? settings.autoConfigureConnectedPivot : true;

		/**
		 * The pivot point defined inside the connected entity.
		 * @type {Vector3}
		 */
		this.connectedLocalPivot = settings.connectedLocalPivot ? new Vector3(settings.connectedLocalPivot) : new Vector3();

		/**
		 * @type {Vector3}
		 */
		this.localAxis = settings.localAxis ? new Vector3(settings.localAxis) : new Vector3(1, 0, 0);
	}
	HingeJoint.prototype = Object.create(PhysicsJoint.prototype);
	HingeJoint.prototype.constructor = HingeJoint;

	return HingeJoint;
});
