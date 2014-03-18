require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/QuadComponent',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'../../lib/V',
	'goo/renderer/TextureCreator',
], function(
	GooRunner,
	Material,
	ShaderLib,
	QuadComponent,
	Vector3,
	Box,
	Sphere,
	Torus,
	V,
	TextureCreator
) {
	'use strict';

	var resourcePath = '../../resources';

	var goo = V.initGoo();
	var world = goo.world;

	var material = new Material(ShaderLib.texturedLit);
	var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
	material.setTexture('DIFFUSE_MAP', texture);
	var quadComponent = new QuadComponent(material);

	var quad = world.createEntity()
		.setComponent(quadComponent)
		.addToWorld();

	quad.set(material);

	V.addLights();

	V.addOrbitCamera(new Vector3(3, Math.PI / 2, 0.3));
});