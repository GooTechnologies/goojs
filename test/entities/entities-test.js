define(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI'], function(World, Entity, System, TransformSystem,
	RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI) {
	"use strict";

	describe("Test world suite", function() {
		// REVIEW: The tests in this suite depend on each other.
		// Tests are not guaranteed to run in order!
		// A description of the problem is in the "Entity id is 0" test.

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
				/* REVIEW: This test fails intermittently for me with one of these messages:
				*
				*   Expected 6 to be 0.
				*   Error: Expected 6 to be 0.
				*       at null.<anonymous> (C:/goo/GooJS/test/entities/entities-test.js:33:23)
				*
				* or
				*
				*   TypeError: Cannot read property 'id' of undefined
                *      at null.<anonymous> (C:/goo/GooJS/test/entities/entities-test.js:33:18)
                *
                * What can cause this?
                *
                * Ah, now I see. It's because entity is not initialized every time.
                * Make sure tests can run independently of each other.
                * "Entity id is 0" should be able to be executed without
                * "New world has no entities after world.createEntity" being executed first.
                * Either create a beforeEach to initialize entity for every test,
                * or make it a local variable that is initialized in the innermost functions.
				*/
				expect(entity.id).toBe(0);
			});
		});

		// REVIEW: Unclear test description. What is "Correct"?
		// Better name: "addToWorld does not add the entity to the world before process is called"
		it("Correct handling of addToWorld", function() {
			entity.addToWorld();
			expect(world.getEntities().length).toBe(0);
			// REVIEW: Checking private variables is irrelevant. What matters is the code's behaviour.
  			expect(world._addedEntities.length).toBe(1);
			expect(world._addedEntities).toContain(entity);
		});

		// REVIEW: Unclear test description. What is "Correct"?
		// Better name: "an added entity is added to the world after process is called"
		it("Correct state after world.process", function() {
			world.process();
			expect(world.getEntities().length).toBe(1);
			// REVIEW: Irrelevant check of private variable.
			// If you're worried about an entity being added twice,
			// make a test that makes sure that two calls to process doesn't add two entities.
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
});
