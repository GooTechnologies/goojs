define([
	'goo/scripts/Scripts',
	'goo/addons/ammopack/AmmoComponent',
	'goo/addons/ammopack/AmmoSystem',
	'goo/addons/ammopack/AmmoWorkerRigidbodyComponent',
	'goo/addons/ammopack/AmmoWorkerSystem',
	'goo/addons/ammopack/BoxCollider',
	'goo/addons/ammopack/calculateTriangleMeshShape',
	'goo/addons/ammopack/CapsuleCollider',
	'goo/addons/ammopack/Collider',
	'goo/addons/ammopack/ColliderComponent',
	'goo/addons/ammopack/MeshCollider',
	'goo/addons/ammopack/PlaneCollider',
	'goo/addons/ammopack/SphereCollider',
	'goo/addons/ammopack/TerrainCollider'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/ammopack/AmmoComponent',
		'goo/addons/ammopack/AmmoSystem',
		'goo/addons/ammopack/AmmoWorkerRigidbodyComponent',
		'goo/addons/ammopack/AmmoWorkerSystem',
		'goo/addons/ammopack/BoxCollider',
		'goo/addons/ammopack/calculateTriangleMeshShape',
		'goo/addons/ammopack/CapsuleCollider',
		'goo/addons/ammopack/Collider',
		'goo/addons/ammopack/ColliderComponent',
		'goo/addons/ammopack/MeshCollider',
		'goo/addons/ammopack/PlaneCollider',
		'goo/addons/ammopack/SphereCollider',
		'goo/addons/ammopack/TerrainCollider'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});