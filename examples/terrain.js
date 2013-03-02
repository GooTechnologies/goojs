require.config({
	baseUrl : "./",
	paths : {
		goo : "../src/goo",
		'goo/lib': '../lib'
	}
});
require(['goo/entities/World', 'goo/entities/Entity', 'goo/entities/systems/System', 'goo/entities/systems/TransformSystem',
		'goo/entities/systems/RenderSystem', 'goo/entities/components/TransformComponent', 'goo/entities/components/MeshDataComponent',
		'goo/entities/components/MeshRendererComponent', 'goo/renderer/MeshData', 'goo/renderer/Renderer',
		'goo/renderer/Material', 'goo/renderer/Shader', 'goo/entities/GooRunner', 'goo/renderer/TextureCreator', 'goo/loaders/Loader',
		'goo/loaders/JSONImporter', 'goo/entities/components/ScriptComponent', 'goo/util/DebugUI', 'goo/shapes/ShapeCreator',
		'goo/entities/EntityUtils', 'goo/renderer/Texture', 'goo/renderer/Camera', 'goo/entities/components/CameraComponent', 'goo/math/Vector3',
		'goo/scripts/BasicControlScript'], function(World, Entity, System, TransformSystem, RenderSystem, TransformComponent, MeshDataComponent,
	MeshRendererComponent, MeshData, Renderer, Material, Shader, GooRunner, TextureCreator, Loader, JSONImporter,
	ScriptComponent, DebugUI, ShapeCreator, EntityUtils, Texture, Camera, CameraComponent, Vector3, BasicControlScript) {
	"use strict";

	var resourcePath = "../resources";

	var material = Material.createMaterial(createShader());
	var texture = new TextureCreator().loadTexture2D(resourcePath + '/head_diffuse.jpg');
	material.textures.push(texture);
	var material2 = Material.createMaterial(createShader());
	material2.textures.push(texture);
	material2.wireframe = true;

	var goo;

	function init() {
		// Create typical goo application
		goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var entity = goo.world.createEntity();
		entity.addToWorld();
		var l1 = createClipmapLevel(1, true);
		entity.transformComponent.attachChild(l1.transformComponent);
		var l2 = createClipmapLevel(2, false);
		entity.transformComponent.attachChild(l2.transformComponent);
		var l3 = createClipmapLevel(4, false);
		entity.transformComponent.attachChild(l3.transformComponent);
		var l4 = createClipmapLevel(8, false);
		entity.transformComponent.attachChild(l4.transformComponent);

		// Add camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 100);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
	}

	function createClipmapLevel(scale, isInner) {
		var entity = goo.world.createEntity();
		entity.addToWorld();

		// 0
		createQuadEntity(entity, 0, 0, 3, 3, scale);
		createQuadEntity(entity, 3, 0, 3, 3, scale);
		createQuadEntity(entity, 6, 0, 2, 3, scale);
		createQuadEntity(entity, 8, 0, 3, 3, scale);
		createQuadEntity(entity, 11, 0, 3, 3, scale);

		// 1
		createQuadEntity(entity, 0, 3, 3, 3, scale);
		createQuadEntity(entity, 11, 3, 3, 3, scale);

		// 2
		createQuadEntity(entity, 0, 6, 3, 2, scale);
		createQuadEntity(entity, 11, 6, 3, 2, scale);

		// 3
		createQuadEntity(entity, 0, 8, 3, 3, scale);
		createQuadEntity(entity, 11, 8, 3, 3, scale);

		// 4
		createQuadEntity(entity, 0, 11, 3, 3, scale);
		createQuadEntity(entity, 3, 11, 3, 3, scale);
		createQuadEntity(entity, 6, 11, 2, 3, scale);
		createQuadEntity(entity, 8, 11, 3, 3, scale);
		createQuadEntity(entity, 11, 11, 3, 3, scale);

		// interior
		createQuadEntity(entity, 3, 3, 8, 1, scale);
		createQuadEntity(entity, 10, 4, 1, 7, scale);

		// innermost level fill
		if (isInner) {
			createQuadEntity(entity, 3, 4, 7, 7, scale);
		}

		return entity;
	}

	// Create simple quad
	function createQuadEntity(parentEntity, x, y, w, h, scale) {
		var world = goo.world;
		var meshData = createGrid(x, y, w, h, scale);

		var entity = world.createEntity();
		parentEntity.transformComponent.attachChild(entity.transformComponent);
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);
		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.materials.push(material);
		meshRendererComponent.materials.push(material2);
		entity.setComponent(meshRendererComponent);

		entity.setComponent(new ScriptComponent(new BasicControlScript()));
		entity.addToWorld();

		return entity;
	}

	function createGrid(offsetX, offsetY, w, h, scale) {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.TEXCOORD0]);
		var meshData = new MeshData(attributeMap, (w + 1) * (h + 1), w * h * 6);

		var vertices = meshData.getAttributeBuffer(MeshData.POSITION);
		var uvs = meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		var indices = meshData.getIndexBuffer();

		for ( var x = 0; x < w + 1; x++) {
			for ( var y = 0; y < h + 1; y++) {
				var index = y * (w + 1) + x;
				vertices[index * 3 + 0] = (x + offsetX - 7) * scale;
				vertices[index * 3 + 1] = (y + offsetY - 7) * scale;
				vertices[index * 3 + 2] = 0;

				uvs[index * 2 + 0] = (x + offsetX) / 15;
				uvs[index * 2 + 1] = (y + offsetY) / 15;
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

			'varying vec4 texCol;',//

			'void main(void) {', //
			'	texCol = texture2D(diffuseMap, vertexUV0 + vec2(time*0.0));',//
			'	float height = length(texCol.rgb);',//
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * ',//
			'		vec4(vertexPosition.x,vertexPosition.y,height*5.0, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'varying vec4 texCol;',//

			'void main(void)',//
			'{',//
			'	gl_FragColor = texCol;',//
			'}',//
			].join('\n')
		};
	}

	init();
});
