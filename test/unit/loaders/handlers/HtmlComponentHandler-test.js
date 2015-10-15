define([
	'goo/entities/World',
	'goo/entities/components/HtmlComponent',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs'
], function (
	World,
	HtmlComponent,
	DynamicLoader,
	Configs
) {
	'use strict';

	describe('HtmlComponentHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			world.gooRunner = {
				renderer: {
					domElement: document.createElement('div')
				}
			};

			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with an htmlComponent', function (done) {
			var config = Configs.entity(['html']);
			loader.preload(Configs.get());
			loader.load(config.id).then(function (entity) {
				expect(entity.htmlComponent).toEqual(jasmine.any(HtmlComponent));
				expect(entity.htmlComponent.useTransformComponent).toBeTruthy();
				expect(/[^\-\w]/.test(entity.htmlComponent.domElement.id)).toBeFalsy();
				expect(document.getElementById(entity.htmlComponent.domElement.id)).not.toBeNull();
				done();
			}, function () {
				expect('').toEqual('Should never get here');
				done();
			});
		});

		it('removes an html entity', function (done) {
			var config = Configs.entity(['html']);
			loader.preload(Configs.get());

			var entity, htmlComponent;
			loader.load(config.id).then(function (_entity) {
				entity = _entity;
				htmlComponent = entity.htmlComponent;
				return loader.remove(config.id);
			}).then(function () {
				expect(entity.htmlComponent).toBeUndefined();
				expect(document.getElementById(htmlComponent.domElement.id)).toBeNull();
				done();
			}, function () {
				expect('').toEqual('Should never get here');
				done();
			});
		});
	});
});