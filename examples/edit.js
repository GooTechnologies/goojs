require({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		ace : "../lib/ace"
	}
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/entities/systems/PartitioningSystem', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/renderer/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3',
		'goo/math/Vector2', 'goo/scripts/BasicControlScript', 'goo/math/Ray', 'ace/ace'], function(World, Entity, System, TransformSystem,
	RenderSystem, TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, Vector2,
	BasicControlScript, Ray, ace) {
	"use strict";

	var resourcePath = "../resources";

	var material;

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : false
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		material = Material.createMaterial(Material.shaders.textured);
		// var texture = new TextureCreator().loadTexture2D(resourcePath + '/pitcher.jpg');
		var colorInfo = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
		var texture = new Texture(colorInfo, null, 2, 2);
		texture.minFilter = 'NearestNeighborNoMipMaps';
		texture.magFilter = 'NearestNeighbor';
		texture.generateMipmaps = false;
		material.textures.push(texture);

		createShapes(goo);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		camera.translation.set(0, 0, 10);
		camera.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		var uniformEditor = ace.edit("uniformEditor");
		uniformEditor.getSession().setUseWrapMode(true);
		uniformEditor.setTheme("ace/theme/monokai");
		uniformEditor.getSession().setMode("ace/mode/javascript");
		// uniformEditor.getSession().setMode("ace/mode/json");
		uniformEditor.setValue(JSON.stringify(material.shader.uniforms));
		uniformEditor.getSession().on('change', function(e) {
			try {
				material.shader.uniforms = JSON.parse(uniformEditor.getValue());
			} catch (err) {
				// console.error(err);
			}
		});

		var vertexEditor = ace.edit("vertexEditor");
		vertexEditor.getSession().setUseWrapMode(true);
		vertexEditor.setTheme("ace/theme/monokai");
		vertexEditor.getSession().setMode("ace/mode/glsl");
		vertexEditor.setValue(material.shader.vertexSource);
		vertexEditor.getSession().on('change', function(e) {
			material.shader.vertexSource = vertexEditor.getValue();
			material.shader.shaderProgram = null;
		});

		var fragmentEditor = ace.edit("fragmentEditor");
		fragmentEditor.getSession().setUseWrapMode(true);
		fragmentEditor.setTheme("ace/theme/monokai");
		fragmentEditor.getSession().setMode("ace/mode/glsl");
		fragmentEditor.setValue(material.shader.fragmentSource);
		fragmentEditor.getSession().on('change', function(e) {
			material.shader.fragmentSource = fragmentEditor.getValue();
			material.shader.shaderProgram = null;
		});
	}

	// Create simple quad
	function createShapes(goo) {
		createMesh(goo, ShapeCreator.createTeapot(), -10, -10, -30);
		createMesh(goo, ShapeCreator.createSphere(16, 16, 2), -10, 0, -30);
		createMesh(goo, ShapeCreator.createBox(3, 3, 3), -10, 10, -30);
		createMesh(goo, ShapeCreator.createQuad(3, 3), 0, -7, -20);
		createMesh(goo, ShapeCreator.createTorus(16, 16, 1, 3), 0, 0, -30);
	}

	function createMesh(goo, meshData, x, y, z) {
		var world = goo.world;

		// Create entity
		var entity = world.createEntity();

		entity.transformComponent.transform.translation.set(x, y, z);

		// Create meshdata component using above data
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		entity.setComponent(new ScriptComponent(new BasicControlScript(goo.renderer.domElement)));

		entity.addToWorld();
	}

	init();
});
