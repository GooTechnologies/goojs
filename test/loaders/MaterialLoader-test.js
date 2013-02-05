define([
		'goo/loaders/MaterialLoader'
	],
	function(
		MaterialLoader
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

		it("has an empty project URL when nothing is passed to the constructor", function() {
			var aLoader = new MaterialLoader();

			expect(aLoader._rootUrl).toBe(undefined);
		});

		it("sets the project URL when passed to the constructor", function() {
			var 
		});

		describe('.load()', function() {

			it("puts the lotion on the skin", function() {
				XMLHttpRequest = MockXHRBuilder(TestResponses);

				
			});
		});

		describe('._parseShaderDefinition()', function() {

			it("will, as a callback argument, return a shaderDefinition based on two external shader files that exist", function() {
				var shaderSource = {
					vs : 'goodVertexShaderSource',
					fs : 'goodFragmentShaderSource'
				};
				
			});

			it("will, as a callback argument, return null if the vertex/fragment shader source file doesn't exist", function() {
				// VS
				var shaderSource = {
					vs : 'nonexistent',
					fs : 'goodFragmentShaderSource'
				};
				var shaderDef;


				// FS
				var shaderSource = {
					vs : 'goodVertexShader',
					fs : 'nonexistent'
				};
				var shaderDef;

				loader._parseShaderDefinition(shaderSource, function(sd) {
					shaderDef = sd;
				});

				expect(shaderDef).toBe(null);
			});

		});


	});
});
