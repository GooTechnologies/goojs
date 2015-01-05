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

		/**
		 * The rigid body wrapper. Will be set on initialize()
		 * @type {Rigidbody}
		 */
		this.rigidbody = null;

		/**
		 * Joints on the body. Use .addJoint to add one.
		 * @type {Array}
		 */
		this.joints = [];

		/**
		 * Set to true if any of the settings (or colliders) were changed, and the body needs to be recreated.
		 * @type {Boolean}
		 */
		this._dirty = true;

		/**
		 * @type {Boolean}
		 */
		this.isKinematic = settings.isKinematic || false;

		/**
		 * @type {number}
		 */
		this.mass = typeof(settings.mass) !== 'undefined' ? settings.mass : 1.0;
		if (this.isKinematic) {
			this.mass = 0;
		}

		/**
		 * @type {Vector3}
		 */
		this.initialVelocity = settings.initialVelocity ? settings.initialVelocity.clone() : new Vector3();

		/**
		 * @private
		 * @type {number}
		 */
		this._linearDamping = 0.01;

		/**
		 * @private
		 * @type {number}
		 */
		this._angularDamping = 0.01;

		/**
		 * @private
		 * @type {number}
		 */
		this._friction = 0.3;

		/**
		 * @private
		 * @type {number}
		 */
		this._restitution = 0;

		/**
		 * @private
		 * @type {number}
		 */
		this._collisionGroup = undefined;

		/**
		 * @private
		 * @type {number}
		 */
		this._collisionMask = undefined;
	}
	RigidbodyComponent.prototype = Object.create(Component.prototype);
	RigidbodyComponent.constructor = RigidbodyComponent;

	Object.defineProperties(RigidbodyComponent.prototype, {

		/**
		 * @member {number} linearDamping
		 * @memberOf RigidbodyComponent#
		 */
		linearDamping: {
			get: function () {
				return this._linearDamping;
			},
			set: function (value) {
				this._linearDamping = value;
				this.rigidbody.setLinearDamping(value);
			}
		},

		/**
		 * @member {number} angularDamping
		 * @memberOf RigidbodyComponent#
		 */
		angularDamping: {
			get: function () {
				return this._angularDamping;
			},
			set: function (value) {
				this._angularDamping = value;
				this.rigidbody.setAngularDamping(value);
			}
		},

		/**
		 * @member {number} collisionGroup
		 * @memberOf RigidbodyComponent#
		 */
		collisionGroup: {
			get: function () {
				return this._collisionGroup;
			},
			set: function (value) {
				this._collisionGroup = value;
				this.rigidbody.setCollisionGroup(value);
			}
		},

		/**
		 * @member {number} collisionMask
		 * @memberOf RigidbodyComponent#
		 */
		collisionMask: {
			get: function () {
				return this._collisionMask;
			},
			set: function (value) {
				this._collisionMask = value;
				this.rigidbody.setCollisionMask(value);
			}
		}
	});

	/**
	 * @param {Joint} joint
	 */
	RigidbodyComponent.prototype.addJoint = function (joint) {
		this.joints.push(joint);
		if (this.rigidbody) {
			this.rigidbody.addJoint(joint);
		}
	};

	return RigidbodyComponent;
});
