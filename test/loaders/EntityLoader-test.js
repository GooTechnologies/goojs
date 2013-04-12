define([
	'goo/loaders/Loader',
	'goo/loaders/EntityLoader',
	'goo/renderer/Material',
	'goo/shapes/ShapeCreator',
	'goo/lib/rsvp.amd',
	'goo/entities/GooRunner'
	],
function(
	Loader,
	EntityLoader,
	Material,
	ShapeCreator,
	RSVP,
	GooRunner
	) {
	'use strict';


	describe('EntityLoader', function() {
		var goo;
		var loader = new Loader({rootPath: 'foo'});
		var el;

		beforeEach(function() {
			goo = new GooRunner();

			var loaderSettings = {
				world: goo.world,
				loader: loader
			};

			el = new EntityLoader(loaderSettings);
		});

		afterEach(function() {
			goo = null;
		});

		describe('.load()', function() {
			it('creates an entity from loaded components', function() {
				loader.load = function(path, parser) {
					if(path === 'entity.ent') {
						return parser({
							"components": {
								"transform": {
									"translation": [0, 0, -5],
									"rotation": [0, 0, 0],
									"scale": [1, 1, 1]
								},
								"meshRenderer": {
									"materialRefs": [
										"materials/plastic.mat"
									]
								},
								"meshData": {
									"meshRef": "meshes/cube.mesh"
								},
								"camera": {
									"fov": 45,
									"near": 1,
									"far": 1000
								}
							}
						}, path);
					} else if(path === 'materials/plastic.mat') {
						var p = new RSVP.Promise();

						p.resolve(new Material('Kanelbulle'));

						return p;
					} else if(path === 'meshes/cube.mesh') {
						var p = new RSVP.Promise();

						p.resolve(ShapeCreator.createBox(1, 2, 3, 4, 5));

						return p;
					} else {
						console.log(path);
						console.log(parser);
					}
				};

				var p = el.load('entity.ent');

				waitsFor(function() {
					return p.isResolved;
				}, 'promise did not get resolved', 1);

				p.then(function(data) {
					expect(data.transformComponent).toBeDefined();
					expect(data.meshDataComponent).toBeDefined();
					expect(data.cameraComponent).toBeDefined();
				});

			});

			it('rejects if there were no components', function() {
				loader.load = function(path, parser) {
					if(path === 'entity.ent') {
						return parser({}, path);
					} else {
						console.log(path);
						console.log(parser);
					}
				};

				var p = el.load('entity.ent');

				waitsFor(function() {
					return p.isRejected;
				}, 'promise did not get rejected', 1);

			});
		});
	});
});