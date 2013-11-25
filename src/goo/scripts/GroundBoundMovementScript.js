define([
	'goo/math/Vector3'
],
	function(Vector3
		) {
		"use strict";

		var calcVec = new Vector3();
		var _defaults = {
			gravity:-9.81,
			worldFloor:-Infinity,
			jumpImpulse:95,
			accLerp:0.1,
			rotLerp:0.1,
			modForward:1,
			modStrafe:0.7,
			modBack:0.4,
			modTurn:0.3
		};

		/**
		 * @class a script for handling movement and jumping over a terrain
		 *
		 * @constructor
		 */

		function GroundBoundMovementScript(properties) {

			properties = properties || {};
			for(var key in _defaults) {
				if(typeof(_defaults[key]) === 'boolean') {
					this[key] = properties[key] !== undefined ? properties[key] === true : _defaults[key];
				}
				else if (!isNaN(_defaults[key])) {
					this[key] = !isNaN(properties[key]) ? properties[key] : _defaults[key];
				}
				else if(_defaults[key] instanceof Vector3) {
					this[key] = (properties[key]) ? new Vector3(properties[key]) : new Vector3().set(_defaults[key]);
				}
				else {
					this[key] = properties[key] || _defaults[key];
				}
			}

			this.groundContact = 1;
			this.targetVelocity = new Vector3();
			this.targetHeading = new Vector3();
			this.acceleration = new Vector3();
			this.torque = new Vector3();
			this.groundHeight = 0;
			this.groundNormal = new Vector3();
			this.controlState = {
				run:0,
				strafe:0,
				jump:0,
				yaw:0,
				roll:0,
				pitch:0
			};
		}

		/**
		 *
		 * @param terrainSystem
		 */
		GroundBoundMovementScript.prototype.setTerrainSystem = function(terrainSystem) {
			this.terrainSystem = terrainSystem;
		};

		GroundBoundMovementScript.prototype.getTerrainSystem = function() {
			return this.terrainSystem;
		};

		GroundBoundMovementScript.prototype.getTerrainHeight = function(translation) {
			var height = this.getTerrainSystem().getTerrainHeightAt(translation.data);
			if (height === null) {
				height = this.worldFloor;
			}
			return height;
		};

		GroundBoundMovementScript.prototype.getTerrainNormal = function(translation) {
			return this.getTerrainSystem().getTerrainNormalAt(translation.data);
		};


		GroundBoundMovementScript.prototype.applyForward = function(amount) {
			this.controlState.run = amount;
		};

		GroundBoundMovementScript.prototype.applyStrafe = function(amount) {
			this.controlState.strafe = amount;
		};

		GroundBoundMovementScript.prototype.applyJump = function(amount) {
			this.controlState.jump = amount;
		};

		GroundBoundMovementScript.prototype.applyTurn = function(amount) {
			this.controlState.yaw = amount;
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
			return [pitch, yaw*this.modTurn, roll];
		};

		GroundBoundMovementScript.prototype.applyGroundNormalInfluence = function() {
			var groundModX = Math.abs(Math.cos(this.groundNormal.data[0]));
			var groundModZ = Math.abs(Math.cos(this.groundNormal.data[2]));
			this.targetVelocity.data[0] *= groundModX;
			this.targetVelocity.data[2] *= groundModZ;
		};

		GroundBoundMovementScript.prototype.updateTargetVectors = function(transform) {
			this.targetVelocity.set(this.applyDirectionalModulation(this.controlState.strafe, this.gravity, this.controlState.run));
			transform.rotation.applyPost(this.targetVelocity);
			this.applyGroundNormalInfluence();
			this.targetHeading.set(this.applyTorqueModulation(this.controlState.pitch, this.controlState.yaw, this.controlState.roll));
		};

		GroundBoundMovementScript.prototype.computeAcceleration = function(entity, current, target) {
			calcVec.set(target);
			entity.transformComponent.transform.rotation.applyPost(calcVec);
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
			this.acceleration.set(this.computeAcceleration(entity, currentVelocity, this.targetVelocity));
			this.torque.set(this.computeTorque(currentRotVel, this.targetHeading));
		};

		GroundBoundMovementScript.prototype.applyAccelerations = function(entity) {
			entity.movementComponent.addVelocity(this.acceleration);
			entity.movementComponent.addRotationVelocity(this.torque);
		};

		GroundBoundMovementScript.prototype.updateGroundNormal = function(transform) {
			this.groundNormal.set(this.getTerrainNormal(transform.translation));
		};

		GroundBoundMovementScript.prototype.checkGroundContact = function(entity, transform) {
			this.groundHeight = this.getTerrainHeight(transform.translation);
			if (transform.translation.data[1] <= this.groundHeight) {
				this.groundContact = 1;
				this.updateGroundNormal(transform);
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
			this.updateTargetVectors(transform);
			this.updateVelocities(entity);
			this.applyAccelerations(entity);
			this.applyGroundContact(entity, transform);
		};



		return GroundBoundMovementScript;
});


