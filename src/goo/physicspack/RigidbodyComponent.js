define([
	'goo/entities/components/Component',
	'goo/math/Vector3'
],
/** @lends */
function (
	Component,
	Vector3
) {
	'use strict';

	/**
	 * @class
	 * @extends Component
	 */
	function RigidbodyComponent(settings) {
		Component.call(this);
		settings = settings || {};
		this.type = 'RigidbodyComponent';
		this.rigidbody = null; // Will be set by the PhysicsSystem
		this.settings = settings;
		this.joints = [];

		// Set to true if any of the settings (or colliders) were changed
		this._dirty = true;

		this.isKinematic = settings.isKinematic || false;
		this.mass = typeof(settings.mass) !== 'undefined' ? settings.mass : 1.0;
		if (this.isKinematic) {
			this.mass = 0;
		}
		this.initialVelocity = settings.initialVelocity ? settings.initialVelocity.clone() : new Vector3();
	}

	RigidbodyComponent.prototype = Object.create(Component.prototype);
	RigidbodyComponent.constructor = RigidbodyComponent;

	RigidbodyComponent.prototype.addJoint = function (joint) {
		this.joints.push(joint);
		if (this.rigidbody) {
			this.rigidbody.addJoint(joint);
		}
	};

	return RigidbodyComponent;
});
