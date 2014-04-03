define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/entities/EntityUtils',
	'goo/shapes/Box',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/renderer/light/PointLight',

	'goo/entities/systems/TransformSystem',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/LightComponent',
	'goo/entities/components/HtmlComponent'
], function(
	World,
	Entity,
	EntityUtils,
	Box,
	Material,
	ShaderLib,
	Camera,
	PointLight,

	TransformSystem,
	TransformComponent,
	MeshRendererComponent,
	LightComponent,
	HtmlComponent
) {
	'use strict';

	describe('EntityUtils', function() {
		var world;
		var material = new Material(ShaderLib.simple);
		var meshData = new Box();
		var camera = new Camera();
		var light = new PointLight();

		beforeEach(function() {
			world = new World();
			world.add(new TransformComponent());
			world.add(new TransformSystem());
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

		it('can get the total bounding box', function() {
			var e1 = EntityUtils.createTypicalEntity(world, meshData);
			var e2 = EntityUtils.createTypicalEntity(world, meshData, [10,10,10]);
			e1.transformComponent.attachChild(e2.transformComponent);
			var e3 = EntityUtils.createTypicalEntity(world, meshData, [10,10,10]);
			e2.transformComponent.attachChild(e3.transformComponent);
			world.process();
			var es = [e1,e2,e3,e1,e2,e3];
			for( var i=0; i<es.length; i++ ) {
				var e = es[i];
				e.transformComponent.updateTransform();
				e.transformComponent.updateWorldTransform();
				e.meshDataComponent.computeBoundFromPoints();
				e.meshRendererComponent.updateBounds(e.meshDataComponent.modelBound, e.transformComponent.worldTransform);
			}
			var bb = EntityUtils.getTotalBoundingBox(e1);
			expect(bb.xExtent).toBe(10.5);
			expect(bb.yExtent).toBe(10.5);
			expect(bb.zExtent).toBe(10.5);
		});

		//! AT: let's isolate this a bit
		(function () {
			function getEntity() {
				return world.createEntity().set(new MeshRendererComponent())
					.set(new LightComponent())
					.set(new HtmlComponent());
			}

			function expectEverything(entity, entityHidden, componentsHidden) {
				expect(entity.hidden).toEqual(entityHidden);
				expect(entity.meshRendererComponent.hidden).toEqual(componentsHidden);
				expect(entity.lightComponent.hidden).toEqual(componentsHidden);
				expect(entity.htmlComponent.hidden).toEqual(componentsHidden);
			}

			describe('hide', function () {
				it('can hide an entity and its components', function () {
					var entity = getEntity();

					EntityUtils.hide(entity);

					expectEverything(entity, true, true);
				});

				it('can hide an entity and its children and their components', function () {
					var grandparent = getEntity();
					var parent1 = getEntity();
					var parent2 = getEntity();
					var child11 = getEntity();
					var child12 = getEntity();
					var child21 = getEntity();
					var child22 = getEntity();

					grandparent.attachChild(parent1);
					grandparent.attachChild(parent2);
					parent1.attachChild(child11);
					parent1.attachChild(child12);
					parent2.attachChild(child21);
					parent2.attachChild(child22);

					EntityUtils.hide(parent1);
					EntityUtils.hide(grandparent);

					expectEverything(grandparent, true, true);
					expectEverything(parent1, true, true);
					expectEverything(parent2, false, true);
					expectEverything(child11, false, true);
					expectEverything(child12, false, true);
					expectEverything(child21, false, true);
					expectEverything(child22, false, true);
				});
			});

			describe('show', function () {
				it('can show a hidden entity and its components', function () {
					var entity = getEntity();

					EntityUtils.hide(entity);
					EntityUtils.show(entity);

					expectEverything(entity, false, false);
				});

				it('can show a hidden entity but keeps its components hidden if an ancestor entity is hidden', function () {
					var grandparent = getEntity();
					var parent1 = getEntity();
					var parent2 = getEntity();
					var child11 = getEntity();
					var child12 = getEntity();
					var child21 = getEntity();
					var child22 = getEntity();

					grandparent.attachChild(parent1);
					grandparent.attachChild(parent2);
					parent1.attachChild(child11);
					parent1.attachChild(child12);
					parent2.attachChild(child21);
					parent2.attachChild(child22);

					EntityUtils.hide(grandparent);
					EntityUtils.show(parent1);
					EntityUtils.show(child22);

					expectEverything(grandparent, true, true);
					expectEverything(parent1, false, true);
					expectEverything(parent2, false, true);
					expectEverything(child11, false, true);
					expectEverything(child12, false, true);
					expectEverything(child21, false, true);
					expectEverything(child22, false, true);
				});
			});
		})();
	});
});