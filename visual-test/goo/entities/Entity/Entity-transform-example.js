require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/TextureCreator',
	'goo/entities/components/LightComponent',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'../../lib/V'
], function(
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	DirectionalLight,
	TextureCreator,
	LightComponent,
	Box,
	Sphere,
	V
) {
	'use strict';

	var resourcePath = "../../resources";

	var goo = V.initGoo();
	var world = goo.world;

	var boxMesh = new Box();
	var sphereMesh = new Sphere(32, 32);

	var texture = new TextureCreator().loadTexture2D(resourcePath + '/check.png');
	var material = Material.createMaterial(ShaderLib.texturedLit);
	material.setTexture('DIFFUSE_MAP', texture);


	var box1 = world.createEntity(boxMesh, material).addToWorld();
	var box2 = world.createEntity(boxMesh, material, [2, 2, 0]).addToWorld();
	var sphere1 = world.createEntity(sphereMesh, material, [-2, 0, 0]).addToWorld();
	var sphere2 = world.createEntity(sphereMesh, material, [-2, -2, 0]).addToWorld();

	box1.setTranslation(2, 0, 0).setRotation(0, 0, Math.PI / 3);
	sphere1.setScale(0.7, 2, 0.7);
	box2.setScale(0.5, 0.5, 1.5).lookAt([0, 0, 0]);
	sphere2.addTranslation(0, 4, 0);


	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));
});