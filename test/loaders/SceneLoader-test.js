define([
	'goo/loaders/Loader',
	'goo/loaders/SceneLoader',
	'goo/entities/Entity',
	'goo/lib/rsvp.amd',
	'goo/entities/GooRunner'
	],
function(
	Loader,
	SceneLoader,
	Entity,
	RSVP,
	GooRunner
	) {
	'use strict';


	describe('SceneLoader', function() {
		var goo;
		var loader = new Loader({rootPath: 'foo'});
		var sl;

		beforeEach(function() {
			goo = new GooRunner();

			var loaderSettings = {
				world: goo.world,
				loader: loader
			};

			sl = new SceneLoader(loaderSettings);
		});

		afterEach(function() {
			goo = null;
		});

		describe('.load()', function() {
			it('creates a world from the loaded entities', function() {
				loader.load = function(path, parser) {
					if(path === 'scene') {
						return parser({
							files: [
								'entity.ent.json'
							]
						}, path);
					} else if(path === 'scene/entity.ent.json') {
						var p = new RSVP.Promise();

						p.resolve(new Entity(goo.world, 'Bruce'));

						return p;
					} else {
						console.log(path);
						console.log(parser);
					}
				};

				var p = sl.load('scene');

				waitsFor(function() {
					return p.isResolved;
				}, 'promise did not get resolved', 1);

				p.then(function(data) {
					expect(data).toBe(goo.world);
					expect(data.entityManager.getEntityByName('Bruce')).toBeTruthy();
				});

			});

			it('rejects if there were no entities', function() {
				loader.load = function(path, parser) {
					if(path === 'scene') {
						return parser({
							files: []
						}, path);
					} else {
						console.log(path);
						console.log(parser);
					}
				};

				var p = sl.load('scene');

				waitsFor(function() {
					return p.isRejected;
				}, 'promise did not get rejected', 1);

			});
		});
	});
});