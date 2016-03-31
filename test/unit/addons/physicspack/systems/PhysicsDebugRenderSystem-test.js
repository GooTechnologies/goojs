describe('PhysicsDebugRenderSystem', function () {

	var BoxCollider = require('../../../../../src/goo/addons/physicspack/colliders/BoxCollider');
	var SphereCollider = require('../../../../../src/goo/addons/physicspack/colliders/SphereCollider');
	var CylinderCollider = require('../../../../../src/goo/addons/physicspack/colliders/CylinderCollider');
	var PlaneCollider = require('../../../../../src/goo/addons/physicspack/colliders/PlaneCollider');
	var MeshCollider = require('../../../../../src/goo/addons/physicspack/colliders/MeshCollider');
	var PhysicsDebugRenderSystem = require('../../../../../src/goo/addons/physicspack/systems/PhysicsDebugRenderSystem');
	var ColliderSystem = require('../../../../../src/goo/addons/physicspack/systems/ColliderSystem');
	var PhysicsSystem = require('../../../../../src/goo/addons/physicspack/systems/PhysicsSystem');
	var Sphere = require('../../../../../src/goo/shapes/Sphere');
	var World = require('../../../../../src/goo/entities/World');
	var MeshData = require('../../../../../src/goo/renderer/MeshData');

	var world, system;

	beforeEach(function () {
		world = new World();
		system = new PhysicsDebugRenderSystem();
		world.setSystem(system);
		world.setSystem(new ColliderSystem());
		world.setSystem(new PhysicsSystem());
	});

	afterEach(function () {
		world.clearSystem('PhysicsSystem');
	});

	it('can clear', function () {
		system.renderList.push(system.renderablePool._create());
		system.clear();
		expect(system.renderablePool._objects.length).toBe(1);
		expect(system.renderList.length).toBe(0);
	});

	it('can cleanup', function () {
		system.renderList.push(system.renderablePool._create());
		system.cleanup();
		expect(system.renderablePool._objects.length).toBe(1);
		expect(system.renderList.length).toBe(0);
	});

	it('can get mesh data from collider', function () {
		var boxCollider = new BoxCollider();
		var sphereCollider = new SphereCollider();
		var cylinderCollider = new CylinderCollider();
		var planeCollider = new PlaneCollider();
		var meshCollider = new MeshCollider({ meshData: new Sphere() });

		expect(system.getMeshData(boxCollider)).toEqual(jasmine.any(MeshData));
		expect(system.getMeshData(sphereCollider)).toEqual(jasmine.any(MeshData));
		expect(system.getMeshData(cylinderCollider)).toEqual(jasmine.any(MeshData));
		expect(system.getMeshData(planeCollider)).toEqual(jasmine.any(MeshData));
		expect(system.getMeshData(meshCollider)).toEqual(jasmine.any(MeshData));
	});
});
