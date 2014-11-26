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
				console.log(entity.htmlComponent.domElement.id);
				expect(/[^\-\w]/.test(entity.htmlComponent.domElement.id)).toBeFalsy();
				expect(document.getElementById(entity.htmlComponent.domElement.id)).not.toBeNull();
				done();
			});
		});
	});
});