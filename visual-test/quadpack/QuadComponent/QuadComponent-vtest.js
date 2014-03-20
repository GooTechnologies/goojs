require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/quadpack/QuadComponent',
	'goo/quadpack/QuadSystem',
	'goo/math/Vector3',
	'../../goo/lib/V',
	'goo/renderer/TextureCreator',
	'goo/renderer/Texture',
	'goo/util/CanvasUtils'
], function(
	GooRunner,
	Material,
	ShaderLib,
	QuadComponent,
	QuadSystem,
	Vector3,
	V,
	TextureCreator,
	Texture,
	CanvasUtils
) {
	'use strict';

	var resourcePath = '../../resources';

	var goo = V.initGoo();
	var world = goo.world;

	world.setSystem(new QuadSystem());

	var data =	"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100'>" +
				'<rect x="0" y="0" width="200" height="100" stroke="black" stroke-width="3" fill="blue" fill-opacity="0.5" />'+
				'<circle cx="100" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />'+
				"</svg>";

	var renderSize = 300;
	var cu = new CanvasUtils();
	cu.renderSvgToCanvas(data, {
		resizeToFit:true,
		width:renderSize,
		height:renderSize
	}, function(canvas){
		var texture = new Texture(canvas, {}, canvas.width, canvas.height);
		//new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		var material = new Material(ShaderLib.texturedLit);
		material.blendState.blending = 'CustomBlending';
		material.renderQueue = 2000;
		material.dualTransparency = true;
		material.setTexture('DIFFUSE_MAP', texture);

		var entity1 = world.createEntity()
			.setComponent(new QuadComponent(material))
			.addToWorld();

		var entity2 = world.createEntity()
			.setComponent(new QuadComponent(material))
			.addToWorld();

		var scale = new Vector3(10, 10, 10);
		entity1.transformComponent.setScale(scale);
		entity2.transformComponent.setScale(scale);
		entity1.transformComponent.setTranslation(new Vector3(0, 0, -2));
		entity2.transformComponent.setTranslation(new Vector3(0, 0, 2));
	});

	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));
});