define([
	'goo/entities/systems/System',
	'goo/entities/SystemBus'
],
/** @lends */
function(
	System,
	SystemBus
) {
	"use strict";
	/*global Ammo */

	// from http://bullet.googlecode.com/svn-history/r2171/trunk/src/BulletCollision/CollisionDispatch/btCollisionObject.h
	var btCollisionFlags = {
		CF_STATIC_OBJECT: 1,
		CF_KINEMATIC_OBJECT: 2,
		CF_NO_CONTACT_RESPONSE : 4,
		CF_CUSTOM_MATERIAL_CALLBACK : 8,
		CF_CHARACTER_OBJECT : 16,
		CF_DISABLE_VISUALIZE_OBJECT : 32,
		CF_DISABLE_SPU_COLLISION_PROCESSING : 64
	};

	/**
	 * @class Handles integration with Ammo.js.
	 * Depends on the global Ammo object,
	 * so load ammo.small.js using a script tag before using this system.
	 * Direct access to the ammoWorld is available like this: myAmmoSystem.ammoWorld
	 * See also {@link AmmoComponent}
	 * @extends System
	 * @param [Object] settings. The settings object can contain the following properties:
	 * @param {number} settings.gravity (defaults to -9.81)
	 * @param {number} settings.maxSubSteps (defaults to 5)
	 * @param {number} settings.stepFrequency (defaults to 60)
	 * @example
	 * var ammoSystem = new AmmoSystem({stepFrequency:60});
	 * goo.world.setSystem(ammoSystem);
	 */
	function AmmoSystem(settings) {
		System.call(this, 'AmmoSystem', ['AmmoRigidbodyComponent', 'TransformComponent']);
		this.settings = settings || {};
		this.fixedTime = 1/(this.settings.stepFrequency || 60);
		this.maxSubSteps = this.settings.maxSubSteps || 5;
		var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
		var overlappingPairCache = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.ammoWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
		this.ammoWorld.setGravity(new Ammo.btVector3(0, this.settings.gravity || -9.81, 0));
	}

	AmmoSystem.prototype = Object.create(System.prototype);

	AmmoSystem.prototype.inserted = function(entity) {
		if (entity.ammoRigidbodyComponent) {

		} else {
			console.log('Warning: missing entity.ammoRigidbodyComponent');
		}
	};

	AmmoSystem.prototype.deleted = function(entity) {
		if (entity.ammoRigidbodyComponent) {
			this.ammoWorld.removeRigidBody(entity.ammoRigidbodyComponent.body);
		}
	};

	AmmoSystem.prototype.process = function(entities, tpf) {
		this.ammoWorld.stepSimulation( tpf, this.maxSubSteps, this.fixedTime);

		for (var i = 0; i < entities.length; i++) {
			var e = entities[i];

			var rb = e.ammoRigidbodyComponent;

			if(!e.ammoRigidbodyComponent._initialized){

				// Set initial position, etc
				e.ammoRigidbodyComponent.initialize(e);

				// Add to world
				this.ammoWorld.addRigidBody( e.ammoRigidbodyComponent.body);

				// Turn off collision response if trigger
				if(true == rb.isTrigger){
					rb.body.setCollisionFlags(rb.body.getCollisionFlags() | btCollisionFlags.CF_NO_CONTACT_RESPONSE);
					var callback = new Ammo.ConcreteContactResultCallback();
					(function(){
						Ammo.customizeVTable(callback, [{
							original: Ammo.ConcreteContactResultCallback.prototype.addSingleResult,
							replacement: function(
								/* btManifoldPoint& */ cp_ptr,
								/* const btCollisionObjectWrapper* */ colObj0_ptr,
								/* int */ partId0,
								/* int */ index0,
								/* const btCollisionObjectWrapper* */ colObj1_ptr,
								/* int */ partId1,
								/* int */ index1      ) {
								var cp = Ammo.wrapPointer(cp_ptr, Ammo.btManifoldPoint);
								var colObj0 = Ammo.wrapPointer(colObj0_ptr, Ammo.btCollisionObjectWrapper);
								var colObj1 = Ammo.wrapPointer(colObj1_ptr, Ammo.btCollisionObjectWrapper);
								console.log('collision!',
									colObj0,
									colObj1,
									partId0,
									index0,
									partId1,
									index1
								)
								SystemBus.emit('goo.ammo.collision', {

								});
							}
						}]);
					})(rb);
					rb.callback = callback;
				}
			}

			if( e.ammoRigidbodyComponent.isTrigger) {
				ammoSystem.ammoWorld.contactTest(rb.body,rb.callback);
			}

			if( e.ammoRigidbodyComponent.mass > 0) {
				e.ammoRigidbodyComponent.copyPhysicalTransformToVisual( e, tpf);
			}
		}
	};

	return AmmoSystem;
});
