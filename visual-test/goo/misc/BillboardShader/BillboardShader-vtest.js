
	goo.V.attachToGlobal();

	V.describe('The 5 yellow orbs have a halo on them that always faces the camera. They are renderered using the billboard shader.');

	function addHalo(x, y, z) {
		var quadMeshData = new Quad(3, 3);
		var quadMaterial = new Material(ShaderLibExtra.billboard);
		quadMaterial.blendState.blending = 'AlphaBlending';
		quadMaterial.renderQueue = 2001;
		new TextureCreator().loadTexture2D('../../../resources/flare.png').then(function (quadTexture) {
			quadMaterial.setTexture('DIFFUSE_MAP', quadTexture);
		});

		gooRunner.world.createEntity(quadMeshData, quadMaterial, [x, y, z]).addToWorld();
	}

	function addBox() {
		var boxMeshData = new Box(1, 1, 1);
		var boxMaterial = new Material(ShaderLib.simpleLit, 'mat');
		gooRunner.world.createEntity(boxMeshData, boxMaterial).addToWorld();
	}

	function addLamp(x, y, z) {
		var lampMeshData = new Sphere(32, 32);
		var lampMaterial = new Material(ShaderLib.simpleColored);
		lampMaterial.uniforms.color = [1.0, 0.8, 0.1];

		var light = new PointLight();
		light.range = 10;

		gooRunner.world.createEntity(lampMeshData, lampMaterial, light, [x, y, z]).addToWorld();

		addHalo(x, y, z);
	}

	function addLamps() {
		var nLamps = 5;
		for (var i = 0; i < nLamps; i++) {
			addLamp((i - ((nLamps - 1) / 2)) * 4, 5, 0);
		}
	}

	var gooRunner = V.initGoo();

	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	addLamps();
	addBox();

	V.process();