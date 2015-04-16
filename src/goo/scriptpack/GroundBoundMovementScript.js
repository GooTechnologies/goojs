define([
	'goo/math/Vector3'
], function (
	Vector3
) {
	'use strict';

	var calcVec = new Vector3();
	var _defaults = {
		gravity: -9.81,
		worldFloor: -Infinity,
		jumpImpulse: 95,
		accLerp: 0.1,
		rotLerp: 0.1,
		modForward: 1,
		modStrafe: 0.7,
		modBack: 0.4,
		modTurn: 0.3
	};

	/**
	 * A script for handling basic movement and jumping over a terrain.
	 * The standard usage of this script will likely also need some input listener and camera handling.
	 */
	function GroundBoundMovementScript(properties) {
		properties = properties || {};
		for (var key in _defaults) {
			if (typeof _defaults[key] === 'boolean') {
				this[key] = properties[key] !== undefined ? properties[key] === true : _defaults[key];
			} else if (!isNaN(_defaults[key])) {
				this[key] = !isNaN(properties[key]) ? properties[key] : _defaults[key];
			} else if (_defaults[key] instanceof Vector3) {
				this[key] = (properties[key]) ? new Vector3(properties[key]) : new Vector3().set(_defaults[key]);
			} else {
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
			run: 0,
			strafe: 0,
			jump: 0,
			yaw: 0,
			roll: 0,
			pitch: 0
		};
	}

	/**
	 * Sets the terrain script. This class requires that the terrain system can provide
	 * height and normal for a given position when applicable. Without a terrain system the
	 * script will fallback to the worldFloor height. (Defaults to -Infinity).
	 * @param {WorldFittedTerrainScript} terrainScript
	 */
	GroundBoundMovementScript.prototype.setTerrainSystem = function (terrainScript) {
		this.terrainScript = terrainScript;
	};


	/**
	 * Returns the terrain system.
	 * @returns {WorldFittedTerrainScript} terrainScript
	 */
	GroundBoundMovementScript.prototype.getTerrainSystem = function () {
		return this.terrainScript;
	};


	/**
	 * Get the terrain height for a given translation. Or if no terrain is present
	 * return the world floor height.
	 * @private
	 * @param {Vector3} translation
	 * @returns {Number} Height of ground
	 */
	GroundBoundMovementScript.prototype.getTerrainHeight = function (translation) {
		var height = this.getTerrainSystem().getTerrainHeightAt(translation.data);
		if (height === null) {
			height = this.worldFloor;
		}
		return height;
	};

	/**
	 * Get the ground normal for a given translation.
	 * @private
	 * @param {Vector3} translation
	 * @returns {Vector3} The terrain normal vector.
	 */
	GroundBoundMovementScript.prototype.getTerrainNormal = function (translation) {
		return this.getTerrainSystem().getTerrainNormalAt(translation.data);
	};

	/**
	 * Request script to move along its forward axis. Becomes
	 * backwards with negative amount.
	 * @param {number} amount
	 */
	GroundBoundMovementScript.prototype.applyForward = function (amount) {
		this.controlState.run = amount;
	};

	/**
	 * Applies strafe amount for sideways input.
	 * @param {number} amount
	 */
	GroundBoundMovementScript.prototype.applyStrafe = function (amount) {
		this.controlState.strafe = amount;
	};

	/**
	 * Applies jump input.
	 * @param {number} amount
	 */
	GroundBoundMovementScript.prototype.applyJump = function (amount) {
		this.controlState.jump = amount;
	};

	/**
	 * Applies turn input for rotation around the y-axis.
	 * @param {number} amount
	 */

	GroundBoundMovementScript.prototype.applyTurn = function (amount) {
		this.controlState.yaw = amount;
	};

	/**
	 * Called when movement state is updated if requirements for jumping are met.
	 * @private
	 * @param [number} up
	 * @returns {*}
	 */
	GroundBoundMovementScript.prototype.applyJumpImpulse = function (up) {
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


	/**
	 * Modulates the movement state with given circumstances and input
	 * @private
	 * @param {number} strafe
	 * @param {number} up
	 * @param {number} run
	 * @returns {Array} The modulated directional movement state
	 */
	GroundBoundMovementScript.prototype.applyDirectionalModulation = function (strafe, up, run) {
		strafe *= this.modStrafe;
		if (run > 0) {
			run *= this.modForward;
		} else {
			run *= this.modBack;
		}
		this.targetVelocity.set(strafe, this.applyJumpImpulse(up), run); // REVIEW: this creates a new object every frame... I recommend to reuse a Vector3 object.
	};

	/**
	 * Modulates the rotational movement state.
	 * @private
	 * @param {number} pitch
	 * @param {number} yaw
	 * @param {number} roll
	 * @returns {Array}
	 */
	GroundBoundMovementScript.prototype.applyTorqueModulation = function (pitch, yaw, roll) {
		this.targetHeading.set(pitch, yaw * this.modTurn, roll); // REVIEW: this creates a new object every frame... I recommend to reuse a Vector3 object.
	};

	/**
	 * Applies the angle of the ground to the directional target velocity. This is to
	 * prevent increase of absolute velocity when moving up or down sloping terrain.
	 * @private
	 */

	GroundBoundMovementScript.prototype.applyGroundNormalInfluence = function () {
		var groundModX = Math.abs(Math.cos(this.groundNormal.x));
		var groundModZ = Math.abs(Math.cos(this.groundNormal.z));
		this.targetVelocity.x *= groundModX;
		this.targetVelocity.z *= groundModZ;
	};


	/**
	 * Updates the movement vectors for this frame
	 * @private
	 * @param {Vector3} transform
	 */
	GroundBoundMovementScript.prototype.updateTargetVectors = function (transform) {
		this.applyDirectionalModulation(this.controlState.strafe, this.gravity, this.controlState.run);
		transform.rotation.applyPost(this.targetVelocity);
		this.applyGroundNormalInfluence();
		this.applyTorqueModulation(this.controlState.pitch, this.controlState.yaw, this.controlState.roll);
	};

	/**
	 * Computes the acceleration for the frame.
	 * @private
	 * @param {Entity} entity
	 * @param {Vector3} current
	 * @param {Vector3} target
	 * @returns {Vector3}
	 */
	GroundBoundMovementScript.prototype.computeAcceleration = function (entity, current, target) {
		calcVec.set(target);
		entity.transformComponent.transform.rotation.applyPost(calcVec);
		calcVec.sub(current);
		calcVec.lerp(target, this.accLerp);
		calcVec.y = target.y; // Ground is not soft...
		return calcVec;
	};


	/**
	 * Computes the torque for the frame.
	 * @private
	 * @param {Vector3} current
	 * @param {Vector3} target
	 * @returns {Vector3}
	 */
	GroundBoundMovementScript.prototype.computeTorque = function (current, target) {
		calcVec.set(target);
		calcVec.sub(current);
		calcVec.lerp(target, this.rotLerp);
		return calcVec;
	};

	/**
	 * Updates the velocity vectors for the frame.
	 * @private
	 * @param {Entity} entity
	 */
	GroundBoundMovementScript.prototype.updateVelocities = function (entity) {
		var currentVelocity = entity.movementComponent.getVelocity();
		var currentRotVel = entity.movementComponent.getRotationVelocity();
		this.acceleration.set(this.computeAcceleration(entity, currentVelocity, this.targetVelocity));
		this.torque.set(this.computeTorque(currentRotVel, this.targetHeading));
	};

	/**
	 * Applies the acceleration to the movement component of the entity
	 * @private
	 * @param {Entity} entity
	 */
	GroundBoundMovementScript.prototype.applyAccelerations = function (entity) {
		entity.movementComponent.addVelocity(this.acceleration);
		entity.movementComponent.addRotationVelocity(this.torque);
	};

	/**
	 * Updates the value of the ground normal
	 * @private
	 * @param {Transform} transform
	 */
	GroundBoundMovementScript.prototype.updateGroundNormal = function (transform) {
		this.groundNormal.set(this.getTerrainNormal(transform.translation));
	};

	/**
	 * Checks if the criteria of ground contact is relevant this frame.
	 * @private
	 * @param {Entity} entity
	 * @param {Transform} transform
	 */
	GroundBoundMovementScript.prototype.checkGroundContact = function (entity, transform) {
		this.groundHeight = this.getTerrainHeight(transform.translation);
		if (transform.translation.y <= this.groundHeight) {
			this.groundContact = 1;
			this.updateGroundNormal(transform);
		} else {
			this.groundContact = 0;
		}
	};

	/**
	 * Applies the rules of ground contact
	 * @private
	 * @param {Entity} entity
	 * @param {Transform} transform
	 */
	GroundBoundMovementScript.prototype.applyGroundContact = function (entity, transform) {
		if (this.groundHeight >= transform.translation.y) {
			transform.translation.y = this.groundHeight;
			if (entity.movementComponent.velocity.y < 0) {
				entity.movementComponent.velocity.y = 0;
			}
		}
	};

	/**
	 * Updates this script with a frame
	 * @private
	 * @param {Entity} entity
	 */
	GroundBoundMovementScript.prototype.run = function (entity) {
		var transform = entity.transformComponent.transform;
		this.checkGroundContact(entity, transform);
		this.updateTargetVectors(transform);
		this.updateVelocities(entity);
		this.applyAccelerations(entity);
		this.applyGroundContact(entity, transform);
	};

	return GroundBoundMovementScript;
});


