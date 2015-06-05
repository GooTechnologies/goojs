require([
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/debugpack/systems/DebugRenderSystem',
	'goo/renderer/TextureCreator',
	'goo/shapes/Quad',
	'goo/entities/components/ScriptComponent',
	'lib/V'
], function (
	Vector3,
	Quaternion,
	DirectionalLight,
	SpotLight,
	DebugRenderSystem,
	TextureCreator,
	Quad,
	ScriptComponent,
	V
	) {
	'use strict';

	var lightRotationAngle = 0;
	var targetPos = new Vector3();
	var rotQuat = new Quaternion();

	var rotationScriptComponent = new ScriptComponent({
		run: function(entity, tpf) {
			var rot = Math.PI * 0.2 * tpf;
			lightRotationAngle += rot;
			var ypan = Math.sin(entity._world.time) * 0.45;
			var xpan = Math.cos(entity._world.time) * 0.25;
			targetPos.setDirect(xpan, ypan, 1);
			targetPos.normalize();
			rotQuat.fromAngleNormalAxis(lightRotationAngle, targetPos);

			var rotMat = entity.transformComponent.transform.rotation;
			rotQuat.toRotationMatrix(rotMat);
			entity.transformComponent._dirty = true;
		
			if (lightRotationAngle >= Math.PI * 2) {
				lightRotationAngle = Math.PI * 2 - lightRotationAngle;
			}
		}
	});

	V.describe('Test the texture projection functionality of DirectionalLight and SpotLight.');

	function addDirectionalLight() {
		var directionalLight = new DirectionalLight(new Vector3(1, 1, 1));
		directionalLight.intensity = 0.5;
		var directionalEntity = goo.world.createEntity(directionalLight, [50, 0, 100]).addToWorld();
		new TextureCreator().loadTexture2D('../../../resources/collectedBottles_diffuse_1024.dds').then(function (texture) {
			directionalLight.lightCookie = texture;
		});

		directionalEntity.setComponent(rotationScriptComponent);

		return directionalEntity;
	}

	function addSpotLight() {
		var spotLight = new SpotLight(new Vector3(1, 1, 1));
		spotLight.angle = 45;
		spotLight.range = 400;
		spotLight.penumbra = 5;
		
		new TextureCreator().loadTexture2D('../../../resources/goo.png').then(function (texture) {
			spotLight.lightCookie = texture;
		});

		var spotEntity = goo.world.createEntity('spotLight', spotLight, [0, 0, 40]);
		
		spotEntity.setComponent(rotationScriptComponent);

		return spotEntity.addToWorld();
	}

	var goo = V.initGoo();
	var world = goo.world;

	var debugRenderSystem = new DebugRenderSystem();
	debugRenderSystem.doRender.LightComponent = true;
	goo.renderSystems.push(debugRenderSystem);
	world.setSystem(debugRenderSystem);

	addDirectionalLight();
	addSpotLight();

	var backLight = new DirectionalLight(new Vector3(0.5, 0.5, 1.0));
	backLight.intensity = 0.1;
	var backLightEntity = world.createEntity(backLight, [-100, 0, 100]);
	backLightEntity.setRotation([0, Math.PI * 0.8, 0]);
	backLightEntity.addToWorld();

	// Backdrop
	var quadSize = 1000;
	world.createEntity(new Quad(quadSize, quadSize), V.getColoredMaterial(1,1,1,1), [0, 0, -50]).addToWorld();

	var spheres = V.addSpheres(1).toArray();
	var scale = 50;
	for (var i = 0; i < spheres.length; i++) {
		var sphere = spheres[i];
		sphere.setScale(scale, scale, scale);
		sphere.setComponent(new ScriptComponent({
			run: function(entity, tpf) {
				var t = Math.sin(entity._world.time) * scale;
				sphere.setTranslation(t, t * 0.5, -Math.abs(t * 1.3))	
			}
		}));
	}


	// camera
	V.addOrbitCamera([300, Math.PI/2, 0]);

	V.process();
});