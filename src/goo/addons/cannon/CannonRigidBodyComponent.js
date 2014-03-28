define([
	'goo/entities/components/Component',
	'goo/math/Quaternion',
	'goo/math/Vector3',
	'goo/math/Transform',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/util/ObjectUtil'
],function(
	Component,
	Quaternion,
	Vector3,
	Transform,
	Box,
	Sphere,
	Quad,
	_
){
	"use strict";

	var quaternion = new Quaternion();
	var pquat = new CANNON.Quaternion();

	/**
	 * @class Adds Cannon physics to an entity. Should be combined with one of the CannonCollider components, such as the @link{CannonSphereColliderComponent}. Also see {@link CannonSystem}.
	 * @extends Component
	 * @param {Object}  [settings]
	 * @param {number}  [settings.mass=1]
	 * @param {number}  [settings.motionState='dynamic'] Should be one of 'dynamic', 'static', 'kinematic'
	 * @param {boolean} [settings.drag=0.0]
	 * @param {boolean} [settings.angularDrag=0.05]
	 * @param {boolean} [settings.collisionDetection='discrete']
	 */
	function CannonRigidbodyComponent(settings){
		settings = settings || {};
		this.type = "CannonRigidbodyComponent";

		_.defaults(settings,{
			mass : 1
		});

		this.mass = settings.mass;

		this._initialized = false; // Keep track, so we can add the body next frame
	}

	CannonRigidbodyComponent.prototype = Object.create(Component.prototype);
	CannonRigidbodyComponent.constructor = CannonRigidbodyComponent;

	/**
	 * Set initial position, create shapes etc.. Should be called whenever changed.
	 * @method initialize
	 * @param  {Entity} entity
	 */
	CannonRigidbodyComponent.prototype.initialize = function(entity) {
		var gooTransform = entity.transformComponent.worldTransform;
		var gooPos = gooTransform.translation;
		var CannonPos = new CANNON.Vec3(gooPos.x, gooPos.y, gooPos.z);

		var q = quaternion;
		q.fromRotationMatrix(gooTransform.rotation);
		CannonTransform.setRotation(new CANNON.btQuaternion(q.x, q.y, q.z, q.w));

		if(this.useWorldBounds) {
			entity._world.process();
			this.shape = this.createCannonShapefromGooShapeWorldBounds(entity, gooTransform);
			this.difference = this.center.clone().sub( gooTransform.translation).invert();
		} else {
			this.shape = this.createCannonShape(entity, gooTransform);
		}

		var motionState = new CANNON.btDefaultMotionState( CannonTransform );
		var localInertia = new CANNON.btVector3(0, 0, 0);

		// rigidbody is dynamic if and only if mass is non zero, otherwise static
		if(this.mass !== 0.0) {
			this.shape.calculateLocalInertia( this.mass, localInertia );
		}

		var info = new CANNON.btRigidBodyConstructionInfo(this.mass, motionState, this.shape, localInertia);
		this.body = new CANNON.btRigidBody( info );

		this._initialized = true;
	};

	/**
	 * Recursively check if there's any colliders in this component
	 * @param  {Entity}  				entity
	 * @param  {?TransformComponent}	transformComponent
	 * @return {Boolean}
	 */
	CannonRigidbodyComponent.prototype.isCompound = function(entity, transformComponent){
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
				if(comp.type == 'CannonColliderComponent'){
					isCompound = true;
					return false;
				}
			}

		});

		return isCompound;
	};

	CannonRigidbodyComponent.prototype.createCannonShape = function(entity, gooTransform) {
		var shape;
		var scale = gooTransform.scale;

		if(this.useWorldBounds){
			// Create a shape depending on the world bounds
			entity.meshDataComponent.computeBoundFromPoints();
			var bound = entity.meshDataComponent.modelBound;
			if (bound instanceof BoundingBox) {
				shape = new CANNON.btBoxShape(new CANNON.btVector3( bound.xExtent*scale.x, bound.yExtent*scale.y, bound.zExtent*scale.z));
			} else if (bound instanceof BoundingSphere) {
				shape = new CANNON.btSphereShape( bound.radius*scale.x);
			}

		} else if( !this.isCompound(entity) ) {
			// If we only have 1 collider without local offset, use the shape directly
			// Find the single collider
			var c = entity._components
			var collider;
			for(var i=0; i<c.length; i++) {
				var child = c[i];
				if(child.type =="CannonColliderComponent"){
					collider = child;
					break;
				}
			}
			shape = collider.CannonShape;

		} else {
			// There's one or more colliders! Create a compound shape
			shape = new CANNON.btCompoundShape();

			// Needed for getting the Rigidbody-local transform of each collider
			var bodyTransform = entity.transformComponent.worldTransform;
			var invBodyTransform = new Transform();
			invBodyTransform.copy(bodyTransform);
			invBodyTransform.invert(invBodyTransform);

			// Add all sub colliders
			entity.traverse(function(entity,level){

				for(var i=0; i<entity._components.length; i++){
					var comp = entity._components[i];
					if(comp.type == 'CannonColliderComponent'){
						var childCannonShape = comp.CannonShape;

						// Get the local transform of the collider, relative to the rigidbody
						var localTrans = new CANNON.btTransform();
						localTrans.setIdentity();
						var gooTrans = new Transform();
						gooTrans.copy(entity.transformComponent.worldTransform);
						Transform.combine(invBodyTransform,gooTrans,gooTrans);
						var gooPos = gooTrans.translation;
						localTrans.setOrigin(new CANNON.btVector3( gooPos.x, gooPos.y, gooPos.z));

						var q = new Quaternion();
						q.fromRotationMatrix(gooTrans.rotation);
						localTrans.setRotation(new CANNON.btQuaternion(q.x, q.y, q.z, q.w));

						shape.addChildShape(localTrans,childCannonShape);
					}
				}

			});
		}
		return shape;
	};

	CannonRigidbodyComponent.prototype.createCannonShapefromGooShapeWorldBounds = function(entity) {
		var shape;
		var bound = EntityUtils.getTotalBoundingBox( entity);
		this.center = bound.center;
		shape = new CANNON.btBoxShape(new CANNON.btVector3( bound.xExtent, bound.yExtent, bound.zExtent));
		return shape;
	};

	CannonRigidbodyComponent.prototype.setLinearFactor = function(n0, n1, n2){
		this.body.setLinearFactor(new CANNON.btVector3(n0,n1,n2));
	};

	// rotation
	CannonRigidbodyComponent.prototype.setAngularFactor = function(n0, n1, n2){
		this.body.setAngularFactor(new CANNON.btVector3(n0,n1,n2));
	};
	CannonRigidbodyComponent.prototype.setFriction = function(n1){
		this.body.setFriction(n1);
	};
	CannonRigidbodyComponent.prototype.setSleepingThresholds = function(min, max){
		this.body.setSleepingThresholds(min, max);
	};
	CannonRigidbodyComponent.prototype.setMass = function(n1){
		this.body.setFriction(n1);
	};
	CannonRigidbodyComponent.prototype.setRestitution = function(n0){
		this.body.setRestitution(n0);
	}
	CannonRigidbodyComponent.prototype.setOffsetPosition = function(n0, n1, n2){
		this.offsetPosition.x = n0;
		this.offsetPosition.y = n1;
		this.offsetPosition.z = n2;
	};
	CannonRigidbodyComponent.prototype.setPosition = function(n0, n1, n2){
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
	CannonRigidbodyComponent.prototype.setRotation = function(rot0){
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
	CannonRigidbodyComponent.prototype.setLinearVelocity = function(v1){
		pvec.setValue(v1.x, v1.y, v1.z);
		this.body.setLinearVelocity(pvec);
	};
	CannonRigidbodyComponent.prototype.getLinearVelocity = function(){
		return this.body.getLinearVelocity();
	};
	CannonRigidbodyComponent.prototype.applyCentralImpulse = function(n0, n1, n2){
		pvec.setValue(n0, n1, n2);
		this.body.applyCentralImpulse(pvec);
	};
	CannonRigidbodyComponent.prototype.applyCentralForce = function(n0, n1, n2){
		pvec.setValue(n0, n1, n2);
		this.body.applyCentralForce(pvec);
	};
	CannonRigidbodyComponent.prototype.removeFromWorld = function(){
		Game.CannonWorld.removeRigidBody(this.body);
	};
	CannonRigidbodyComponent.prototype.addToWorld = function(){
		Game.CannonWorld.addRigidBody(this.body);
	};

	CannonRigidbodyComponent.prototype.copyPhysicalTransformToVisual = function(entity) {
		var tc = entity.transformComponent;
		if ( ! this.body ) {
			return;
		}
		this.body.getMotionState().getWorldTransform(this.CannonTransform);
		var CannonQuat = this.CannonTransform.getRotation();
		quaternion.setd(CannonQuat.x(), CannonQuat.y(), CannonQuat.z(), CannonQuat.w());
		tc.transform.rotation.copyQuaternion(quaternion);
		var origin = this.CannonTransform.getOrigin();
		tc.setTranslation(origin.x(), origin.y(), origin.z());
	};

	return CannonRigidbodyComponent;
});
