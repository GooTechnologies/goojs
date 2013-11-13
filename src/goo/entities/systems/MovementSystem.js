define(['goo/entities/systems/System'],
	/** @lends */
		function (System) {
		"use strict";

		/**
		 * @class Processes all entities with movement components,adding movement
		 */
		function MovementSystem() {
			System.call(this, 'MovementSystem', ['MovementComponent']);
		}

		MovementSystem.prototype = Object.create(System.prototype);

		MovementSystem.prototype.applyMovementToEntity = function (dRot, dTrans, entity) {
			entity.transformComponent.transform.translation.add(dTrans);
			var angles = entity.transformComponent.transform.rotation.toAngles();
			angles.add(dRot);
			entity.transformComponent.transform.rotation.fromAngles(angles);
		};

		MovementSystem.prototype.process = function (entities) {
			var i, movementComponent;
			for (i = 0; i < entities.length; i++) {
				movementComponent = entities[i].movementComponent;
				this.applyMovementToEntity(movementComponent.getRotation(), movementComponent.getVelocity(), entities[i]);

				movementComponent._updated = false;
				if (movementComponent._dirty) {
					movementComponent.updateTransform();
				}
			}
		};



		return MovementSystem;
	});