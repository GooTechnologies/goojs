define([
		'goo/loaders/SceneLoader',
		'goo/entities/GooRunner'
	],
	function(
		SceneLoader,
		GooRunner
	) {
	"use strict";

	describe("SceneLoader", function() {
		var goo;

		beforeEach(function() {
			// Create typical goo application
			goo = new GooRunner({
				showStats : false
			});
			//goo.renderer.domElement.id = 'goo';
		});

		afterEach(function() {
			goo = null;
		});

		it("can load and return a JSON object", function() {
			var s = new SceneLoader(goo.world);
			s.projectUrl = '/path/to/project/';
			var sceneURL = 'scenes/scene';


			var _data = null;

			s.load(sceneURL,{
				onSuccess: function(data) {
					_data = data;
				},
				onError: function(error) {
					console.warn('Failed to load scene: ' + error);
				}
			});

			expect(data).toEqual('{"a":"b"}');
		});

/*
	loadScene(projectURL, sceneURL, callback)
	load(urlRelativeToProjectRoot, callback) 
	handleSuccessfulRequest(request)
	_parseScene(sceneSource, callback)
	_parseEntity(entitySource, callback)
	_parseMeshRenderer(meshRendererSource, callback)
	_parseMeshDataComponent(meshDataComponentSource, callback)
	_parseMeshData(object, weightsPerVert, type)
	_parseMaterial(materialDataSource, callback)
	_parseShaderDefinition(shaderDataSource, callback)


*/

/*
		it("can perform component-wise addition between two matrices", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.add(a);

			expect(a).toEqual(new Matrix(2, 2).set(4, 8, 12, 16));
			expect(Matrix.add(b, b)).toEqual(new Matrix(2, 2).set(4, 8, 12, 16));
		});

		it("can perform component-wise subtraction between two matrices", function() {
			var a = new Matrix(2, 2).set(2, 4, 6, 8);
			var b = new Matrix(2, 2).set(2, 4, 6, 8);

			a.sub(a);

			expect(a).toEqual(new Matrix(2, 2).set(0, 0, 0, 0));
			expect(Matrix.sub(b, b)).toEqual(new Matrix(2, 2).set(0, 0, 0, 0));
		});
*/
	});
});
