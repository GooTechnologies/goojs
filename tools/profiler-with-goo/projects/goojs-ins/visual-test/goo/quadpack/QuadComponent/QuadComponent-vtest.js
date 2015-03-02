require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/quadpack/QuadComponent',
	'goo/math/Vector3',
	'lib/V'
], function (
	GooRunner,
	Material,
	ShaderLib,
	QuadComponent,
	Vector3,
	V
) {
	'use strict';

	V.describe('The quad component/handler are used to render 2 svgs to double-faced quads');

	var svgData1 =	"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='0 -50 200 150' width='513' height='513'>" +
		'<rect x="0" y="0" width="200" height="100" stroke="black" stroke-width="3" fill="blue" fill-opacity="0.5" />' +
		'<circle cx="100" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />' +
		"</svg>";

	var svgData2 =	"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='0 -50 200 150' width='512' height='512'>" +
		'<rect x="0" y="0" width="200" height="100" stroke="black" stroke-width="3" fill="blue" fill-opacity="0.5" />' +
		'<circle cx="100" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />' +
		"</svg>";

	// 3d test ---
	var goo = V.initGoo();
	var world = goo.world;

	addQuad(svgData1, -5);
	addQuad(svgData2,  5);

	function getImage(svgData) {
		var img = new Image();
		var svg = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
		var DOMURL = window.URL || window.webkitURL || window;
		var url = DOMURL.createObjectURL(svg);
		img.src = url;

		return img;
	}

	function addQuad(svgData, x) {
		var img = getImage(svgData);

		img.onload = function () {
			var quad1 = new QuadComponent(img);
			var quad2 = new QuadComponent(img);
			var entity1 = world.createEntity().setComponent(quad1).addToWorld();
			var entity2 = world.createEntity().setComponent(quad2).addToWorld();

			var scale = new Vector3(5, 5, 5);
			entity1.setScale(scale);
			entity2.setScale(scale);
			entity1.setTranslation([x, 0, -0.5]);
			entity2.setTranslation([x, 0,  0.5]);
		};
	}

	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	V.process();

	// 2d test ---
	draw(createCanvas(), svgData1);
	draw(createCanvas(), svgData2);

	function createCanvas() {
		var canvas = document.createElement('canvas');
		canvas.width = 512;
		canvas.height = 512;

		document.body.appendChild(canvas);

		return canvas;
	}

	function draw(canvas, svgData) {
		var img = getImage(svgData);

		img.onload = function () {
			canvas.getContext('2d').drawImage(img, 0, 0);
		};
	}
});