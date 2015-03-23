require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/MeshDataComponent',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'goo/renderer/light/PointLight',
	'goo/renderer/Camera'
], function(
	GooRunner,
	Material,
	ShaderLib,
	MeshDataComponent,
	Vector3,
	Box,
	Sphere,
	Torus,
	PointLight,
	Camera
) {
	'use strict';

	// initialize the engine and attach the rendering canvas to the page
	var goo = new GooRunner();
	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	var world = goo.world;

	// get some meshes
	var boxMesh = new Box();
	var sphereMesh = new Sphere(32, 32);
	var torusMesh = new Torus(32, 32, 0.1, 0.5);

	// components can be created manually to encapsulate "primitive engine data types" (meshes, materials, cameras, lights, ...)
	var box = world.createEntity([1.5, 0, 0]);
	var meshDataComponent = new MeshDataComponent(boxMesh);
	box.setComponent(meshDataComponent);
	box.addToWorld();

	// alternatively the engine may try to figure out what component to create from the data you pass to an entity
	// attaching the component to the entity is handles behind the scenes
	var sphere = world.createEntity([0, 0, 0])
		.set(sphereMesh)
		.addToWorld();

	// yet a simpler way of attaching a component to a newly created entity is to just pass the data to the factory method .createEntity
	var torus = world.createEntity(torusMesh, [-1.5, 0, 0])
		.addToWorld();

	// set some materials so we actually see the meshes
	var material = new Material(ShaderLib.simpleLit);
	box.set(material);
	sphere.set(material);
	torus.set(material);

	// add some lights
	world.createEntity(new PointLight(), [ 100, 100, 100]).addToWorld();
	world.createEntity(new PointLight(), [-100, -100, -100]).addToWorld();
	world.createEntity(new PointLight(), [-100, 100, -100]).addToWorld();

	// add a camera
	world.createEntity(new Camera(), [0, 0, 15]).addToWorld();
});