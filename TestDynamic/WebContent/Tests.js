"use strict";

require([ 'goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System',
		'goo/entities/systems/TransformSystem', 'goo/entities/systems/RenderSystem',
		'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem',
		'goo/renderer/MeshData', 'goo/renderer/Renderer', 'goo/renderer/Material', 'goo/renderer/Shader',
		'goo/renderer/DataMap', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI' ], function(World,
		Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent,
		PartitioningSystem, MeshData, Renderer, Material, Shader, DataMap, GooRunner, TextureCreator, Loader,
		JSONImporter, ScriptComponent, DebugUI) {

	describe("A suite", function() {
		it("contains spec with an expectation", function() {
			expect(true).toBe(true);
		});
	});

	(function() {
		var jasmineEnv = jasmine.getEnv();
		jasmineEnv.updateInterval = 250;

		/**
		 * Create the `HTMLReporter`, which Jasmine calls to provide results of
		 * each spec and each suite. The Reporter is responsible for presenting
		 * results to the user.
		 */
		var htmlReporter = new jasmine.HtmlReporter();
		jasmineEnv.addReporter(htmlReporter);

		/**
		 * Delegate filtering of specs to the reporter. Allows for clicking on
		 * single suites or specs in the results to only run a subset of the
		 * suite.
		 */
		jasmineEnv.specFilter = function(spec) {
			return htmlReporter.specFilter(spec);
		};

		/**
		 * Run all of the tests when the page finishes loading - and make sure
		 * to run any previous `onload` handler
		 * 
		 * ### Test Results
		 * 
		 * Scroll down to see the results of all of these specs.
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
