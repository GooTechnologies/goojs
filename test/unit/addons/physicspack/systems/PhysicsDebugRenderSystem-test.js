define([
	'goo/entities/World',
	'goo/addons/physicspack/systems/PhysicsDebugRenderSystem',
	'goo/addons/physicspack/systems/PhysicsSystem',
	'goo/addons/physicspack/systems/ColliderSystem',

	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/addons/physicspack/colliders/BoxCollider',
	'goo/addons/physicspack/colliders/CylinderCollider',
	'goo/addons/physicspack/colliders/PlaneCollider',
	'goo/addons/physicspack/colliders/MeshCollider',

	'goo/renderer/MeshData',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/shapes/TextureGrid'
], function (
	World,
	PhysicsDebugRenderSystem,
	PhysicsSystem,
	ColliderSystem,

	SphereCollider,
	BoxCollider,
	CylinderCollider,
	PlaneCollider,
	MeshCollider,

	MeshData,
	Sphere,
	Box,
	Cylinder,
	TextureGrid
) {
	'use strict';

	describe('PhysicsDebugRenderSystem', function () {
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
			system.renderList.push(system.renderablePool.create());
			system.clear();
			expect(system.renderablePool.objects.length).toBe(1);
			expect(system.renderList.length).toBe(0);
		});

		it('can cleanup', function () {
			system.renderList.push(system.renderablePool.create());
			system.cleanup();
			expect(system.renderablePool.objects.length).toBe(1);
			expect(system.renderList.length).toBe(0);
		});

		it('can get mesh data from collider', function () {
			var boxCollider = new BoxCollider();
			var sphereCollider = new SphereCollider();
			var cylinderCollider = new CylinderCollider();
			var planeCollider = new PlaneCollider();
			var meshCollider = new MeshCollider({ meshData: new Sphere() });

			expect(system.getMeshData(boxCollider)).toEqual(jasmine.any(Box));
			expect(system.getMeshData(sphereCollider)).toEqual(jasmine.any(Sphere));
			expect(system.getMeshData(cylinderCollider)).toEqual(jasmine.any(Cylinder));
			expect(system.getMeshData(planeCollider)).toEqual(jasmine.any(TextureGrid));
			expect(system.getMeshData(meshCollider)).toEqual(jasmine.any(MeshData));
		});
	});
});