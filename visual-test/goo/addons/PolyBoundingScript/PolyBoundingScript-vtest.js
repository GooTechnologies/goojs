goo.V.attachToGlobal();

	V.describe([
		'The polyBounding script is used do prevent the camera entity from going into the pillars',
		'Control the camera entity using WASD and a mouse'
	].join('\n'));

	function addBoxes(polyBoundingScript) {
		var boxDim = 5;
		var boxDimp2 = boxDim / 2;
		var boxHeight = 60;
		var boxHeightp2 = boxHeight / 2;
		var meshData = new Box(boxDim, boxHeight, boxDim);
		var marg = 1.8;

		var nBoxes = 10;
		for (var i = 0; i < nBoxes; i++) {
			for (var j = 0; j < nBoxes; j++) {

				var material = new Material(ShaderLib.simpleColored);
				material.uniforms.color = [
					i / nBoxes,
					j / nBoxes,
					0.2
				];

				var x = (i - nBoxes / 2) * (boxDim + 10);
				var y = (j - nBoxes / 2) * (boxDim + 10);

				world.createEntity(meshData, material, [x, 0, y]).addToWorld();

				polyBoundingScript.addCollidable({
					poly: [
						x - boxDimp2 - marg, y - boxDimp2 - marg,
						x - boxDimp2 - marg, y + boxDimp2 + marg,
						x + boxDimp2 + marg, y + boxDimp2 + marg,
						x + boxDimp2 + marg, y - boxDimp2 - marg],
					bottom: -boxHeightp2,
					top: boxHeightp2
				});
			}
		}
	}

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var polyBoundingScript = new PolyBoundingScript();
	addBoxes(polyBoundingScript);

	V.addLights();

	// Add camera
	var cameraEntity = world.createEntity(new Camera(), [0, 0, 20])
		.lookAt(new Vector3(0, 0, 0))
		.addToWorld();

	// Camera control set up
	var scripts = new ScriptComponent();
	scripts.scripts.push(Scripts.create('WASD', {
		domElement: gooRunner.renderer.domElement,
		walkSpeed: 25.0,
		crawlSpeed: 10.0
	}));
	scripts.scripts.push(Scripts.create('MouseLookScript', {
		domElement: gooRunner.renderer.domElement
	}));

	scripts.scripts.push(polyBoundingScript);
	cameraEntity.set(scripts);

	V.process();