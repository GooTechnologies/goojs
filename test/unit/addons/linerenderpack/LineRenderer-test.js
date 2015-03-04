define([
	'goo/entities/World',
	'goo/math/Vector3',
	'goo/addons/linerenderpack/LineRenderer'
], function (World,
			 Vector3,
			 LineRenderer) {
	'use strict';

	describe('LineRenderer', function () {
		var world;
		var lineRenderer;

		beforeEach(function () {
			world = new World();
		});

		it('can construct', function () {
			lineRenderer = new LineRenderer(world, new Vector3(1, 1, 1));

			expect(lineRenderer).toBeDefined();
		});

	});
});