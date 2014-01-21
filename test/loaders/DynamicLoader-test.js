define([
	'goo/entities/World',
	'goo/entities/Entity',
	'goo/entities/components/TransformComponent',
	'goo/loaders/DynamicLoader',
	'goo/util/rsvp',
	'goo/util/ObjectUtil'
], function(
	World,
	Entity,
	TransformComponent,
	DynamicLoader,
	RSVP,
	_
) {
	'use strict';

	var objectBase = {
		id: 'asdf.entity',
		name: 'Testing entity',
		license: 'CC0',
		orignalLicense: 'CC0',

		created: '2014-01-11T13:29:12+00:00',
		modified: '2014-01-11T13:29:12+00:00',

		public: true,
		owner: 'rickard',
		readonly: false,
		description: 'Dummy Entity',
		deleted: false,

		dataModelVersion: 2
	};

	var components = {
		transform: {
			translation: [10,20,30],
			rotation: [10,20,30],
			scale: [2,2,2]
		}
	};

	function randomRef(type) {
		return Math.random().toString(16) + '.' + type;
	}

	describe('DynamicLoader', function() {
		var world, loader, bundle;
		beforeEach(function() {
			world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});

			// To be able to preload bundle
			bundle = {};
		});

		it('loads bundle', function() {
			// Create a bundlewrapper to preload and skip ajax
			var bundleKey = randomRef('bundle');
			var bundleWrapper = {};
			bundleWrapper[bundleKey] = bundle;

			// Populate the bundle
			var entity = {
				components: {}
			};
			_.extend(entity, objectBase);
			var entKey = randomRef('entity');
			bundle[entKey] = entity;

			// Preload
			loader.preload(bundleWrapper);

			// Load bundle
			var p = loader.load(bundleKey).then(function() {
				var keys = Object.keys(loader._configs);

				expect(keys).toContain(entKey);
				expect(loader._configs[entKey].components).toBeDefined();
			});

			waitsFor(function() { return p.isResolved; }, 'promise does not get resolved', 1);
		});

		describe('EntityHandler', function() {
			var entity, entKey;
			beforeEach(function() {
				entity = {
					components: {}
				};
				entKey = randomRef('entity');
				bundle[entKey] = entity;
			});
			it('loads an empty entity', function() {
				// Prefill loader
				loader.preload(bundle);

				var p = loader.load(entKey).then(function(entity) {
					expect(entity).toEqual(jasmine.any(Entity));
					expect(entity.id).toBe(entKey);
				});
				waitsFor(function() { return p.isResolved; }, 'promise does not get resolved', 1);
			});
			describe('TransformComponent', function() {
				beforeEach(function() {
					entity.components.transform = components.transform;
					loader.preload(bundle);

					this.addMatchers({
						toNearlyEqual: function(expected) {
							var epsilon = 1e-5;
							if (this.actual.length) {
								var len = this.actual.length;
								if (len !== expected.length) {
									return false;
								}
								while (len--) {
									if (Math.abs(this.actual[len] - expected[len]) > epsilon) {
										return false;
									}
								}
								return true;
							} else {
								return Math.abs(this.actual - expected) <= epsilon;
							}
						}
					});

				});
				it('load an entity with a transformComponent', function() {
					var p = loader.load(entKey).then(function(entity) {
						expect(entity.transformComponent).toEqual(jasmine.any(TransformComponent));
					});

					waitsFor(function() { return p.isResolved; }, 'promise does not get resolved', 1);
				});
				it('has correct transform', function() {
					var config = entity.components.transform;
					var p = loader.load(entKey).then(function(entity) {
						var t = entity.transformComponent.transform;
						expect(t.translation.data).toEqual(config.translation);
						expect(t.scale.data).toEqual(config.scale);
						var rotation = t.rotation.toAngles().data;
						rotation[0] *= 180 / Math.PI;
						rotation[1] *= 180 / Math.PI;
						rotation[2] *= 180 / Math.PI;
						expect(rotation).toNearlyEqual(config.rotation);
					});
					waitsFor(function() { return p.isResolved; }, 'promise does not get resolved', 1);
				});
				it('updates correctly', function() {
					var component, config;
					var p = loader.load(entKey).then(function(entity) {
						component = entity.transformComponent;
						config = {
							components: {
								transform: {
									translation: [0,0,2],
									scale: [0,0,2],
									rotation: [2,2,2]
								}
							}
						};
						return loader.update(entKey, config);
					}).then(function(entity) {
						expect(entity.transformComponent).toBe(component);

						var t = entity.transformComponent.transform;
						var tr = config.components.transform;
						expect(t.translation.data).toEqual(tr.translation);
						expect(t.scale.data).toEqual(tr.scale);
						var rotation = t.rotation.toAngles().data;
						rotation[0] *= 180 / Math.PI;
						rotation[1] *= 180 / Math.PI;
						rotation[2] *= 180 / Math.PI;
						expect(rotation).toNearlyEqual(tr.rotation);

					});
					waitsFor(function() { return p.isResolved; }, 'promise does not get resolved', 1);
				});
				/*
				it('adds hierarchy correctly', function() {

				});
				*/
			});
		});



	});

});