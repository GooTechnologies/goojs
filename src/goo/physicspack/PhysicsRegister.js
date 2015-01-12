define([

	'goo/scripts/Scripts',

	'goo/physicspack/ammo/AmmoComponent',
	'goo/physicspack/ammo/AmmoSystem',

	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/Collider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/colliders/MeshCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/TerrainCollider',

	'goo/physicspack/joints/BallJoint',
	'goo/physicspack/joints/HingeJoint',
	'goo/physicspack/joints/PhysicsJoint',

	'goo/physicspack/AbstractPhysicsSystem',
	'goo/physicspack/AbstractRigidbodyComponent',
	'goo/physicspack/ColliderComponent',
	'goo/physicspack/ColliderSystem',
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/RaycastResult',
	'goo/physicspack/RigidbodyComponent'

], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',

		'goo/physicspack/ammo/AmmoComponent',
		'goo/physicspack/ammo/AmmoSystem',

		'goo/physicspack/colliders/BoxCollider',
		'goo/physicspack/colliders/Collider',
		'goo/physicspack/colliders/CylinderCollider',
		'goo/physicspack/colliders/MeshCollider',
		'goo/physicspack/colliders/PlaneCollider',
		'goo/physicspack/colliders/SphereCollider',
		'goo/physicspack/colliders/TerrainCollider',

		'goo/physicspack/joints/BallJoint',
		'goo/physicspack/joints/HingeJoint',
		'goo/physicspack/joints/PhysicsJoint',

		'goo/physicspack/AbstractPhysicsSystem',
		'goo/physicspack/AbstractRigidbodyComponent',
		'goo/physicspack/ColliderComponent',
		'goo/physicspack/ColliderSystem',
		'goo/physicspack/PhysicsSystem',
		'goo/physicspack/RaycastResult',
		'goo/physicspack/RigidbodyComponent'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});