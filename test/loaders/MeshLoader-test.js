define([
	'goo/loaders/Loader',
	'goo/loaders/MeshLoader',
	'goo/renderer/MeshData',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Texture',
	'goo/shapes/ShapeCreator',
	'goo/lib/rsvp.amd',
	'goo/entities/GooRunner'
	],
function(
	Loader,
	MeshLoader,
	MeshData,
	ShaderLib,
	ShapeCreator,
	Texture,
	RSVP,
	GooRunner
	) {
	'use strict';


	describe('MeshLoader', function() {
		var loader = new Loader({rootPath: 'foo'});
		var ml;

		beforeEach(function() {
			
			var loaderSettings = {
				loader: loader
			};

			ml = new MeshLoader(loaderSettings);
		});

		describe('.load()', function() {
			it('creates a mesh from mesh definition', function() {
				loader.load = function(path, parser) {
					var p = new RSVP.Promise();
						
					if(path === 'mesh.mat') {
						return parser({
							"data": {
								"VertexCount": 8,
								"Indices": [0, 1, 3, 2, 3, 1, 4, 7, 5, 6, 5, 7, 0, 4, 1, 5, 1, 4, 1, 5, 2, 6, 2, 5, 2, 6, 3, 7, 3, 6, 4, 0, 7, 3, 7, 0],
								"Vertices": [1.0, 0.9999999403953552, -1.0, 1.0, -1.0, -1.0, -1.0000001192092896, -0.9999998211860657, -1.0, -0.9999996423721313, 1.0000003576278687, -1.0, 1.0000004768371582, 0.999999463558197, 1.0, 0.9999993443489075, -1.0000005960464478, 1.0, -1.0000003576278687, -0.9999996423721313, 1.0, -0.9999999403953552, 1.0, 1.0],
								"Normals": [0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, 0.5773491859436035, 0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, -0.5773491859436035, 0.5773491859436035, -0.5773491859436035, 0.5773491859436035, 0.5773491859436035],
								"TextureCoords": [[0, 1,0,0,1,0,1,1,1,1,1,0,0,0,0,1]],
								"IndexModes": ["Triangles"],
								"IndexLengths": [36]
							},
							"name": "Cube",
							"compressed": false
						}, path);
					} else {
						console.log(path);
						console.log(parser);
						p.reject();
					}

					return p;
				}

				var p = ml.load('mesh.mat');

				waitsFor(function() {
					return p.isResolved;
				}, 'promise did not get resolved', 1);

				p.then(function(data) {
					expect(data instanceof MeshData).toBeTruthy();
				});

			});

			it('rejects if the mesh definition was empty', function() {
				loader.load = function(path, parser) {
					if(path === 'mesh.mat') {
						return parser({}, path);
					} else {
						console.log(path);
						console.log(parser);
					}
				};

				var p = ml.load('mesh.mat');

				waitsFor(function() {
					return p.isRejected;
				}, 'promise did not get rejected', 1);

			});
		});
	});
});