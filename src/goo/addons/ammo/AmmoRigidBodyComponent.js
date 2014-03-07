define([
	'goo/entities/components/Component',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad'
],function(
	Component,
	Quaternion,
	Vector3,
	Transform,
	Box,
	Sphere,
	Quad
){
	"use strict";

	var quaternion = new Quaternion();
	var ptrans = new Ammo.btTransform();
	var pquat = new Ammo.btQuaternion(0,0,0,1);
	var pvec = new Ammo.btVector3();
	var origin = new Ammo.btVector3();

	/**
	 * @class Adds Ammo physics to an entity. Should be combined with one of the AmmoCollider components, such as the @link{AmmoSphereColliderComponent}. Also see {@link AmmoSystem}.
	 * @extends Component
	 * @param {Object}  [settings]
	 * @param {number}  [settings.mass=1]
	 * @param {number}  [settings.motionState='dynamic'] Should be one of 'dynamic', 'static', 'kinematic'
	 * @param {boolean} [settings.drag=0.0]
	 * @param {boolean} [settings.angularDrag=0.05]
	 * @param {boolean} [settings.collisionDetection='discrete']
	 */
	function AmmoRigidbodyComponent(settings){
		this.type = "AmmoRigidbodyComponent";

		settings = settings || {};

		this._initialized = false; // Keep track, so we can add the body next frame
		this.mass = 		typeof settings.mass		!== 'undefined' ? settings.mass : 		1.0;
		this.isTrigger =	typeof settings.isTrigger	!== 'undefined' ? settings.isTrigger : 	false;
		this.ammoTransform = new Ammo.btTransform();
	};

	AmmoRigidbodyComponent.prototype = Object.create(Component.prototype);
	AmmoRigidbodyComponent.constructor = AmmoRigidbodyComponent;

	/**
	 * Set initial position, create shapes etc.. Should be called whenever changed.
	 * @method initialize
	 * @param  {Entity} entity
	 */
	AmmoRigidbodyComponent.prototype.initialize = function(entity) {
		var gooTransform = entity.transformComponent.worldTransform;
		var gooPos = gooTransform.translation;
		var ammoTransform = new Ammo.btTransform();

		ammoTransform.setIdentity();
		ammoTransform.setOrigin(new Ammo.btVector3( gooPos.x, gooPos.y, gooPos.z));

		var q = quaternion;
		q.fromRotationMatrix(gooTransform.rotation);
		ammoTransform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));

		if(this.useWorldBounds) {
			entity._world.process();
			this.shape = this.createAmmoShapefromGooShapeWorldBounds(entity, gooTransform);
			this.difference = this.center.clone().sub( gooTransform.translation).invert();
		} else {
			this.shape = this.createAmmoShape(entity, gooTransform);
		}

		var motionState = new Ammo.btDefaultMotionState( ammoTransform );
		var localInertia = new Ammo.btVector3(0, 0, 0);

		// rigidbody is dynamic if and only if mass is non zero, otherwise static
		if(this.mass !== 0.0) {
			this.shape.calculateLocalInertia( this.mass, localInertia );
		}

		var info = new Ammo.btRigidBodyConstructionInfo(this.mass, motionState, this.shape, localInertia);
		this.body = new Ammo.btRigidBody( info );

		this._initialized = true;
	};

	/**
	 * Recursively check if there's any colliders in this component
	 * @param  {Entity}  				entity
	 * @param  {?TransformComponent}	transformComponent
	 * @return {Boolean}
	 */
	AmmoRigidbodyComponent.prototype.isCompound = function(entity, transformComponent){
		transformComponent = transformComponent || entity.transformComponent;

		var isCompound = false,
			numCollidersOnBaseLevel = 0;

		// The shape is a compound shape if there's any collider in a sub entity
		entity.traverse(function(entity,level){

			if(level == 0){
				numCollidersOnBaseLevel++;
				return;
			}

			if(numCollidersOnBaseLevel > 1){
				isCompound = true;
				return false;
			}

			for(var i=0; i<entity._components.length; i++){
				var comp = entity._components[i];
				if(comp.type == 'AmmoColliderComponent'){
					isCompound = true;
					return false;
				}
			}

		});

		return isCompound;
	};

	AmmoRigidbodyComponent.prototype.createAmmoShape = function(entity, gooTransform) {
		var shape;
		var scale = gooTransform.scale;

		if(this.useWorldBounds){
			// Create a shape depending on the world bounds
			entity.meshDataComponent.computeBoundFromPoints();
			var bound = entity.meshDataComponent.modelBound;
			if (bound instanceof BoundingBox) {
				shape = new Ammo.btBoxShape(new Ammo.btVector3( bound.xExtent*scale.x, bound.yExtent*scale.y, bound.zExtent*scale.z));
			} else if (bound instanceof BoundingSphere) {
				shape = new Ammo.btSphereShape( bound.radius*scale.x);
			}

		} else if( !this.isCompound(entity) ) {
			// If we only have 1 collider without local offset, use the shape directly
			// Find the single collider
			var c = entity._components
			var collider;
			for(var i=0; i<c.length; i++) {
				var child = c[i];
				if(child.type =="AmmoColliderComponent"){
					collider = child;
					break;
				}
			}
			shape = collider.ammoShape;

		} else {
			// There's one or more colliders! Create a compound shape
			shape = new Ammo.btCompoundShape();

			// Needed for getting the Rigidbody-local transform of each collider
			var bodyTransform = entity.transformComponent.worldTransform;
			var invBodyTransform = new Transform();
			invBodyTransform.copy(bodyTransform);
			invBodyTransform.invert(invBodyTransform);

			// Add all sub colliders
			entity.traverse(function(entity,level){

				for(var i=0; i<entity._components.length; i++){
					var comp = entity._components[i];
					if(comp.type == 'AmmoColliderComponent'){
						var childAmmoShape = comp.ammoShape;

						// Get the local transform of the collider, relative to the rigidbody
						var localTrans = new Ammo.btTransform();
						localTrans.setIdentity();
						var gooTrans = new Transform();
						gooTrans.copy(entity.transformComponent.worldTransform);
						Transform.combine(invBodyTransform,gooTrans,gooTrans);
						var gooPos = gooTrans.translation;
						localTrans.setOrigin(new Ammo.btVector3( gooPos.x, gooPos.y, gooPos.z));

						var q = new Quaternion();
						q.fromRotationMatrix(gooTrans.rotation);
						localTrans.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));

						shape.addChildShape(localTrans,childAmmoShape);
					}
				}

			});
		}
		return shape;
	};

	AmmoRigidbodyComponent.prototype.createAmmoShapefromGooShapeWorldBounds = function(entity) {
		var shape;
		var bound = EntityUtils.getTotalBoundingBox( entity);
		this.center = bound.center;
		shape = new Ammo.btBoxShape(new Ammo.btVector3( bound.xExtent, bound.yExtent, bound.zExtent));
		return shape;
	};

	AmmoRigidbodyComponent.prototype.setLinearFactor = function(n0, n1, n2){
		this.body.setLinearFactor(new Ammo.btVector3(n0,n1,n2));
	};

	// rotation
	AmmoRigidbodyComponent.prototype.setAngularFactor = function(n0, n1, n2){
		this.body.setAngularFactor(new Ammo.btVector3(n0,n1,n2));
	};
	AmmoRigidbodyComponent.prototype.setFriction = function(n1){
		this.body.setFriction(n1);
	};
	AmmoRigidbodyComponent.prototype.setSleepingThresholds = function(min, max){
		this.body.setSleepingThresholds(min, max);
	};
	AmmoRigidbodyComponent.prototype.setMass = function(n1){
		this.body.setFriction(n1);
	};
	AmmoRigidbodyComponent.prototype.setRestitution = function(n0){
		this.body.setRestitution(n0);
	}
	AmmoRigidbodyComponent.prototype.setOffsetPosition = function(n0, n1, n2){
		this.offsetPosition.x = n0;
		this.offsetPosition.y = n1;
		this.offsetPosition.z = n2;
	};
	AmmoRigidbodyComponent.prototype.setPosition = function(n0, n1, n2){
		this.body.getMotionState().getWorldTransform(ptrans);
		//ptrans.setIdentity();
		origin = ptrans.getOrigin();
		origin.setX(n0);
		origin.setY(n1);
		origin.setZ(n2);
		ptrans.setOrigin(origin);
		ptrans.setRotation(ptrans.getRotation());
		this.body.setWorldTransform(ptrans);
		var p = this.newPos;
		p.setd(origin.x()+this.offsetPosition.x, origin.y()+this.offsetPosition.y, origin.z()+this.offsetPosition.z);
		this.position.setd(p.x, p.y, p.z);
		this.entity.transformComponent.setUpdated();
	}
	AmmoRigidbodyComponent.prototype.setRotation = function(rot0){
		this.newRot.fromRotationMatrix(rot0);
		this.body.getMotionState().getWorldTransform(ptrans);
		//ptrans.setIdentity();
		ptrans.setOrigin(this.body.getWorldTransform().getOrigin());
		pquat = ptrans.getRotation();
		pquat.setValue(this.newRot.x, this.newRot.y, this.newRot.z, this.newRot.w);
		ptrans.setRotation(pquat);
		this.body.setWorldTransform(ptrans);
		this.entity.transformComponent.transform.rotation.copyQuaternion(this.newRot);
		this.entity.transformComponent.setUpdated();
	}
	AmmoRigidbodyComponent.prototype.setLinearVelocity = function(v1){
		pvec.setValue(v1.x, v1.y, v1.z);
		this.body.setLinearVelocity(pvec);
	};
	AmmoRigidbodyComponent.prototype.getLinearVelocity = function(){
		return this.body.getLinearVelocity();
	};
	AmmoRigidbodyComponent.prototype.applyCentralImpulse = function(n0, n1, n2){
		pvec.setValue(n0, n1, n2);
		this.body.applyCentralImpulse(pvec);
	};
	AmmoRigidbodyComponent.prototype.applyCentralForce = function(n0, n1, n2){
		pvec.setValue(n0, n1, n2);
		this.body.applyCentralForce(pvec);
	};
	AmmoRigidbodyComponent.prototype.removeFromWorld = function(){
		Game.ammoWorld.removeRigidBody(this.body);
	};
	AmmoRigidbodyComponent.prototype.addToWorld = function(){
		Game.ammoWorld.addRigidBody(this.body);
	};

	AmmoRigidbodyComponent.prototype.copyPhysicalTransformToVisual = function(entity) {
		var tc = entity.transformComponent;
		if ( ! this.body ) {
			return;
		}
		this.body.getMotionState().getWorldTransform(this.ammoTransform);
		var ammoQuat = this.ammoTransform.getRotation();
		quaternion.setd(ammoQuat.x(), ammoQuat.y(), ammoQuat.z(), ammoQuat.w());
		tc.transform.rotation.copyQuaternion(quaternion);
		var origin = this.ammoTransform.getOrigin();
		tc.setTranslation(origin.x(), origin.y(), origin.z());
	};

	return AmmoRigidbodyComponent;
});
