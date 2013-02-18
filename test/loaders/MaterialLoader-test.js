define([
	'goo/loaders/Loader',
	'goo/loaders/MaterialLoader',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Texture',
	'goo/shapes/ShapeCreator',
	'lib/rsvp.amd',
	'goo/entities/GooRunner'
	],
function(
	Loader,
	MaterialLoader,
	Material,
	ShaderLib,
	ShapeCreator,
	Texture,
	RSVP,
	GooRunner
	) {
	'use strict';


	describe('MaterialLoader', function() {
		var loader = new Loader({rootPath: 'foo'});
		var ml;

		beforeEach(function() {
			
			var loaderSettings = {
				loader: loader
			};

			ml = new MaterialLoader(loaderSettings);
		});

		describe('.load()', function() {
			it('creates a material from material definition', function() {
				loader.load = function(path, parser) {
					var p = new RSVP.Promise();
						
					if(path === 'material.mat') {
						return parser({
							"shader": "shaders/texturedLit.shader",
							"uniforms": {
								"ambient": [0.2, 0.2, 0.2],
								"diffuse": [1.0, 0.3, 0.5, 0.1],
								"diffuseTexture": "textures/grid.png"
							}
						}, path);
					} else if(path === 'shaders/texturedLit.shader') {
						p.resolve({
							vs: 'vs',
							fs: 'fs'
						});
					} else if(path === 'vs') {
						p.resolve(ShaderLib.texturedLit.vshader);
					} else if(path === 'fs') {
						p.resolve(ShaderLib.texturedLit.fshader);
					} else {
						console.log(path);
						console.log(parser);
						p.reject();
					}

					return p;
				}
				loader.loadImage = function(path) {
					var p = new RSVP.Promise();

					p.resolve(new Image());

					return p;
				}

				var p = ml.load('material.mat');

				waitsFor(function() {
					return p.isResolved;
				}, 'promise did not get resolved', 1);

				p.then(function(data) {
					expect(data instanceof Material).toBeTruthy();
				});

			});

			it('rejects if the material definition was empty', function() {
				loader.load = function(path, parser) {
					if(path === 'material.mat') {
						return parser({}, path);
					} else {
						console.log(path);
						console.log(parser);
					}
				};

				var p = ml.load('material.mat');

				waitsFor(function() {
					return p.isRejected;
				}, 'promise did not get rejected', 1);

			});
		});
	});
});