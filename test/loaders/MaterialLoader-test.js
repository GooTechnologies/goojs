define([
		'goo/loaders/MaterialLoader',
		'goo/util/Promise',
		'goo/util/Ajax',
		'goo/renderer/Material'
	],
	function(
		MaterialLoader,
		Promise,
		Ajax,
		Material
	) {
	'use strict';

	var TestResponses = {
		'material' : {
			readyState : 4,
			status : 200,
			responseText : '{"shader": "goodShaderSource","uniforms": {"ambient": [0.2, 0.2, 0.2],"diffuseTexture": "textures/grid.png"}}',
			responseHeader : {
				'Content-Type' : 'application/json'
			}
		},
		'badMaterial' : {
			readyState : 4,
			status : 200,
			responseText : '{shader": "goodShaderSource","uniforms": {"ambient": [0.2, 0.2, 0.2],"diffuseTexture": "textures/grid.png"}}',
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
		},
		'badShaderSource.json' : {
			readyState : 4,
			status : 200,
			responseText : '{ vs": "goodVertexShaderSource", "fs": "goodFragmentShaderSource" }',
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
		}
		
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
			
			for(var key in response) this[key] = response[key];

			this.onreadystatechange();
		}
		
		MockXHR.prototype.getResponseHeader = function(header) {
			return this.responseHeader[header] ? this.responseHeader[header] : null;
		}

		return MockXHR;
	};

	describe('MaterialLoader', function() {
		var loader;
		var goo;
		var projectURL;
		var sceneURL;
		var XHR = XMLHttpRequest;

		beforeEach(function() {
			XMLHttpRequest = MockXHRBuilder(TestResponses);

			loader = new MaterialLoader();
		});

		afterEach(function() {
			XMLHttpRequest = XHR; // Restore the XHR definition, just in case
			loader = null;
		});

		it("has an empty string as project URL when nothing is passed to the constructor", function() {
			var aLoader = new MaterialLoader();

			expect(aLoader._rootUrl).toBe('');
		});

		it("sets the project URL when passed to the constructor", function() {
			var aLoader = new MaterialLoader('pancakes');

			expect(aLoader._rootUrl).toBe('pancakes');
		});

		describe('.setRootUrl()', function() {

			it("sets the root url", function() {
				loader.setRootUrl('bacon');

				expect(loader._rootUrl).toBe('bacon');
			});
		});

		describe('.load()', function() {

			it('resolves its promise and creates a new Material from a correct URL', function() {
				spyOn(loader, '_resolve').andCallThrough();

				loader.load('material');
				
				expect(loader._resolve).toHaveBeenCalled();
				expect(loader._state).toBe('resolved');

				loader
					.done(function(data) {
						expect(data.__proto__).toBe(Material.prototype);
						expect(data.shader.fragmentSource).toBe('goodFragmentShader');
						expect(data.shader.vertexSource).toBe('goodVertexShader');
					})
			});

			it('rejects its promise from a bad URL', function() {
				spyOn(loader, '_reject').andCallThrough();

				loader.load('404');

				expect(loader._reject).toHaveBeenCalled();
				expect(loader._state).toBe('rejected');
			});

			it('rejects its promise when the URL response isn\'t valid JSON', function() {
				spyOn(loader, '_reject').andCallThrough();

				loader.load('badMaterial');

				expect(loader._reject).toHaveBeenCalled();
				expect(loader._state).toBe('rejected');
			});
		});

	});
});