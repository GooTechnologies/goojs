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
	'goo/renderer/TextureCreator',
	'goo/loaders/JSONImporter',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/ShapeCreator',
	'goo/entities/EntityUtils',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/Util',
	'goo/renderer/pass/BloomPass',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/renderer/shaders/ShaderLib',
	'goo/scripts/OrbitCamControlScript'
], function (
	Material,
	GooRunner,
	TextureCreator,
	JSONImporter,
	ScriptComponent,
	ShapeCreator,
	EntityUtils,
	Camera,
	CameraComponent,
	Composer,
	RenderPass,
	FullscreenPass,
	Util,
	BloomPass,
	Vector3,
	Vector4,
	ShaderLib,
	OrbitCamControlScript
) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : false
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

		// Create composer with same size as screen
		var composer = new Composer(); // or new RenderTarget(sizeX, sizeY, options);

		// Scene render
		var renderPass = new RenderPass(goo.world.getSystem('RenderSystem').renderList);
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

		var shaders = [
			'copy',
			'copyPure',
			'textured',
			'texturedLit',
			'bokehShader',
			'sepia',
			'dotscreen',
			'vignette',
			'film',
			'bleachbypass',
			'horizontalTiltShift',
			'colorify',
			'normalmap',
			'rgbshift',
			'brightnesscontrast',
			'luminosity',
			'downsample',
			'boxfilter'
		];
		for ( var i = 0; i < shaders.length; i++) {
			var key = shaders[i];
			console.log(key);

			var inp = document.createElement('li');
			inp.setAttribute('onclick', 'selectEffect("'+key+'");');
			var t = document.createTextNode(key);
			inp.appendChild(t);

			document.getElementById('list').appendChild(inp);
		}

		// object to hold proxy properties for dat.gui use
		var proxies;
		window.selectEffect = function(effect) {
			console.log(effect);

			proxies = {};

			coolPass.material = Material.createMaterial(Util.clone(ShaderLib[effect]));
			coolPass.renderable.materials = [coolPass.material];

			var infoPanel = document.getElementById('effectInfo');

			var t = document.createTextNode(effect);
			var effectName = document.getElementById('effectName');
			if(effectName.childNodes.length > 0) {
				effectName.replaceChild(t, effectName.firstChild);
			} else {
				effectName.appendChild(t);
			}

			if(infoPanel.childNodes.length > 1) {
				infoPanel.removeChild(infoPanel.lastChild);
			}
			var gui = new dat.GUI({
				name: effect,
				autoPlace: false
			});
			var uniforms = coolPass.material.shader.uniforms;
			var arrayHandle = function (value) {
				var valueArray = value.split(',');
				for (var i = 0; i < valueArray.length; i++) {
					valueArray[i] = parseFloat(valueArray[i]);
				}
				// WARNING Hack-ish, but meh, it's just a demo
				uniforms[this.property] = valueArray;
			};
			var colorHandle = function (value) {
				uniforms.color = [proxies.red, proxies.green, proxies.blue];
			};
			for (var key in uniforms) {
				console.log(key, uniforms[key]);

				if (uniforms[key] instanceof Array) {
					// WARNING Hack-ish, but meh, it's just a demo
					if (effect === 'colorify' && key === 'color') {
						proxies.red = uniforms[key][0];
						proxies.green = uniforms[key][1];
						proxies.blue = uniforms[key][2];

						gui.add(proxies, 'red', 0, 1).onChange(colorHandle).step(0.01);
						gui.add(proxies, 'green', 0, 1).onChange(colorHandle).step(0.01);
						gui.add(proxies, 'blue', 0, 1).onChange(colorHandle).step(0.01);
					} else {
						proxies[key] = uniforms[key].toString();
						gui.add(proxies, key).onFinishChange(arrayHandle);
					}
				} else if(uniforms[key] instanceof Object) {
					console.log("Nested object, can't display ", uniforms[key]);
				} else {
					if (typeof (uniforms[key]) === 'string') {
						console.log('Skipping string option ', key);
					} else {
						gui.add(uniforms, key);
					}
				}
			}

			infoPanel.appendChild(gui.domElement);
		};

		// Regular copy
		// var shader = Util.clone(ShaderLib.copy);
		// var outPass = new FullscreenPass(shader);
		// outPass.renderToScreen = true;

		composer.addPass(renderPass);
		composer.addPass(bloomPass);
		composer.addPass(coolPass);
		// composer.addPass(outPass);

		goo.renderSystem.composers.push(composer);
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
