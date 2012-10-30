"use strict";

require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/renderer/Texture'], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent,
	MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader,
	JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture) {

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
				var script = {
					zero : new THREE.Vector3(),
					run : function(entity) {
						var t = entity._world.time;

						var transformComponent = entity.transformComponent;
						transformComponent.transform.translation.x = Math.sin(t) * 30;
						transformComponent.transform.translation.z = Math.cos(t) * 30;
						transformComponent.transform.rotation.y = Math.sin(t * 1.5) * 3;
						transformComponent.setUpdated();

						goo.renderer.camera.position.x = Math.sin(t * 1.0) * 50 + 70;
						goo.renderer.camera.position.y = 20;
						goo.renderer.camera.position.z = Math.sin(t * 1.0) * 50 + 70;
						goo.renderer.camera.lookAt(this.zero);
						goo.renderer.camera.updateWorld();
					}
				};
				entities[0].setComponent(new ScriptComponent(script));
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
				var script = {
					run : function(entity) {
						var t = entity._world.time;

						var transformComponent = entity.transformComponent;
						transformComponent.transform.translation.x = Math.sin(t + 3) * 30;
						transformComponent.transform.translation.z = Math.cos(t + 3) * 30;
						transformComponent.transform.rotation.x = Math.sin(t) * 2;
						transformComponent.transform.rotation.y = Math.sin(t * 1.5) * 3;
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
		importer.load('resources/shoes/shoes_compressed.json', 'resources/shoes/textures/', {
			onSuccess : function(entities) {
				// Pull out the fabric entity of the shoe
				var fabricEntity;
				var name = 'polySurfaceShape10[lambert2SG]';
				for ( var key in entities) {
					var entity = entities[key];
					if (entity.name === name) {
						fabricEntity = entity;
						break;
					}
				}
				if (!fabricEntity) {
					console.error('Could not find entity: ' + name);
					return;
				}

				var script = {
					run : function(entity) {
						var t = entity._world.time;

						entity.meshRendererComponent.materials[0].materialState.diffuse.r = Math.sin(t * 3) * 0.5 + 0.5;
						entity.meshRendererComponent.materials[0].materialState.diffuse.g = Math.sin(t * 2) * 0.5 + 0.5;
						entity.meshRendererComponent.materials[0].materialState.diffuse.b = Math.sin(t * 4) * 0.5 + 0.5;
					}
				};
				fabricEntity.setComponent(new ScriptComponent(script));

				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(1.5, 1.5, 1.5);
				var script = {
					run : function(entity) {
						var t = entity._world.time;

						var transformComponent = entity.transformComponent;
						transformComponent.transform.rotation.y = t * 0.5;
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
		meshData.getAttributeBuffer(MeshData.COLOR).set([1.0, 0.5, 0.5, 1.0, 0.5, 1.0, 0.5, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, ]);
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
		material.cullState.enabled = false;

		var texture = new TextureCreator().loadTexture2D('resources/pitcher.jpg');
		// var colorInfo = new Uint8Array([255, 255, 255, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255]);
		// var texture = new Texture(colorInfo, null, 2, 2);
		material.textures.push(texture);

		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		// Add script component
		var script = {
			run : function(entity) {
				var t = entity._world.time;
				var transformComponent = entity.transformComponent;
				transformComponent.transform.translation.x = Math.sin(t + 4) * 30;
				transformComponent.transform.translation.z = Math.cos(t + 4) * 30;
				transformComponent.transform.rotation.y = Math.sin(t) * 3;
				transformComponent.setUpdated();
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
