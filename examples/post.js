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
		'goo/entities/EntityUtils', 'goo/entities/components/LightComponent', 'goo/renderer/Light', 'goo/scripts/BasicControlScript',
		'goo/entities/EventHandler', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/renderer/pass/Composer',
		'goo/renderer/pass/RenderPass', 'goo/renderer/pass/FullscreenPass', 'goo/renderer/Util', 'goo/renderer/pass/RenderTarget',
		'goo/renderer/pass/BloomPass', 'goo/math/Vector3', 'goo/math/Vector4', 'goo/renderer/pass/BlurPass', 
		'goo/renderer/shaders/ShaderLib', 'goo/scripts/OrbitCamControlScript'], function(World, Entity, System,
	TransformSystem, RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material,
	Shader, GooRunner, TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, LightComponent, Light,
	BasicControlScript, EventHandler, Camera, CameraComponent, Composer, RenderPass, FullscreenPass, Util, RenderTarget, BloomPass, Vector3, Vector4,
	BlurPass, ShaderLib, OrbitCamControlScript) {
	"use strict";

	var resourcePath = "../resources";

	function removeChildrenFromNode(node) {
		while (node.hasChildNodes()) {
			node.removeChild(node.firstChild);
		}
	}
	
	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 5, 25);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		cameraEntity.setComponent(new ScriptComponent(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(30, Math.PI / 2, 0),
			minAscent : -0.1,
			maxAscent : 1,
			maxZoomDistance : 50	
		})));

		// Examples of model loading
		loadModels(goo);

		// Disable normal rendering
		goo.world.getSystem('RenderSystem').doRender = false;

		// Create composer with same size as screen
		var composer = new Composer(); // or new RenderTarget(sizeX, sizeY, options);

		// Scene render
		var renderPass = new RenderPass(goo.world.getSystem('PartitioningSystem').renderList);
		renderPass.clearColor = new Vector4(0.1, 0.1, 0.1, 1.0);
//		renderPass.clearColor = new Vector4(0.7,0.7,0.7,1);
		// renderPass.overrideMaterial = Material.createMaterial(ShaderLib.showNormals);
//		renderPass.renderToScreen = true;

		// Bloom
		var bloomPass = new BloomPass();
		// var bloomPass = new BlurPass();

		// Film grain
		var coolPass = new FullscreenPass(ShaderLib.copy);
//		var coolPass = new FullscreenPass(ShaderLib.film);
//		var coolPass = new FullscreenPass(ShaderLib.sepia);
//		var coolPass = new FullscreenPass(ShaderLib.dotscreen);
//		var coolPass = new FullscreenPass(ShaderLib.vignette);
//		var coolPass = new FullscreenPass(ShaderLib.bleachbypass);
//		var coolPass = new FullscreenPass(ShaderLib.horizontalTiltShift);
//		var coolPass = new FullscreenPass(ShaderLib.horizontalTiltShift);
		coolPass.renderToScreen = true;

		for ( var key in ShaderLib) {
			console.log(key);

			var inp = document.createElement('button');
			inp.setAttribute('onclick', 'selectEffect("'+key+'");');
			var t = document.createTextNode(key);
			inp.appendChild(t);

			document.getElementById('sel').appendChild(inp);
		}
		
		var elem = document.getElementById('effectInfo');
		window.selectEffect = function(effect) {
			console.log(effect);
			
			coolPass.material = Material.createMaterial(Util.clone(ShaderLib[effect]));
			coolPass.renderable.materials = [coolPass.material];
			
			removeChildrenFromNode(elem);
			for (var key in coolPass.material.shader.uniforms) {
				var div = document.createElement('div');
				elem.appendChild(div);

				var t = document.createTextNode(key);
				div.appendChild(t);

				var inp = document.createElement('input');
				inp.setAttribute('type', 'text');
				inp.setAttribute('value', JSON.stringify(coolPass.material.shader.uniforms[key]));
				inp.addEventListener('change', function(val) {
					console.log(val.srcElement.value);
					coolPass.material.shader.uniforms[key] = eval(val.srcElement.value);
				}, false);
				div.appendChild(inp);
			}
		};
		
		// Regular copy
		// var shader = Util.clone(ShaderLib.copy);
		// var outPass = new FullscreenPass(shader);
		// outPass.renderToScreen = true;

		composer.addPass(renderPass);
		composer.addPass(bloomPass);
		composer.addPass(coolPass);
		// composer.addPass(outPass);

		goo.callbacks.push(function(tpf) {
			composer.render(goo.renderer, tpf);
		});
	}

	function loadModels(goo) {
		var parentEntity = goo.world.createEntity();
		parentEntity.addToWorld();
		
		var importer = new JSONImporter(goo.world);

		importer.load(resourcePath + '/head.model', resourcePath + '/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(40, 40, 40);

				parentEntity.transformComponent.attachChild(entities[0].transformComponent);
			},
			onError : function(error) {
				console.error(error);
			}
		});
		
		var meshData = ShapeCreator.createBox(250, 5, 250, 20, 20);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.transformComponent.transform.translation.y = -10;
		entity.name = "Box";

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(ShaderLib.texturedLit, 'BoxShader');

		var texture = new TextureCreator().loadTexture2D(resourcePath + '/pitcher.jpg');
		material.textures.push(texture);

		entity.meshRendererComponent.materials.push(material);
		parentEntity.transformComponent.attachChild(entity.transformComponent);
		entity.addToWorld();
	}

	init();
});
