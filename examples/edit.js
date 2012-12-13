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
		'goo/math/Vector2', 'goo/scripts/BasicControlScript', 'goo/math/Ray'], function(World, Entity, System, TransformSystem, RenderSystem,
	TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, Vector2,
	BasicControlScript, Ray) {
	"use strict";

	var resourcePath = "../resources";

	var material;
	var uniformEditor, vertexEditor, fragmentEditor;
	var currentShader;
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
			currentShader.shaderProgram = null;
		}
	};
	var fragmentListener = function(e) {
		if (currentShader) {
			currentShader.fragmentSource = fragmentEditor.getValue();
			currentShader.shaderProgram = null;
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
		camera.translation.set(0, 20, 60);
		camera.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		camera.onFrameChange();
		var cameraEntity = goo.world.createEntity("CameraEntity");
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

		var shaders = [];
		goo.world.setManager({
			added : function(entity) {
				shaders = [];
				var selectElement = document.getElementById('shaderSelect');
				selectElement.innerHTML = '';
				var entities = goo.world.entityManager.getEntities();
				var index = 0;
				for ( var i = 0; i < entities.length; i++) {
					var entity = entities[i];
					if (!entity.meshRendererComponent) {
						continue;
					}
					var entityMaterial = entity.meshRendererComponent.materials[0];
					var shader = entityMaterial.shader;
					if (shaders.indexOf(shader) !== -1) {
						continue;
					}
					shaders.push(shader);
					var optionElement = document.createElement('option');
					optionElement.setAttribute('value', index);
					index++;
					optionElement.appendChild(document.createTextNode(entityMaterial.name + '_' + shader.name + '_' + shader._id));
					selectElement.appendChild(optionElement);
				}

				$('#shaderSelect').change();
			}
		});

		$('#shaderSelect').change(function() {
			var selectedShader = shaders[$(this).val()];
			if (selectedShader) {
				setShader(selectedShader);
			}
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
