import BoxCollider from './colliders/BoxCollider';
import Collider from './colliders/Collider';
import CylinderCollider from './colliders/CylinderCollider';
import MeshCollider from './colliders/MeshCollider';
import PlaneCollider from './colliders/PlaneCollider';
import SphereCollider from './colliders/SphereCollider';
import AbstractColliderComponent from './components/AbstractColliderComponent';
import AbstractRigidBodyComponent from './components/AbstractRigidBodyComponent';
import ColliderComponent from './components/ColliderComponent';
import RigidBodyComponent from './components/RigidBodyComponent';
import ColliderComponentHandler from './handlers/ColliderComponentHandler';
import RigidBodyComponentHandler from './handlers/RigidBodyComponentHandler';
import index from './index';
import BallJoint from './joints/BallJoint';
import HingeJoint from './joints/HingeJoint';
import PhysicsJoint from './joints/PhysicsJoint';
import PhysicsMaterial from './PhysicsMaterial';
import RaycastResult from './RaycastResult';
import PhysicsBoxDebugShape from './shapes/PhysicsBoxDebugShape';
import PhysicsCylinderDebugShape from './shapes/PhysicsCylinderDebugShape';
import PhysicsPlaneDebugShape from './shapes/PhysicsPlaneDebugShape';
import PhysicsSphereDebugShape from './shapes/PhysicsSphereDebugShape';
import AbstractPhysicsSystem from './systems/AbstractPhysicsSystem';
import ColliderSystem from './systems/ColliderSystem';
import PhysicsDebugRenderSystem from './systems/PhysicsDebugRenderSystem';
import PhysicsSystem from './systems/PhysicsSystem';
import Pool from './util/Pool';

module.exports = {
	BoxCollider,
	Collider,
	CylinderCollider,
	MeshCollider,
	PlaneCollider,
	SphereCollider,
	AbstractColliderComponent,
	AbstractRigidBodyComponent,
	ColliderComponent,
	RigidBodyComponent,
	ColliderComponentHandler,
	RigidBodyComponentHandler,
	index,
	BallJoint,
	HingeJoint,
	PhysicsJoint,
	PhysicsMaterial,
	RaycastResult,
	PhysicsBoxDebugShape,
	PhysicsCylinderDebugShape,
	PhysicsPlaneDebugShape,
	PhysicsSphereDebugShape,
	AbstractPhysicsSystem,
	ColliderSystem,
	PhysicsDebugRenderSystem,
	PhysicsSystem,
	Pool
};

import ObjectUtils from '../../util/ObjectUtils';
if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}