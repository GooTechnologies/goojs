define([
	'goo/entities/World',
	'goo/math/Vector3',
	'goo/addons/linerenderpack/LineRenderer',
	'goo/addons/linerenderpack/LineRenderSystem'
], function (
	World,
	Vector3,
	LineRenderer,
	LineRenderSystem
) {
	'use strict';

	describe('LineRenderSystem', function () {
		var world;
		var lineRenderSystem;

		beforeEach(function () {
			world = new World();
			lineRenderSystem = new LineRenderSystem(world);
		});

		it('can construct', function () {
			expect(lineRenderSystem).toBeDefined();
		});

		it('can drawLine', function () {
			//draw a red line between 0,0,0 and 1,1,1
			lineRenderSystem.drawLine(Vector3.ZERO, Vector3.ONE, lineRenderSystem.RED);

			expect(lineRenderSystem._lineRenderers.length).toBe(1);
		});

		it('can drawCross', function () {
			//draw a red cross at 0,0,0
			lineRenderSystem.drawCross(Vector3.ZERO, lineRenderSystem.RED);

			expect(lineRenderSystem._lineRenderers.length).toBe(1);
		});
	});
});