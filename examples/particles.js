require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3',
		'goo/scripts/WASDControlScript', 'goo/scripts/MouseLookControlScript', 'goo/entities/systems/ParticlesSystem',
		'goo/entities/components/ParticleComponent', 'goo/particles/ParticleUtils', 'goo/renderer/shaders/ShaderLib'], function (World, Entity, System, TransformSystem, RenderSystem,
	TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3,
	WASDControlScript, MouseLookControlScript, ParticlesSystem, ParticleComponent, ParticleUtils, ShaderLib) {
	"use strict";

	var resourcePath = "../resources";

	var material;

	function init () {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		material = Material.createMaterial(ShaderLib.particles);
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/flare.png');
		texture.wrapS = 'EdgeClamp';
		texture.wrapT = 'EdgeClamp';
		texture.generateMipmaps = true;
		material.textures.push(texture);
		material.blendState.blending = 'AlphaBlending';
		material.cullState.enabled = false;
		material.depthState.write = false;

		// Add ParticlesSystem to world.
		var particles = new ParticlesSystem();
		goo.world.setSystem(particles);

		// create an entity with particles
		createParticles(goo);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 20);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		var scripts = new ScriptComponent();
		scripts.scripts.push(new WASDControlScript({
			domElement : goo.renderer.domElement,
			walkSpeed : 25.0,
			crawlSpeed : 10.0
		}));
		scripts.scripts.push(new MouseLookControlScript({
			domElement : goo.renderer.domElement
		}));
		cameraEntity.setComponent(scripts);
	}

	// Create simple quad
	function createParticles (goo) {
		var world = goo.world;

		// Create entity
		var entity = world.createEntity();

		entity.transformComponent.transform.translation.set(0, 0, 0);

		// Create particle component
		var particleComponent = new ParticleComponent({
			particleCount : 100,
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 2.0,
				color : [1, 0, 0, 1]
			}, {
				timeOffset : 0.5,
				size : 1.5,
				color : [1, 1, 0, 0.5]
			}, {
				timeOffset : 0.5,
				size : 0.5,
				color : [0, 0, 0, 0]
			}],
			emitters : [{
				totalParticlesToSpawn : -1,
				releaseRatePerSecond : 5,
				minLifetime : 2.0,
				maxLifetime : 3.0
			}, {
				totalParticlesToSpawn : -1,
				releaseRatePerSecond : 5,
				minLifetime : 3.0,
				maxLifetime : 5.0,
				getEmissionPoint : function (particle, particleEntity) {
					var vec3 = particle.position;
					return ParticleUtils.applyEntityTransformPoint(vec3.set(5, 0, 0), particleEntity);
				}
			}, {
				totalParticlesToSpawn : -1,
				releaseRatePerSecond : 5,
				minLifetime : 0.1,
				maxLifetime : 2.5,
				getEmissionPoint : function (particle, particleEntity) {
					var vec3 = particle.position;
					return ParticleUtils.applyEntityTransformPoint(vec3.set(-5, 0, 0), particleEntity);
				}
			}],
		});
		entity.setComponent(particleComponent);

		// Create meshdata component using particle data
		var meshDataComponent = new MeshDataComponent(particleComponent.meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		entity.addToWorld();
	}

	init();
});
