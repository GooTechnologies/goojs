require({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require([
	'goo/noise/Noise',
	'goo/noise/ValueNoise'
], function(Noise, ValueNoise) {
	'use strict';

	var canvas = document.querySelector("canvas");
	var context = canvas.getContext("2d");
	var image = context.createImageData(256, 256);

	for (var y = 0; y < 256; y++)
	for (var x = 0; x < 256; x++)
	{
		var offset = (y*256 + x)*4;
		var value = Math.floor(Noise.fractal2d(x, y, 256.0, 16, 0.75, 2.0, ValueNoise)*255.0);

		image.data[offset + 0] = value;
		image.data[offset + 1] = value;
		image.data[offset + 2] = value;
		image.data[offset + 3] = 255;
	}

	context.putImageData(image, 0, 0);
});