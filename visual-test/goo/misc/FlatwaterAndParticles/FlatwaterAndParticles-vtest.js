require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/addons/waterpack/FlatWaterRenderer',
	'goo/entities/systems/ParticlesSystem',
	'goo/entities/components/ParticleComponent',
	'goo/particles/ParticleUtils',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Quad,
	Vector3,
	TextureCreator,
	FlatWaterRenderer,
	ParticlesSystem,
	ParticleComponent,
	ParticleUtils,
	V
	) {
	'use strict';

	V.describe('Fire and water were at some point causing rendering artifacts. This scene serves as the minimal test case.');

	function addFire(goo) {
		// particle material
		var material = new Material(ShaderLib.particles);
		var texture = new TextureCreator().loadTexture2D('../../../resources/flare.png');
		texture.generateMipmaps = true;
		material.setTexture('DIFFUSE_MAP', texture);
		material.blendState.blending = 'AlphaBlending';
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.renderQueue = 2001;

		// create particle component of the particle cloud entity
		var particleComponent = new ParticleComponent({
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 2.0,
				color : [1, 1, 0, 0.5]
			}, {
				timeOffset : 0.25,
				color : [1, 0, 0, 1]
			}, {
				timeOffset : 0.25,
				color : [0, 0, 0, 0.7]
			}, {
				timeOffset : 0.5,
				size : 3.0,
				color : [0, 0, 0, 0]
			}],
			emitters : [{
				totalParticlesToSpawn : -1,
				releaseRatePerSecond : 5,
				minLifetime : 1.0,
				maxLifetime : 2.5,
				getEmissionVelocity : function (particle/*, particleEntity*/) {
					var vec3 = particle.velocity;
					return ParticleUtils.getRandomVelocityOffY(vec3, 0, Math.PI * 15 / 180, 5);
				}
			}]
		});

		// create the particle cloud entity
		goo.world.createEntity(particleComponent.meshData, material, particleComponent, [10, 0, 0])
			.addToWorld();
	}

	function addWater(goo, waterY) {
		// water
		var meshData = new Quad(10000, 10000, 10, 10);

		var material = new Material(ShaderLib.simple);
		var waterEntity = goo.world.createEntity(meshData, material);
		waterEntity.meshRendererComponent.isPickable = false;

		waterEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);
		if (waterY) {
			waterEntity.transformComponent.transform.translation.set(0, waterY, 0);
		}
		waterEntity.addToWorld();

		//var camera = cameraEntity.cameraComponent.camera;
		var waterRenderer = new FlatWaterRenderer({
			useRefraction: false,
			normalsUrl: '../../../resources/waternormals3.png'
		});
		goo.renderSystem.preRenderers.push(waterRenderer);

		waterRenderer.setWaterEntity(waterEntity);
		//waterRenderer.setSkyBox(skybox);

		waterRenderer.waterMaterial.shader.uniforms.timeMultiplier = 1.5;
		// waterRenderer.waterMaterial.shader.uniforms.doFog = false;
		waterRenderer.waterMaterial.shader.uniforms.sunDirection = [0, 1, 0.1];
		waterRenderer.waterMaterial.shader.uniforms.sunSpecPower = 1.0;

		waterRenderer.waterMaterial.shader.uniforms.waterColor = [0.1, 0.2, 0.3];
		waterRenderer.waterMaterial.shader.uniforms.sunColor = [1.0, 1.0, 0.9];
		waterRenderer.waterMaterial.shader.uniforms.distortionMultiplier = 0.04;
		waterRenderer.waterMaterial.shader.uniforms.fresnelPow = 1.5;
		waterRenderer.waterMaterial.shader.uniforms.normalMultiplier = 0.9;
		waterRenderer.waterMaterial.shader.uniforms.fresnelMultiplier = 0.5;
		waterRenderer.waterMaterial.shader.uniforms.sunShininess = 150;
		waterRenderer.waterMaterial.shader.uniforms.waterScale = 20.0;
		waterRenderer.waterMaterial.shader.uniforms.fogColor = [0.95, 0.98, 1.0];
		waterRenderer.waterMaterial.shader.uniforms.fogStart = 2000;

		return waterRenderer;
	}

	function addBox(goo) {
		var boxMeshData = new Box(10, 30, 10);
		var boxMaterial = new Material(ShaderLib.simple);
		goo.world.createEntity(boxMeshData, boxMaterial, [0, 15.01, 0])
			.addToWorld();
	}

	var goo = V.initGoo();

	V.addOrbitCamera(new Vector3(60, Math.PI / 2, 0), new Vector3(0, 5, 0));
	V.addLights();

	addBox(goo);
	addWater(goo, 0);
	addFire(goo);

	V.process();
});
