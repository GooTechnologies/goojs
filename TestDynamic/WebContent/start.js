"use strict";

require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System',
		'goo/entities/systems/TransformSystem', 'goo/entities/systems/RenderSystem',
		'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem',
		'goo/renderer/MeshData', 'goo/renderer/Renderer', 'goo/renderer/Material', 'goo/renderer/Shader',
		'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader', 'goo/loaders/JSONImporter',
		'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils'], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent,
	MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils) {

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// var ui = new DebugUI(goo);

		// Examples of model loading
		loadModels(goo);

		// Add quad
		var quadEntity = createQuadEntity(goo);
		quadEntity.addToWorld();

		// Add box
		var boxEntity = createBoxEntity(goo);
		boxEntity.addToWorld();
	}

	function loadModels(goo) {
		var importer = new JSONImporter(goo.world);

		// Load asynchronous with callback
		importer.load('resources/girl.model', 'resources/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(0.15, 0.15, 0.15);
				var t = 0;
				var zero = new THREE.Vector3();
				goo.callbacks.push(function(tpf) {
					var transformComponent = entities[0].transformComponent;
					transformComponent.transform.translation.x = Math.sin(t) * 30;
					transformComponent.transform.translation.z = Math.cos(t) * 30;
					transformComponent.transform.rotation.y = Math.sin(t * 1.5) * 3;
					transformComponent.setUpdated();

					goo.renderer.camera.position.x = Math.sin(t * 1.0) * 50 + 70;
					goo.renderer.camera.position.y = 20;
					goo.renderer.camera.position.z = Math.sin(t * 1.0) * 50 + 70;
					goo.renderer.camera.lookAt(zero);
					goo.renderer.camera.updateWorld();

					t += tpf;
				});
			},
			onError : function(error) {
				console.error(error);
			}
		});

		// Load asynchronous with callback
		importer.load('resources/head.model', 'resources/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(50, 50, 50);
				var t = 0;
				goo.callbacks.push(function(tpf) {
					var transformComponent = entities[0].transformComponent;
					transformComponent.transform.translation.x = Math.sin(t + 3) * 30;
					transformComponent.transform.translation.y = Math.sin(t) * 0;
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

		// Load asynchronous with callback
		importer.load('resources/shoes/shoes_compressed.json', 'resources/shoes/textures/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(1.5, 1.5, 1.5);
				var script = {
					t : 0,
					init : function(entity) {

					},
					run : function(entity) {
						var transformComponent = entities[0].transformComponent;
						transformComponent.transform.rotation.y = this.t * 0.5;
						transformComponent.setUpdated();

						this.t += entity._world.tpf;
					}
				};
				entities[0].setComponent(new ScriptComponent(script));
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
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR, MeshData.TEXCOORD0]);
		// Add custom attribute
		attributeMap.Stuff = {
			count : 1,
			type : 'Byte'
		};

		var meshData = new MeshData(attributeMap, 4, 6);

		// Fill attribute buffers
		meshData.getAttributeBuffer(MeshData.POSITION).set([-5, -5, 0, -5, 5, 0, 5, 5, 0, 5, -5, 0]);
		meshData.getAttributeBuffer(MeshData.COLOR).set(
			[1.0, 0.5, 0.5, 1.0, 0.5, 1.0, 0.5, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, ]);
		meshData.getAttributeBuffer(MeshData.TEXCOORD0).set([0, 0, 0, 1, 1, 1, 1, 0]);
		meshData.getAttributeBuffer('Stuff').set([0, 1, 2, 3]);
		meshData.getIndexBuffer().set([0, 1, 3, 1, 2, 3]);

		// Create entity
		var entity = world.createEntity();

		// Create meshdata component using above data
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		var material = new Material('QuadMaterial');

		var vs = getShader('vshader');
		var fs = getShader('fshader');

		material.shader = new Shader('QuadShader', vs, fs);

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
				var transformComponent = entity.transformComponent;
				transformComponent.transform.translation.x = Math.sin(this.t + 4) * 30;
				transformComponent.transform.translation.z = Math.cos(this.t + 4) * 30;
				transformComponent.setUpdated();

				this.t += entity._world.tpf;
			}
		};
		entity.setComponent(new ScriptComponent(script));

		return entity;
	}

	function createBoxEntity(goo) {
		var entity = ShapeCreator.createBoxEntity(goo.world, 15, 5, 15);
		entity.transformComponent.transform.translation.y = -10;
		entity.name = "Box";

		var material = new Material('TestMaterial');

		var vs = Material.shaders.texturedLit.vshader;
		var fs = Material.shaders.texturedLit.fshader;

		material.shader = new Shader('BoxShader', vs, fs);

		var texture = new TextureCreator().loadTexture2D('resources/pitcher.jpg');
		material.textures.push(texture);

		entity.meshRendererComponent.materials.push(material);

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
