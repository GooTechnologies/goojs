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
	'goo/entities/components/MeshDataComponent',
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
	MeshDataComponent,
	LightComponent,
	HtmlComponent
) {
	'use strict';

	describe('EntityUtils', function() {
		var world;
		var meshData = new Box();

		beforeEach(function() {
			world = new World();
			world.registerComponent(TransformComponent);
			world.registerComponent(MeshDataComponent);
			world.add(new TransformSystem());
			Entity.entityCount = 0;
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
			var e1 = world.createEntity(meshData, new MeshRendererComponent());
			var e2 = world.createEntity(meshData, new MeshRendererComponent(), [10, 10, 10]);
			e1.transformComponent.attachChild(e2.transformComponent);
			var e3 = world.createEntity(meshData, new MeshRendererComponent(), [10, 10, 10]);
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