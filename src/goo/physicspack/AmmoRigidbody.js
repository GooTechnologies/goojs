define([
	'goo/physicspack/Rigidbody',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/Transform',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'goo/physicspack/colliders/TerrainCollider'
],
/** @lends */
function (
	Rigidbody,
	Vector3,
	Quaternion,
	Transform,
	BoxCollider,
	SphereCollider,
	CylinderCollider,
	PlaneCollider,
	TerrainCollider
) {
	'use strict';

	/* global Ammo */

	function AmmoRigidbody(ammoWorld, settings) {
		settings = settings || {};
		Rigidbody.call(this, settings);

		/**
		 * The Ammo.btRigidbody instance. Will be created on .initialize()
		 */
		this.ammoBody = null;
	}

	AmmoRigidbody.prototype = Object.create(Rigidbody.prototype);
	AmmoRigidbody.constructor = AmmoRigidbody;

	var tmpQuat = new Quaternion();

	// Get the world transform from the entity and set on the body
	AmmoRigidbody.prototype.setTransformFromEntity = function (entity) {
		// var t = entity.transformComponent.transform;
		// var body = this.ammoBody;
		// body.setPosition.copy(t.translation);
		// var q = tmpQuat;
		// q.fromRotationMatrix(t.rotation);
		// body.quaternion.copy(q);

		var gooPos = entity.transformComponent.transform.translation;
		var ammoTransform = new Ammo.btTransform();
		ammoTransform.setIdentity();
		ammoTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
		var gooQuaternion = new Quaternion();
		gooQuaternion.fromRotationMatrix(entity.transformComponent.transform.rotation);
		var q = gooQuaternion;
		ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
		this.ammoBody.setWorldTransform(this.ammoTransform);
	};

	AmmoRigidbody.prototype.setForce = function (force) {
		this.cannonBody.force.copy(force);
	};

	AmmoRigidbody.prototype.setVelocity = function (velocity) {
		this.cannonBody.velocity.copy(velocity);
	};

	AmmoRigidbody.prototype.setPosition = function (pos) {
		this.cannonBody.position.copy(pos);
	};

	AmmoRigidbody.prototype.getPosition = function (targetVector) {
		var ammoTransform = new Ammo.btTransform();
		var p = this.ammoBody.getWorldTransform(ammoTransform);
		targetVector.setDirect(p.getOrigin().getX(), p.getOrigin().getY(), p.getOrigin().getZ());
	};

	AmmoRigidbody.prototype.setQuaternion = function (pos) {
		//this.cannonBody.quaternion.copy(pos);
		//
	};

	AmmoRigidbody.prototype.getQuaternion = function (targetQuat) {
		var ammoTransform = new Ammo.btTransform();
		var p = this.ammoBody.getWorldTransform(ammoTransform);

		var q = new Ammo.btQuaternion();
		ammoTransform.getRotation(q);
		targetQuat.setDirect(q.getX(), q.getY(), q.getZ(), q.getW());
	};

	AmmoRigidbody.prototype.setAngularVelocity = function (angularVelocity) {
		this.cannonBody.angularVelocity.copy(angularVelocity);
	};

	AmmoRigidbody.prototype.initialize = function (entity, world) {
		var gooTransform = entity.transformComponent.worldTransform;
		var gooPos = gooTransform.translation;
		var gooRot = gooTransform.rotation;

		var ammoTransform = new Ammo.btTransform();
		ammoTransform.setIdentity();
		ammoTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
		var q = tmpQuat;
		q.fromRotationMatrix(gooRot);
		ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));

		var shape = this.constructAmmoShape(entity);

		var motionState = new Ammo.btDefaultMotionState(ammoTransform);
		var localInertia = new Ammo.btVector3(0, 0, 0);

		// rigidbody is dynamic if and only if mass is non zero, otherwise static
		if (this.mass !== 0.0) {
			shape.calculateLocalInertia(this.mass, localInertia);
		}

		var info = new Ammo.btRigidBodyConstructionInfo(this.mass, motionState, shape, localInertia);
		this.localInertia = localInertia;
		this.ammoBody = new Ammo.btRigidBody(info);
		world.world.addRigidBody(this.ammoBody);
		//this.body.setLinearFactor(this.linearFactor);

		// if (this.onInitializeBody) {
		// 	this.onInitializeBody(this.body);
		// }
	};

	AmmoRigidbody.prototype.constructAmmoShape = function (entity) {
		this.traverseColliders(entity, function (colliderEntity, collider, localPosition, localQuaternion){

		});
		return new Ammo.btSphereShape(1);
	};

	AmmoRigidbody.prototype.getShape = function (collider) {
		var shape;
		if (collider instanceof BoxCollider) {
			var halfExtents = new CANNON.Vec3();
			halfExtents.copy(collider.halfExtents);
			shape = new CANNON.Box(halfExtents);
		} else if (collider instanceof SphereCollider) {
			shape = new CANNON.Sphere(collider.radius);
		} else if (collider instanceof PlaneCollider) {
			shape = new CANNON.Plane();
		} else if (collider instanceof CylinderCollider) {
			shape = new CANNON.Cylinder(
				collider.radiusTop,
				collider.radiusBottom,
				collider.height,
				collider.numSegments
			);
		} else if (collider instanceof TerrainCollider) {
			shape = new CANNON.Heightfield(collider.data);
		}
		return shape;
	};

	AmmoRigidbody.prototype.addCollider = function (collider, position, quaternion) {
		var body = this.cannonBody;

		// collider.cannonShape = this.getShape(collider);

		// if (collider.isTrigger) {
		// 	collider.cannonShape.collisionResponse = false;
		// }

		// // Add the shape
		// var cannonPos = new CANNON.Vec3();
		// if (position) {
		// 	cannonPos.copy(position);
		// }
		// var cannonQuat = new CANNON.Quaternion();
		// if (position) {
		// 	cannonQuat.copy(quaternion);
		// }
		// body.addShape(collider.cannonShape, cannonPos, cannonQuat);
	};

	return AmmoRigidbody;
});