define([
	'goo/entities/components/MeshData',
	'goo/entities/components/MeshRenderer',
	'goo/entities/components/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/TextureCreator'
],
/** @lends */
function(
	MeshDataComponent,
	MeshRenderer,
	MeshData,
	Material,
	Shader,
	TextureCreator
) {
	"use strict";

	/**
	 * @class A terrain
	 */
	function Terrain(world) {
		var resourcePath = "../resources";
		var material = Material.createMaterial(terrainShaderDef);
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/head_diffuse.jpg');
		material.setTexture('DIFFUSE_MAP', texture);
		var material2 = Material.createMaterial(terrainShaderDef);
		material2.setTexture('HEIGHT_MAP', texture);
		material2.wireframe = true;
		this.material = material;
		this.material2 = material2;

		var entity = world.createEntity();
		entity.addToWorld();
		for (var i = 0; i < 6; i++) {
			var level = this.createClipmapLevel(world, i, i === 0);
			entity.transformComponent.attachChild(level.transformComponent);
		}
	}

	Terrain.prototype.createClipmapLevel = function(world, scale, isInner) {
		var entity = world.createEntity();

		var size = Math.pow(2, scale);
		entity.transformComponent.transform.scale.set(size, size, 1);
		var move = (2 * Math.pow(-1, scale+1) + Math.pow(2, scale+1))/6;
		var diff = scale % 2 === 0 ? move : -move;
		entity.transformComponent.transform.translation.set(diff, -diff, 0);
		entity.addToWorld();

		// 0
		this.createQuadEntity(world, entity, 0, 0, 3, 3);
		this.createQuadEntity(world, entity, 3, 0, 3, 3);
		this.createQuadEntity(world, entity, 6, 0, 2, 3);
		this.createQuadEntity(world, entity, 8, 0, 3, 3);
		this.createQuadEntity(world, entity, 11, 0, 3, 3);

		// 1
		this.createQuadEntity(world, entity, 0, 3, 3, 3);
		this.createQuadEntity(world, entity, 11, 3, 3, 3);

		// 2
		this.createQuadEntity(world, entity, 0, 6, 3, 2);
		this.createQuadEntity(world, entity, 11, 6, 3, 2);

		// 3
		this.createQuadEntity(world, entity, 0, 8, 3, 3);
		this.createQuadEntity(world, entity, 11, 8, 3, 3);

		// 4
		this.createQuadEntity(world, entity, 0, 11, 3, 3);
		this.createQuadEntity(world, entity, 3, 11, 3, 3);
		this.createQuadEntity(world, entity, 6, 11, 2, 3);
		this.createQuadEntity(world, entity, 8, 11, 3, 3);
		this.createQuadEntity(world, entity, 11, 11, 3, 3);

		// interior
		// this.createQuadEntity(world, entity, 3, 3, 8, 1);
		// this.createQuadEntity(world, entity, 10, 4, 1, 7);

		// innermost level fill
		if (isInner) {
			this.createQuadEntity(world, entity, 3, 4, 7, 7);
		}

		return entity;
	};

	Terrain.prototype.createQuadEntity = function(world, parentEntity, x, y, w, h) {
		var meshData = this.createGrid(x, y, w, h);

		var entity = world.createEntity();
		parentEntity.transformComponent.attachChild(entity.transformComponent);
		var meshDataComponent = new MeshDataComponent(meshData);
		entity.setComponent(meshDataComponent);
		var meshRenderer = new MeshRenderer();
		// meshRenderer.materials.push(this.material);
		meshRenderer.materials.push(this.material2);
		entity.setComponent(meshRenderer);

		entity.addToWorld();

		return entity;
	};

	Terrain.prototype.createGrid = function(offsetX, offsetY, w, h) {
		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.TEXCOORD0]);
		var meshData = new MeshData(attributeMap, (w + 1) * (h + 1), w * h * 6);

		var vertices = meshData.getAttributeBuffer(MeshData.POSITION);
		var uvs = meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		var indices = meshData.getIndexBuffer();

		for (var x = 0; x < w + 1; x++) {
			for (var y = 0; y < h + 1; y++) {
				var index = y * (w + 1) + x;
				vertices[index * 3 + 0] = (x + offsetX - 7);
				vertices[index * 3 + 1] = (y + offsetY - 7);
				vertices[index * 3 + 2] = 0;

				uvs[index * 2 + 0] = (x + offsetX) / 15;
				uvs[index * 2 + 1] = (y + offsetY) / 15;
			}
		}

		for (var x = 0; x < w; x++) {
			for (var y = 0; y < h; y++) {
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
	};

	var terrainShaderDef = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			diffuseMap: 'DIFFUSE_MAP',
			time: Shader.TIME
		},
		vshader: [ //
		'attribute vec3 vertexPosition;', //
		'attribute vec2 vertexUV0;', //

		'uniform mat4 viewMatrix;', //
		'uniform mat4 projectionMatrix;', //
		'uniform mat4 worldMatrix;', //

		'uniform float time;', //
		'uniform sampler2D diffuseMap;', //

		'varying vec4 texCol;', //

		'void main(void) {', //
		'	texCol = texture2D(diffuseMap, vertexUV0 + vec2(time*0.0));', //
		'	float height = length(texCol.rgb);', //
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * ', //
		'		vec4(vertexPosition.x,vertexPosition.y,height*5.0, 1.0);', //
		'}' //
		].join('\n'),
		fshader: [ //
		'precision mediump float;', //

		'varying vec4 texCol;', //

		'void main(void)', //
		'{', //
		'	gl_FragColor = texCol;', //
		'}' //
		].join('\n')
	};

	return Terrain;
});