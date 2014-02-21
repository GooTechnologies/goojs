define([
	'goo/entities/World',
	'goo/loaders/DynamicLoader',
	'loaders/Configs',

	'goo/entities/components/TransformComponent'
], function(
	World,
	DynamicLoader,
	Configs,

	TransformComponent
) {
	'use strict';

	function wait(promise, time) {
		time = time || 1;
		waitsFor(function() { return promise.isResolved; }, 'promise does not get resolved', time);
	}

	describe('TransformComponentHandler', function() {
		var loader;
		beforeEach(function() {
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

			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with a transformComponent', function() {
			var config = Configs.entity(['transform']);
			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				expect(entity.transformComponent).toEqual(jasmine.any(TransformComponent));
			});
			wait(p);
		});

		it('loads the correct transform', function() {
			var config = Configs.entity(['transform']);
			config.components.transform.translation = [1,2,3];
			config.components.transform.rotation = [4,5,6];
			config.components.transform.scale = [7,8,9];

			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				var t = entity.transformComponent.transform;
				var ct = config.components.transform;
				expect(t.translation.data).toEqual(ct.translation);
				expect(t.scale.data).toEqual(ct.scale);
				var rotation = t.rotation.toAngles().data;
				rotation[0] *= 180 / Math.PI;
				rotation[1] *= 180 / Math.PI;
				rotation[2] *= 180 / Math.PI;
				expect(rotation).toNearlyEqual(ct.rotation);
			});
			wait(p);
		});

		it('updates existing transformcomponent', function() {
			var component;
			var config = Configs.entity(['transform']);

			var newConfig = Configs.entity(['transform']);
			newConfig.components.transform.translation = [1,2,3];
			newConfig.id = config.id;

			loader.preload(Configs.get());
			var p = loader.load(config.id).then(function(entity) {
				component = entity.transformComponent;

				return loader.update(config.id, newConfig);
			}).then(function(entity) {
				expect(entity.transformComponent).toBe(component);

				var t = entity.transformComponent.transform;
				var ct = newConfig.components.transform;
				expect(t.translation.data).toEqual(ct.translation);
				expect(t.scale.data).toEqual(ct.scale);
				var rotation = t.rotation.toAngles().data;
				rotation[0] *= 180 / Math.PI;
				rotation[1] *= 180 / Math.PI;
				rotation[2] *= 180 / Math.PI;
				expect(rotation).toNearlyEqual(ct.rotation);

			});
			wait(p);
		});

		it('adds hierarchy correctly', function() {
			var parentConfig = Configs.entity(['transform']);
			var childConfig = Configs.entity(['transform']);
			Configs.attachChild(parentConfig, childConfig);

			loader.preload(Configs.get());

			var p = loader.load(parentConfig.id).then(function(entity) {
				expect(entity.transformComponent.children.length).toBeGreaterThan(0);

				var child = entity.transformComponent.children[0];
				expect(child).toEqual(jasmine.any(TransformComponent));
				expect(child.entity.id).toBe(childConfig.id);
				expect(child.parent).toBe(entity.transformComponent);
			});
			wait(p);
		});
	});



});