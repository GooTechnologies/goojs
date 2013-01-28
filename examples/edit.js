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
		'goo/math/Vector2', 'goo/scripts/BasicControlScript', 'goo/math/Ray', 'goo/renderer/Util'], function(World, Entity, System, TransformSystem,
	RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, Vector2,
	BasicControlScript, Ray, Util) {
	"use strict";

	var resourcePath = "../resources";

	var material;
	var uniformEditor, vertexEditor, fragmentEditor;
	var currentEntity, currentShader;
	var uniformListener = function(e) {
		if (currentShader) {
			try {
				currentShader.uniforms = JSON.parse(uniformEditor.getValue());
			} catch (err) {
				// TODO: ignore this
			}
		}
	};
	var vertexListener = function(e) {
		if (currentShader) {
			currentShader.vertexSource = vertexEditor.getValue();
			currentShader.rebuild();
		}
	};
	var fragmentListener = function(e) {
		if (currentShader) {
			currentShader.fragmentSource = fragmentEditor.getValue();
			currentShader.rebuild();
		}
	};

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : false
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		material = Material.createMaterial(Material.shaders.textured);
		// var texture = new TextureCreator().loadTexture2D(resourcePath + '/pitcher.jpg');
		var colorInfo = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
		var texture = new Texture(colorInfo, null, 2, 2);
		texture.minFilter = 'NearestNeighborNoMipMaps';
		texture.magFilter = 'NearestNeighbor';
		texture.generateMipmaps = false;
		material.textures.push(texture);

		loadModels(goo);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 20, 60);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		uniformEditor = ace.edit("uniformEditor");
		uniformEditor.getSession().setUseWrapMode(true);
		uniformEditor.setTheme("ace/theme/monokai");
		// uniformEditor.getSession().setMode("ace/mode/javascript");
		uniformEditor.getSession().setMode("ace/mode/json");
		uniformEditor.getSession().on('change', uniformListener);

		vertexEditor = ace.edit("vertexEditor");
		vertexEditor.getSession().setUseWrapMode(true);
		vertexEditor.setTheme("ace/theme/monokai");
		vertexEditor.getSession().setMode("ace/mode/glsl");
		vertexEditor.getSession().on('change', vertexListener);

		fragmentEditor = ace.edit("fragmentEditor");
		fragmentEditor.getSession().setUseWrapMode(true);
		fragmentEditor.setTheme("ace/theme/monokai");
		fragmentEditor.getSession().setMode("ace/mode/glsl");
		fragmentEditor.getSession().on('change', fragmentListener);

		var entities = [];
		var shaders = {};

		for ( var name in Material.shaders) {
			shaders[name] = Material.createShader(Util.clone(Material.shaders[name]), name);
		}

		function updatePresets() {
			var presetElement = document.getElementById('presetsSelect');
			presetElement.innerHTML = '';
			for ( var name in shaders) {
				var optionElement = document.createElement('option');
				optionElement.setAttribute('value', name);
				optionElement.appendChild(document.createTextNode(name));
				presetElement.appendChild(optionElement);
			}
		}
		updatePresets();

		goo.world.setManager({
			added : function(entity) {
				if (entity.meshRendererComponent && entities.indexOf(entity) === -1) {
					entities.push(entity);
				}

				var selectElement = document.getElementById('entitySelect');
				selectElement.innerHTML = '';
				var index = 0;
				for ( var i = 0; i < entities.length; i++) {
					var entity = entities[i];
					if (!entity.meshRendererComponent) {
						continue;
					}
					var entityMaterial = entity.meshRendererComponent.materials[0];
					var shader = entityMaterial.shader;
					if (!shaders[shader.name]) {
						shaders[shader.name] = shader;
						updatePresets();
					}
					var optionElement = document.createElement('option');
					optionElement.setAttribute('value', index);
					index++;
					optionElement.appendChild(document.createTextNode(entity.name));
					selectElement.appendChild(optionElement);
				}

				$('#entitySelect').change();
			}
		});

		$('#entitySelect').change(function() {
			var selectedEntity = entities[$(this).val()];
			if (selectedEntity) {
				currentEntity = selectedEntity;
				var selectedShader = selectedEntity.meshRendererComponent.materials[0].shader;
				if (selectedShader) {
					$('#shaderName').text(selectedShader.name);
					setShader(selectedShader);
					$('#presetsSelect').val(selectedShader.name);
				}
			}
		});

		$('#presetsSelect').change(function() {
			var selectedShader = shaders[$(this).val()];
			if (selectedShader && currentEntity) {
				currentEntity.meshRendererComponent.materials[0].shader = selectedShader;
				$('#entitySelect').change();
			}
		});

		var newIndex = 0;
		$('#newshader').click(function() {
			var type = 'simple';
			var name = 'New_' + type + newIndex++;
			var newShader = Material.createShader(Util.clone(Material.shaders[type]), name);
			shaders[name] = newShader;
			updatePresets();
			$('#shaderName').text(newShader.name);
			setShader(newShader);
			$('#presetsSelect').val(newShader.name);
			$('#presetsSelect').change();
		});
	}

	function setShader(shader) {
		currentShader = shader;

		if (shader.uniforms) {
			uniformEditor.setValue(JSON.stringify(shader.uniforms, null, '\t'));
		}

		vertexEditor.setValue(shader.vertexSource);

		fragmentEditor.setValue(shader.fragmentSource);
	}

	function loadModels(goo) {
		var importer = new JSONImporter(goo.world);

		// Load asynchronous with callback
		importer.load(resourcePath + '/girl.model', resourcePath + '/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(0.15, 0.15, 0.15);
				entities[0].transformComponent.transform.translation.x = 10;
				entities[0].transformComponent.transform.translation.y = -10;
				var script = {
					run : function(entity) {
						var t = entity._world.time;

						var transformComponent = entity.transformComponent;
						transformComponent.transform.rotation.y = Math.sin(t * 0.5) * 1;
						transformComponent.setUpdated();
					}
				};
				entities[0].setComponent(new ScriptComponent(script));
			},
			onError : function(error) {
				console.error(error);
			}
		});

		// Load asynchronous with callback
		importer.load(resourcePath + '/head.model', resourcePath + '/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(50, 50, 50);
				entities[0].transformComponent.transform.translation.x = -10;
				var script = {
					run : function(entity) {
						var t = entity._world.time;

						var transformComponent = entity.transformComponent;
						transformComponent.transform.rotation.y = Math.sin(t * 0.5) * 1;
						transformComponent.setUpdated();
					}
				};
				entities[0].setComponent(new ScriptComponent(script));
			},
			onError : function(error) {
				console.error(error);
			}
		});
	}

	init();
});
