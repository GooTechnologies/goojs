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
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3','goo/math/MathUtils',
		'goo/scripts/BasicControlScript', 'goo/entities/systems/ParticlesSystem', 'goo/entities/components/ParticleComponent', 'goo/particles/ParticleUtils', 'goo/particles/ParticleEmitter'], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent,
	MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter,
	ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, MathUtils, BasicControlScript, ParticlesSystem, ParticleComponent, ParticleUtils, ParticleEmitter) {
	"use strict";

	var resourcePath = "../resources";
	var goo = null;
	var particleEntities = [];
	var defaultTexture = null;

	function init() {
		// Create typical goo application
		goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// Add ParticlesSystem to world.
		var particles = new ParticlesSystem();
		goo.world.setSystem(particles);
		
		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		camera.translation.set(0, 30, 50);
		camera.lookAt(new Vector3(0, 2, 0), Vector3.UNIT_Y);
		camera.onFrameChange();
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		
		// Hook up buttons
		document.getElementById('add_particle_component').addEventListener('click', function() {
			addParticleComponent();
		}, false);
		
		// load default texture
		defaultTexture = new TextureCreator().loadTexture2D(resourcePath + '/flare.png');
		defaultTexture.wrapS = 'EdgeClamp';
		defaultTexture.wrapT = 'EdgeClamp';
		defaultTexture.generateMipmaps = true;
		
		// setup jquery input handlers
		setupInputHandlers();
		
		// add default particles
		addParticleComponent();
	}

	function getParticleComponentByEntityId(id) {
		for (var i=0, max=particleEntities.length; i < max; i++ ) {
			if (particleEntities[i].id == id) return particleEntities[i].particleComponent;
		}
		return null;
	}

	function getParticleEntityById(id) {
		for (var i=0, max=particleEntities.length; i < max; i++ ) {
			if (particleEntities[i].id == id) return particleEntities[i];
		}
		return null;
	}
	
	function openUserFile(filter, callback) {
		var chooser = $('#fileChooser');
		if (callback) {
			chooser.one('change', callback);
		}
		if (filter) {
			chooser.attr("accept", filter);
		} else {
			chooser.attr("accept", undefined);
		}
		chooser.trigger('click');
	}
	
	function setupInputHandlers() {
		$('#particle_components').on('change', '.particle_count', function() {
			var entity = getParticleEntityById(this.name);
			if (!entity) return;
			this.value = Math.min(Math.max(1, this.value), 16383); // 16383 ~= 65535/4
			entity.particleComponent.recreateParticles(this.value);
			entity.meshDataComponent.meshData = entity.particleComponent.meshData;
		});
		$('#particle_components').on('change', '.particle_blending', function() {
			var entity = getParticleEntityById(this.name);
			if (!entity) return;
			entity.meshRendererComponent.materials[0].blendState.blending = this.value;
		});
		var uvChange = function() {
			var entity = getParticleEntityById(this.name);
			if (!entity) return;
			this.value = Math.min(Math.max(1, this.value), 64);
			var isU = this.className === "particle_atlasX";
			if (isU)
				entity.particleComponent.uRange = this.value;
			else
				entity.particleComponent.vRange = this.value;
			entity.particleComponent.recreateParticles(entity.particleComponent.particleCount);
			entity.meshDataComponent.meshData = entity.particleComponent.meshData;
		};
		$('#particle_components').on('change', '.particle_atlasX , .particle_atlasY', uvChange);
		$('#particle_components').on('change', '.particle_enabled', function() {
			var entity = getParticleEntityById(this.name);
			if (entity) {
				entity.particleComponent.enabled = this.checked;
			}
		});
		$('#particle_components').on('click', '.particle_texture', function() {
			var clickedImg = this;
			var entity = getParticleEntityById(this.name);
			if (!entity) return;
			openUserFile("image/*", function(ev) {
				if (this.files && this.files[0]) {
					$("#imgRecycler").replaceWith('<img id="imgRecycler" class="hidden_input">');
					var img = $("#imgRecycler").get(0); // grab actual dom object
					var reader = new FileReader();
					reader.onload = function(e) {
						img.onload = function() {
							var texture = new Texture(img);
							texture.wrapS = 'EdgeClamp';
							texture.wrapT = 'EdgeClamp';
							texture.generateMipmaps = true;
							img.dataReady = true;
							var mat = entity.meshRendererComponent.materials[0];
							mat.textures[0] = texture;
						};
						img.src = e.target.result;
						clickedImg.src = e.target.result;
					};
					reader.readAsDataURL(this.files[0]);
				}
				this.value="";
			});
		});
	}

	function createParticleMaterial(blendType) {
		var material = Material.createMaterial(Material.shaders.particles);
		material.textures.push(defaultTexture);
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.blendState.blending = blendType;
		return material;
	}
	
	// Create simple quad
	function addParticleComponent(properties) {
		if (!goo) return null;
		
		if (!properties) {
			properties = {};
		}
		
		// Create entity
		var entity = goo.world.createEntity();
		
		// Create particle component
		var particleComponent = new ParticleComponent(properties);
		
		entity.setComponent(particleComponent);
		
		// Create meshdata component using particle data
		var meshDataComponent = new MeshDataComponent(particleComponent.meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(createParticleMaterial(properties.blendType ? properties.blendType : 'AlphaBlending'));
		entity.setComponent(meshRendererComponent);

		var script = new BasicControlScript(goo.renderer.domElement);
		script.rollSpeed = 0.25;
		entity.setComponent(new ScriptComponent(script));

		// add a default emitter
		var loc = new Vector3(Math.random() * 20 - 10, 0.0, Math.random() * 20 - 10);
		particleComponent.emitters.push(new ParticleEmitter({
			getEmissionPoint: function(particle, particleEntity) {
	    		ParticleUtils.applyEntityTransformPoint(particle.position.set(loc), particleEntity);
	    	},
			timeline: [ {
					timeOffset: 0.0,
					color: [Math.random(), Math.random(), Math.random(), 1.0]
				} ]
		}));
		
		entity.addToWorld();
		particleEntities.push(entity);

		// initialize the UI for editing this component.
		addParticleComponentUI(entity);
		
		return particleComponent;
	}
	
	function addParticleComponentUI(entity) {
    	// Create html for a new accordian from template
    	var sectionHTML = $("#component_accordion_template").render({
    		title: "Particle Component "+particleEntities.length,
    		count: entity.particleComponent.particleCount,
    		name: entity.id,
    		atlasX: entity.particleComponent.uRange,
    		atlasY: entity.particleComponent.vRange,
    		enabled: entity.particleComponent.enabled ? 'checked' : ''
    	});
    	// make into jquery object
    	var section = $(sectionHTML.trim());
    	
    	// add to accordion
    	var accordion = $('#particle_components');
    	accordion.append(section);

    	// remake accordion
    	accordion.accordion("destroy").accordion({
    		heightStyle: "auto",
    		collapsible: true,
    		active: particleEntities.length - 1
    	});
	}
	
	init();
});
