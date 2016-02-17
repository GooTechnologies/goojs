define([
	'goo/addons/physicspack/components/AbstractRigidBodyComponent',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/colliders/MeshCollider',
	'goo/addons/physicspack/joints/BallJoint',
	'goo/addons/physicspack/joints/HingeJoint',
	'goo/addons/physicspack/components/ColliderComponent'
], function (
	AbstractRigidBodyComponent,
	Vector3,
	Quaternion,
	Transform,
	BoxCollider,
	SphereCollider,
	CylinderCollider,
	PlaneCollider,
	MeshCollider,
	BallJoint,
	HingeJoint,
	ColliderComponent
) {
	'use strict';

	/* global CANNON */
	var tmpQuat = new Quaternion();
	var tmpCannonVec;
	var tmpCannonVec2;

	/**
	 * Adds rigid body dynamics the entity. To be used with the {@link PhysicsSystem}. If the entity or its children have {@link ColliderComponent}s, they are added as collision shapes to the rigid body.
	 * @param {Object} [settings]
	 * @param {number} [settings.mass=1]
	 * @param {boolean} [settings.isKinematic=false]
	 * @param {Vector3} [settings.velocity]
	 * @param {Vector3} [settings.angularVelocity]
	 * @param {number} [settings.linearDamping=0.01]
	 * @param {number} [settings.angularDamping=0.05]
	 * @extends AbstractRigidBodyComponent
	 */
	function RigidBodyComponent(settings) {
		settings = settings || {};
		AbstractRigidBodyComponent.apply(this, arguments);

		this.type = 'RigidBodyComponent';

		/**
		 * @type {CANNON.Body}
		 */
		this.cannonBody = null;

		/**
		 * If true, the Cannon.js body is re-initialized in the next process().
		 * @private
		 * @type {boolean}
		 */
		this._dirty = true;

		/**
		 * @private
		 * @type {boolean}
		 */
		this._isKinematic = !!settings.isKinematic;

		/**
		 * @private
		 * @type {number}
		 */
		this._mass = settings.mass !== undefined ? settings.mass : 1.0;
		if (this._isKinematic) {
			this._mass = 0;
		} else if (this._mass === 0) {
			this._isKinematic = true;
		}

		/**
		 * @private
		 * @type {boolean}
		 */
		this._initialized = false;

		/**
		 * @private
		 * @type {Vector3}
		 */
		this._velocity = settings.velocity ? settings.velocity.clone() : new Vector3();

		/**
		 * @private
		 * @type {Vector3}
		 */
		this._angularVelocity = settings.angularVelocity ? settings.angularVelocity.clone() : new Vector3();

		/**
		 * @private
		 * @type {number}
		 */
		this._linearDamping = settings.linearDamping !== undefined ? settings.linearDamping : 0.01;

		/**
		 * @private
		 * @type {number}
		 */
		this._angularDamping = settings.angularDamping !== undefined ? settings.angularDamping : 0.05;

		/**
		 * @private
		 * @type {number}
		 */
		this._sleepingThreshold = settings.sleepingThreshold !== undefined ? settings.sleepingThreshold : 0.2;

		/**
		 * @private
		 * @type {number}
		 */
		this._sleepingTimeLimit = settings.sleepingTimeLimit !== undefined ? settings.sleepingTimeLimit : 1;

		if (!tmpCannonVec) {
			tmpCannonVec = new CANNON.Vec3();
			tmpCannonVec2 = new CANNON.Vec3();
		}

		/**
		 * All the attached colliders.
		 * @type {Array}
		 */
		this._colliderEntities = [];

		/**
		 * How smoothing of the rigid body movement should be done. Set it to {@link RigidBodyComponent.NONE} or {@link RigidBodyComponent.INTERPOLATE}.
		 * @type {number}
		 */
		this.interpolation = RigidBodyComponent.INTERPOLATE;

		/**
		 * Constraint the movement of the rigid body. Set it to RigidBodyComponent.FREEZE_NONE, RigidBodyComponent.FREEZE_POSITION_X, RigidBodyComponent.FREEZE_POSITION_Y, RigidBodyComponent.FREEZE_POSITION_Z, RigidBodyComponent.FREEZE_ROTATION_X, RigidBodyComponent.FREEZE_ROTATION_Y, RigidBodyComponent.FREEZE_ROTATION_Z, RigidBodyComponent.FREEZE_POSITION, RigidBodyComponent.FREEZE_ROTATION or RigidBodyComponent.FREEZE_ALL.
		 *
		 * @type {number}
		 */
		this._constraints = RigidBodyComponent.FREEZE_NONE;
	}

	RigidBodyComponent.prototype = Object.create(AbstractRigidBodyComponent.prototype);
	RigidBodyComponent.prototype.constructor = RigidBodyComponent;

	RigidBodyComponent.type = 'RigidBodyComponent';

	/**
	 * No constraints.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_NONE = 0;

	/**
	 * Freeze motion along the X-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_POSITION_X = 1;

	/**
	 * Freeze motion along the Y-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_POSITION_Y = 2;

	/**
	 * Freeze motion along the Z-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_POSITION_Z = 4;

	/**
	 * Freeze rotation along the X-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ROTATION_X = 8;

	/**
	 * Freeze rotation along the Y-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ROTATION_Y = 16;

	/**
	 * Freeze rotation along the Z-axis.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ROTATION_Z = 32;

	/**
	 * Freeze motion along all axes.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_POSITION = RigidBodyComponent.FREEZE_POSITION_X | RigidBodyComponent.FREEZE_POSITION_Y | RigidBodyComponent.FREEZE_POSITION_Z;

	/**
	 * Freeze rotation along all axes.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ROTATION = RigidBodyComponent.FREEZE_ROTATION_X | RigidBodyComponent.FREEZE_ROTATION_Y | RigidBodyComponent.FREEZE_ROTATION_Z;

	/**
	 * Freeze rotation and motion along all axes.
	 * @type {number}
	 */
	RigidBodyComponent.FREEZE_ALL = RigidBodyComponent.FREEZE_POSITION | RigidBodyComponent.FREEZE_ROTATION;

	/**
	 * No rigid body smoothing.
	 */
	RigidBodyComponent.NONE = 1;

	/**
	 * Transform is smoothed based on the Transform of the previous frame.
	 */
	RigidBodyComponent.INTERPOLATE = 2;
	//! SH: Making room for future "EXTRAPOLATE"

	/**
	 * Cannon.js uses ConvexPolyhedron shapes for collision checking sometimes (for example, for cylinders). Therefore it needs a number of segments to use.
	 * @type {number}
	 */
	RigidBodyComponent.numCylinderSegments = 10;

	/**
	 * Get the world transform from the entity and set on the body
	 * @private
	 * @param {Entity} entity
	 */
	RigidBodyComponent.prototype.setTransformFromEntity = function (entity) {
		var transform = entity.transformComponent.worldTransform;
		var body = this.cannonBody;
		body.position.copy(transform.translation);
		body.previousPosition.copy(transform.translation);
		body.interpolatedPosition.copy(transform.translation);
		tmpQuat.fromRotationMatrix(transform.rotation);
		body.quaternion.copy(tmpQuat);
		body.previousQuaternion.copy(tmpQuat);
		body.interpolatedQuaternion.copy(tmpQuat);
	};

	/**
	 * Apply a world-oriented force to a world point.
	 * @param {Vector3} force The force vector, oriented in world space.
	 * @param {Vector3} worldPoint Where to apply the force, in world space.
	 * @example
     * var direction = new Vector3();
     * direction
     *     .copy(entity.transformComponent.worldTransform.translation)
	 *     .sub(bombEntity.transformComponent.worldTransform.translation)
	 *     .normalize()
	 *     .scale(100);
     * entity.applyForceWorld(direction, entity.transformComponent.worldTransform.translation);
	 */
	RigidBodyComponent.prototype.applyForceWorld = function (force, worldPoint) {
		var cannonForce = tmpCannonVec;
		cannonForce.copy(force);

		var cannonPoint = tmpCannonVec2;
		cannonPoint.copy(worldPoint);
		cannonPoint.vsub(this.cannonBody.position, cannonPoint);

		this.cannonBody.applyForce(cannonForce, cannonPoint);
	};

	/**
	 * Apply a local force to the body in local body space.
	 * @param {Vector3} force The force vector, oriented in local space.
	 * @param {Vector3} [relativePoint] Where to apply the force. This point is relative to the Body, oriented in local space. Defaults to the zero vector (the center of mass).
	 * @example
	 * var localThrusterForce = new Vector3(0, 0, 1); // Thrust in forward direction of ship
	 * var localPosition = new Vector3(0, 0, -1); // Applies to the back part of the ship
	 * shapeShip.rigidBodyComponent.applyForce(localThrusterForce, localPosition);
	 */
	RigidBodyComponent.prototype.applyForceLocal = function (force, relativePoint) {
		var cannonForce = tmpCannonVec;
		cannonForce.copy(force);

		var cannonPoint = CANNON.Vec3.ZERO;
		if (relativePoint) {
			cannonPoint = tmpCannonVec2;
			cannonPoint.copy(relativePoint);
		}

		var body = this.cannonBody;

		// Transform the vectors to world space
		body.vectorToWorldFrame(cannonForce, cannonForce);
		body.vectorToWorldFrame(cannonPoint, cannonPoint);

		body.applyForce(cannonForce, cannonPoint);
	};

	/**
	 * Apply a force to a point on the body in world space.
	 * @param {Vector3} force The force vector, oriented in world space.
	 * @param {Vector3} [relativePoint] Where to apply the force. This point is relative to the Body, oriented in World space. Defaults to the zero vector (the center of mass).
	 */
	RigidBodyComponent.prototype.applyForce = function (force, relativePoint) {
		var cannonForce = tmpCannonVec;
		cannonForce.copy(force);

		var cannonPoint = CANNON.Vec3.ZERO;
		if (relativePoint) {
			cannonPoint = tmpCannonVec2;
			cannonPoint.copy(relativePoint);
		}

		this.cannonBody.applyForce(cannonForce, cannonPoint);
	};

	/**
	 * Apply a torque to a point on the body in world space.
	 * @param {Vector3} torque The torque vector, oriented in world space.
	 */
	RigidBodyComponent.prototype.applyTorque = function (torque) {
		tmpCannonVec.copy(torque);
		this.cannonBody.torque.vadd(tmpCannonVec, this.cannonBody.torque);
	};

	/**
	 * Apply a torque to the body in local body space.
	 * @param {Vector3} torque The torque vector, oriented in local body space.
	 */
	RigidBodyComponent.prototype.applyTorqueLocal = function (torque) {
		var cannonTorque = tmpCannonVec;
		cannonTorque.copy(torque);

		// Transform to world space
		this.cannonBody.vectorToWorldFrame(cannonTorque, cannonTorque);
		this.cannonBody.torque.vadd(cannonTorque, this.cannonBody.torque);
	};

	/**
	 * Apply an impulse to the body.
	 * @param {Vector3} impulse The impulse vector, oriented in world space.
	 * @param {Vector3} relativePoint Where the impulse should be applied
	 */
	RigidBodyComponent.prototype.applyImpulse = function (impulse, relativePoint) {
		tmpCannonVec.copy(impulse);
		tmpCannonVec2.copy(relativePoint);
		this.cannonBody.applyImpulse(tmpCannonVec, tmpCannonVec2);
	};

	/**
	 * Apply an impulse to the center of mass of the body.
	 * @param {Vector3} impulse The force vector, oriented in local space.
	 * @param {Vector3} relativePoint
	 */
	RigidBodyComponent.prototype.applyImpulseLocal = function (impulse, relativePoint) {
		tmpCannonVec.copy(impulse);
		tmpCannonVec2.copy(relativePoint);
		this.cannonBody.applyLocalImpulse(tmpCannonVec, tmpCannonVec2);
	};

	/**
	 * @param {Vector3} velocity
	 */
	RigidBodyComponent.prototype.setVelocity = function (velocity) {
		if (this.cannonBody) {
			this.cannonBody.velocity.copy(velocity);
		}
		this._velocity.set(velocity);
	};

	/**
	 * @param {Vector3} targetVector
	 */
	RigidBodyComponent.prototype.getVelocity = function (targetVector) {
		var body = this.cannonBody;
		var velocity = body ? body.velocity : this._velocity;
		targetVector.setDirect(velocity.x, velocity.y, velocity.z);
	};

	/**
	 * @param {Vector3} angularVelocity
	 */
	RigidBodyComponent.prototype.setAngularVelocity = function (angularVelocity) {
		if (this.cannonBody) {
			this.cannonBody.angularVelocity.copy(angularVelocity);
		}
		this._angularVelocity.set(angularVelocity);
	};

	/**
	 * @param {Vector3} targetVector
	 */
	RigidBodyComponent.prototype.getAngularVelocity = function (targetVector) {
		var body = this.cannonBody;
		var angularVelocity = body ? body.angularVelocity : this._angularVelocity;
		targetVector.setDirect(angularVelocity.x, angularVelocity.y, angularVelocity.z);
	};

	/**
	 * @param {Vector3} position
	 */
	RigidBodyComponent.prototype.setPosition = function (position) {
		if (this.cannonBody) {
			this.cannonBody.position.copy(position);
		}
	};

	/**
	 * @param {Vector3} targetVector
	 */
	RigidBodyComponent.prototype.getPosition = function (targetVector) {
		if (this.cannonBody) {
			var position = this.cannonBody.position;
			targetVector.setDirect(position.x, position.y, position.z);
		}
	};

	/**
	 * Get the interpolated position from the rigid body. Use this for rendering. The resulting vector is a linear interpolation between the current and previous physics position, that matches the current rendering frame.
	 * @param {Vector3} targetVector
	 */
	RigidBodyComponent.prototype.getInterpolatedPosition = function (targetVector) {
		if (this.cannonBody) {
			var position = this.cannonBody.interpolatedPosition;
			targetVector.setDirect(position.x, position.y, position.z);
		}
	};

	/**
	 * @param {Quaternion} quaternion
	 */
	RigidBodyComponent.prototype.setQuaternion = function (quaternion) {
		if (this.cannonBody) {
			this.cannonBody.quaternion.copy(quaternion);
		}
	};

	/**
	 * @param {Quaternion} targetQuat
	 */
	RigidBodyComponent.prototype.getQuaternion = function (targetQuat) {
		if (this.cannonBody) {
			var cannonQuaternion = this.cannonBody.quaternion;
			targetQuat.setDirect(
				cannonQuaternion.x,
				cannonQuaternion.y,
				cannonQuaternion.z,
				cannonQuaternion.w
			);
		}
	};

	/**
	 * Get the interpolated quaternion from the rigid body. Use this for rendering. The resulting quaternion is a spherical interpolation between the current and previous physics position, that matches the current rendering frame.
	 * @param {Quaternion} targetQuat
	 */
	RigidBodyComponent.prototype.getInterpolatedQuaternion = function (targetQuat) {
		if (this.cannonBody) {
			var cannonQuaternion = this.cannonBody.interpolatedQuaternion;
			targetQuat.setDirect(
				cannonQuaternion.x,
				cannonQuaternion.y,
				cannonQuaternion.z,
				cannonQuaternion.w
			);
		}
	};

	Object.defineProperties(RigidBodyComponent.prototype, {

		/**
		 * @target-class RigidBodyComponent linearDamping member
		 * @type {number}
		 */
		linearDamping: {
			get: function () {
				return this._linearDamping;
			},
			set: function (value) {
				if (this.cannonBody) {
					this.cannonBody.linearDamping = value;
				}
				this._linearDamping = value;
			}
		},

		/**
		 * @target-class RigidBodyComponent angularDamping member
		 * @type {number}
		 */
		angularDamping: {
			get: function () {
				return this._angularDamping;
			},
			set: function (value) {
				if (this.cannonBody) {
					this.cannonBody.angularDamping = value;
				}
				this._angularDamping = value;
			}
		},

		/**
		 * @target-class RigidBodyComponent isKinematic member
		 * @type {number}
		 */
		isKinematic: {
			get: function () {
				return this._isKinematic;
			},
			set: function (value) {
				this._isKinematic = value;
				if (this.cannonBody) {
					this.cannonBody.type = value ? CANNON.Body.KINEMATIC : CANNON.Body.DYNAMIC;
					this.cannonBody.updateMassProperties();
				}
			}
		},

		/**
		 * @target-class RigidBodyComponent sleepingThreshold member
		 * @type {number}
		 */
		sleepingThreshold: {
			get: function () {
				return this._sleepingThreshold;
			},
			set: function (value) {
				this._sleepingThreshold = value;
				if (this.cannonBody) {
					this.cannonBody.sleepSpeedLimit = value;
				}
			}
		},

		/**
		 * @target-class RigidBodyComponent mass member
		 * @type {number}
		 */
		mass: {
			get: function () {
				return this._mass;
			},
			set: function (value) {
				this._mass = value;
				if (this.cannonBody) {
					this.cannonBody.mass = value;
					this.cannonBody.updateMassProperties();
				}
			}
		},

		/**
		 * @target-class RigidBodyComponent sleepingTimeLimit member
		 * @type {number}
		 */
		sleepingTimeLimit: {
			get: function () {
				return this._sleepingTimeLimit;
			},
			set: function (value) {
				this._sleepingTimeLimit = value;
				if (this.cannonBody) {
					this.cannonBody.sleepTimeLimit = value;
				}
			}
		},

		/**
		 * Constraint the movement of the rigid body. Set it to RigidBodyComponent.FREEZE_NONE, RigidBodyComponent.FREEZE_POSITION_X, RigidBodyComponent.FREEZE_POSITION_Y, RigidBodyComponent.FREEZE_POSITION_Z, RigidBodyComponent.FREEZE_ROTATION_X, RigidBodyComponent.FREEZE_ROTATION_Y, RigidBodyComponent.FREEZE_ROTATION_Z, RigidBodyComponent.FREEZE_POSITION, RigidBodyComponent.FREEZE_ROTATION or RigidBodyComponent.FREEZE_ALL.
		 * @target-class RigidBodyComponent constraints member
		 * @type {number}
		 */
		constraints: {
			get: function () {
				return this._constraints;
			},
			set: function (value) {
				this._constraints = value;
				var body = this.cannonBody;
				if (body) {
					RigidBodyComponent.constraintsToCannonFactors(value, body.linearFactor, body.angularFactor);
				}
			}
		}
	});

	/**
	 * Removes the body from the physics engine
	 */
	RigidBodyComponent.prototype.destroy = function () {
		var body = this.cannonBody;
		if (body) {
			body.world.removeBody(body);
			delete this._system._entities[body.id];
			body.shapes.forEach(function (shape) {
				this._system._shapeIdToColliderEntityMap.delete(shape.id);
			}.bind(this));
			this.cannonBody = null;
		}

		// Remove references to colliders
		for (var i = 0; i < this._colliderEntities.length; i++) {
			this._colliderEntities[i].bodyEntity = null;
		}
		this._colliderEntities.length = 0;
	};

	RigidBodyComponent.constraintsToCannonFactors = function (constraints, linear, angular) {
		linear.set(
			constraints & RigidBodyComponent.FREEZE_POSITION_X ? 0 : 1,
			constraints & RigidBodyComponent.FREEZE_POSITION_Y ? 0 : 1,
			constraints & RigidBodyComponent.FREEZE_POSITION_Z ? 0 : 1
		);
		angular.set(
			constraints & RigidBodyComponent.FREEZE_ROTATION_X ? 0 : 1,
			constraints & RigidBodyComponent.FREEZE_ROTATION_Y ? 0 : 1,
			constraints & RigidBodyComponent.FREEZE_ROTATION_Z ? 0 : 1
		);
	};

	/**
	 * Initialize the Cannon.js body available in the .cannonBody property. This is useful if the intention is to work with the CANNON.Body instance directly after the component is created.
	 */
	RigidBodyComponent.prototype.initialize = function () {
		this.destroy();

		var body = this.cannonBody = new CANNON.Body({
			mass: this._mass,
			linearDamping: this._linearDamping,
			angularDamping: this._angularDamping,
			sleepSpeedLimit: this._sleepingThreshold,
			sleepTimeLimit: this._sleepingTimeLimit
		});
		RigidBodyComponent.constraintsToCannonFactors(this.constraints, body.linearFactor, body.angularFactor);
		this._system.cannonWorld.addBody(body);
		this._system._entities[body.id] = this._entity;

		if (!this._initialized) {
			body.velocity.copy(this._velocity);
			body.angularVelocity.copy(this._angularVelocity);
		}

		this.traverseColliders(this._entity, function (colliderEntity, collider, position, quaternion) {
			this.addCollider(colliderEntity, position, quaternion);
			colliderEntity.colliderComponent.bodyEntity = this._entity;
		});
		if (this._isKinematic) {
			body.type = CANNON.Body.KINEMATIC;
		}
		this.setTransformFromEntity(this._entity);
		body.aabbNeedsUpdate = true;
		this.emitInitialized(this._entity);
	};

	/**
	 * @hidden
	 */
	RigidBodyComponent.prototype.initializeJoint = function (joint) {
		var bodyA = this.cannonBody;
		var bodyB = (joint.connectedEntity.rigidBodyComponent || joint.connectedEntity.colliderComponent).cannonBody;
		var constraint;
		if (joint instanceof BallJoint) {
			// Scale the joint to the world scale
			var scaledPivotA = joint.localPivot.clone();
			scaledPivotA.mul(this._entity.transformComponent.transform.scale);

			var pivotInA = new CANNON.Vec3();
			var pivotInB = new CANNON.Vec3();
			pivotInA.copy(scaledPivotA);

			if (joint.autoConfigureConnectedPivot) {
				// Get the local pivot in bodyB
				bodyA.pointToWorldFrame(pivotInA, pivotInB);
				bodyB.pointToLocalFrame(pivotInB, pivotInB);
			} else {
				var worldScaledPivotB = joint.connectedLocalPivot.clone();
				worldScaledPivotB.mul(joint.connectedEntity.transformComponent.transform.scale);
				pivotInB.copy(worldScaledPivotB);
			}

			constraint = new CANNON.PointToPointConstraint(bodyA, pivotInA, bodyB, pivotInB);
		} else if (joint instanceof HingeJoint) {
			var pivotInA = new CANNON.Vec3();
			var pivotInB = new CANNON.Vec3();
			var axisInA = new CANNON.Vec3();
			var axisInB = new CANNON.Vec3();

			// Scale the joint to the world scale
			var scaledPivotA = joint.localPivot.clone();
			scaledPivotA.mul(this._entity.transformComponent.transform.scale);

			// Copy it to cannon vectors
			pivotInA.copy(scaledPivotA);
			axisInA.copy(joint.localAxis);

			if (joint.autoConfigureConnectedPivot) {
				// Get the local pivot in bodyB
				bodyA.pointToWorldFrame(pivotInA, pivotInB);
				bodyB.pointToLocalFrame(pivotInB, pivotInB);
			} else {
				var worldScaledPivotB = joint.connectedLocalPivot.clone();
				worldScaledPivotB.mul(joint.connectedEntity.transformComponent.transform.scale);
				pivotInB.copy(worldScaledPivotB);
			}

			// The axis remains unscaled
			axisInB.copy(joint.localAxis);

			// Get the local axis in bodyB
			bodyA.vectorToWorldFrame(joint.localAxis, axisInB);
			bodyB.vectorToLocalFrame(axisInB, axisInB);

			constraint = new CANNON.HingeConstraint(bodyA, bodyB, {
				pivotA: pivotInA,
				pivotB: pivotInB,
				axisA: axisInA,
				axisB: axisInB,
				collideConnected: joint.collideConnected
			});
		} else {
			console.warn('Unhandled joint: ', joint);
		}

		if (constraint) {
			bodyA.world.addConstraint(constraint);
			joint.cannonJoint = constraint;
		}
	};

	RigidBodyComponent.copyScaleFromColliderToCannonShape = function (cannonShape, collider) {
		if (collider instanceof SphereCollider) {
			cannonShape.radius = collider.radius;
		} else if (collider instanceof BoxCollider) {
			cannonShape.halfExtents.copy(collider.halfExtents);
			cannonShape.updateConvexPolyhedronRepresentation();
			cannonShape.updateBoundingSphereRadius();
		} else if (collider instanceof MeshCollider) {
			var scale;
			if (!tmpCannonVec) {
				tmpCannonVec = new CANNON.Vec3();
			}
			scale = tmpCannonVec;
			scale.copy(collider.scale);
			cannonShape.setScale(scale);
		}
		cannonShape.updateBoundingSphereRadius();
	};

	/**
	 * @hidden
	 */
	RigidBodyComponent.prototype.destroyJoint = function (joint) {
		var body = this.cannonBody;
		if (body && joint.cannonJoint) {
			body.world.removeConstraint(joint.cannonJoint);
			joint.cannonJoint = null;
		}
	};

	/**
	 * @private
	 */
	RigidBodyComponent.prototype.addCollider = function (entity, position, quaternion) {
		var body = this.cannonBody;
		var colliderComponent = entity.colliderComponent;
		colliderComponent.updateWorldCollider(true);
		var collider = colliderComponent.worldCollider;

		var cannonShape = colliderComponent.cannonShape = ColliderComponent.getCannonShape(collider);

		this._system._shapeIdToColliderEntityMap.set(cannonShape.id, entity);

		// Create a material for the shape
		var mat = new CANNON.Material();
		mat.friction = colliderComponent.material ? colliderComponent.material.friction : -1;
		mat.restitution = colliderComponent.material ? colliderComponent.material.restitution : -1;
		cannonShape.material = mat;

		cannonShape.collisionResponse = !colliderComponent.isTrigger;

		// Add the shape
		var cannonPos = new CANNON.Vec3();
		if (position) {
			cannonPos.copy(position);
		}
		var cannonQuat = new CANNON.Quaternion();
		if (position) {
			cannonQuat.copy(quaternion);
		}
		body.addShape(cannonShape, cannonPos, cannonQuat);

		this._colliderEntities.push(entity);
	};

	/**
	 * Creates a new instance indentical to this component.
	 * @returns RigidBodyComponent
	 */
	RigidBodyComponent.prototype.clone = function () {
		return new RigidBodyComponent({
			isKinematic: this._isKinematic,
			mass: this._mass,
			velocity: this._velocity,
			angularVelocity: this._angularVelocity,
			linearDamping: this._linearDamping,
			angularDamping: this._angularDamping,
			sleepingThreshold: this._sleepingThreshold,
			sleepingTimeLimit: this._sleepingTimeLimit
		});
	};

	/**
	 * @private
	 * @param entity
	 */
	RigidBodyComponent.prototype.attached = function (entity) {
		this._entity = entity;
		this._system = entity._world.getSystem('PhysicsSystem');
	};

	RigidBodyComponent.prototype.api = {};

	return RigidBodyComponent;
});