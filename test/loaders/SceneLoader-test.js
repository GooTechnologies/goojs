define([
	'goo/loaders/Loader',
	'goo/loaders/SceneLoader',
	'goo/util/Promise',
	'goo/entities/GooRunner'
	],
	function(
		Loader,
		SceneLoader,
		Promise,
		GooRunner
		) {
		'use strict';

		var TestResponses = {
			'goodScene' : {
				readyState : 4,
				status : 200,
				responseText : '{"files" : ["goodEntity.ent.json","goodEntity.ent.json"], "directories" : []}',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			},
			'badScene' : {
				readyState : 4,
				status : 200,
				responseText : 'Where did you get your clothes? At the... toilet store? {"components": {"transform": {"translation": [0, 0, -5],"rotation": [0, 0, 0],"scale": [1, 1, 1]},"meshRenderer": {"materials": ["goodMaterial"]},"meshData": {"mesh": "goodMesh"}}}',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			},
			'goodScene/goodEntity.ent.json' : {
				readyState : 4,
				status : 200,
				responseText : '{"components": {"transform": {"translation": [0, 0, -5],"rotation": [0, 0, 0],"scale": [1, 1, 1]},"meshRenderer": {"materials": ["goodMaterial.mat"]},"meshData": {"mesh": "goodMesh.mesh"}}}',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			},
			'goodMesh.mesh.json' : {
				readyState : 4,
				status : 200,
				responseText : '{"data": {"VertexCount": 8, "Indices": [0, 1, 3, 2, 3, 1, 4, 7, 5, 6, 5, 7, 0, 4, 1, 5, 1, 4, 1, 5, 2, 6, 2, 5, 2, 6, 3, 7, 3, 6, 4, 0, 7, 3, 7, 0], "Vertices": [1.0, 0.9999999403953552, -1.0, 1.0, -1.0, -1.0, -1.0000001192092896, -0.9999998211860657, -1.0, -0.9999996423721313, 1.0000003576278687, -1.0, 1.0000004768371582, 0.999999463558197, 1.0, 0.9999993443489075, -1.0000005960464478, 1.0, -1.0000003576278687, -0.9999996423721313, 1.0, -0.9999999403953552, 1.0, 1.0], "Normals": [0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, 0.5773491859436035, 0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, 0.5773491859436035], "TextureCoords": [[0, 1,0,0,1,0,1,1,1,1,1,0,0,0,0,1]], "IndexModes": ["Triangles"], "IndexLengths": [36]}, "name": "Cube", "compressed": false}',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			},
			'goodMaterial.mat.json' : {
				readyState : 4,
				status : 200,
				responseText : '{"shader": "goodShaderSource.shader","uniforms": {"ambient": [0.2, 0.2, 0.2],"diffuseTexture": "textures/grid.png"}}',
				responseHeader : {
					'Content-Type' : 'application/json'
				}
			},
			'goodVertexShaderSource.vs.glsl' : {
				readyState : 4,
				status : 200,
				responseText : 'goodVertexShader',
				responseHeader : {
					'Content-Type' : 'application/octet-stream'
				}
			},
			'goodFragmentShaderSource.fs.glsl' : {
				readyState : 4,
				status : 200,
				responseText : 'goodFragmentShader',
				responseHeader : {
					'Content-Type' : 'application/octet-stream'
				}
			},
			'goodShaderSource.shader.json' : {
				readyState : 4,
				status : 200,
				responseText : '{ "vs": "goodVertexShaderSource.vs.glsl", "fs": "goodFragmentShaderSource.fs.glsl" }',
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

		describe('SceneLoader', function() {
			var loader;
			var goo;
			var projectURL;
			var sceneURL;
			var XHR = XMLHttpRequest;
			var loaderSettings = {
				loader: new Loader()
			};

			beforeEach(function() {
				XMLHttpRequest = MockXHRBuilder(TestResponses);
				goo = new GooRunner();
				loaderSettings.world = goo.world;
				loader = new SceneLoader(loaderSettings);
			});

			afterEach(function() {
				XMLHttpRequest = XHR; // Restore the XHR definition, just in case
				loader = null;
				goo = null;
			});

			describe('.load()', function() {

				it('resolves its promise and creates a new Scene from a correct URL', function() {

					var promise = loader.load('goodScene');

					promise
					.done(function(data) {
						// Do some checks
						expect(data).toBe(goo.world);
						expect(data.entityManager.getEntities().length).toBe(2);
					})
					.always(function(d) {
						console.log(d);
						expect(promise._state).toBe('resolved');
					});
				});

				it('rejects its promise from a bad URL', function() {
					var promise = loader.load('404');

					promise.always(function() {
						expect(promise._state).toBe('rejected');
					});
				});

				it('rejects its promise when the URL response isn\'t valid JSON', function() {
					var promise = loader.load('badScene');

					promise.always(function() {
						expect(promise._state).toBe('rejected');
					});
				});
			});
		});
});