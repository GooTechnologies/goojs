require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/TextureCreator',
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
	MeshRendererComponent,
	TextureCreator,
	Vector3,
	Box,
	Sphere,
	Torus,
	PointLight,
	Camera
) {
	'use strict';

	var resourcePath = '../../../../resources';

	// initialize the engine and attach the rendering canvas to the page
	var goo = new GooRunner();
	goo.renderer.domElement.id = 'goo';
	document.body.appendChild(goo.renderer.domElement);

	var world = goo.world;

	var simpleColored = new Material(ShaderLib.simpleColored);
	simpleColored.uniforms.color = [0.0, 0.3, 1.0];

	var simpleLit = new Material(ShaderLib.simpleLit);

	var texturedLit = new Material(ShaderLib.texturedLit);
	new TextureCreator().loadTexture2D(resourcePath + '/check.png').then(function (texture) {
		texturedLit.setTexture('DIFFUSE_MAP', texture);
	});

	// components can be created manually to encapsulate "primitive engine data types" (meshes, materials, cameras, lights, ...)
	var torus = world.createEntity([1.5, 0, 0]);
	var meshRendererComponent = new MeshRendererComponent();
	meshRendererComponent.materials.push(simpleColored);
	torus.setComponent(meshRendererComponent);
	torus.addToWorld();

	// alternatively the engine may try to figure out what component to create from the data you pass to an entity
	// attaching the component to the entity is handles behind the scenes
	var sphere = world.createEntity([0, 0, 0])
		.set(simpleLit)
		.addToWorld();

	// yet a simpler way of attaching a component to a newly created entity is to just pass the data to the factory method .createEntity
	var box = world.createEntity(texturedLit, [-1.5, 0, 0])
		.addToWorld();

	// get some meshes so we have something to apply the material to
	box.set(new Box());
	sphere.set(new Sphere(32, 32));
	torus.set(new Torus(32, 32, 0.1, 0.5));

	// add some lights
	world.createEntity(new PointLight(), [ 100, 100, 100]).addToWorld();
	world.createEntity(new PointLight(), [-100, -100, -100]).addToWorld();
	world.createEntity(new PointLight(), [-100, 100, -100]).addToWorld();

	// add a camera
	world.createEntity(new Camera(), [0, 0, 15]).addToWorld();
});