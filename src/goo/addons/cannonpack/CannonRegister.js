define([
	'goo/scripts/Scripts',
	'goo/addons/cannonpack/CannonBoxColliderComponent',
	'goo/addons/cannonpack/CannonDistanceJointComponent',
	'goo/addons/cannonpack/CannonPlaneColliderComponent',
	'goo/addons/cannonpack/CannonTerrainColliderComponent',
	'goo/addons/cannonpack/CannonRigidBodyComponent',
	'goo/addons/cannonpack/CannonSphereColliderComponent',
	'goo/addons/cannonpack/CannonCylinderColliderComponent',
	'goo/addons/cannonpack/CannonSystem'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/addons/cannonpack/CannonBoxColliderComponent',
		'goo/addons/cannonpack/CannonDistanceJointComponent',
		'goo/addons/cannonpack/CannonPlaneColliderComponent',
		'goo/addons/cannonpack/CannonTerrainColliderComponent',
		'goo/addons/cannonpack/CannonRigidBodyComponent',
		'goo/addons/cannonpack/CannonSphereColliderComponent',
		'goo/addons/cannonpack/CannonCylinderColliderComponent',
		'goo/addons/cannonpack/CannonSystem'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});