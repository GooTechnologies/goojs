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
	 * See also {@link AmmoComponent}
	 * @extends System
	 * @param [Object] settings. The settings object can contain the following properties:
	 * @param {number} settings.gravity (defaults to -9.81)
	 * @param {number} settings.stepFrequency (defaults to 60)
	 * @example
	 * var ammoSystem = new AmmoSystem({stepFrequency:60});
	 * goo.world.setSystem(ammoSystem);
	 */
	function AmmoSystem(settings) {
		System.call(this, 'AmmoSystem', ['AmmoComponent', 'TransformComponent']);
		this.settings = settings || {};
		var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
		var overlappingPairCache = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.ammoWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
		this.ammoWorld.setGravity(new Ammo.btVector3(0, this.settings.gravity || -9.81, 0));
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
			this.ammoWorld.remove(entity.ammoComponent.body);
		}
	};

	var fixedTime = 1/60;
	AmmoSystem.prototype.process = function(entities, tpf) {
		this.ammoWorld.stepSimulation( tpf, Math.floor(tpf / fixedTime)+1, fixedTime);

		for (var i = 0; i < entities.length; i++) {
			var e = entities[i];
			e.ammoComponent.process( e, tpf);
		}
	};

	return AmmoSystem;
});
