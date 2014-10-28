define([
	'goo/scripts/Scripts',
	'goo/physicspack/colliders/BoxCollider',
	'goo/physicspack/colliders/PlaneCollider',
	'goo/physicspack/colliders/TerrainCollider',
	'goo/physicspack/colliders/RigidbodyComponent',
	'goo/physicspack/colliders/SphereCollider',
	'goo/physicspack/colliders/CylinderCollider',
	'goo/physicspack/PhysicsSystem'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/physicspack/colliders/BoxCollider',
		'goo/physicspack/colliders/TerrainCollider',
		'goo/physicspack/colliders/PlaneCollider',
		'goo/physicspack/colliders/RigidbodyComponent',
		'goo/physicspack/colliders/SphereCollider',
		'goo/physicspack/colliders/CylinderCollider',
		'goo/physicspack/PhysicsSystem'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});