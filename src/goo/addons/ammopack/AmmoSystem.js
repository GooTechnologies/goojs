define([
	'goo/entities/systems/System'
],
/** @lends */
function(
	System
) {
	'use strict';
	/*global Ammo */

	/**
	 * @class Handles integration with Ammo.js.
	 * Depends on the global Ammo object, 
	 * so load ammo.small.js using a script tag before using this system.
	 * Direct access to the ammoWorld is available like this: myAmmoSystem.ammoWorld
	 * See also {@link AmmoComponent}
	 * @deprecated Deprecated as of v0.11.x and scheduled for removal in v0.13.0; consider using the Cannon system/component instead.
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
		System.call(this, 'AmmoSystem', ['AmmoComponent', 'TransformComponent']);
		this.settings = settings || {};
		this.fixedTime = 1/(this.settings.stepFrequency || 60);
		this.maxSubSteps = this.settings.maxSubSteps || 5;
		var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
		var overlappingPairCache = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.ammoWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
		var gravity = this.settings.gravity;
		if (gravity == null) {
			gravity = -9.81;
		}
		this.ammoWorld.setGravity(new Ammo.btVector3(0, gravity, 0));
	}

	AmmoSystem.prototype = Object.create(System.prototype);

	AmmoSystem.prototype.inserted = function(entity) {
		if (entity.ammoComponent) {
			entity.ammoComponent.initialize(entity);
			this.ammoWorld.addRigidBody( entity.ammoComponent.body);
		} else {
			console.log('Warning: missing entity.ammoComponent');
		}
	};

	AmmoSystem.prototype.deleted = function(entity) {
		if (entity.ammoComponent) {
			this.ammoWorld.removeRigidBody(entity.ammoComponent.body);
		}
	};

	AmmoSystem.prototype.process = function(entities, tpf) {
		this.ammoWorld.stepSimulation( tpf, this.maxSubSteps, this.fixedTime);

		for (var i = 0; i < entities.length; i++) {
			var e = entities[i];
			if( e.ammoComponent.mass > 0) {
				e.ammoComponent.copyPhysicalTransformToVisual( e, tpf);
			}
		}
	};

	return AmmoSystem;
});
