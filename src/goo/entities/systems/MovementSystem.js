define(['goo/entities/systems/System'],

		function (System) {
		'use strict';

		/**
		 * Processes all entities with movement components.
		 * This system applies movement vectors for translation and rotation
		 * to the transform of the entity which has it every frame.
		 * @extends System
		 */
		function MovementSystem() {
			System.call(this, 'MovementSystem', ['MovementComponent']);
		}

		MovementSystem.prototype = Object.create(System.prototype);
		MovementSystem.prototype.constructor = MovementSystem;

		MovementSystem.prototype.addVelocityToTransform = function (vel, transform, tpf) {
			transform.translation.addDirect(vel.x * tpf, vel.y * tpf, vel.z * tpf);
		};

		MovementSystem.prototype.addRotToTransform = function (rotVel, transform, tpf) {
			transform.rotation.rotateX(rotVel.x * tpf);
			transform.rotation.rotateY(rotVel.y * tpf);
			transform.rotation.rotateZ(rotVel.z * tpf);
		};

		MovementSystem.prototype.applyMovementToEntity = function (entity) {
			var tpf = entity._world.tpf;
			var rotVel = entity.movementComponent.getRotationVelocity();
			var velocity = entity.movementComponent.getVelocity();
			var transform = entity.transformComponent.transform;
			this.addVelocityToTransform(velocity, transform, tpf);
			this.addRotToTransform(rotVel, transform, tpf);
			entity.transformComponent.setUpdated();
		};

		MovementSystem.prototype.process = function (entities) {
			var i, movementComponent;
			for (i = 0; i < entities.length; i++) {
				movementComponent = entities[i].movementComponent;
				this.applyMovementToEntity(entities[i]);
			}
		};

		return MovementSystem;
	});