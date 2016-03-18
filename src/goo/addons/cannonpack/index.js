import CannonBoxColliderComponent from './CannonBoxColliderComponent';
import CannonCylinderColliderComponent from './CannonCylinderColliderComponent';
import CannonDistanceJointComponent from './CannonDistanceJointComponent';
import CannonPlaneColliderComponent from './CannonPlaneColliderComponent';
import CannonRigidbodyComponent from './CannonRigidbodyComponent';
import CannonSphereColliderComponent from './CannonSphereColliderComponent';
import CannonSystem from './CannonSystem';
import CannonTerrainColliderComponent from './CannonTerrainColliderComponent';

module.exports = {
	CannonBoxColliderComponent,
	CannonCylinderColliderComponent,
	CannonDistanceJointComponent,
	CannonPlaneColliderComponent,
	CannonRigidbodyComponent,
	CannonSphereColliderComponent,
	CannonSystem,
	CannonTerrainColliderComponent
};

import ObjectUtils from '../../util/ObjectUtils';
if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}