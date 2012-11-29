"use strict";

require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/scripts/BasicControlScript',
		'goo/entities/EventHandler', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/renderer/pass/Composer',
		'goo/renderer/pass/RenderPass', 'goo/renderer/pass/FullscreenPass', 'goo/renderer/Util', 'goo/renderer/pass/RenderTarget',
		'goo/renderer/pass/BloomPass', 'goo/math/Vector3', 'goo/math/Vector4'], function(World, Entity, System, TransformSystem, RenderSystem,
	TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light, BasicControlScript,
	EventHandler, Camera, CameraComponent, Composer, RenderPass, FullscreenPass, Util, RenderTarget, BloomPass, Vector3, Vector4) {

	function init() {
		// Create typical goo application
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		camera.translation.set(0, 5, 25);
		camera.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		// Examples of model loading
		loadModels(goo);

		// Disable normal rendering
		goo.world.getSystem('RenderSystem').doRender = false;

		// Create composer with same size as screen
		var composer = new Composer(); // or new RenderTarget(sizeX, sizeY, options);

		// Scene render
		var renderPass = new RenderPass(goo.world.getSystem('PartitioningSystem').renderList);
		renderPass.clearColor = new Vector4(0.1, 0.1, 0.1, 0.0);

		// Bloom
		var bloomPass = new BloomPass();

		// Film grain
		var coolPass = new FullscreenPass(createFilmShader(goo));
		coolPass.renderToScreen = true;

		// Regular copy
		// var shader = Util.clone(Material.shaders.copy);
		// var outPass = new FullscreenPass(shader);
		// outPass.renderToScreen = true;

		composer.addPass(renderPass);
		composer.addPass(bloomPass);
		composer.addPass(coolPass);
		// composer.addPass(outPass);

		var f = 0;
		goo.callbacks.push(function(tpf) {
			composer.render(goo.renderer, tpf);

			f = (f + 1) % 100;
			if (f === 0) {
				console.log(goo.renderer.info.toString());
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

				entities[0].setComponent(new ScriptComponent(new BasicControlScript()));
			},
			onError : function(error) {
				console.error(error);
			}
		});
	}

	function createFilmShader(goo) {
		var shader = {
			bindings : {
				"tDiffuse" : {
					type : "int",
					value : 0
				},
				"time" : {
					type : "float",
					value : function() {
						return goo.world.time * 1.0;
					}
				},
				"nIntensity" : {
					type : "float",
					value : 0.5
				},
				"sIntensity" : {
					type : "float",
					value : 0.05
				},
				"sCount" : {
					type : "float",
					value : 4096
				},
				"grayscale" : {
					type : "int",
					value : 0
				}
			},
			vshader : Material.shaders.copy.vshader,
			fshader : [//
			"precision mediump float;",//

			// control parameter
			"uniform float time;",

			"uniform bool grayscale;",

			// noise effect intensity value (0 = no effect, 1 = full effect)
			"uniform float nIntensity;",

			// scanlines effect intensity value (0 = no effect, 1 = full effect)
			"uniform float sIntensity;",

			// scanlines effect count value (0 = no effect, 4096 = full effect)
			"uniform float sCount;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 texCoord0;",

			"void main() {",

			// sample the source
			"vec4 cTextureScreen = texture2D( tDiffuse, texCoord0 );",

			// make some noise
			"float x = texCoord0.x * texCoord0.y * time * 1000.0;", "x = mod( x, 13.0 ) * mod( x, 123.0 );", "float dx = mod( x, 0.01 );",

			// add noise
			"vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",

			// get us a sine and cosine
			"vec2 sc = vec2( sin( texCoord0.y * sCount ), cos( texCoord0.y * sCount ) );",

			// add scanlines
			"cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

			// interpolate between source and result by intensity
			"cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

			// convert to grayscale if desired
			"if( grayscale ) {",

			"cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

			"}",

			"gl_FragColor = vec4( cResult, cTextureScreen.a );",

			"}"].join('\n')
		};
		return shader;
	}
	init();
});
