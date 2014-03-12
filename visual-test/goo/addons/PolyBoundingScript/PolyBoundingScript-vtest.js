require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/shapes/Box',
	'goo/scripts/WASDControlScript',
	'goo/scripts/MouseLookControlScript',
	'goo/addons/scripts/PolyBoundingScript'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightComponent,
	Box,
	WASDControlScript,
	MouseLookControlScript,
	PolyBoundingScript
	) {
	'use strict';

	function addBoxes(goo, polyBoundingScript) {
		var boxDim = 5;
		var boxDimp2 = boxDim / 2;
		var boxHeight = 60;
		var boxHeightp2 = boxHeight / 2;
		var meshData = new Box(boxDim, boxHeight, boxDim);
		var marg = 1.8;

		var nBoxes = 10;
		for (var i = 0; i < nBoxes; i++) {
			for (var j = 0; j < nBoxes; j++) {

				var material = new Material(ShaderLib.simpleColored, '');
				material.uniforms.color = [
					i / nBoxes,
					j / nBoxes,
					0.2
				];
				var boxEntity = goo.world.createEntity(meshData, material);

				var x = (i - nBoxes / 2) * (boxDim + 10);
				var y = (j - nBoxes / 2) * (boxDim + 10);
				boxEntity.transformComponent.transform.translation.setd(x, 0, y);

				boxEntity.addToWorld();

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

	function polyBoundingScriptDemo(goo) {
		var polyBoundingScript = new PolyBoundingScript();
		addBoxes(goo, polyBoundingScript);

		// Add light
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(0, 100, 0);
		lightEntity.addToWorld();

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 20);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// Camera control set up
		var scripts = new ScriptComponent();
		scripts.scripts.push(new WASDControlScript({
			domElement : goo.renderer.domElement,
			walkSpeed : 25.0,
			crawlSpeed : 10.0
		}));
		scripts.scripts.push(new MouseLookControlScript({
			domElement : goo.renderer.domElement
		}));

		scripts.scripts.push(polyBoundingScript);
		cameraEntity.setComponent(scripts);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		polyBoundingScriptDemo(goo);
	}

	init();
});
