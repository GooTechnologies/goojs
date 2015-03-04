define([
	'goo/entities/World',
	'goo/math/Vector3',
	'goo/addons/linerenderpack/LineRenderer',
	'goo/addons/linerenderpack/LineRenderSystem'
], function (World,
			 Vector3,
			 LineRenderer,
			 LineRenderSystem) {
	'use strict';

	describe('LineRenderSystem', function () {
		var world;
		var lineRenderSystem;

		beforeEach(function () {
			world = new World();
		});

		it('can construct', function () {
			lineRenderSystem = new LineRenderSystem(world);

			expect(lineRenderSystem).toBeDefined();
		});

	});
});