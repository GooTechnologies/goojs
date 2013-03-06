require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/MeshData',
	'goo/renderer/Util'
], function (GooRunner, EntityUtils, Material, Camera, CameraComponent, ScriptComponent, ShaderLib, MeshData, Util) {
	"use strict";

	function init() {
		var goo = new GooRunner({
			showStats : true,
			antiAlias : false
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		goo.renderer.setClearColor(0,0,0,1);

		// Add points
		var pointsEntity = createBoxEntity(goo);

		// Add spin
		pointsEntity.setComponent(new ScriptComponent({
			run : function(entity) {
				entity.transformComponent.transform.setRotationXYZ(
					entity._world.time * 0.3,
					entity._world.time * 0.6,
					0
				);
				entity.transformComponent.setUpdated();

//				var verts = entity.meshDataComponent.meshData.getAttributeBuffer(MeshData.POSITION);
//				for (var i = 0; i < 500000; i++) {
//					var x = (Math.random()-0.5)*5.0;
//					var y = (Math.random()-0.5)*5.0;
//					var z = (Math.random()-0.5)*5.0;
//
//					verts[i * 3 + 0] += x;
//					verts[i * 3 + 1] += y;
//					verts[i * 3 + 2] += z;
//				}
//				entity.meshDataComponent.meshData.vertexData._dataNeedsRefresh = true;
			}
		}));
		pointsEntity.addToWorld();

		// Add camera
		var camera = new Camera(27, 1, 5, 3500);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
	}

	function createBoxEntity(goo) {
		var count = 500000;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR]);
		var meshData = new MeshData(attributeMap, count);
		meshData.indexModes = ['Points'];

		var verts = meshData.getAttributeBuffer(MeshData.POSITION);
		var colors = meshData.getAttributeBuffer(MeshData.COLOR);

		var n = 1000, n2 = n / 2;
		for (var i = 0; i < count; i++) {
			var x = Math.random() * n - n2;
			var y = Math.random() * n - n2;
			var z = Math.random() * n - n2;

			verts[i * 3 + 0] = x;
			verts[i * 3 + 1] = y;
			verts[i * 3 + 2] = z;
			var l = (Math.max(x*x, y*y, z*z) / (n2*n2)) * 0.8 + 0.2;

			var vx = (x / n) + 0.5;
			var vy = (y / n) + 0.5;
			var vz = (z / n) + 0.5;

			colors[i * 4 + 0] = vx * l;
			colors[i * 4 + 1] = vy * l;
			colors[i * 4 + 2] = vz * l;
			colors[i * 4 + 3] = 1.0;
		}

		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.transformComponent.transform.translation.z = -2750;

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(Util.clone(ShaderLib.point), 'PointShader');
		entity.meshRendererComponent.materials.push(material);

		return entity;
	}

	init();
});
