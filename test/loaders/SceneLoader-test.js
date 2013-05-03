define([
	'goo/loaders/Loader',
	'goo/loaders/SceneLoader',
	'goo/entities/Entity',
	'goo/util/rsvp',
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
							entityRefs: [
								'entities/entity.ent'
							]
						}, path);
					} else if(path === 'entities/entity.ent') {
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
					expect(data[0] instanceof Entity).toBeTruthy();
					expect(data.entityManager.getEntityByName('Bruce')).toBeTruthy();
				});

			});

			it('resolves as an empty array if there is no `entityRefs`', function() {
				loader.load = function(path, parser) {
					return parser({}, path);
				};

				var p = sl.load('scene');

				p.then(function(data) {
					expect(data.length).toEqual(0);
				});

				waitsFor(function() {
					return p.isResolved;
				}, 'promise did not get resolved', 1);
			});
		});
	});
});
