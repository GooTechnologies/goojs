require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/quadpack/QuadComponent',
	'goo/math/Vector3',
	'lib/V'
], function(
	GooRunner,
	Material,
	ShaderLib,
	QuadComponent,
	Vector3,
	V
) {
	'use strict';

	var goo = V.initGoo();
	var world = goo.world;

	var data =	"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100'>" +
				'<rect x="0" y="0" width="200" height="100" stroke="black" stroke-width="3" fill="blue" fill-opacity="0.5" />'+
				'<circle cx="100" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />'+
				"</svg>";

	var img = new Image();
	var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
	var DOMURL = window.URL || window.webkitURL || window;
	var url = DOMURL.createObjectURL(svg);
	img.src = url;
	img.onload = function(){
		var quad1 = new QuadComponent(img);
		var quad2 = new QuadComponent(img);
		var entity1 = world.createEntity().setComponent(quad1).addToWorld();
		var entity2 = world.createEntity().setComponent(quad2).addToWorld();

		var scale = new Vector3(10, 10, 10);
		entity1.transformComponent.setScale(scale);
		entity2.transformComponent.setScale(scale);
		entity1.transformComponent.setTranslation(new Vector3(0, 0, -2));
		entity2.transformComponent.setTranslation(new Vector3(0, 0, 2));
	};

	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));

	V.process();
});