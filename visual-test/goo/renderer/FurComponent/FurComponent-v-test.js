require([
	'lib/V',

	'goo/math/Vector3',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FurPass',

	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/shapes/Torus',
	'goo/shapes/Box',
	'goo/util/TangentGenerator'
],
function(
	V,

	Vector3,
	Composer,
	RenderPass,
	FurPass,

	Sphere,
	Quad,
	Torus,
	Box,
	TangentGenerator
	) {
	"use strict";

	var gui;

	var goo;

	function init() {
		V.describe('Its getting hairy!');

		goo = V.initGoo();

		gui = new window.dat.GUI();

		createFurRenderingRoutine();

		var material = V.getColoredMaterial();

		//var meshData = new Sphere(32, 32);
		//var meshData = new Quad();
		var meshData = new Torus();
		//var meshData = new Box()



		TangentGenerator.addTangentBuffer(meshData);

		var entity = goo.world.createEntity(
						meshData,
						material
					);
		var s = 10;
		entity.setScale(s, s, s);
		entity.setRotation(0, 0, Math.PI/2);
		//entity.setRotation(0, Math.PI/2 , 0);
		entity.addToWorld();

		V.addOrbitCamera(new Vector3(90, Math.PI / 2, 0));
		//V.addLights();

		V.process();
	}


	var furSettings = {
		layerCount: 20
	};

	function createFurRenderingRoutine() {

		var renderList = goo.world.getSystem('RenderSystem').renderList;
		var composer = new Composer();

		var regularPass = new RenderPass(renderList);
		regularPass.renderToScreen = true;

		// TODO: Add filter , to only render entities with FurComponents in the FurPass.
		var furPass = new FurPass(renderList, furSettings.layerCount);
		furPass.clear = false;

		var furFolder = gui.addFolder("Fur Uniforms");
		furFolder.add(furPass.furUniforms, 'furRepeat', 1, 100);
		furFolder.add(furPass.furUniforms, 'hairLength', 0.1, 20);
		furFolder.add(furPass.furUniforms, 'curlFrequency', 0, 100);
		furFolder.add(furPass.furUniforms, 'curlRadius', -1, 1);
		furFolder.add(furPass.furUniforms, 'shadow', 1, 10);
		furFolder.add(furPass.furUniforms, 'specularPower', 0, 1000);
		furFolder.add(furPass.furUniforms, 'specularBlend', 0, 1);
		furFolder.open();

		window.furUniforms = furPass.furUniforms;

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