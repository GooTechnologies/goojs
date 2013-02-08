define([
	'goo/loaders/EntityLoader',
	'goo/util/Promise',
	'goo/util/Ajax',
	'goo/entities/GooRunner'
	],
	function(
		EntityLoader,
		Promise,
		Ajax,
		GooRunner
		) {
		'use strict';

		var TestResponses = {
			'goodEntity' : {
				readyState : 4,
				status : 200,
				responseText : '{"components": {"transform": {"translation": [0, 0, -5],"rotation": [0, 0, 0],"scale": [1, 1, 1]},"meshRenderer": {"materials": ["goodMaterial"]},"meshData": {"mesh": "goodMesh"}}}',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			},
			'badEntity' : {
				readyState : 4,
				status : 200,
				responseText : 'It puts the lotion on the skin, or it gets the hose. {"components": {"transform": {"translation": [0, 0, -5],"rotation": [0, 0, 0],"scale": [1, 1, 1]},"meshRenderer": {"materials": ["materials/plastic.mat"]},"meshData": {"mesh": "meshes/cube.mesh"}}}',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			},
			'goodMesh.json' : {
				readyState : 4,
				status : 200,
				responseText : '{"data": {"VertexCount": 8, "Indices": [0, 1, 3, 2, 3, 1, 4, 7, 5, 6, 5, 7, 0, 4, 1, 5, 1, 4, 1, 5, 2, 6, 2, 5, 2, 6, 3, 7, 3, 6, 4, 0, 7, 3, 7, 0], "Vertices": [1.0, 0.9999999403953552, -1.0, 1.0, -1.0, -1.0, -1.0000001192092896, -0.9999998211860657, -1.0, -0.9999996423721313, 1.0000003576278687, -1.0, 1.0000004768371582, 0.999999463558197, 1.0, 0.9999993443489075, -1.0000005960464478, 1.0, -1.0000003576278687, -0.9999996423721313, 1.0, -0.9999999403953552, 1.0, 1.0], "Normals": [0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, 0.5773491859436035, 0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, 0.5773491859436035], "TextureCoords": [[0, 1,0,0,1,0,1,1,1,1,1,0,0,0,0,1]], "IndexModes": ["Triangles"], "IndexLengths": [36]}, "name": "Cube", "compressed": false}',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			},
			'goodMaterial.json' : {
				readyState : 4,
				status : 200,
				responseText : '{"shader": "goodShaderSource","uniforms": {"ambient": [0.2, 0.2, 0.2],"diffuseTexture": "textures/grid.png"}}',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			},
			'goodVertexShaderSource' : {
				readyState : 4,
				status : 200,
				responseText : 'goodVertexShader',
				responseHeader : {
					'Content-Type' : 'application/octet-stream'
				}
			},
			'goodFragmentShaderSource' : {
				readyState : 4,
				status : 200,
				responseText : 'goodFragmentShader',
				responseHeader : {
					'Content-Type' : 'application/octet-stream'
				}
			},
			'goodShaderSource.json' : {
				readyState : 4,
				status : 200,
				responseText : '{ "vs": "goodVertexShaderSource", "fs": "goodFragmentShaderSource" }',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			}
		};



		function MockXHRBuilder(mockResponses) {
			function MockXHR() {

			}

			MockXHR.prototype.open = function(method, url) {
				this.url = url;
			};

			MockXHR.prototype.send = function() {
				if(!mockResponses[this.url])
				{
					this.readyState = 4;
					this.status = 404;
					this.statusText = 'Couldn\'t find a fake response: ' + this.url;
					this.onreadystatechange();
					return;
				}

				var response = mockResponses[this.url];

				for(var key in response)
				{
					this[key] = response[key];
				}

				this.onreadystatechange();
			};

			MockXHR.prototype.getResponseHeader = function(header) {
				return this.responseHeader[header] ? this.responseHeader[header] : null;
			};

			return MockXHR;
		}

		describe('EntityLoader', function() {
			var loader;
			var goo;
			var projectURL;
			var sceneURL;
			var XHR = XMLHttpRequest;

			beforeEach(function() {
				XMLHttpRequest = MockXHRBuilder(TestResponses);
				goo = new GooRunner();
				loader = new EntityLoader(goo.world);
			});

			afterEach(function() {
				XMLHttpRequest = XHR; // Restore the XHR definition, just in case
				loader = null;
				goo = null;
			});

			it("has null as world and an empty string as project URL when no arguments to constructor", function() {
				loader = new EntityLoader();

				expect(loader._rootUrl).toBe('');
				expect(loader._world).toBe(null);
			});

			it("has an empty string as project URL when the second argument to the constructor is undefined/null", function() {
				loader = new EntityLoader(goo.world);

				expect(loader._rootUrl).toBe('');
				expect(loader._world).toBe(goo.world);
			});

			it("sets the project URL when passed to the constructor", function() {
				var loader = new EntityLoader(goo.world, 'Brick Tamland');


				expect(loader._rootUrl).toBe('Brick Tamland');
				expect(loader._world).toBe(goo.world);
			});

			describe('.setRootUrl()', function() {

				it("sets the root url", function() {
					loader.setRootUrl('Veronica Corningstone');

					expect(loader._rootUrl).toBe('Veronica Corningstone');
				});
			});

			describe('.setWorld()', function() {

				it("sets the world", function() {
					loader.setWorld('Ron Burgundy');

					expect(loader._world).toBe('Ron Burgundy');
				});
			});

			describe('.load()', function() {

				it('resolves its promise and creates a new entity from a correct URL', function() {

					var promise = loader.load('goodEntity');

					promise
					.done(function(data) {
						// Do some checks
						expect(data._world).toBe(goo.world);
						expect(data.transformComponent.transform.translation.z).toBe(-5);
						expect(data.meshDataComponent.meshData.vertexCount).toBe(8);
						expect(data.meshRendererComponent.materials[0].materialState.ambient.r).toBe(0.2);
					})
					.always(function() {
						//expect(promise._resolve).toHaveBeenCalled();
						expect(promise._state).toBe('resolved');
					});
				});

				it('rejects its promise from a bad URL', function() {
					var promise = loader.load('404');

					promise.always(function() {
						//expect(promise._reject).toHaveBeenCalled();
						expect(promise._state).toBe('rejected');
				});
			});

			it('rejects its promise when the URL response isn\'t valid JSON', function() {
				var promise = loader.load('badEntity');

				promise.always(function() {
					//expect(promise._reject).toHaveBeenCalled();
					expect(promise._state).toBe('rejected');
				});
			});

			it('loads are unique with every call', function() {

				var promise1 = loader.load('goodEntity'),
				promise2 = loader.load('goodEntity');

				Promise.when(promise1, promise2)
					.done(function(data) {
						// Do some checks
						expect(data[0]).not.toBe(data[1]);
						expect(data[0].id).not.toBe(data[1].id);
					})
					.fail(function() {
						// Fail test if we come here
						expect('success').toBe('failure');
					});
			});
		});
	});
});