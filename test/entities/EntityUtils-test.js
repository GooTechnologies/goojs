define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/entities/EntityUtils',
	'goo/shapes/Box',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/renderer/light/PointLight'
], function(
	World,
	Entity,
	EntityUtils,
	Box,
	Material,
	ShaderLib,
	Camera,
	PointLight
) {
	'use strict';

	describe('EntityUtils', function() {
		var world;
		var material = Material.createMaterial(ShaderLib.simple);
		var meshData = new Box();
		var camera = new Camera(45, 1, 1, 1000);
		var light = new PointLight();
		beforeEach(function() {
			world = new World();
			Entity.entityCount = 0;
		});
		it('can create a typical entity holding nothing (backwards compatibile)', function() {
			var entity = EntityUtils.createTypicalEntity(world);
			expect(entity.toString()).toBe('Entity_0');
			expect(entity.hasComponent('MeshDataComponent')).toBeFalsy();
			expect(entity.hasComponent('MeshRendererComponent')).toBeFalsy();
			expect(entity.hasComponent('LightComponent')).toBeFalsy();
			expect(entity.hasComponent('CameraComponent')).toBeFalsy();
		});
		it('can create a typical entity holding a mesh (backwards compatibile)', function() {
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			expect(entity.hasComponent('MeshDataComponent')).toBeTruthy();
			expect(entity.hasComponent('MeshRendererComponent')).toBeTruthy();
		});
		it('can create a typical entity holding a mesh and a material (backwards compatibile)', function() {
			var entity = EntityUtils.createTypicalEntity(world, meshData, material);
			expect(entity.hasComponent('MeshDataComponent')).toBeTruthy();
			expect(entity.hasComponent('MeshRendererComponent')).toBeTruthy();
		});
		it('can create a typical entity holding a mesh, a material and a name (backwards compatibile)', function() {
			var entity = EntityUtils.createTypicalEntity(world, meshData, material, 'entitate');
			expect(entity.hasComponent('MeshDataComponent')).toBeTruthy();
			expect(entity.hasComponent('MeshRendererComponent')).toBeTruthy();
			expect(entity.toString()).toBe('entitate');
		});
		it('can create a typical entity holding a light', function() {
			var entity = EntityUtils.createTypicalEntity(world, light);
			expect(entity.hasComponent('LightComponent')).toBeTruthy();
		});
		it('can create a typical entity holding a camera', function() {
			var entity = EntityUtils.createTypicalEntity(world, camera);
			expect(entity.hasComponent('CameraComponent')).toBeTruthy();
		});
		it('can create a typical entity holding located somewhere', function() {
			var entity = EntityUtils.createTypicalEntity(world, [10, 20, 30]);
			var translation = entity.transformComponent.transform.translation;
			expect(translation.data[0] === 10 && translation.data[1] === 20 && translation.data[2] === 30).toBeTruthy();
		});
		it('can create a typical entity holding all sorts of stuff in random order', function() {
			var entity = EntityUtils.createTypicalEntity(world, camera, meshData, 'entitate', material, light);
			expect(entity.toString()).toBe('entitate');
			expect(entity.hasComponent('MeshDataComponent')).toBeTruthy();
			expect(entity.hasComponent('MeshRendererComponent')).toBeTruthy();
			expect(entity.hasComponent('LightComponent')).toBeTruthy();
			expect(entity.hasComponent('CameraComponent')).toBeTruthy();
		});

		it('can get the root entity', function() {
			var e1 = world.createEntity();
			var e2 = world.createEntity();
			e1.transformComponent.attachChild(e2.transformComponent);
			var e3 = world.createEntity();
			e2.transformComponent.attachChild(e3.transformComponent);
			world.process();

			expect(EntityUtils.getRoot(e1)).toBe(e1);
			expect(EntityUtils.getRoot(e2)).toBe(e1);
			expect(EntityUtils.getRoot(e3)).toBe(e1);
		});
	});
});
