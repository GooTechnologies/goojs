define([
	'goo/math/Vector3',
	'goo/entities/components/Component'
],
	/** @lends */
		function (
		Vector3,
		Component
		) {
		'use strict';

		/**
		 * @class Holds the movement parameters of an entity.
		 * Typically useful for anything which has a speed and/or
		 * rotation.
		 * @extends Component
		 */
		function MovementComponent() {
			Component.apply(this, arguments);

			this.type = 'MovementComponent';
			this.velocity = new Vector3();
			this.rotationVelocity = new Vector3();
		}

		MovementComponent.type = 'MovementComponent';

		MovementComponent.prototype = Object.create(Component.prototype);
		MovementComponent.prototype.constructor = MovementComponent;

		/**
		 * Adds velocity to movement. Typically useful for things such as gravity and slingshots.
		 * @param {Vector3} vec3 velocity impulse vector.
		 */
		MovementComponent.prototype.addVelocity = function(vec3) {
			this.velocity.add(vec3);
		};

		/**
		 * Adds velocity to movement. Typically useful for things such as gravity and slingshots.
		 * @param {Vector3} vec3 velocity impulse vector.
		 */

		MovementComponent.prototype.setVelocity = function(vec3) {
			this.velocity.set(vec3);
		};

		/**
		 * Reads the movement velocity vector
		 * @returns {Vector3} velocity vector
		 */

		MovementComponent.prototype.getVelocity = function() {
			return this.velocity;
		};

		/**
		 * Adds rotational velocity to movement. Typically useful for spinning or turning things.
		 * @param {Vector3} vec3 rotational velocity impulse vector.
		 */

		MovementComponent.prototype.addRotationVelocity = function(vec3) {
			this.rotationVelocity.add(vec3);
		};
		/**
		 * Sets rotational velocity of the movement.
		 * @param {Vector3} vec3 rotational velocity vector.
		 */

		MovementComponent.prototype.setRotationVelocity = function(vec3) {
			this.rotationVelocity.set(vec3);
		};

		/**
		 * Read the rotational velocity of movement
		 * @returns {Vector3} the rotational velocity
		 */

		MovementComponent.prototype.getRotationVelocity = function() {
			return this.rotationVelocity;
		};

		return MovementComponent;
	});