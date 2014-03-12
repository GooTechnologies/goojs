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
	'goo/entities/components/TextComponent',
	'goo/renderer/TextureCreator',
	'goo/entities/systems/TextSystem'
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
	TextComponent,
	TextureCreator,
	TextSystem
	) {
	'use strict';

	function textComponentDemo(goo) {
		// add text system to world
		goo.world.setSystem(new TextSystem());

		// create text entity
		var textEntity = goo.world.createEntity();

		// get a font
		var material = new Material(ShaderLib.billboard, 'Billboard material');
		var texture = new TextureCreator().loadTexture2D('../../resources/font.png');
		material.setTexture('DIFFUSE_MAP', texture);
		material.blendState.blending = 'AlphaBlending';

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		textEntity.setComponent(meshRendererComponent);

		// create text component with an initial text
		var textComponent = new TextComponent('Vivos brunneis vulpes\nsalit super\npiger canis');
		textEntity.setComponent(textComponent);

		textEntity.transformComponent.transform.translation.setd(3, 3, 0);

		textEntity.addToWorld();

		// change text
		var text = 'The quick brown fox\njumps over\nthe lazy dog ';
		var counter = 0;
		setInterval(function() {
			counter++;
			if(counter > text.length) { counter = 1; }

			textEntity.textComponent.setText(text.substr(0, counter));
		}, 100);


		// setup lights and camera
		var light1 = new PointLight();
		//light1.color = [1.0, 0.3, 0.0];
		var light1Entity = goo.world.createEntity('light');
		light1Entity.setComponent(new LightComponent(light1));
		light1Entity.transformComponent.transform.translation.set(10, 10, 10);
		light1Entity.addToWorld();

		// camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 3);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(30, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		textComponentDemo(goo);
	}

	init();
});
