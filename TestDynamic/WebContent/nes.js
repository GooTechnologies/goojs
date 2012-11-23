"use strict";

require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/scripts/BasicControlScript',
		'goo/entities/EventHandler', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/renderer/pass/Composer',
		'goo/renderer/pass/RenderPass', 'goo/renderer/pass/FullscreenPass', 'goo/renderer/Util', 'goo/renderer/pass/RenderTarget',
		'goo/renderer/pass/BloomPass', 'goo/math/Vector3', 'goo/math/Vector4', 'goo/renderer/pass/NesPass', 'goo/math/Transform'], function(World,
	Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData,
	Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent,
	Light, BasicControlScript, EventHandler, Camera, CameraComponent, Composer, RenderPass, FullscreenPass, Util, RenderTarget, BloomPass, Vector3,
	Vector4, NesPass, Transform) {

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		camera.translation.set(0, 15, 75);
		camera.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// Examples of model loading
		loadModels(goo);

		// Disable normal rendering
		goo.world.getSystem('RenderSystem').doRender = false;

		// Create composer with same size as screen
		var composer = new Composer(new RenderTarget(256, 224, {
			magFilter : 'NearestNeighbor'
		}));

		// Scene render
		var renderPass = new RenderPass(goo.world.getSystem('PartitioningSystem').renderList);
		renderPass.clearColor = new Vector4(0.1, 0.1, 0.1, 0.0);

		// NES
		var nesPass = new NesPass();

		// Regular copy
		var outPass = new FullscreenPass(Util.clone(Material.shaders.copy));
		// outPass.renderToScreen = true;

		composer.addPass(renderPass);
		composer.addPass(nesPass);
		composer.addPass(outPass);

		var material = Material.createMaterial(Material.shaders.textured);
		material.textures[0] = composer.readBuffer;

		var materialLit = Material.createMaterial(Material.shaders.textured);
		var base = new TextureCreator().loadTexture2D('resources/pitcher.jpg');
		materialLit.textures[0] = base;

		var comp = [];
		var importer = new JSONImporter(goo.world);
		importer.load('resources/computer.json', 'resources/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(50, 50, 50);
				entities[0].transformComponent.transform.translation.y = 0;
				entities[0].setComponent(new ScriptComponent(new BasicControlScript()));

				var reg = new RegExp('Screen');
				for ( var j = 0; j < entities.length; j++) {
					entities[j].skip = true;
					if (entities[j].meshDataComponent) {
						comp.push(entities[j]);
						if (reg.test(entities[j].name)) {
							entities[j].meshRendererComponent.materials[0] = material;
						} else {
							entities[j].meshRendererComponent.materials[0] = materialLit;
						}
					}
				}
			},
			onError : function(error) {
				console.error(error);
			}
		});

		// var renderableThing = {
		// meshData : ShapeCreator.createBoxData(20, 20, 20),
		// materials : [material],
		// transform : new Transform()
		// };

		goo.callbacks.push(function(tpf) {
			composer.render(goo.renderer, tpf);
			// goo.renderer.render(renderableThing, Renderer.mainCamera, [], null, true);
			if (comp !== null) {
				goo.renderer.render(comp, Renderer.mainCamera, [], null, true);
			}
		});
	}

	function loadModels(goo) {
		var importer = new JSONImporter(goo.world);

		importer.load('resources/head.model', 'resources/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(40, 40, 40);
				entities[0].transformComponent.transform.translation.y = 15;

				entities[0].setComponent(new ScriptComponent(new BasicControlScript()));
			},
			onError : function(error) {
				console.error(error);
			}
		});

		// Load asynchronous with callback
		importer.load('resources/girl.model', 'resources/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(0.15, 0.15, 0.15);
				var script = {
					run : function(entity) {
						var t = entity._world.time;

						var transformComponent = entity.transformComponent;
						transformComponent.transform.translation.x = Math.sin(t) * 30;
						transformComponent.transform.translation.z = Math.cos(t) * 30;
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
				// entities[0].transformComponent.transform.scale.set(1.5, 1.5, 1.5);
				entities[0].transformComponent.transform.translation.y = -5;
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

	var litShader = {
		vshader : [ //
		'attribute vec3 vertexPosition; //!POSITION', //
		'attribute vec3 vertexNormal; //!NORMAL', //

		'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
		'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
		'uniform mat4 worldMatrix; //!WORLD_MATRIX',//
		'uniform vec3 cameraPosition; //!CAMERA', //
		'uniform vec3 lightPosition; //!LIGHT0', //

		'varying vec3 normal;',//
		'varying vec3 lightDir;',//
		'varying vec3 eyeVec;',//

		'void main(void) {', //
		'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', //
		'	gl_Position = projectionMatrix * viewMatrix * worldPos;', //

		'	normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;', //
		'	lightDir = lightPosition - worldPos.xyz;', //
		'	eyeVec = cameraPosition - worldPos.xyz;', //
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',//

		'uniform vec4 materialAmbient; //!AMBIENT',//
		'uniform vec4 materialDiffuse; //!DIFFUSE',//
		'uniform vec4 materialSpecular; //!SPECULAR',//
		'uniform float materialSpecularPower; //!SPECULAR_POWER',//

		'varying vec3 normal;',//
		'varying vec3 lightDir;',//
		'varying vec3 eyeVec;',//

		'void main(void)',//
		'{',//
		'	vec4 final_color = materialAmbient;',//

		'	vec3 N = normalize(normal);',//
		'	vec3 L = normalize(lightDir);',//

		'	float lambertTerm = dot(N,L)*0.75+0.25;',//

		'	if(lambertTerm > 0.0)',//
		'	{',//
		'		final_color += materialDiffuse * // gl_LightSource[0].diffuse * ',//
		'					   lambertTerm;	',//
		'		vec3 E = normalize(eyeVec);',//
		'		vec3 R = reflect(-L, N);',//
		'		float specular = pow( max(dot(R, E), 0.0), materialSpecularPower);',//
		'		final_color += materialSpecular * // gl_LightSource[0].specular * ',//
		'					   specular;	',//
		'		final_color = clamp(final_color, vec4(0.0), vec4(1.0));',//
		'	}',//
		'	gl_FragColor = vec4(final_color.rgb, texCol.a);',//
		'}',//
		].join('\n')
	};

	init();
});
