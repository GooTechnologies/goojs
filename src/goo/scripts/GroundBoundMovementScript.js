define([
	'goo/math/Vector3'
],
	function(Vector3) {
		"use strict";



		function GroundBoundMovementScript() {
			this.gravity = -0.281;
			this.jumpImpulse = 5.2;
			this.groundContact = 0;
			this.acceleration = new Vector3();
			this.torque = new Vector3();
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

		GroundBoundMovementScript.prototype.getTerrainHeightBeneath = function(entity) {
			return this.getTerrainSystem().getTerrainHeightAt(entity.transformComponent.transform.translation.data);
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

		GroundBoundMovementScript.prototype.applyControlStateToMovement = function(entity) {
			this.acceleration.data[0] = this.controlState.strafe*0.05;
			this.acceleration.data[1] = this.gravity+this.controlState.jump*this.jumpImpulse*this.groundContact;
			this.acceleration.data[2] = this.controlState.run*0.05;
			this.torque.data[1] = this.controlState.turn;

			entity.movementComponent.setVelocity(this.acceleration);
			entity.movementComponent.setRotationVelocity(this.torque);

		};

		GroundBoundMovementScript.prototype.run = function(entity) {

			var groundHeight = this.getTerrainHeightBeneath(entity);
			var transform = entity.transformComponent.transform;
			if (transform.translation.data[1] < groundHeight) {
				this.groundContact = 1;
				transform.translation.data[1] = groundHeight;

			} else {
				this.groundContact = 0;
				this.controlState.jump = 0;

			}

			transform.translation.addv(entity.movementComponent.getVelocity());
		//	var angles = transform.rotation.toAngles();
		//	angles.add(entity.movementComponent.getRotationVelocity());
		//	transform.rotation.fromAngles(angles);
			this.applyControlStateToMovement(entity);
			entity.transformComponent.setUpdated();
		//	console.log("Running Movement:", entity)
		};



		return GroundBoundMovementScript;
});


