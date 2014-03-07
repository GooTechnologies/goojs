define([
	'goo/entities/systems/System'
],
/** @lends */
function(
	System
) {
	"use strict";

	var Ammo = window.Ammo; // make jslint happy

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

			if(!e.ammoRigidbodyComponent._initialized){

				// Set initial position, etc
				e.ammoRigidbodyComponent.initialize(e);

				// Add to world
				this.ammoWorld.addRigidBody( e.ammoRigidbodyComponent.body);
			}

			if( e.ammoRigidbodyComponent.mass > 0) {
				e.ammoRigidbodyComponent.copyPhysicalTransformToVisual( e, tpf);
			}
		}
	};

	return AmmoSystem;
});
