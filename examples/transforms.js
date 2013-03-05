require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require([
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/Material',
	'goo/entities/GooRunner',
	'goo/entities/components/ScriptComponent',
	'goo/shapes/ShapeCreator',
	'goo/renderer/Texture',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/math/Vector3',
	'goo/scripts/BasicControlScript',
	'goo/renderer/shaders/ShaderLib'
], function (
	MeshDataComponent,
	MeshRendererComponent,
	Material,
	GooRunner,
	ScriptComponent,
	ShapeCreator,
	Texture,
	Camera,
	CameraComponent,
	Vector3,
	BasicControlScript,
	ShaderLib
) {
	"use strict";

	var resourcePath = "../resources";

	var material;

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		material = Material.createMaterial(ShaderLib.textured);
		// var texture = new TextureCreator().loadTexture2D(resourcePath + '/pitcher.jpg');
		var colorInfo = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
		var texture = new Texture(colorInfo, null, 2, 2);
		texture.minFilter = 'NearestNeighborNoMipMaps';
		texture.magFilter = 'NearestNeighbor';
		texture.generateMipmaps = false;
		material.textures.push(texture);
		// material.wireframe = true;

		createShapes(goo);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 10);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
	}

	// Create simple quad
	function createShapes(goo) {
		var sun = createMesh(goo, ShapeCreator.createSphere(16, 16, 1));
		var earth = createMesh(goo, ShapeCreator.createSphere(16, 16, 1));
		var moon = createMesh(goo, ShapeCreator.createSphere(16, 16, 1));

		sun.transformComponent.attachChild(earth.transformComponent);
		earth.transformComponent.attachChild(moon.transformComponent);

		sun.transformComponent.transform.translation.set(0.0, 0.0, -10.0);
		earth.transformComponent.transform.translation.set(3.0, 0.0, 0.0);
		earth.transformComponent.transform.scale.set(2.0, 1.0, 1.0);
		earth.transformComponent.transform.setRotationXYZ(0, 0, Math.PI * 0.5);
		moon.transformComponent.transform.translation.set(3.0, 0.0, 0.0);
		moon.transformComponent.transform.scale.set(0.5, 1.0, 1.0);

		sun.setComponent(new ScriptComponent(new BasicControlScript()));
	}

	function createMesh(goo, meshData) {
		var world = goo.world;

		// Create entity
		var entity = world.createEntity();

		// Create meshdata component using above data
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		entity.addToWorld();

		return entity;
	}

	init();
});
