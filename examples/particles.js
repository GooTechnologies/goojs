require({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
	}
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3',
		'goo/scripts/BasicControlScript', 'goo/entities/systems/ParticlesSystem', 'goo/entities/components/ParticleComponent'], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent,
	MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter,
	ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, BasicControlScript, ParticlesSystem, ParticleComponent) {
	"use strict";

	var resourcePath = "../resources";

	var material;

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		material = Material.createMaterial(Material.shaders.particles);
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
		camera.translation.set(0, 0, 20);
		camera.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		camera.onFrameChange();
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
	}

	// Create simple quad
	function createParticles(goo) {
		var world = goo.world;

		// Create entity
		var entity = world.createEntity();

		entity.transformComponent.transform.translation.set(0, 0, 0);

		// Create particle component
		var particleComponent = new ParticleComponent({
			particleCount: 100,
			timeline: [
				{
					timeOffset: 0.0,
					spin: 0,
					mass: 1,
					size: 20.0,
					color: [1, 0, 0, 1]
				}, {
					timeOffset: 0.5,
					size: 12.0,
					color: [1, 1, 0, 0.5]
				}, {
					timeOffset: 0.5,
					size: 2.0,
					color: [0, 0, 0, 0]
				}
			],
			emitters : [
			    {
			    	totalParticlesToSpawn: Infinity,
			    	releaseRatePerSecond: 5,
			    	minLifetime: 2.0,
			    	maxLifetime: 3.0
			    }, {
			    	totalParticlesToSpawn: Infinity,
			    	releaseRatePerSecond: 5,
			    	minLifetime: 3.0,
			    	maxLifetime: 5.0,
			    	getEmissionPoint: function(vec3) {
						return vec3.set(5,0,0);
			    	}
			    }, {
			    	totalParticlesToSpawn: Infinity,
			    	releaseRatePerSecond: 5,
			    	minLifetime: 0.1,
			    	maxLifetime: 2.5,
			    	getEmissionPoint: function(vec3) {
						return vec3.set(-5,0,0);
			    	}
			    }
			],
		});
		entity.setComponent(particleComponent);
		
		// Create meshdata component using particle data
		var meshDataComponent = new MeshDataComponent(particleComponent.meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		entity.setComponent(new ScriptComponent(new BasicControlScript()));

		entity.addToWorld();
	}

	init();
});
