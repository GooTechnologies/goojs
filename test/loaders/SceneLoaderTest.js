define([
		'goo/loaders/SceneLoader',
		'goo/entities/GooRunner'
	],
	function(
		SceneLoader,
		GooRunner
	) {
	'use strict';

	var TestResponses = {
		'/project/scenes/scene' : {
			readyState : 4,
			status : 200,
			responseText : '{"files":["camera.ent.json","cube.ent.json"],"directories":[]}',
			responseHeader : {
				'Content-Type' : 'application/json'
			}
		},
		'/project/goodVertexShaderSource' : {
			readyState : 4,
			status : 200,
			responseText : 'goodVertexShader',
			responseHeader : {
				'Content-Type' : 'application/octet-stream'
			}
		},
		'/project/goodFragmentShaderSource' : {
			readyState : 4,
			status : 200,
			responseText : 'goodFragmentShader',
			responseHeader : {
				'Content-Type' : 'application/octet-stream'
			}
		},
		'/project/shaders/goodShaderSource.json' : {
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

	describe('SceneLoader', function() {
		var s;
		var goo;
		var projectURL;
		var sceneURL;
		var XHR = XMLHttpRequest;

		beforeEach(function() {
			XMLHttpRequest = MockXHRBuilder(TestResponses);

			// Create typical goo application
			goo = new GooRunner({
				showStats : false
			});
			
			s = new SceneLoader(goo);
			s.projectURL = '/project/';

			//s.toggleVerbal(true);
		});

		afterEach(function() {
			XMLHttpRequest = XHR; // Restore the XHR definition, just in case
			s = null;
		});

		describe('.loadScene()', function() {

			it("puts the lotion on the skin", function() {
				XMLHttpRequest = MockXHRBuilder(TestResponses);

				s.projectURL = undefined; // Just for this method we want to check that this get's set

				expect(s.projectURL).toBe(undefined);

				spyOn(s, '_parseScene').andCallThrough();
				s.loadScene('/project/', 'scenes/scene');


				expect(s.projectURL).toBe('/project/');
				expect(s.sceneURL).toBe('scenes/scene');


				expect(s._parseScene).toHaveBeenCalled();
			});

			it("or it gets the hose", function() {
				
			});
		});

		describe('.load()', function() {
			it("is yet to be tested...", function() {});
		});

		describe('.handleSuccessfulRequest()', function() {
			it("is yet to be tested...", function() {});
		});

		describe('._parseScene()', function() {
			it("is yet to be tested...", function() {});
		});

		describe('._parseEntity()', function() {
			it("is yet to be tested...", function() {});
		});

		describe('._parseMeshRenderer()', function() {
			it("is yet to be tested...", function() {});
		});

		describe('._parseMeshDataComponent()', function() {
			it("is yet to be tested...", function() {});
		});

		describe('._parseMeshData()', function() {
			it("is yet to be tested...", function() {});
		});

		describe('._parseMaterial()', function() {
			
			it("will, as a callback argument, return a Material based on a valid materialDataSource", function() {
				var materialDataSource = {
					shader: 'shaders/goodShaderSource',
					uniforms: {
						ambient: [0.1, 0.2, 0.3]
					}
				};
				var material;

				s._parseMaterial(materialDataSource, function(mat) {
					material = mat;
				});

				console.log(material);
				//expect(material).toEqual({r:0.1, g:0.2, b:0.3, a:1.0});
				//expect(material.);
			});

		});

		describe('._parseShaderDefinition()', function() {

			it("will, as a callback argument, return a shaderDefinition based on two external shader files that exist", function() {
				var shaderSource = {
					vs : 'goodVertexShaderSource',
					fs : 'goodFragmentShaderSource'
				};
				var shaderDef;

				s._parseShaderDefinition(shaderSource, function(sd) {
					shaderDef = sd;
				});

				expect(shaderDef.vshader).toEqual('goodVertexShader');
				expect(shaderDef.fshader).toEqual('goodFragmentShader');
			});

			it("will, as a callback argument, return null if the vertex/fragment shader source file doesn't exist", function() {
				// VS
				var shaderSource = {
					vs : 'nonexistent',
					fs : 'goodFragmentShaderSource'
				};
				var shaderDef;

				s._parseShaderDefinition(shaderSource, function(sd) {
					shaderDef = sd;
				});

				expect(shaderDef).toBe(null);

				// FS
				var shaderSource = {
					vs : 'goodVertexShader',
					fs : 'nonexistent'
				};
				var shaderDef;

				s._parseShaderDefinition(shaderSource, function(sd) {
					shaderDef = sd;
				});

				expect(shaderDef).toBe(null);
			});

		});


	});
});
