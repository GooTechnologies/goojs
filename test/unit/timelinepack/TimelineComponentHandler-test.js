define([
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/loaders/DynamicLoader',
	'test/loaders/Configs',
	'goo/timelinepack/TimelineComponent',
	'goo/timelinepack/TimelineComponentHandler'
], function(
	World,
	Material,
	DynamicLoader,
	Configs,
	TimelineComponent,
	TimelineComponentHandler
	) {
	'use strict';

	describe('TimelineComponentHandler', function () {
		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: './',
				ajax: false
			});
		});

		it('loads an entity with a timeline component', function (done) {
			var config = Configs.entity(['timeline']);
			loader.preload(Configs.get());

			loader.load(config.id).then(function (entity) {
				expect(entity.timelineComponent).toEqual(jasmine.any(TimelineComponent));

				//
				expect(entity.timelineComponent.channels.length).toEqual(2);
				expect(entity.timelineComponent.channels[0].keyframes.length).toEqual(3);
				expect(entity.timelineComponent.channels[1].keyframes.length).toEqual(2);

				done();
			});
		});
	});
});