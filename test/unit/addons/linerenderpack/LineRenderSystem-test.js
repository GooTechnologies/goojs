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
			lineRenderSystem = new LineRenderSystem(world);
		});

		it('can construct', function () {
			expect(lineRenderSystem).toBeDefined();
		});

		describe('encodeColor', function () {
			it('can encode white', function () {

				var encodedColor = lineRenderSystem.encodeColor(lineRenderSystem.WHITE);

				expect(encodedColor).toBe(16777215);
			});

			it('can encode red', function () {

				var encodedColor = lineRenderSystem.encodeColor(lineRenderSystem.RED);

				expect(encodedColor).toBe(16711680);
			});

			it('can encode green', function () {

				var encodedColor = lineRenderSystem.encodeColor(lineRenderSystem.GREEN);

				expect(encodedColor).toBe(65280);
			});

			it('can encode blue', function () {

				var encodedColor = lineRenderSystem.encodeColor(lineRenderSystem.BLUE);

				expect(encodedColor).toBe(255);
			});

			it('can encode black', function () {

				var encodedColor = lineRenderSystem.encodeColor(lineRenderSystem.BLACK);

				expect(encodedColor).toBe(0);
			});
		});

		it('can drawLine', function () {

			//draw a red line between 0,0,0 and 1,1,1
			lineRenderSystem.drawLine(Vector3.ZERO, Vector3.ONE, Vector3.UNIT_X);

			expect(lineRenderSystem._lineRendererKeys.length).toBe(1);
		});

		it('can drawCross', function () {

			//draw a red cross at 0,0,0
			lineRenderSystem.drawCross(Vector3.ZERO, Vector3.UNIT_X);

			expect(lineRenderSystem._lineRendererKeys.length).toBe(1);
		});

	});
});