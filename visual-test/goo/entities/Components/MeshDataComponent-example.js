require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/MeshDataComponent',
	'goo/math/Vector3',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Torus',
	'../../lib/V'
], function(
	GooRunner,
	Material,
	ShaderLib,
	MeshDataComponent,
	Vector3,
	Box,
	Sphere,
	Torus,
	V
) {
	'use strict';

	var goo = V.initGoo();
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
	var material = Material.createMaterial(ShaderLib.simpleLit);
	box.set(material);
	sphere.set(material);
	torus.set(material);


	V.addLights();

	V.addOrbitCamera(new Vector3(15, Math.PI / 2, 0.3));
});