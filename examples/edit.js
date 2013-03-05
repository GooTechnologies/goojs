require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/renderer/Material',
	'goo/entities/GooRunner',
	'goo/loaders/JSONImporter',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/Texture',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/math/Vector3',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib'
], function (Material, GooRunner, JSONImporter, ScriptComponent, Texture, Camera, CameraComponent, Vector3, Util, ShaderLib) {
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

		material = Material.createMaterial(ShaderLib.textured);
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

		for ( var name in ShaderLib) {
			shaders[name] = Material.createShader(Util.clone(ShaderLib[name]), name);
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
			var newShader = Material.createShader(Util.clone(ShaderLib[type]), name);
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
						transformComponent.transform.setRotationXYZ(0, Math.sin(t * 0.5) * 1, 0);
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
						transformComponent.transform.setRotationXYZ(0, Math.sin(t * 0.5) * 1, 0);
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
