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

		it("Entity is setup correctly", function() {
			expect(entity._world).toBe(world);
			expect(entity._components.length).toBe(0);
			expect(entity.id).toBe(0);
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
	});

	(function() {
		var jasmineEnv = jasmine.getEnv();
		jasmineEnv.updateInterval = 250;

		/**
		 * Create the `HTMLReporter`, which Jasmine calls to provide results of each spec and each suite. The Reporter is responsible for presenting
		 * results to the user.
		 */
		var htmlReporter = new jasmine.HtmlReporter();
		jasmineEnv.addReporter(htmlReporter);

		/**
		 * Delegate filtering of specs to the reporter. Allows for clicking on single suites or specs in the results to only run a subset of the
		 * suite.
		 */
		jasmineEnv.specFilter = function(spec) {
			return htmlReporter.specFilter(spec);
		};

		/**
		 * Run all of the tests when the page finishes loading - and make sure to run any previous `onload` handler ### Test Results Scroll down to
		 * see the results of all of these specs.
		 */
		var currentWindowOnload = window.onload;
		window.onload = function() {
			if (currentWindowOnload) {
				currentWindowOnload();
			}

			// document.querySelector('.version').innerHTML =
			// jasmineEnv.versionString();
			execJasmine();
		};

		function execJasmine() {
			jasmineEnv.execute();
		}
	})();

});
