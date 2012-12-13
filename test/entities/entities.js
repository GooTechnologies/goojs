require({
	baseUrl : "./",
	paths : {
		goo : "../../goo",
	}
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI'], function(World, Entity, System, TransformSystem,
	RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI) {
	"use strict";

	describe("Test world suite", function() {
		var world;
		var entity;

		it("New world has no entities", function() {
			world = new World();
			expect(world.getEntities().length).toBe(0);
		});

		it("New world has no entities after world.createEntity", function() {
			entity = world.createEntity();
			expect(world.getEntities().length).toBe(0);
		});

		describe("Entity is setup correctly", function() {
			it("Entity world is global world", function() {
				expect(entity._world).toBe(world);
			});
			it("Entity has 1 components (transformcomponent)", function() {
				expect(entity._components.length).toBe(1);
				expect(entity.getComponent('TransformComponent')).toBeDefined();
			});
			it("Entity id is 0", function() {
				expect(entity.id).toBe(0);
			});
		});

		it("Correct handling of addToWorld", function() {
			entity.addToWorld();
			expect(world.getEntities().length).toBe(0);
			expect(world._addedEntities.length).toBe(1);
			expect(world._addedEntities).toContain(entity);
		});

		it("Correct state after world.process", function() {
			world.process();
			expect(world.getEntities().length).toBe(1);
			expect(world._addedEntities.length).toBe(0);
		});

		it("Entity still exists after removeFromWorld before process", function() {
			entity.removeFromWorld();
			expect(world.getEntities().length).toBe(1);
			expect(world._removedEntities.length).toBe(1);
			expect(world._removedEntities).toContain(entity);
		});

		it("Correct state after world.process", function() {
			world.process();
			expect(world.getEntities().length).toBe(0);
			expect(world._removedEntities.length).toBe(0);
		});
	});

	(function() {
		var jasmineEnv = jasmine.getEnv();
		jasmineEnv.updateInterval = 250;
		var htmlReporter = new jasmine.HtmlReporter();
		jasmineEnv.addReporter(htmlReporter);
		jasmineEnv.specFilter = function(spec) {
			return htmlReporter.specFilter(spec);
		};
		jasmineEnv.execute();
	})();
});
