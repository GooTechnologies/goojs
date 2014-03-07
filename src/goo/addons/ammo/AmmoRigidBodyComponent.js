define([
	'goo/entities/components/Component',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad'
],function(
	Component,
	Quaternion,
	Vector3,
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
		/*
		var pos = entity.transformComponent.transform.translation,
		    rot = entity.transformComponent.transform.rotation;

		quaternion.fromRotationMatrix(rot);

		var aquat = new Ammo.btQuaternion(quaternion.x,quaternion.y,quaternion.z,quaternion.w),
		    apos = new Ammo.btVector3(this.position.x,this.position.y,this.position.z);

		var trans = new Ammo.btTransform(aquat, apos);
		var localInertia = new Ammo.btVector3(0,0,0);

		entity.colliderComponent.ammoShape.calculateLocalInertia(mass, localInertia);
		var motionState = new Ammo.btDefaultMotionState(trans);

		this.rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, entity.colliderComponent.ammoShape, localInertia );
		this.body = new Ammo.btRigidBody(this.rbInfo);
		*/
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

		// Possible to make sensors in Bullet?
		//if(false == this.isTrigger){
		//}

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

		console.log("traversing!")

		// TODO:
		entity.traverse(function(entity){
			console.log(entity)
		});

		var result = false;

		// Check if we have any colliders as children
		for(var i=0; i<transformComponent.children.length; ++i){
			var child = transformComponent.children[i];

			if(child.type == "AmmoColliderComponent"){
				return true;
			}

			if(this.isCompound(entity,child)){
				return true;
			}
		}

		return false;
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
			// There's one or more colliders! Create a compound
			shape = new Ammo.btCompoundShape();
			var c = entity.transformComponent.children;
			for(var i=0; i<c.length; i++) {
				var childAmmoShape = this.getAmmoShapefromGooShape( c[i].entity );
				var localTrans = new Ammo.btTransform();
				localTrans.setIdentity();
				var gooPos = c[i].transform.translation;
				localTrans.setOrigin(new Ammo.btVector3( gooPos.x, gooPos.y, gooPos.z));
				// TODO: also setRotation ?
				shape.addChildShape(localTrans,childAmmoShape);
			}

		}
		return shape;
	};

	// Recursively add physics shapes to the ammo compound shape
	AmmoRigidbodyComponent.prototype.addAmmoCompoundChildren = function(ammoCompoundShape, parentWorldTransform, obj){
		if(obj instanceof TransformComponent){
			for(var i=0; i<obj.children.length; i++){
				var comp = obj.children[i];
				this.addAmmoCompoundChildren(ammoCompoundShape, obj.transform, comp);
			}

		} else if(obj instanceof Entity){
			for(var i=0; i<obj._components.length; i++){
				var comp = obj._components[i];
				this.addAmmoCompoundChildren(ammoCompoundShape, parentWorldTransform, comp);
			}

		} else if(obj instanceof Component && obj.type == "AmmoColliderComponent"){

			// Construct local transform
			var localTrans = new Ammo.btTransform();
			localTrans.setIdentity();
			var gooPos = parentWorldTransform.transform.translation;
			localTrans.setOrigin(new Ammo.btVector3( gooPos.x, gooPos.y, gooPos.z));
			// TODO: also setRotation ?

			ammoCompoundShape.addChildShape(localTrans,obj.ammoShape);
		}
	}

	AmmoRigidbodyComponent.prototype.createAmmoShapefromGooShapeWorldBounds = function(entity) {
		var shape;
		var bound = EntityUtils.getTotalBoundingBox( entity);
		this.center = bound.center;
		shape = new Ammo.btBoxShape(new Ammo.btVector3( bound.xExtent, bound.yExtent, bound.zExtent));
		//shape = new Ammo.btBoxShape(new Ammo.btVector3( bound.xExtent*scale, bound.yExtent*scale, bound.zExtent*scale));
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

	AmmoRigidbodyComponent.prototype._ammoUpdate = function(){
		this.body.getMotionState().getWorldTransform(ptrans);
		origin = ptrans.getOrigin();
		pquat = ptrans.getRotation();

		this.newPos.setd(origin.x()+this.offsetPosition.x, origin.y()+this.offsetPosition.y, origin.z()+this.offsetPosition.z);
		this.newRot.setd(pquat.x(), pquat.y(), pquat.z(), pquat.w());
		this.position.setd(
			this.newPos.x,
			this.newPos.y,
			this.newPos.z
			);
		quaternion.setd(
			this.newRot.x,
			this.newRot.y,
			this.newRot.z,
			this.newRot.w
			);
		//var tc = this.entity.transformComponent;
		//while(tc.parent){
   		//	tc = tc.parent.entity.transformComponent;
		//}
		this.entity.transformComponent.transform.rotation.copyQuaternion(quaternion);
		this.entity.transformComponent.setUpdated();
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
