define([

	'goo/scripts/Scripts',

	'goo/physicspack/ammo/AmmoPhysicsSystem',
	'goo/physicspack/ammo/AmmoRigidbody',

	'goo/physicspack/cannon/CannonPhysicsSystem',
	'goo/physicspack/cannon/CannonRigidbody',

	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/Collider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/TerrainCollider',

	'goo/physicspack/joints/BallJoint',
	'goo/physicspack/joints/HingeJoint',
	'goo/physicspack/joints/Joint',

	'goo/physicspack/ColliderComponent',
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/Rigidbody',
	'goo/physicspack/RigidbodyComponent'

], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',

		'goo/physicspack/ammo/AmmoPhysicsSystem',
		'goo/physicspack/ammo/AmmoRigidbody',

		'goo/physicspack/cannon/CannonPhysicsSystem',
		'goo/physicspack/cannon/CannonRigidbody',

		'goo/physicspack/colliders/BoxCollider',
		'goo/physicspack/colliders/Collider',
		'goo/physicspack/colliders/CylinderCollider',
		'goo/physicspack/colliders/PlaneCollider',
		'goo/physicspack/colliders/SphereCollider',
		'goo/physicspack/colliders/TerrainCollider',

		'goo/physicspack/joints/BallJoint',
		'goo/physicspack/joints/HingeJoint',
		'goo/physicspack/joints/Joint',

		'goo/physicspack/ColliderComponent',
		'goo/physicspack/PhysicsSystem',
		'goo/physicspack/Rigidbody',
		'goo/physicspack/RigidbodyComponent'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});