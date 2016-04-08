
	goo.V.attachToGlobal();

	V.describe([
		'Tests that normalmaps + tangentcoord generation works with entity combining.'
	].join('\n'));

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var material = new Material(ShaderLib.uber);
	var sphereEntity1 = world.createEntity(new Sphere(16, 16, 1), material, [-1.2, 0, 0]).addToWorld();
	sphereEntity1.static = true;
	var sphereEntity2 = world.createEntity(new Sphere(16, 16, 1), material, [1.2, 0, 0]).addToWorld();
	sphereEntity2.static = true;

	var renderer = gooRunner.renderer;
	var renderSystem = gooRunner.world.getSystem('RenderSystem');
	var entities = renderSystem._activeEntities;
	var lights = renderSystem.lights;

	new TextureCreator().loadTexture2D('../../../../resources/waternormals3.png').then(function (texture) {
		material.setTexture('NORMAL_MAP', texture);
		return renderer.precompileShaders(entities, lights);
	}).then(function () {
		return renderer.preloadMaterials(entities);
	}).then(function () {
		new EntityCombiner(world).combine();
	});

	V.addLights();

	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));

	V.process();