require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/light/PointLight',
	'goo/renderer/TextureCreator',
	'goo/entities/components/LightComponent',
	'goo/shapes/Box',
	'goo/shapes/Sphere'
], function (
	GooRunner,
	Material,
	ShaderLib,
	Camera,
	CameraComponent,
	ScriptComponent,
	MeshRendererComponent,
	PointLight,
	TextureCreator,
	LightComponent,
	Box,
	Sphere
) {
	'use strict';

	var resourcePath = '../../../resources/';

	// initialize the engine and attach the rendering canvas to the page
	var goo = new GooRunner();
	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	var world = goo.world;

	var boxMesh = new Box();
	var sphereMesh = new Sphere(32, 32);

	var material = new Material(ShaderLib.texturedLit);
	new TextureCreator().loadTexture2D(resourcePath + 'check.png').then(function (texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});

	var box1 = world.createEntity(boxMesh, material).addToWorld();
	var box2 = world.createEntity(boxMesh, material, [2, 2, 0]).addToWorld();
	var sphere1 = world.createEntity(sphereMesh, material, [-2, 0, 0]).addToWorld();
	var sphere2 = world.createEntity(sphereMesh, material, [-2, -2, 0]).addToWorld();

	box1.setTranslation(2, 0, 0).setRotation(0, 0, Math.PI / 3);
	sphere1.setScale(0.7, 2, 0.7);
	box2.setScale(0.5, 0.5, 1.5).lookAt([0, 0, 0]);
	sphere2.addTranslation(0, 4, 0);


	// add some lights
	world.createEntity(new PointLight(), [ 100, 100, 100]).addToWorld();
	world.createEntity(new PointLight(), [-100, -100, -100]).addToWorld();
	world.createEntity(new PointLight(), [-100, 100, -100]).addToWorld();

	// add a camera
	world.createEntity(new Camera(), [0, 0, 15]).addToWorld();
});