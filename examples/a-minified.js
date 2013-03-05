require(['../minified/goo'], function() {
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/loaders/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3',
		'goo/math/MathUtils', 'goo/scripts/OrbitCamControlScript', 'goo/entities/systems/ParticlesSystem',
		'goo/entities/components/ParticleComponent', 'goo/particles/ParticleUtils', 'goo/particles/ParticleEmitter', 'goo/renderer/shaders/ShaderLib'], function (World, Entity,
	System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, MeshData, Renderer,
	Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera,
	CameraComponent, Vector3, MathUtils, OrbitCamControlScript, ParticlesSystem, ParticleComponent, ParticleUtils, ParticleEmitter, ShaderLib) {
	"use strict";

	var resourcePath = "../resources";

	function init () {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		goo.renderer.setClearColor(0.0,0.0,0.0,1.0);
		document.body.appendChild(goo.renderer.domElement);

		var texture = new TextureCreator().loadTexture2D(resourcePath + '/particle_atlas.png');
		texture.wrapS = 'EdgeClamp';
		texture.wrapT = 'EdgeClamp';
		texture.generateMipmaps = true;

		var additiveMaterial = Material.createMaterial(ShaderLib.particles);
		additiveMaterial.textures.push(texture);
		additiveMaterial.blendState.blending = 'AdditiveBlending';
		additiveMaterial.cullState.enabled = false;
		additiveMaterial.depthState.write = false;

		var alphaMaterial = Material.createMaterial(ShaderLib.particles);
		alphaMaterial.textures.push(texture);
		alphaMaterial.blendState.blending = 'AlphaBlending';
		alphaMaterial.cullState.enabled = false;
		alphaMaterial.depthState.write = false;

		// Add ParticlesSystem to world.
		var particles = new ParticlesSystem();
		goo.world.setSystem(particles);

		// create our shared particles
		var additiveParticleComponent = createParticles(goo.world, additiveMaterial);
		var alphaParticleComponent = createParticles(goo.world, alphaMaterial);

		// add various emitters
		addGooText(additiveParticleComponent);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 30, 40);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 2, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(70, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	// Create simple quad
	function createParticles (world, material) {
		// Create entity
		var entity = world.createEntity();

		// Create particle component
		var particleComponent = new ParticleComponent({
			particleCount : 1500,
			uRange : 4,
			vRange : 4
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

		return particleComponent;
	}

	function addGooText (particleComponent) {
		var image = [//
		'XX...XX..XXXXX..X....X..XXXXX..XXXXX..XXXXX..XXXXXX..XXXXX......XXXX....XXXX....XXXX...XX', //
		'X.X.X.X....X....XX...X....X....X........X....X.......X....X....X.......X....X..X....X..XX', //
		'X..X..X....X....X.X..X....X....XXX......X....XXXX....X....X....X..XXX..X....X..X....X..XX', //
		'X.....X....X....X..X.X....X....X........X....X.......X....X....X....X..X....X..X....X....', //
		'X.....X..XXXXX..X...XX..XXXXX..X......XXXXX..XXXXXX..XXXXX......XXXX....XXXX....XXXX...XX'];
		var height = image.length;
		var width = image[0].length;

		var positions = [];
		for ( var yy = 0; yy < height; ++yy) {
			for ( var xx = 0; xx < width; ++xx) {
				if (image[yy].substring(xx, xx + 1) === 'X') {
					positions.push([(xx - width * 0.5) * 0.5, -(yy - height * 0.5) * 0.5]);
				}
			}
		}

		particleComponent.emitters.push(new ParticleEmitter({
			totalParticlesToSpawn : -1,
			releaseRatePerSecond : positions.length * 4,
			minLifetime : 0.5,
			maxLifetime : 4.0,
			getEmissionPoint : function (particle, particleEntity) {
				var vec3 = particle.position;
				var index = Math.floor(Math.random() * positions.length);
				index = Math.min(index, positions.length - 1);
				ParticleUtils.applyEntityTransformPoint(vec3.set(positions[index][0], positions[index][1], 0), particleEntity);
			},
			getEmissionVelocity : function (particle, particleEntity) {
				var vec3 = particle.velocity;
				return vec3.set(Math.random() * 0.2 - 0.1, 0, Math.random() * 0.2 - 0.1);
			},
			timeline : [{
				timeOffset : 0.0,
				spin : 0,
				mass : 1,
				size : 0.5,
				color : [1, 0, 0, 1]
			}, {
				timeOffset : 0.33,
				color : [0, 1, 0, 1]
			}, {
				timeOffset : 0.33,
				color : [0, 0, 1, 1]
			}, {
				timeOffset : 0.33,
				size : 1.0,
				color : [1, 1, 0, 0]
			}]
		}));
	}

	init();
});
});