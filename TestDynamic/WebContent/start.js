"use strict";

require([ 'goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System',
		'goo/entities/systems/TransformSystem', 'goo/entities/systems/RenderSystem',
		'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem',
		'goo/renderer/MeshData', 'goo/renderer/Renderer', 'goo/renderer/Material', 'goo/renderer/Shader',
		'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader', 'goo/loaders/JSONImporter',
		'goo/entities/components/ScriptComponent', 'goo/util/DebugUI' ], function(World, Entity, System,
		TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent,
		PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter,
		ScriptComponent, DebugUI) {

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		document.body.appendChild(goo.renderer.domElement);

		var ui = new DebugUI(goo);

		// Examples of model loading
		loadModels(goo);

		// Add quad
		var quadEntity = createQuadEntity(goo);
		quadEntity.addToWorld();
	}

	function loadModels(goo) {
		// Load synchronous
		var importer = new JSONImporter(goo.world);
		var entities = importer.load('resources/girl.model', 'resources/');
		for ( var i in entities) {
			entities[i].addToWorld();
		}
		entities[0].TransformComponent.transform.scale.set(0.15, 0.15, 0.15);
		goo.callbacks.push((function(entities) {
			var t = 0;
			var zero = new THREE.Vector3();
			return function(tpf) {
				var transformComponent = entities[0].TransformComponent;
				transformComponent.transform.translation.x = Math.sin(t) * 30;
				transformComponent.transform.translation.y = Math.sin(t) * 150;
				transformComponent.transform.translation.z = Math.cos(t) * 30;
				transformComponent.transform.rotation.y = Math.sin(t * 1.5) * 3;
				transformComponent.setUpdated();

				goo.renderer.camera.position.x = Math.sin(t * 1.1) * 50;
				goo.renderer.camera.position.y = Math.sin(t * 1.5) * 150;
				goo.renderer.camera.position.z = Math.cos(t * 2.0) * 50;
				goo.renderer.camera.lookAt(zero);
				goo.renderer.camera.updateWorld();

				t += tpf;
			};
		})(entities));

		// Load synchronous with callback
		importer.load('resources/head.model', 'resources/', false, {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].TransformComponent.transform.scale.set(60, 60, 60);
				var t = 0;
				goo.callbacks.push(function(tpf) {
					var transformComponent = entities[0].TransformComponent;
					transformComponent.transform.translation.x = Math.sin(t + 3) * 30;
					transformComponent.transform.translation.y = Math.sin(t) * 150;
					transformComponent.transform.translation.z = Math.cos(t + 3) * 30;
					transformComponent.transform.rotation.x = Math.sin(t) * 2;
					transformComponent.transform.rotation.y = Math.sin(t * 1.5) * 3;
					transformComponent.setUpdated();

					t += tpf;
				});
			},
			onError : function(error) {
				console.error(error);
			}
		});

		// Load asynchronous (forced callback)
		importer.load('resources/head.model', 'resources/', true, {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].TransformComponent.transform.scale.set(30, 30, 30);
				var t = 0;
				goo.callbacks.push(function(tpf) {
					var transformComponent = entities[0].TransformComponent;
					transformComponent.transform.translation.x = Math.sin(t + 2) * 30;
					transformComponent.transform.translation.z = Math.cos(t + 2) * 30;
					transformComponent.transform.rotation.x = Math.sin(t) * 2;
					transformComponent.transform.rotation.y = Math.sin(t * 1.5) * 3;
					transformComponent.setUpdated();

					t += tpf;
				});
			},
			onError : function(error) {
				console.error(error);
			}
		});
	}

	// Create simple quad
	function createQuadEntity(goo) {
		var world = goo.world;

		// Setup default attributes
		var attributeMap = MeshData.defaultMap([ MeshData.POSITION, MeshData.COLOR, MeshData.TEXCOORD0 ]);
		// Add custom attribute
		attributeMap.Stuff = {
			count : 1,
			type : 'Float'
		};

		var meshData = new MeshData(attributeMap, 4, 6);

		// Fill attribute buffers
		meshData.getAttributeBuffer(MeshData.POSITION).set([ -5, -5, 0, -5, 5, 0, 5, 5, 0, 5, -5, 0 ]);
		meshData.getAttributeBuffer(MeshData.COLOR).set(
				[ 1.0, 0.5, 0.5, 1.0, 0.5, 1.0, 0.5, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, ]);
		meshData.getAttributeBuffer(MeshData.TEXCOORD0).set([ 0, 0, 0, 1, 1, 1, 1, 0 ]);
		meshData.getAttributeBuffer('Stuff').set([ 0, 1, 2, 3 ]);
		meshData.getIndexBuffer().set([ 0, 1, 3, 1, 2, 3 ]);

		// Create entity
		var entity = world.createEntity();

		// Create transform component
		var transformComponent = new TransformComponent();
		entity.setComponent(transformComponent);

		// Create meshdata component using above data
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		var material = new Material('TestMaterial');

		var vs = getShader('vshader');
		var fs = getShader('fshader');

		material.shader = new Shader('TestShader', vs, fs);

		var texture = new TextureCreator().loadTexture2D('resources/pitcher.jpg');
		material.textures.push(texture);

		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		// Add script component
		var script = {
			t : 0,
			init : function(entity) {

			},
			run : function(entity) {
				var transformComponent = entity.TransformComponent;
				transformComponent.transform.translation.x = Math.sin(this.t + 4) * 30;
				transformComponent.transform.translation.z = Math.cos(this.t + 4) * 30;
				transformComponent.setUpdated();

				this.t += entity._world.tpf;
			}
		};
		entity.setComponent(new ScriptComponent(script));

		return entity;
	}

	function getShader(id) {
		var shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}

		var str = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType === 3) {
				str += k.textContent;
			}
			k = k.nextSibling;
		}

		return str;
	}

	init();
});
