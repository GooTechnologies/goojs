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
	'goo/entities/components/ScriptComponent',
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
	ScriptComponent,
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
		return entity;
	}


	var moveScript = new ScriptComponent([{run: function(ent, tpf) { 
		if (ent.atime == undefined)
			ent.atime = tpf;
		else
			ent.atime += tpf;
			
		ent.transformComponent.setTranslation(Math.sin(ent.atime)*10, Math.cos(ent.atime)*10, -300);
	} }]);
	

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
		createMesh(goo, ShapeCreator.createTorus(16, 16, 1, 3), material, 0, 0, -30).setComponent(moveScript);
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
		
		var el1 = document.getElementById('html1');
		var el2 = document.getElementById('html2');
		
		var ent1 = EntityUtils.createHTMLEntity(goo.world, el1);
		var ent2 = EntityUtils.createHTMLEntity(goo.world, el2);
		ent1.transformComponent.setTranslation(0, 0, -30);
		ent2.transformComponent.setTranslation(-10, 0, -30);
		
		ent1.addToWorld();
		ent2.addToWorld();
		
		ent1.setComponent(moveScript);
		
		htmlDemo(goo);
	}

	init();
});
