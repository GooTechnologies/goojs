require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitNPanControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent',
	'goo/debug/LightPointer',
	'goo/entities/components/LightDebugComponent',
	'goo/loaders/DynamicLoader'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitNPanControlScript,
	ScriptComponent,
	MeshData,
	Shader,
	MeshDataComponent,
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightComponent,
	LightPointer,
	LightDebugComponent,
	DynamicLoader
	) {
	'use strict';

	var gui = new window.dat.GUI();

	function createCamera(goo) {
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitNPanControlScript({
			domElement: goo.renderer.domElement,
			spherical: new Vector3(9, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	function noiseMaterialDemo(goo, entities) {
		var radius = 2;
		var sphereMeshData = ShapeCreator.createSphere(64, 64, radius);

		var perFragmentMaterialName = 'perFragmentMaterial';
		var perFragmentMaterial = Material.createMaterial(ShaderLib.perFragmentNoise3d, perFragmentMaterialName);

		var perFragmentSphere = goo.world.createEntity(sphereMeshData, perFragmentMaterial, [0, 0, 0]);
		perFragmentSphere.addToWorld();

		for (var i= 0; i < entities.length; i++) {
			entities[i].meshRendererComponent.materials = [perFragmentMaterial];
		}
		// DAT GUI SETUP
		var pervertData = {
			color1: [255, 0, 0],
			color2: [0, 255, 0],
			color3: [0, 0, 255],
			timeMultiplier : 1.0,
			scaleX : 1.0,
			scaleY : 1.0,
			scaleZ : 1.0,
			noiseSize : 1.0
		};
		var perFragGUIFolder = gui.addFolder(perFragmentMaterialName);
		var controller = perFragGUIFolder.addColor(pervertData, 'color1');
		controller.onChange(function() {
			var guiColor = pervertData.color1;
			perFragmentMaterial.shader.uniforms.color1[0] = guiColor[0] / 255;
			perFragmentMaterial.shader.uniforms.color1[1] = guiColor[1] / 255;
			perFragmentMaterial.shader.uniforms.color1[2] = guiColor[2] / 255;
		});
		var controller = perFragGUIFolder.addColor(pervertData, 'color2');
		controller.onChange(function() {
			var guiColor = pervertData.color2;
			perFragmentMaterial.shader.uniforms.color2[0] = guiColor[0] / 255;
			perFragmentMaterial.shader.uniforms.color2[1] = guiColor[1] / 255;
			perFragmentMaterial.shader.uniforms.color2[2] = guiColor[2] / 255;
		});
		var controller = perFragGUIFolder.addColor(pervertData, 'color3');
		controller.onChange(function() {
			var guiColor = pervertData.color3;
			perFragmentMaterial.shader.uniforms.color3[0] = guiColor[0] / 255;
			perFragmentMaterial.shader.uniforms.color3[1] = guiColor[1] / 255;
			perFragmentMaterial.shader.uniforms.color3[2] = guiColor[2] / 255;
		});

		var scaleRange = 10.0;
		controller = perFragGUIFolder.add(pervertData, 'scaleX', 0.0, scaleRange);
		controller.onChange(function() {
			perFragmentMaterial.shader.uniforms.scale[0] = pervertData.scaleX;
		});
		controller = perFragGUIFolder.add(pervertData, 'scaleY', 0.0, scaleRange);
		controller.onChange(function() {
			perFragmentMaterial.shader.uniforms.scale[1] = pervertData.scaleY;
		});
		controller = perFragGUIFolder.add(pervertData, 'scaleZ', 0.0, scaleRange);
		controller.onChange(function() {
			perFragmentMaterial.shader.uniforms.scale[2] = pervertData.scaleZ;
		});

		var timeRange = 30.0;
		controller = perFragGUIFolder.add(pervertData, 'timeMultiplier', -timeRange, timeRange);
		controller.onChange(function() {
			perFragmentMaterial.shader.uniforms.timeMultiplier = pervertData.timeMultiplier;
		});
		perFragGUIFolder.open();

		createCamera(goo);
	}

	function init() {
		var goo = new GooRunner({
			showStats: true,
			logo: 'bottomleft',
			debugKeys: true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var loader = new DynamicLoader({world: goo.world, rootPath: './'});
		loader.loadFromBundle('project.project', 'root.bundle').then(function() {
			var entities = [];
			entities.push(loader.getCachedObjectForRef('Starship1/entities/Main_frame_Material0.entity'));
			entities.push(loader.getCachedObjectForRef('Starship1/entities/Main_frame_Material1.entity'));
			entities.push(loader.getCachedObjectForRef('Starship1/entities/Main_frame_Material2.entity'));
			noiseMaterialDemo(goo, entities);
		});

	}

	init();
});
