require.config({
	paths: {
		"goo": "../../../src/goo"
	}
});

require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/entities/components/LightComponent'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	EntityUtils,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	DirectionalLight,
	SpotLight,
	LightComponent
	) {
	'use strict';

	function buildCombined(verts1, indices1, indexLength1, indexMode1, verts2, indices2, indexLength2, indexMode2) {
		var verts = verts1.concat(verts2);
		var indices = indices1.concat(indices2);

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), verts.length, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = [indexLength1, indexLength2];
		meshData.indexModes = [indexMode1, indexMode2];

		return meshData;
	}
	//--------
	function wrapAndAdd(goo, meshData, x, y, z) {
		x = x || 0;
		y = y || 0;
		z = z || 0;
		var material = Material.createMaterial(ShaderLib.simpleLit, '');
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData, material);
		entity.transformComponent.transform.translation.set(x, y, z);
		entity.addToWorld();
		console.log('Added', entity);
		return entity;
	}
	//--------
	function indexModesDemo(goo) {
		//have a 7x7 grid of all possible combiations? (Points-Points, Points-Lines, ... )
		/*
		var indexModes = [
			[[6, 6, 0], 'Points'],
			'Lines',
			'LineStrip',
			'LineLoop',
			'Triangles',
			'TriangleStrip',
			'TriangleFan']; */

		var triangleAndLine = buildCombined(
			[0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 2], 3, 'Triangles',
			[2, 2, 0, 2, 3, 0], [3, 4], 2, 'Lines');
		wrapAndAdd(goo, triangleAndLine, 5, -5);

		// light
		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.transform.translation.set(-1, -3, -5);
		lightEntity.addToWorld();

		// camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(20, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		indexModesDemo(goo);
	}

	init();
});
