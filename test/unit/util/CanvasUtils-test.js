define([
	'goo/util/CanvasUtils'
],
function (
	CanvasUtils
) {
	'use strict';

	describe('CanvasUtils', function () {

		describe("Rendering an SVG to canvas", function () {

			var renderSize = 300;
			var options = {
				width: renderSize,
				height: renderSize
			};

			it('should create an canvas element with the given dimensions', function (done) {

				var data = "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100'>" +
					'<rect x="0" y="0" width="200" height="100" fill="blue" />' +
					"</svg>";

				CanvasUtils.renderSvgToCanvas(data, options, function (canvas) {
					expect(canvas).toEqual(jasmine.any(HTMLCanvasElement));
					expect(canvas.width).toEqual(options.width);
					expect(canvas.height).toEqual(options.height);
					done();
				});
			});

			describe("when SVG data is corrupt", function () {
				it('should fire the callback with no argument (undefined)', function (done) {

					var data = "<svg xmlns='http://www.w3.org/2000/svg' oh wait what?";

					CanvasUtils.renderSvgToCanvas(data, options, function (canvas) {
						expect(canvas).toBeUndefined();
						done();
					});
				});
			});
		});
	});
});
