define([

	'goo/scripts/Scripts',

	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/Collider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/colliders/MeshCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/colliders/SphereCollider',

	'goo/addons/physicspack/joints/BallJoint',
	'goo/addons/physicspack/joints/HingeJoint',
	'goo/addons/physicspack/joints/PhysicsJoint',

	'goo/addons/physicspack/systems/AbstractPhysicsSystem',
	'goo/addons/physicspack/components/AbstractRigidBodyComponent',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/addons/physicspack/systems/ColliderSystem',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/RaycastResult',
	'goo/addons/physicspack/PhysicsMaterial',
	'goo/addons/physicspack/components/RigidBodyComponent'

], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',

		'goo/addons/physicspack/colliders/BoxCollider',
		'goo/addons/physicspack/colliders/Collider',
		'goo/addons/physicspack/colliders/CylinderCollider',
		'goo/addons/physicspack/colliders/MeshCollider',
		'goo/addons/physicspack/colliders/PlaneCollider',
		'goo/addons/physicspack/colliders/SphereCollider',

		'goo/addons/physicspack/joints/BallJoint',
		'goo/addons/physicspack/joints/HingeJoint',
		'goo/addons/physicspack/joints/PhysicsJoint',

		'goo/addons/physicspack/systems/AbstractPhysicsSystem',
		'goo/addons/physicspack/components/AbstractRigidBodyComponent',
		'goo/addons/physicspack/components/ColliderComponent',
		'goo/addons/physicspack/systems/ColliderSystem',
		'goo/addons/physicspack/systems/PhysicsSystem',
		'goo/addons/physicspack/RaycastResult',
		'goo/addons/physicspack/PhysicsMaterial',
		'goo/addons/physicspack/components/RigidBodyComponent'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});