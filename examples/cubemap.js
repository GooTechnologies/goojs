require({
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
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3',
		'goo/scripts/BasicControlScript', 'goo/renderer/shaders/ShaderFragments'], function(World, Entity, System, TransformSystem, RenderSystem,
	TransformComponent, MeshDataComponent, MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner,
	TextureCreator, Loader, JSONImporter, ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3,
	BasicControlScript, ShaderFragments) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		// Add box
		var boxEntity = createBoxEntity(goo);
		boxEntity.addToWorld();

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(10, 20, 20);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
	}

	function createBoxEntity(goo) {
		var meshData = ShapeCreator.createBox(10, 10, 10);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData);
		entity.name = "Box";

		var material = new Material('TestMaterial');
		material.shader = Material.createShader(createShaderDef(), 'CubeShader');

		var texture = new TextureCreator().loadTextureCube([resourcePath + '/pitcher.jpg', resourcePath + '/pitcher.jpg',
				resourcePath + '/pitcher.jpg', resourcePath + '/pitcher.jpg', resourcePath + '/pitcher.jpg', resourcePath + '/pitcher.jpg']);
		material.textures.push(texture);

		entity.meshRendererComponent.materials.push(material);

		entity.setComponent(new ScriptComponent(new BasicControlScript()));

		return entity;
	}

	function createShaderDef() {
		return {
			includes : [ShaderFragments.features.fog],
			attributes : {
				vertexPosition : MeshData.POSITION,
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				diffuseMap : Shader.TEXTURE0
			},
			vshader : [ //
			'attribute vec3 vertexPosition;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//

			'varying vec3 texCoord0;',//

			'void main(void) {', //
			'	vec4 t = worldMatrix * vec4(vertexPosition, 1.0);',//
			'	texCoord0 = normalize(t.xyz);',//
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform samplerCube diffuseMap;',//

			'varying vec3 texCoord0;',//

			'void main(void)',//
			'{',//
			'	gl_FragColor = vec4(textureCube(diffuseMap, texCoord0).rgb, 1.0);',//
			'}',//
			].join('\n')
		};
	}

	init();
});
