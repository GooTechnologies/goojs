define([
		'goo/loaders/Loader',
		'goo/loaders/MaterialLoader',
		'goo/util/Deferred',
		'goo/util/Promise',
		'goo/util/Ajax',
		'goo/renderer/Material'
	],
	function(
		Loader,
		MaterialLoader,
		Deferred,
		Promise,
		Ajax,
		Material
	) {
	'use strict';

	var TestResponses = {
		'material.mat.json' : {
			readyState : 4,
			status : 200,
			responseText : '{"shader": "goodShaderSource.shader","uniforms": {"ambient": [0.2, 0.2, 0.2],"diffuseTexture": "textures/grid.png"}}',
			responseHeader : {
				'Content-Type' : 'application/json'
			}
		},
		'badMaterial.mat.json' : {
			readyState : 4,
			status : 200,
			responseText : '{shader": "goodShaderSource.shader","uniforms": {"ambient": [0.2, 0.2, 0.2],"diffuseTexture": "textures/grid.png"}}',
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
		},
		'badShaderSource.shader.json' : {
			readyState : 4,
			status : 200,
			responseText : '{ vs": "goodVertexShaderSource.vs.glsl", "fs": "goodFragmentShaderSource.fs.glsl" }',
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

	describe('MaterialLoader', function() {
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

			loader = new MaterialLoader(loaderSettings);
		});

		afterEach(function() {
			XMLHttpRequest = XHR; // Restore the XHR definition, just in case
			loader = null;
		});


		describe('.load()', function() {

			it('resolves its promise and creates a new Material from a correct URL', function() {
				var promise = loader.load('material.mat');

				promise
					.done(function(data) {
						expect(data instanceof Material).toBeTruthy();
						expect(data.shader.fragmentSource).toBe('goodFragmentShader');
						expect(data.shader.vertexSource).toBe('goodVertexShader');
					})
					.always(function() {
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
				var promise = loader.load('badMaterial.mat');

				promise.always(function() {
					expect(promise._state).toBe('rejected');
				});
			});

			it('loads are unique with every call', function() {

				var promise1 = loader.load('material.mat'),
					promise2 = loader.load('material.mat');

				Deferred.when(promise1, promise2)
					.done(function(data) {
						// Do some checks
						expect(data[0]).not.toBe(data[1]);
					})
					.fail(function() {
						// Fail test if we come here
						expect('success').toBe('failure');
					});
			});
		});

	});
});