require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/ShapeCreator',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/p2/p2System',
	'goo/addons/p2/p2Component',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'../../lib/V'
], function (
	GooRunner,
	Material,
	Camera,
	CameraComponent,
	ShapeCreator,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	P2System,
	P2Component,
	PointLight,
	LightComponent,
	V //REVEIW: let's use V because it deals with the boilerplate for you
) {
	'use strict';

	var resourcePath = '../../resources';

	function init() {
		//REVIEW: bam!
		var goo = V.initGoo();
		/*
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);
		*/

		var p2System = new P2System();
		goo.world.setSystem(p2System);
		p2System.world.gravity[1] = -20;

		function addPrimitives() {
			//REVIEW: spaces
			for (var i=0;i<40;i++) {
				var x = Math.random() * 16 - 8;
				var y = Math.random() * 16 + 8;
				var z = Math.random() * 16 - 8;
				if (Math.random() < 0.5) {
					var w = 1+Math.random()*2,
						h = 1+Math.random()*2;
					createEntity(goo, ShapeCreator.createBox(w, h, 1+Math.random()*2), {
						mass:1,
						shapes:[{
							type:'box',
							width:w,
							height:h,
						}]
					}, [x,y,z]);
				} else {
					var radius = 1+Math.random();
					createEntity(goo, ShapeCreator.createSphere(10, 10, radius), {
						mass:1,
						shapes:[{
							type:'circle',
							radius:radius,
						}], //REVIEW: doesn't the checkstyle choke on these extra ','?
					}, [x,y,z]);
				}
			}
		}

		addPrimitives();
		document.addEventListener('keypress', addPrimitives, false);

		var planeEntity = createEntity(goo, ShapeCreator.createQuad(1000, 1000, 100, 100), {
			mass: 0,
			offsetAngleX:-Math.PI/2,
			shapes:[{
				type:'plane'
			}],
		}, [0,-10,0]);

		V.addLights();
		/*
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.setTranslation(0, 100, -10);
		lightEntity.addToWorld();
		*/

		//REVIEW: demo-mode (auto-moving) orbit camera in one line!
		V.addOrbitCamera(new Vector3(40, Math.PI/2, Math.PI/4));
		/*
		var camera = new Camera(45, 1, 0.1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(40, Math.PI/2, Math.PI/4)
		}));
		cameraEntity.setComponent(scripts);
		cameraEntity.addToWorld();
		*/
	}

	function createEntity(goo, meshData, p2Settings, pos) {
		//REVIEW: createMaterial is deprecated (and documented!); use new Material(...) instead
		// at some point deprecated methods will get removed and will break your test :(
		// this very smart IDE that I'm using will warn me when using deprecated methods - maybe yours has a similar option/plugin
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.setTexture('DIFFUSE_MAP', texture);
		var entity = goo.world.createEntity(meshData, material, pos);
		entity.setComponent(new P2Component(p2Settings));
		entity.addToWorld();
		return entity;
	}

	init();
});
