define([
	'goo/math/Vector3'
],
	function(Vector3
		) {
		"use strict";

		var calcVec = new Vector3();

		function GroundBoundMovementScript() {
			this.gravity = -9.81;
			this.worldFloor = -99999999;
			this.jumpImpulse = 95;
			this.accLerp = 0.1;
			this.rotLerp = 0.1;
			this.modForward = 1;
			this.modStrafe = 0.7;
			this.modBack = 0.4;
			this.modTurn = 0.3;

			this.groundContact = 1;
			this.targetVelocity = new Vector3();
			this.targetHeading = new Vector3();
			this.acceleration = new Vector3();
			this.torque = new Vector3();
			this.groundHeight = 0;
			this.controlState = {
				run:0,
				strafe:0,
				jump:0,
				turn:0
			};
		}

		GroundBoundMovementScript.prototype.setTerrainSystem = function(terrainSystem) {
			this.terrainSystem = terrainSystem;
		};

		GroundBoundMovementScript.prototype.getTerrainSystem = function() {
			return this.terrainSystem;
		};

		GroundBoundMovementScript.prototype.getTerrainHeight = function(entity) {
			var height = this.getTerrainSystem().getTerrainHeightAt(entity.transformComponent.transform.translation.data);
			if (height === null) {
				height = this.worldFloor;
			}
			return height;
		};

		GroundBoundMovementScript.prototype.applyForward = function(amount) {
			this.controlState.run = amount;
		};

		GroundBoundMovementScript.prototype.applyStrafe = function(amount) {
			this.controlState.strafe = amount;
		};

		GroundBoundMovementScript.prototype.applyJump = function(amount) {
			this.controlState.jump = amount;
			console.log("jump", amount);
		};

		GroundBoundMovementScript.prototype.applyTurn = function(amount) {
			this.controlState.turn = amount;
		};

		GroundBoundMovementScript.prototype.applyJumpImpulse = function(up) {
			if (this.groundContact) {
				if (this.controlState.jump) {
					up = this.jumpImpulse;
					this.controlState.jump = 0;
				} else {
					up = 0;
				}
			}
			return up;
		};

		GroundBoundMovementScript.prototype.applyDirectionalModulation = function(strafe, up, run) {
			strafe *= this.modStrafe;
			if (run > 0) {
				run *=this.modForward;
			} else {
				run *=this.modBack;
			}
			return [strafe, this.applyJumpImpulse(up), run];
		};

		GroundBoundMovementScript.prototype.applyTorqueModulation = function(pitch, yaw, roll) {
			yaw *= this.modTurn;
			return [pitch, yaw, roll];
		};

		GroundBoundMovementScript.prototype.updateTargetVectors = function() {
			this.targetVelocity.set(this.applyDirectionalModulation(this.controlState.strafe, this.gravity, this.controlState.run));
			this.targetHeading.set(this.applyTorqueModulation(0, this.controlState.turn, 0));
		};

		GroundBoundMovementScript.prototype.computeAcceleration = function(current, target) {
			calcVec.set(target);
			calcVec.sub(current);
			calcVec.lerp(target, this.accLerp);
			calcVec.data[1] = target.data[1]; // Ground is not soft...
			return calcVec;
		};

		GroundBoundMovementScript.prototype.computeTorque = function(current, target) {
			calcVec.set(target);
			calcVec.sub(current);
			calcVec.lerp(target, this.rotLerp);
			return calcVec;
		};

		GroundBoundMovementScript.prototype.updateVelocities = function(entity) {
			var currentVelocity = entity.movementComponent.getVelocity();
			var currentRotVel = entity.movementComponent.getRotationVelocity();
			this.acceleration.set(this.computeAcceleration(currentVelocity, this.targetVelocity));
			this.torque.set(this.computeTorque(currentRotVel, this.targetHeading));
		};

		GroundBoundMovementScript.prototype.applyAccelerations = function(entity) {
			entity.movementComponent.addVelocity(this.acceleration);
			entity.movementComponent.addRotationVelocity(this.torque);
		};

		GroundBoundMovementScript.prototype.checkGroundContact = function(entity, transform) {
			this.groundHeight = this.getTerrainHeight(entity);
			if (transform.translation.data[1] <= this.groundHeight) {
				this.groundContact = 1;
			} else {
				this.groundContact = 0;
			}
		};

		GroundBoundMovementScript.prototype.applyGroundContact = function(entity, transform) {
			if (this.groundHeight >= transform.translation.data[1]) {
				transform.translation.data[1] = this.groundHeight;
				if (entity.movementComponent.velocity.data[1] < 0) {
					entity.movementComponent.velocity.data[1] = 0;
				}
			}
		};

		GroundBoundMovementScript.prototype.run = function(entity) {
			var transform = entity.transformComponent.transform;
			this.checkGroundContact(entity, transform);
			this.updateTargetVectors();
			this.updateVelocities(entity);
			this.applyAccelerations(entity);
			this.applyGroundContact(entity, transform);
		};



		return GroundBoundMovementScript;
});


