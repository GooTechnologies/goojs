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
		'goo/math/MathUtils', 'goo/scripts/WASDControlScript', 'goo/scripts/MouseLookControlScript', 'goo/entities/systems/ParticlesSystem',
		'goo/entities/components/ParticleComponent', 'goo/particles/ParticleUtils', 'goo/particles/ParticleEmitter'], function (World, Entity,
	System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer,
	Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera,
	CameraComponent, Vector3, MathUtils, WASDControlScript, MouseLookControlScript, ParticlesSystem, ParticleComponent, ParticleUtils,
	ParticleEmitter) {
	"use strict";

	var resourcePath = "../resources";
	var goo = null;
	var particleEntities = [];
	var defaultTexture = null;

	function init () {
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

		// load default texture
		defaultTexture = new TextureCreator().loadTexture2D(resourcePath + '/particle_atlas.png');
		defaultTexture.wrapS = 'EdgeClamp';
		defaultTexture.wrapT = 'EdgeClamp';
		defaultTexture.generateMipmaps = true;

		// setup top level jQuery input handlers
		setupInputHandlers();

		// add default particles
		addParticleComponent();
	}

	/**
	 * Helper function for locating a particle entity by its entity id.
	 */
	function getParticleEntityById (id) {
		for ( var i = 0, max = particleEntities.length; i < max; i++) {
			if (particleEntities[i].id == id) {
				return particleEntities[i];
			}
		}
		return null;
	}

	/**
	 * Use the hidden file input field to ask a user for a file to open.
	 */
	function openUserFile (filter, callback) {
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

	/**
	 * Create a new ParticleComponent with default values.
	 */
	function addParticleComponent () {
		if (!goo) {
			return null;
		}

		// Create entity
		var entity = goo.world.createEntity();

		// Create particle component and assign to entity
		var particleComponent = new ParticleComponent({
			particleCount : 500,
			uRange : 4,
			vRange : 4
		});
		entity.setComponent(particleComponent);

		// Create MeshDataComponent using ParticleComponent's pre-generated data
		entity.setComponent(new MeshDataComponent(particleComponent.meshData));

		// Create MeshRendererComponent with default material, texture and shader
		var meshRendererComponent = new MeshRendererComponent();
		var material = Material.createMaterial(Material.shaders.particles);
		material.textures.push(defaultTexture);
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.blendState.blending = 'AlphaBlending';
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		// Add a default ParticleEmitter
		particleComponent.emitters.push(new ParticleEmitter({
			timeline : [],
			releaseRatePerSecond : 50
		}));

		// Add our entity to the world
		entity.addToWorld();

		// Store the entity for later use
		particleEntities.push(entity);

		// initialize the UI for editing this component.
		addParticleComponentUI(entity);

		return particleComponent;
	}

	/**
	 * Generate UI for editing the properties of a ParticleComponent.
	 */
	function addParticleComponentUI (entity) {
		var particleComponent = entity.particleComponent;
		var accordion = $('#particle_components');

		// generate new html for this particleComponent from jsrender template
		var componentHTML = $("#component_editor_template").render({
			title : "Particle Entity",
			count : particleComponent.particleCount,
			name : entity.id,
			atlasX : particleComponent.uRange,
			atlasY : particleComponent.vRange,
			enabled : particleComponent.enabled ? 'checked' : ''
		});

		// convert generated html into jquery node and add to the emitters accordion
		var section = $(componentHTML.trim());
		accordion.append(section);

		// Now find our emitters section and make that into a sortable jquery UI accordion
		var emitters = section.children('.emitters').first();
		emitters.accordion({
			header : "> div > h3",
			heightStyle : "content",
			collapsible : true
		}).sortable({
			axis : "y",
			handle : "h3",
			delay : 250,
			start : function (event, ui) {
				particleComponent.emitters.start = ui.item.index();
			},
			stop : function (event, ui) {
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

		// By default we have 1 emitter, so setup UI on it.
		addParticleEmitterUI(entity, particleComponent.emitters[0], 0, section);

		// find and enable the "add particle emitter" button
		var addEmitter = section.find('#add_emitter').button();
		addEmitter.on('click', function () {
			var emitter = new ParticleEmitter({
				timeline : [],
				releaseRatePerSecond : 50
			});
			particleComponent.emitters.push(emitter);
			if (particleComponent.emitters.length == 1) {
				// a bit of a hack... if length == 1, they probably deleted all emitters, which might have accidently disabled things
				particleComponent.enabled = true;
			}
			addParticleEmitterUI(entity, emitter, particleComponent.emitters.length - 1, section);
		});

		// find and enable the "delete particle entity" button
		var deleteButton = section.find('.delete_button').first();
		deleteButton.button();
		deleteButton.on('click', function (ev) {
			// prevent open/close of accordion on delete press
			ev.stopPropagation();
			ev.preventDefault();

			// delete ui entry
			section.remove();

			// remove from our list
			for ( var i = 0, max = particleEntities.length; i < max; i++) {
				if (particleEntities[i] === entity) {
					particleEntities.splice(i, 1);
					break;
				}
			}

			// remove actual entity from world
			entity.removeFromWorld();
		});

		// refresh accordion
		accordion.accordion("refresh");

		// automatically select the newly added entry
		accordion.accordion("option", "active", particleEntities.length - 1);
	}

	/**
	 * Generate UI for editing the properties of a ParticleEmitter.
	 */
	function addParticleEmitterUI (entity, emitter, emitterIndex, sectionUI) {
		// add our default gravity influence
		emitter.gravity = 0;
		emitter.influences.push({
			enabled : true,
			prepare : function (particleEntity, emitter) {
			},
			apply : function (tpf, particle, particleIndex) {
				particle.velocity.y -= emitter.gravity * tpf;
			}
		});

		// find emitters dom node in our section
		var emitters = sectionUI.children('.emitters').first();
		// generate new html for this emitter from jsrender template
		var emittersHTML = $("#emitter_editor_template").render({
			uuid : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
				return v.toString(16); // uuid is used to uniquely id the radio button group in General.
			}),
			enabled : emitter.enabled ? 'checked' : '',
			maxLifetime : emitter.maxLifetime,
			releaseRatePerSecond : emitter.releaseRatePerSecond,
			minLifetime : emitter.minLifetime,
			totalParticlesToSpawn : emitter.totalParticlesToSpawn
		});
		// convert generated html into jquery node and add to the emitters accordion
		var editor = $(emittersHTML.trim());
		emitters.append(editor);

		// Ok, now go into our generated jquery node and convert into tabs for emitter properties
		var tabs = emitters.find('.emitter_properties').eq(emitterIndex);
		tabs.tabs({
			heightStyle : "content",
			active : 0
		});

		// Now find our timeline and make that into a sortable jquery UI accordion
		var timeline = tabs.find('.timeline').first();
		timeline.accordion({
			header : "> div > h3",
			heightStyle : "content",
			collapsible : true
		}).sortable({
			axis : "y",
			handle : "h3",
			delay : 250,
			start : function (event, ui) {
				timeline.start = ui.item.index();
			},
			stop : function (event, ui) {
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

		// While we're in the timeline, find the "add timeline entry" button and enable it
		var addEntry = editor.find('#add_entry').button();
		addEntry.on('click', function () {
			var entry = {
				timeOffset : emitter.timeline.length == 0 ? 0.0 : 0.25,
				color : [Math.random(), Math.random(), Math.random(), 1.0]
			};
			emitter.timeline.push(entry);
			addTimelineUI(emitter, entry, tabs);
		});

		// Great, now setup the input listeners for this emitter
		setupEmittersListeners(editor, emitter, entity.particleComponent);

		// Find the "delete particle emitter" button and enable it
		var deleteButton = editor.find('.delete_button').first();
		deleteButton.button();
		deleteButton.on('click', function (ev) {
			// prevent open/close of accordion on delete press
			ev.stopPropagation();
			ev.preventDefault();

			// delete ui entry
			editor.remove();

			// remove actual emitter
			var emitterArray = entity.particleComponent.emitters;
			for ( var i = 0, max = emitterArray.length; i < max; i++) {
				if (emitterArray[i] === emitter) {
					emitterArray.splice(i, 1);
					break;
				}
			}
		});

		// refresh the emitter accordion we dropped all of this into.
		emitters.accordion("refresh");

		// automatically select the newly added entry
		emitters.accordion("option", "active", entity.particleComponent.emitters.length - 1);
	}

	/**
	 * Generate UI for editing the properties of a ParticleEmitter timeline entry.
	 */
	function addTimelineUI (emitter, entry, tabsUI) {
		// find timeline accordion dom node under our tabs node.
		var timeline = tabsUI.find('.timeline').first();
		// generate new html for this timeline entry from jsrender template
		// color needs to be converted to rgba(int, int, int, %) format for the jquery colorpicker plugin.
		var timelineHTML = $("#timeline_editor_template").render(
			{
				size : entry.size !== undefined ? entry.size : '',
				mass : entry.mass !== undefined ? entry.mass : '',
				spin : entry.spin !== undefined ? Math.floor(entry.spin * 180 / Math.PI) : '',
				timeOffset : entry.timeOffset !== undefined ? entry.timeOffset : 0.0,
				color : entry.color !== undefined ? "rgba(" + Math.floor(entry.color[0] * 255) + "," + Math.floor(entry.color[1] * 255) + ","
					+ Math.floor(entry.color[2] * 255) + "," + entry.color[3] + ")" : ''
			});

		// convert generated html into jquery node and add to the timeline accordion
		var entryUI = $(timelineHTML.trim());
		timeline.append(entryUI);

		// find our color input box and enable it as a colorpicker
		entryUI.find('.color').first().colorpicker({
			parts : 'full',
			showOn : 'both',
			showNoneButton : 'true',
			buttonImage : '../examples-lib/colorpicker/images/ui-colorpicker.png',
			buttonColorize : true,
			alpha : true,
			colorFormat : 'RGBA',
			select : function (event, color) {
				var exp = /rgba\((\d*),(\d*),(\d*),([\d.]*)\)/g;
				var vals = exp.exec(color.formatted);
				if (vals) {
					entry.color = [vals[1] / 255, vals[2] / 255, vals[3] / 255, vals[4]]; // alpha is already [0,1]
				} else {
					entry.color = undefined;
				}
			}
		});

		// setup the input listeners for this entry's UI
		setupTimelineListeners(entryUI, entry);

		// find and enable the "delete particle entry" button
		var deleteButton = entryUI.find('.delete_button').first();
		deleteButton.button();
		deleteButton.on('click', function (ev) {
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

		// automatically select the newly added entry
		timeline.accordion("option", "active", emitter.timeline.length - 1);
	}

	/**
	 * Setup our default particle component input handlers. These are just for direct properties of ParticleComponent. We set these up at a high level
	 * once and use the name on the input field to get the particle component's entity id for lookup.
	 */
	function setupInputHandlers () {
		// Hook up add button
		$('#add_particle_component').on('click', function () {
			addParticleComponent();
		});

		$('#change_bgcolor_button').colorpicker({
			parts : 'full',
			showOn : 'both',
			buttonImage : '../examples-lib/colorpicker/images/ui-colorpicker.png',
			buttonColorize : true,
			alpha : false,
			colorFormat : 'RGBA',
			select : function (event, color) {
				var exp = /rgba\((\d*),(\d*),(\d*),([\d.]*)\)/g;
				var vals = exp.exec(color.formatted);
				goo.renderer.setClearColor(vals[1] / 255, vals[2] / 255, vals[3] / 255, vals[4]); // alpha is already [0,1]
			}
		});

		// add listeners for particle component edits
		$('#particle_components').on('change', '.particle_count', function () {
			var entity = getParticleEntityById(this.name);
			this.value = Math.min(Math.max(1, this.value), 16383); // 16383 ~= 65535/4
			entity.particleComponent.recreateParticles(this.value);
			entity.meshDataComponent.meshData = entity.particleComponent.meshData;
		});
		$('#particle_components').on('change', '.particle_blending', function () {
			var entity = getParticleEntityById(this.name);
			entity.meshRendererComponent.materials[0].blendState.blending = this.value;
		});
		var uvChange = function () {
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
		$('#particle_components').on('change', '.particle_enabled', function () {
			var entity = getParticleEntityById(this.name);
			if (entity) {
				entity.particleComponent.enabled = this.checked;
			}
		});
		$('#particle_components').on('click', '.particle_texture', function () {
			var clickedImg = this;
			var entity = getParticleEntityById(this.name);
			openUserFile("image/*", function (ev) {
				if (this.files && this.files[0]) {
					$("#imgRecycler").replaceWith('<img id="imgRecycler" class="hidden_input">');
					var img = $("#imgRecycler").get(0); // grab actual dom object
					var reader = new FileReader();
					reader.onload = function (e) {
						img.onload = function () {
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

	/**
	 * Setup UI change listeners for emitter properties.
	 */
	function setupEmittersListeners (emitterUI, emitter, particleComponent) {
		emitterUI.on('change', '.emitter_enabled', function () {
			emitter.enabled = this.checked;
			if (emitter.enabled) {
				// if all emitters are disabled and all the particles die, the component may become disabled too.
				// So here we re-enable it just in case. May cause some UI inconsistencies.
				particleComponent.enabled = true;
			}
		});
		emitterUI.on('change', '.release_rate', function () {
			emitter.releaseRatePerSecond = this.value;
			emitter.particlesWaitingToRelease = 0; // reset to prevent leakage
		});
		emitterUI.on('change', '.max_life', function () {
			emitter.maxLifetime = this.value / 1000;
		});
		emitterUI.on('change', '.min_life', function () {
			emitter.minLifetime = this.value / 1000;
		});
		emitterUI.on('change', '.max_spawn', function () {
			emitter.totalParticlesToSpawn = this.value;
		});
		emitterUI.on('change', '.gravity', function () {
			emitter.gravity = this.value;
		});
		emitterUI.on('change', '.billboard', function () {
			if (this.value === 'camera') {
				emitter.getParticleBillboardVectors = ParticleEmitter.CAMERA_BILLBOARD_FUNC;
			} else if (this.value === 'xy') {
				emitter.getParticleBillboardVectors = function (particle, particleEntity) {
					particle.bbX.set(-1, 0, 0);
					particle.bbY.set(0, 1, 0);
				};
			} else if (this.value === 'yz') {
				emitter.getParticleBillboardVectors = function (particle, particleEntity) {
					particle.bbX.set(0, 1, 0);
					particle.bbY.set(0, 0, -1);
				};
			} else if (this.value === 'xz') {
				emitter.getParticleBillboardVectors = function (particle, particleEntity) {
					particle.bbX.set(-1, 0, 0);
					particle.bbY.set(0, 0, -1);
				};
			} else if (this.value === 'particle') {
				emitter.getParticleBillboardVectors = function (particle, particleEntity) {
					particle.bbX.set(particle.emit_bbX);
					particle.bbY.set(particle.emit_bbY);
				};
			}
		});
		emitterUI.on('change', '.emission_point', function () {
			emitter.getEmissionPoint = new Function('particle', 'particleEntity', this.value);
		});
		emitterUI.on('change', '.emission_point_examples', function () {
			var textArea = emitterUI.find(".emission_point").first();
			textArea.val(getPointFunction(this.value));
			textArea.trigger("change");
		});
		emitterUI.on('change', '.emission_velocity', function () {
			emitter.getEmissionVelocity = new Function('particle', 'particleEntity', this.value);
		});
		emitterUI.on('change', '.emission_velocity_examples', function () {
			var textArea = emitterUI.find(".emission_velocity").first();
			textArea.val(getVelocityFunction(this.value));
			textArea.trigger("change");
		});
	}

	/**
	 * Setup UI change listeners for timeline entry properties.
	 */
	function setupTimelineListeners (entryUI, entry) {
		entryUI.on('change', '.timeOffset', function () {
			entry.timeOffset = this.value.trim() !== '' ? this.value.trim() : undefined;
		});
		entryUI.on('change', '.spin', function () {
			entry.spin = (this.value.trim() !== '' ? this.value.trim() : undefined) * Math.PI / 180.0;
		});
		entryUI.on('change', '.size', function () {
			entry.size = this.value.trim() !== '' ? this.value.trim() : undefined;
		});
		entryUI.on('change', '.mass', function () {
			entry.mass = this.value.trim() !== '' ? this.value.trim() : undefined;
		});
		entryUI.on('change', '.uvIndex', function () {
			entry.uvIndex = this.value.trim() !== '' ? this.value.trim() : undefined;
		});
	}

	/**
	 * Generate sample javascript function content for emitter's getEmissionPoint.
	 */
	function getPointFunction (type) {
		switch (type) {
			case 'Point':
				return "particle.position.set(0,0,0);";
			case 'Rectangle':
				return "var center = particle.position.set(0, 0, 0);\n" + //
				"var xExtent = 10,  zExtent = 10;\n" + //
				"center.x += (Math.random() * 2 * xExtent) - xExtent;\n" + //
				"center.y += 0;\n" + //
				"center.z += (Math.random() * 2 * zExtent) - zExtent;";
			case 'GOO!':
				return "// XXX: ideally this first part would exist outside of the function...\n" + //
				"if (!particleEntity.positions) {\n" + //
				"	var image = [//\n" + //
				"		'.XXXX....XXXX....XXXX...XX', //\n" + //
				"		'X.......X....X..X....X..XX', //\n" + //
				"		'X..XXX..X....X..X....X..XX', //\n" + //
				"		'X....X..X....X..X....X....', //\n" + //
				"		'.XXXX....XXXX....XXXX...XX'];\n" + //
				"	var height = image.length;\n" + //
				"	var width = image[0].length;\n" + //
				"\n" + //
				"	particleEntity.positions = [];\n" + //
				"	for ( var yy = 0; yy < height; ++yy) {\n" + //
				"		for ( var xx = 0; xx < width; ++xx) {\n" + //
				"			if (image[yy].substring(xx, xx + 1) == 'X') {\n" + //
				"				particleEntity.positions.push([(xx - width * 0.5) * 0.5, -(yy - height * 0.5) * 0.5]);\n" + //
				"			}\n" + //
				"		}\n" + //
				"	}\n" + //
				"}\n" + //
				"\n" + //
				"// This part is all that has to be in the function itself\n" + //
				"var index = Math.floor(Math.random() * particleEntity.positions.length);\n" + //
				"index = Math.min(index, particleEntity.positions.length - 1);\n" + //
				"particle.position.set(particleEntity.positions[index][0], 10 + particleEntity.positions[index][1], 0);\n" + //
				"particle.position.mul(2);";
			case 'Cube':
				return "var center = particle.position.set(0, 0, 0);\n" + //
				"var extent = 5;\n" + //
				"\n" + //
				"center.x += (Math.random() * 2 * extent) - extent;\n" + //
				"center.y += (Math.random() * 2 * extent) - extent;\n" + //
				"center.z += (Math.random() * 2 * extent) - extent;";
			case 'HollowCube':
				return "var center = particle.position.set(0, 0, 0);\n" + //
				"var side = Math.floor(Math.random() * 3);\n" + //
				"var dir = Math.floor(Math.random() * 2);\n" + //
				"var x = 2 * Math.random() - 1.0;\n" + //
				"var y = 2 * Math.random() - 1.0;\n" + //
				"var extent = 5;\n" + //
				"\n" + //
				"if (side == 0) {\n" + //
				"	center.x += extent * (dir ? 1 : -1);\n" + //
				"	center.y += y * extent;\n" + //
				"	center.z += x * extent;\n" + //
				"	particle.emit_bbX = [0, 0, 1];\n" + //
				"	particle.emit_bbY = [0, 1, 0];\n" + //
				"} else if (side == 1) {\n" + //
				"	center.y += extent * (dir ? 1 : -1);\n" + //
				"	center.z += y * extent;\n" + //
				"	center.x += x * extent;\n" + //
				"	particle.emit_bbX = [1, 0, 0];\n" + //
				"	particle.emit_bbY = [0, 0, 1];\n" + //
				"} else {\n" + //
				"	center.z += extent * (dir ? 1 : -1);\n" + //
				"	center.y += y * extent;\n" + //
				"	center.x += x * extent;\n" + //
				"	particle.emit_bbX = [1, 0, 0];\n" + //
				"	particle.emit_bbY = [0, 1, 0];\n" + //
				"}";
			case 'Sphere':
				return "var radius = 5, center = particle.position.set(0, 0, 0);\n" + //
				"var dir = particle.velocity.set(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();" + //
				"dir.mul(Math.random() * radius);" + //
				"center.add(dir)";
			case 'HollowSphere':
				// TODO: maybe we can calc and set particle.emit_bbX and particle.emit_bbY here? In particles4 we do it with polar coords.
				return "var radius = 5, center = particle.position.set(0, 0, 0);\n" + //
				"var dir = particle.velocity.set(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();" + //
				"dir.mul(radius);" + //
				"center.add(dir)";
		}
	}

	/**
	 * Generate sample javascript function content for emitter's getEmissionVelocity.
	 */
	function getVelocityFunction (type) {
		switch (type) {
			case 'Simple':
				return "particle.velocity.set(0,1,0);";
			case 'Fountain':
				return "var scale = 5,\n minOffsetAngle = Math.PI * 0 / 180,\n maxOffsetAngle = Math.PI * 30 / 180;\n\n" + //
				"var randomAngle = minOffsetAngle + Math.random() * (maxOffsetAngle - minOffsetAngle);\n" + //
				"var randomDir = Math.PI * 2 * Math.random();\n" + //
				"\n" + //
				"particle.velocity.x = Math.cos(randomDir) * Math.sin(randomAngle);\n" + //
				"particle.velocity.y = Math.cos(randomAngle);\n" + //
				"particle.velocity.z = Math.sin(randomDir) * Math.sin(randomAngle);\n" + //
				"\n" + //
				"particle.velocity.mul(scale);";
			case 'Flame':
				return "var scale = 5,\n minOffsetAngle = Math.PI * 0 / 180,\n maxOffsetAngle = Math.PI * 15 / 180;\n\n" + //
				"var randomAngle = minOffsetAngle + Math.random() * (maxOffsetAngle - minOffsetAngle);\n" + //
				"var randomDir = Math.PI * 2 * Math.random();\n" + //
				"\n" + //
				"particle.velocity.x = Math.cos(randomDir) * Math.sin(randomAngle);\n" + //
				"particle.velocity.y = Math.cos(randomAngle);\n" + //
				"particle.velocity.z = Math.sin(randomDir) * Math.sin(randomAngle);\n" + //
				"\n" + //
				"particle.velocity.mul(scale);";
			case 'Random':
				return "particle.velocity.set(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).mul(10.0);";
			case 'Drift':
				return "particle.velocity.set(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).mul(0.5);";
			case 'GroundFog':
				return "particle.velocity.set(Math.random()-0.5,0,Math.random()-0.5).mul(2.0);";
			case 'Rain':
				return "particle.velocity.set(0, -50, 0);";
			case 'None':
				return "particle.velocity.set(0,0,0);";
		}
	}

	init();
});
