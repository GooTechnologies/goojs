require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/HTMLComponent',
	'goo/renderer/Texture',
	'goo/entities/EntityUtils',
	'goo/math/Vector3',
	'goo/debug/Debugger'
], function (
	GooRunner,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	HTMLComponent,
	Texture,
	EntityUtils,
	Vector3,
	Debugger
) {
	'use strict';

	function createMesh(goo, meshData, material, x, y, z) {
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData, material);
		entity.transformComponent.transform.translation.set(x, y, z);
		entity.addToWorld();
	}

	function createShapes(goo) {
		var material = Material.createMaterial(ShaderLib.textured);
		var colorInfo = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
		var texture = new Texture(colorInfo, null, 2, 2);
		texture.minFilter = 'NearestNeighborNoMipMaps';
		texture.magFilter = 'NearestNeighbor';
		material.setTexture('DIFFUSE_MAP', texture);

		createMesh(goo, ShapeCreator.createSphere(16, 16, 2), material, -10, 0, -30);
		createMesh(goo, ShapeCreator.createBox(3, 3, 3), material, -10, 10, -30);
		createMesh(goo, ShapeCreator.createQuad(3, 3), material, 0, -7, -20);
		createMesh(goo, ShapeCreator.createTorus(16, 16, 1, 3), material, 0, 0, -30);
	}

	function htmlDemo(goo) {
		createShapes(goo);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 10);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
	}

	function init() {

		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);
		
		var el = document.getElementById('html1');
		
		var e = EntityUtils.createHTMLEntity(goo.world, el);
		e.transformComponent.setTranslation(0, 0, -30);
		
		e.addToWorld();
		
		console.log(e);
		
		htmlDemo(goo);
	}

	init();
});
