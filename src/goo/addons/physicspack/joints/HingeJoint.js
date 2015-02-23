define([
	'goo/entities/components/Component',
	'goo/util/ObjectUtil',
	'goo/addons/physicspack/joints/PhysicsJoint',
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
	 * Physics hinge joint. To be added to a {@link RigidbodyComponent} or {@link AmmoRigidbodyComponent}.
	 * @param {object} [settings]
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
		this.localPivot = settings.localPivot ? settings.localPivot.clone() : new Vector3(0, 0.5, 0);

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
		this.connectedLocalPivot = settings.connectedLocalPivot ? settings.connectedLocalPivot.clone() : new Vector3();

		/**
		 * @type {Vector3}
		 */
		this.localAxis = settings.localAxis ? settings.localAxis.clone() : new Vector3(1, 0, 0);
	}
	HingeJoint.prototype = Object.create(PhysicsJoint.prototype);
	HingeJoint.prototype.constructor = HingeJoint;

	return HingeJoint;
});
