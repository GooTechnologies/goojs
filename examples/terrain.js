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
		'goo/scripts/BasicControlScript'], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent,
	MeshRendererComponent, PartitioningSystem, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter,
	ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, BasicControlScript) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		// Create typical goo application
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var quadEntity = createQuadEntity(goo);
		quadEntity.addToWorld();

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		camera.translation.set(0, 0, 100);
		camera.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		camera.onFrameChange();
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
	}

	// Create simple quad
	function createQuadEntity(goo) {
		var world = goo.world;

		var meshData = createGrid(128, 128);

		// Create entity
		var entity = world.createEntity();

		// Create meshdata component using above data
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);

		// Create meshrenderer component with material and shader
		var meshRendererComponent = new MeshRendererComponent();
		var material = Material.createMaterial(createShader());

		var texture = new TextureCreator().loadTexture2D(resourcePath + '/head_specular.jpg');
		material.textures.push(texture);

		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		entity.setComponent(new ScriptComponent(new BasicControlScript()));

		return entity;
	}

	function createGrid(w, h) {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.TEXCOORD0]);
		var meshData = new MeshData(attributeMap, (w + 1) * (h + 1), w * h * 6);

		var vertices = meshData.getAttributeBuffer(MeshData.POSITION);
		var uvs = meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		var indices = meshData.getIndexBuffer();

		for ( var x = 0; x < w + 1; x++) {
			for ( var y = 0; y < h + 1; y++) {
				var index = y * (w + 1) + x;
				vertices[index * 3 + 0] = x - w / 2;
				vertices[index * 3 + 1] = y - h / 2;
				vertices[index * 3 + 2] = 0;

				uvs[index * 2 + 0] = x / (w + 1);
				uvs[index * 2 + 1] = y / (h + 1);
			}
		}

		for ( var x = 0; x < w; x++) {
			for ( var y = 0; y < h; y++) {
				var index = y * (w + 1) + x;
				var indicesIndex = y * w + x;
				indices[indicesIndex * 6 + 0] = index;
				indices[indicesIndex * 6 + 1] = index + 1;
				indices[indicesIndex * 6 + 2] = index + w + 1;
				indices[indicesIndex * 6 + 3] = index + 1;
				indices[indicesIndex * 6 + 4] = index + w + 1 + 1;
				indices[indicesIndex * 6 + 5] = index + w + 1;
			}
		}

		return meshData;
	}

	function createShader() {
		return {
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexUV0 : MeshData.TEXCOORD0
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				diffuseMap : Shader.TEXTURE0,
				time : Shader.TIME
			},
			vshader : [ //
			'attribute vec3 vertexPosition;', //
			'attribute vec2 vertexUV0;', //

			'uniform mat4 viewMatrix;', //
			'uniform mat4 projectionMatrix;',//
			'uniform mat4 worldMatrix;',//

			'uniform float time;',//
			'uniform sampler2D diffuseMap;',//

			'varying float height;',//

			'void main(void) {', //
			'	vec4 texCol = texture2D(diffuseMap, vertexUV0 + vec2(time*0.00002));',//
			'	height = length(texCol.rgb);',//
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * ',//
			'		vec4(vertexPosition+vec3(0.0,0.0,height*10.0), 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'varying float height;',//

			'void main(void)',//
			'{',//
			'	gl_FragColor = vec4(height);',//
			'}',//
			].join('\n')
		};
	}

	init();
});
