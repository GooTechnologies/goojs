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
			lineRenderer = new LineRenderer(world, Vector3.ONE);

			expect(lineRenderer).toBeDefined();
		});

		it('can add line', function () {
			lineRenderer = new LineRenderer(world, Vector3.ONE);

			lineRenderer._addLine(Vector3.ZERO, Vector3.ONE);

			//expect _numRenderingLines to have incremented
			expect(lineRenderer._numRenderingLines).toBe(1);
		});

		it('can add to renderList', function () {
			lineRenderer = new LineRenderer(world, Vector3.ONE);
			var renderList = [];

			lineRenderer._addLine(Vector3.ZERO, Vector3.ONE);

			lineRenderer._manageRenderList(renderList);

			//expect an element in the renderList array
			expect(renderList.length).toBe(1);
		});

		it('can remove from renderList', function () {
			lineRenderer = new LineRenderer(world, Vector3.ONE);
			var renderList = [];

			lineRenderer._addLine(Vector3.ZERO, Vector3.ONE);

			//simulate two frames
			for (var i = 0; i < 2; i++) {
				lineRenderer._updateVertexData();
				lineRenderer._manageRenderList(renderList);
				lineRenderer._clear();
			}

			//expect no elements in the renderList array
			expect(renderList.length).toBe(0);
		});

	});
});