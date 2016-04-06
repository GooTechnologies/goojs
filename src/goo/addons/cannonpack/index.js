module.exports = {
	CannonBoxColliderComponent: require('./CannonBoxColliderComponent'),
	CannonCylinderColliderComponent: require('./CannonCylinderColliderComponent'),
	CannonDistanceJointComponent: require('./CannonDistanceJointComponent'),
	CannonPlaneColliderComponent: require('./CannonPlaneColliderComponent'),
	CannonRigidbodyComponent: require('./CannonRigidbodyComponent'),
	CannonSphereColliderComponent: require('./CannonSphereColliderComponent'),
	CannonSystem: require('./CannonSystem'),
	CannonTerrainColliderComponent: require('./CannonTerrainColliderComponent')
};
if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}