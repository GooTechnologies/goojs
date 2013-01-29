require.config({
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
		'goo/math/MathUtils', 'goo/scripts/BasicControlScript', 'goo/entities/systems/ParticlesSystem', 'goo/entities/components/ParticleComponent',
		'goo/particles/ParticleUtils', 'goo/particles/ParticleEmitter'], function(World, Entity, System, TransformSystem, RenderSystem,
	TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, MathUtils,
	BasicControlScript, ParticlesSystem, ParticleComponent, ParticleUtils, ParticleEmitter) {
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
		goo.a = 1;
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// Add ParticlesSystem to world.
		var particles = new ParticlesSystem();
		goo.world.setSystem(particles);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 30, 50);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 2, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

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
		for ( var i = 0, max = particleEntities.length; i < max; i++) {
			if (particleEntities[i].id == id) {
				return particleEntities[i].particleComponent;
			}
		}
		return null;
	}

	function getParticleEntityById(id) {
		for ( var i = 0, max = particleEntities.length; i < max; i++) {
			if (particleEntities[i].id == id) {
				return particleEntities[i];
			}
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
		// Hook up add button
		$('#add_particle_component').on('click', function() {
			addParticleComponent();
		});

		// add listeners for particle component edits
		$('#particle_components').on('change', '.particle_count', function() {
			var entity = getParticleEntityById(this.name);
			this.value = Math.min(Math.max(1, this.value), 16383); // 16383 ~= 65535/4
			entity.particleComponent.recreateParticles(this.value);
			entity.meshDataComponent.meshData = entity.particleComponent.meshData;
		});
		$('#particle_components').on('change', '.particle_blending', function() {
			var entity = getParticleEntityById(this.name);
			entity.meshRendererComponent.materials[0].blendState.blending = this.value;
		});
		var uvChange = function() {
			var entity = getParticleEntityById(this.name);
			this.value = Math.min(Math.max(1, this.value), 64);
			var isU = this.className === "particle_atlasX";
			if (isU) {
				entity.particleComponent.uRange = this.value;
			} else {
				entity.particleComponent.vRange = this.value;
			}
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
				this.value = "";
			});
		});
	}

	function setupEmittersListeners(emitters, entity) {
		emitters.on('change', '.release_rate', function() {
			entity.particleComponent.emitters[this.name].releaseRatePerSecond = this.value;
		});
		emitters.on('change', '.max_life', function() {
			entity.particleComponent.emitters[this.name].maxLifetime = this.value / 1000;
		});
		emitters.on('change', '.min_life', function() {
			entity.particleComponent.emitters[this.name].minLifetime = this.value / 1000;
		});
		emitters.on('change', '.max_spawn', function() {
			entity.particleComponent.emitters[this.name].totalParticlesToSpawn = this.value;
		});
		emitters.on('change', '.billboard', function() {
			if (this.value === 'camera') {
				entity.particleComponent.emitters[this.id].getParticleBillboardVectors = ParticleEmitter.CAMERA_BILLBOARD_FUNC;
			} else if (this.value === 'xy') {
				entity.particleComponent.emitters[this.id].getParticleBillboardVectors = function(particle, particleEntity) {
					particle.bbX.set(-1, 0, 0);
					particle.bbY.set(0, 1, 0);
				};
			} else if (this.value === 'yz') {
				entity.particleComponent.emitters[this.id].getParticleBillboardVectors = function(particle, particleEntity) {
					particle.bbX.set(0, 1, 0);
					particle.bbY.set(0, 0, -1);
				};
			} else if (this.value === 'xz') {
				entity.particleComponent.emitters[this.id].getParticleBillboardVectors = function(particle, particleEntity) {
					particle.bbX.set(-1, 0, 0);
					particle.bbY.set(0, 0, -1);
				};
			}
		});
		emitters.on('change', '.emission_point', function() {
			var func = new Function('particle', 'particleEntity', this.value);
			entity.particleComponent.emitters[this.id].getEmissionPoint = func;
		});
		emitters.on('change', '.emission_velocity', function() {
			var func = new Function('particle', 'particleEntity', this.value);
			entity.particleComponent.emitters[this.id].getEmissionVelocity = func;
		});
	}

	function setupTimelineListeners(entryUI, entry) {
		entryUI.on('change', '.timeOffset', function() {
			entry.timeOffset = this.value.trim() !== '' ? this.value.trim() : undefined;
		});
		entryUI.on('change', '.spin', function() {
			entry.spin = (this.value.trim() !== '' ? this.value.trim() : undefined) * Math.PI / 180.0;
		});
		entryUI.on('change', '.size', function() {
			entry.size = this.value.trim() !== '' ? this.value.trim() : undefined;
		});
		entryUI.on('change', '.mass', function() {
			entry.mass = this.value.trim() !== '' ? this.value.trim() : undefined;
		});
		entryUI.on('change', '.uvIndex', function() {
			entry.uvIndex = this.value.trim() !== '' ? this.value.trim() : undefined;
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
		if (!goo) {
			return null;
		}

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
		particleComponent.emitters.push(new ParticleEmitter({
			timeline : []
		}));
		particleComponent.emitters[0].uuid = simpleUUID();

		entity.addToWorld();
		particleEntities.push(entity);

		// initialize the UI for editing this component.
		addParticleComponentUI(entity);

		return particleComponent;
	}

	function addTimelineUI(emitter, entry, tabsUI) {
		// setup timeline
		var timeline = tabsUI.find('.timeline').first();
		var timelineHTML = $("#timeline_editor_template").render(
			{
				name : entry.uuid,
				size : entry.size !== undefined ? entry.size : '',
				mass : entry.mass !== undefined ? entry.mass : '',
				spin : entry.spin !== undefined ? Math.floor(entry.spin * 180 / Math.PI) : '',
				timeOffset : entry.timeOffset !== undefined ? entry.timeOffset : 0.0,
				color : entry.color !== undefined ? "rgba(" + Math.floor(entry.color[0] * 255) + "," + Math.floor(entry.color[1] * 255) + ","
					+ Math.floor(entry.color[2] * 255) + "," + entry.color[3] + ")" : ''
			});
		// add emitters to component editor
		var entryUI = $(timelineHTML.trim());
		timeline.append(entryUI);
		entryUI.find('.color').first().colorpicker({
			parts : 'full',
			showOn : 'both',
			buttonImage : '../examples-lib/colorpicker/images/ui-colorpicker.png',
			buttonColorize : true,
			alpha : true,
			colorFormat : 'RGBA',
			select : function(event, color) {
				var exp = /rgba\((\d*),(\d*),(\d*),([\d.]*)\)/g;
				var vals = exp.exec(color.formatted);
				entry.color = [vals[1] / 255, vals[2] / 255, vals[3] / 255, vals[4]]; // alpha is already [0,1]
			}
		});

		setupTimelineListeners(entryUI, entry);

		var deleteButton = entryUI.find('.delete_button').first();
		deleteButton.button();
		deleteButton.on('click', function(ev) {
			// prevent open/close of accordion on delete press
			ev.stopPropagation();
			ev.preventDefault();

			// delete ui entry
			entryUI.remove();

			// remove actual timeline entry
			for ( var i = 0, max = emitter.timeline.length; i < max; i++) {
				if (emitter.timeline[i] === entry) {
					emitter.timeline.splice(i, 1);
					break;
				}
			}
		});

		// refresh accordion
		timeline.accordion("refresh");
		timeline.accordion("option", "active", emitter.timeline.length - 1);
	}

	function simpleUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
			return v.toString(16);
		});
	}

	function addParticleEmitterUI(entity, emitter, emitterIndex, sectionUI) {
		var emitters = sectionUI.children('.emitters').first();
		var emittersHTML = $("#emitter_editor_template").render({
			index : emitterIndex,
			ent : entity.id,
			maxLifetime : emitter.maxLifetime,
			releaseRatePerSecond : emitter.releaseRatePerSecond,
			minLifetime : emitter.minLifetime,
			totalParticlesToSpawn : emitter.totalParticlesToSpawn
		});
		var editor = $(emittersHTML.trim());
		// add emitters to component editor
		emitters.append(editor);

		// make tabs for emitter properties
		var tabs = emitters.find('.emitter_properties').eq(emitterIndex);
		tabs.tabs({
			heightStyle : "content",
			active : 0
		});

		var timeline = tabs.find('.timeline').first();
		timeline.accordion({
			header : "> div > h3",
			heightStyle : "content",
			collapsible : true
		}).sortable({
			axis : "y",
			handle : "h3",
			delay : 250,
			start : function(event, ui) {
				timeline.start = ui.item.index();
			},
			stop : function(event, ui) {
				// reorder timeline entries too
				var stop = ui.item.index();
				if (stop == timeline.start) {
					return;
				}

				// yank the entry that moved
				var moved = emitter.timeline.splice(timeline.start, 1)[0];
				// replace it in the right location
				emitter.timeline.splice(stop, 0, moved);
			}
		});

		// enable add timeline entry button
		var addEntry = editor.find('#add_entry').button();
		addEntry.on('click', function() {
			var entry = {
				timeOffset : emitter.timeline.length == 0 ? 0.0 : 0.25,
				color : [Math.random(), Math.random(), Math.random(), 1.0],
				uuid : simpleUUID()
			};
			emitter.timeline.push(entry);
			addTimelineUI(emitter, entry, tabs);
		});

		// refresh accordion
		emitters.accordion("refresh");
	}

	function addParticleComponentUI(entity) {
		var particleComponent = entity.particleComponent;

		// Create html for ui from template
		var componentHTML = $("#component_editor_template").render({
			title : "Particle Entity " + particleEntities.length,
			count : particleComponent.particleCount,
			name : entity.id,
			atlasX : particleComponent.uRange,
			atlasY : particleComponent.vRange,
			enabled : particleComponent.enabled ? 'checked' : ''
		});
		// make into jquery object
		var section = $(componentHTML.trim());

		// enable add emitter button
		var addEmitter = section.find('#add_emitter').button();
		addEmitter.on('click', function() {
			var emitter = new ParticleEmitter({
				timeline : []
			});
			emitter.uuid = simpleUUID();
			particleComponent.emitters.push(emitter);
			addParticleEmitterUI(entity, emitter, particleComponent.emitters.length - 1, section);
		});

		// add listeners for emitter changes
		var emitters = section.children('.emitters').first();
		emitters.accordion({
			header : "> div > h3",
			heightStyle : "content",
			collapsible : true
		}).sortable({
			axis : "y",
			handle : "h3",
			delay : 250,
			start : function(event, ui) {
				particleComponent.emitters.start = ui.item.index();
			},
			stop : function(event, ui) {
				// reorder timeline entries too
				var stop = ui.item.index();
				if (stop == particleComponent.emitters.start) {
					return;
				}

				// yank the entry that moved
				var moved = particleComponent.emitters.splice(particleComponent.emitters.start, 1)[0];
				// replace it in the right location
				particleComponent.emitters.splice(stop, 0, moved);
			}
		});
		setupEmittersListeners(emitters, entity);

		// add UI for default emitter
		addParticleEmitterUI(entity, particleComponent.emitters[0], 0, section);

		// add top level to main accordion
		var accordion = $('#particle_components');
		accordion.append(section);

		// refresh accordion
		accordion.accordion("refresh");
	}

	init();
});
