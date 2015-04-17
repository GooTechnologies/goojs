require([
	'lib/V',

	'goo/math/Vector3',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FurPass',
	'goo/renderer/TextureCreator',

	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/shapes/Torus',
	'goo/shapes/Box',
	'goo/util/TangentGenerator',

	'goo/entities/components/ScriptComponent',
	'goo/noise/Noise',
	'goo/noise/ValueNoise'
],
function(
	V,

	Vector3,
	Composer,
	RenderPass,
	FurPass,
	TextureCreator,

	Sphere,
	Quad,
	Torus,
	Box,
	TangentGenerator,

	ScriptComponent,
	Noise,
	ValueNoise
	) {
	"use strict";

	var gui;

	var goo;

	var furSettings = {
		layerCount: 20,
		perVertNoisePower: 1.0,
	};



	var furUniforms;

	function init() {
		V.describe('Its getting hairy!');

		goo = V.initGoo();

		gui = new window.dat.GUI();

		createFurRenderingRoutine();

		var material = V.getColoredMaterial();

		//var meshData = new Sphere(32, 32);
		//var meshData = new Quad();
		var meshData = new Torus(32, 32);
		//var meshData = new Box()

		TangentGenerator.addTangentBuffer(meshData);

		var entity = goo.world.createEntity(
						meshData,
						material
					);
		var s = 10;
		entity.setScale(s, s, s);
		entity.addToWorld();


		var scriptEntity = goo.world.createEntity();
		var updateFurScript = {
			run: function (entity, tpf, ctx, params) {
				var t = entity._world.time;
				furUniforms.displacement[2] = Math.sin(t * 0.5 - 10);
				furUniforms.displacement[1] = Math.sin(t);
				furUniforms.displacement[0] = Math.cos(t * 0.5);
				

				var scale = 0.3;
				var octaves = 3;
				var persistance = 0.8;
				var lacunarity = 2.0;
				var noise = Noise.fractal1d(t, scale, octaves, persistance, lacunarity, ValueNoise);
				var radius = 19;
				furUniforms.vertDisplacement = furSettings.perVertNoisePower * noise;
				furUniforms.vertDistancePos[0] = radius * Math.sin(t);
				furUniforms.vertDistancePos[1] = radius * Math.cos(t);
			}
		}
		var sc = new ScriptComponent([updateFurScript]);
		scriptEntity.set(sc);
		scriptEntity.addToWorld();

		V.addOrbitCamera(new Vector3(90, Math.PI / 2, 0));
		//V.addLights();

		V.process();
	}


	function createFurRenderingRoutine() {

		var renderList = goo.world.getSystem('RenderSystem').renderList;
		var composer = new Composer();

		var regularPass = new RenderPass(renderList);
		regularPass.renderToScreen = true;

		// TODO: Add filter , to only render entities with FurComponents in the FurPass.
		var furPass = new FurPass(renderList, furSettings.layerCount);
		furPass.clear = false;

		var furFolder = gui.addFolder("Fur Uniforms");
		furFolder.add(furPass.furUniforms, 'furRepeat', 1, 15);
		furFolder.add(furPass.furUniforms, 'hairLength', 0.1, 20);
		furFolder.add(furPass.furUniforms, 'curlFrequency', 0, 100);
		furFolder.add(furPass.furUniforms, 'curlRadius', -1, 1);
		furFolder.add(furPass.furUniforms, 'shadow', 1, 10);
		furFolder.add(furPass.furUniforms, 'specularPower', 0, 200);
		furFolder.add(furPass.furUniforms, 'specularBlend', 0, 1);
		furFolder.add(furPass.furUniforms, 'vertDisplacementRadius', 0, 100);
		furFolder.add(furSettings, 'perVertNoisePower', 0, 20);
		furFolder.open();

		window.furUniforms = furPass.furUniforms;
		furUniforms = furPass.furUniforms;

		var controller = gui.add(furSettings, 'layerCount', 1, 100).step(1);
		controller.onFinishChange(function(value) {
			furPass.regenerateLayers(value);
		});

		composer.addPass(regularPass);
		composer.addPass(furPass);

		goo.world.getSystem('RenderSystem').composers.push(composer);
	}

	init();
});