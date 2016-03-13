	goo.V.attachToGlobal();

	var numFires = 200;
	var scale = 3 / numFires;

	function addFire(translation, scale) {
		var material = new Material(ShaderLib.particles);
		var texture = ParticleSystemUtils.createFlareTexture();
		texture.generateMipmaps = true;
		material.setTexture('DIFFUSE_MAP', texture);
		material.blendState.blending = 'AdditiveBlending';
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.renderQueue = 2002;

		ParticleSystemUtils.createParticleSystemEntity(
			world,
			ParticleLib.getFire({
				scale: scale,
				startColor: [1, 1, 0],
				endColor: [1, 0, 0]
			}),
			material
		).set(translation)
		.addToWorld();
	}

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	V.addOrbitCamera();

	for (var i = 0; i < numFires; i++) {
		addFire([0, 0, (i - numFires / 2) * scale*5], scale*(Math.sin(i/10)+1.5));
	}

	V.process();
