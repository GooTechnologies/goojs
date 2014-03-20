define([
	'goo/util/CanvasUtils'
],
function(
	CanvasUtils
) {
	'use strict';

	describe('CanvasUtils', function() {

		beforeEach(function(){
		});

		it('renders an SVG to canvas', function() {
			var data =	"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100'>" +
						'<rect x="0" y="0" width="200" height="100" fill="blue" />'+
						"</svg>";

			var done = false;
			var renderSize = 300;
			var cu = new CanvasUtils();
			var options = {
				width: renderSize,
				height: renderSize
			};
			cu.renderSvgToCanvas(data, options, function(canvas){
				expect(canvas).toEqual(jasmine.any(HTMLCanvasElement));
				expect(canvas.width).toEqual(options.width);
				expect(canvas.height).toEqual(options.height);
				done = true;
			});

			waitsFor(function(){
				return done;
			},'didnt get canvas!',1000);
		});

	});
});