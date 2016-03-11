
	goo.V.attachToGlobal();

	var gooRunner = V.initGoo();

	V.addLights();

	function createMesh(meshData, material, x, y, z) {
		var entity = gooRunner.world.createEntity(meshData, material);
		entity.transformComponent.transform.translation.setDirect(x, y, z);
		entity.addToWorld();
	}

	function createShapes() {
		var material = new Material(ShaderLib.textured);
		var colorInfo = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
		var texture = new Texture(colorInfo, null, 2, 2);
		texture.minFilter = 'NearestNeighborNoMipMaps';
		texture.magFilter = 'NearestNeighbor';
		material.setTexture('DIFFUSE_MAP', texture);

		createMesh(new Sphere(16, 16, 2),	material, -5, 0, 0);
		createMesh(new Box(3, 3, 3),		material, -5, 5, 0);
		createMesh(new Quad(3, 3),			material, 0, -5, 0);
		createMesh(new Torus(16, 16, 1, 3),	material, 5, 0,  0);
	}

	createShapes();

	// add camera
	var camera = new Camera();
	var cameraEntity = gooRunner.world.createEntity(camera, 'CameraEntity', [0,0,10]).addToWorld();
	camera.setProjectionMode(Camera.Parallel);
	var size = 10;
	camera.setFrustum(1, 100, -size, size, size, -size, 1);
	var script = Scripts.create('PanCamControlScript', {
		panSpeed : 1
	});

	// camera control set up
	var scriptComponent = new ScriptComponent();
	scriptComponent.scripts.push(script);
	cameraEntity.setComponent(scriptComponent);

	SystemBus.addListener('goo.scriptError', function(evt){
		throw new Error(evt.message);
	});
});