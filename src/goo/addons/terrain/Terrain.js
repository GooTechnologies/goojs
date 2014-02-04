define([
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/MathUtils',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/TextureCreator'
],
/** @lends */
function(
	MeshDataComponent,
	MeshRendererComponent,
	MathUtils,
	MeshData,
	Material,
	Shader,
	TextureCreator
) {
	"use strict";

	/**
	 * @class A terrain
	 */
	function Terrain(world, texture, textureWidth, textureHeight) {
		// this.n = 8;
		// this.n = 16;
		this.n = 32;
		this.levels = 5;
		this.height = 255*2;
		// this.height = 0;

		var material = Material.createMaterial(terrainShaderDef);
		material.setTexture('DIFFUSE_MAP', texture);
		material.cullState.frontFace = 'CW';
		// material.wireframe = true;
		material.uniforms.heightMul = this.height;
		material.uniforms.resolution = [textureWidth, textureHeight];
		this.material = material;

		var entity = world.createEntity();
		entity.addToWorld();
		this.clipmaps = [];
		for (var i = 0; i < this.levels; i++) {
			var clipmapEntity = this.createClipmapLevel(world, i);
			var size = Math.pow(2, i);
			clipmapEntity.setScale(size, 1, size);
			entity.attachChild(clipmapEntity);
			this.clipmaps[i] = {
				clipmapEntity: clipmapEntity,
				level: i,
				size: size,
				currentX: 100000,
				currentZ: 100000,
			};
		}

		var parentClipmap =  this.clipmaps[this.clipmaps.length-1];
		for (var i = this.clipmaps.length-2; i >= 0; i--) {
			var clipmap = this.clipmaps[i];
			clipmap.parentClipmap = parentClipmap;
			parentClipmap = clipmap;
		}
	}

	Terrain.prototype.update = function(pos) {
		var x = pos.x;
		var z = pos.z;

		for (var i = 0; i < this.clipmaps.length; i++) {
			var clipmap = this.clipmaps[i];

			var level = clipmap.level;

			var xx = Math.floor(x * 0.5 / clipmap.size);
			var zz = Math.floor(z * 0.5 / clipmap.size);

			if (xx === clipmap.currentX && zz === clipmap.currentZ) {
				continue;
			}

			var n = this.n;

			if (clipmap.parentClipmap) {
				var interior1 = clipmap.parentClipmap.clipmapEntity.interior1;
				var interior2 = clipmap.parentClipmap.clipmapEntity.interior2;

				var xxx = MathUtils.moduloPositive(xx+1, 2);
				var zzz = MathUtils.moduloPositive(zz+1, 2);
				var xmove = xxx % 2 === 0 ? -n : n+1;
				var zmove = zzz % 2 === 0 ? -n : n+1;
				interior1.setTranslation(-n, 0, zmove);
				zzz = MathUtils.moduloPositive(zz, 2);
				zmove = zzz % 2 === 0 ? -n : -n+1;
				interior2.setTranslation(xmove, 0, zmove);
			}

			// console.log(clipmap.level, 'new pos', xx, zz);

			clipmap.clipmapEntity.setTranslation(xx * clipmap.size * 2, 0, zz * clipmap.size * 2);

			clipmap.currentX = xx;
			clipmap.currentZ = zz;
		}
	};

	Terrain.prototype.createClipmapLevel = function(world, level) {
		var entity = world.createEntity('clipmap');
		entity.addToWorld();

		var n = this.n;

		// 0
		this.createQuadEntity(world, level, entity, -2*n, -2*n, n, n);
		this.createQuadEntity(world, level, entity, -1*n, -2*n, n, n);
		this.createQuadEntity(world, level, entity, 0*n, -2*n, 2, n);
		this.createQuadEntity(world, level, entity, 2, -2*n, n, n);
		this.createQuadEntity(world, level, entity, 2+1*n, -2*n, n, n);

		// 1
		this.createQuadEntity(world, level, entity, -2*n, -1*n, n, n);
		this.createQuadEntity(world, level, entity, 2+1*n, -1*n, n, n);

		// 2
		this.createQuadEntity(world, level, entity, -2*n, 0, n, 2);
		this.createQuadEntity(world, level, entity, 2+1*n, 0, n, 2);

		// 3
		this.createQuadEntity(world, level, entity, -2*n, 2, n, n);
		this.createQuadEntity(world, level, entity, 2+1*n, 2, n, n);

		// 4
		this.createQuadEntity(world, level, entity, -2*n, 2+1*n, n, n);
		this.createQuadEntity(world, level, entity, -1*n, 2+1*n, n, n);
		this.createQuadEntity(world, level, entity, 0, 2+1*n, 2, n);
		this.createQuadEntity(world, level, entity, 2, 2+1*n, n, n);
		this.createQuadEntity(world, level, entity, 2+1*n, 2+1*n, n, n);

		if (level === 0) {
			// innermost level fill
			this.createQuadEntity(world, level, entity, -n, -n, n*2+2, n*2+2);
		} else {
			// interior
			entity.interior1 = this.createQuadEntity(world, level, entity, -n, -n, n*2+2, 1);
			entity.interior2 = this.createQuadEntity(world, level, entity, -n, -n, 1, n*2+1);
		}

		return entity;
	};

	Terrain.prototype.createQuadEntity = function(world, level, parentEntity, x, y, w, h, material) {
		material = material || this.material;

		var meshData = this.createGrid(w, h);
		var entity = world.createEntity('mesh_'+w+'_'+h, meshData, material);

		entity.meshDataComponent.modelBound.xExtent = w*0.5;
		entity.meshDataComponent.modelBound.yExtent = this.height;
		entity.meshDataComponent.modelBound.zExtent = h*0.5;
		entity.meshDataComponent.modelBound.center.setd(w*0.5, 0, h*0.5);
		entity.meshDataComponent.autoCompute = false;

		entity.setTranslation(x, 0, y);
		// entity.setTranslation(x * 1.05, 0, y * 1.05);

		parentEntity.attachChild(entity);
		entity.addToWorld();

		return entity;
	};

	var gridCache = {};

	Terrain.prototype.createGrid = function(w, h) {
		var key = w + '_' + h;
		if (gridCache[key]) {
			return gridCache[key];
		}

		var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
		var meshData = new MeshData(attributeMap, (w + 1) * (h + 1), (w * 2 + 4) * h);
		gridCache[key] = meshData;

		meshData.indexModes = ['TriangleStrip'];

		var vertices = meshData.getAttributeBuffer(MeshData.POSITION);
		var indices = meshData.getIndexBuffer();

		for (var x = 0; x < w + 1; x++) {
			for (var y = 0; y < h + 1; y++) {
				var index = y * (w + 1) + x;
				vertices[index * 3 + 0] = x;
				vertices[index * 3 + 1] = 0;
				vertices[index * 3 + 2] = y;
			}
		}

		var indicesIndex = 0;
		var index = 0;
		for (var y = 0; y < h; y++) {
			indices[indicesIndex++] = y * (w + 1);
			indices[indicesIndex++] = y * (w + 1);

			for (var x = 0; x < w; x++) {
				index = y * (w + 1) + x;
				indices[indicesIndex++] = index + w + 1;
				indices[indicesIndex++] = index + 1;
			}

			indices[indicesIndex++] = index + w + 1 + 1;
			indices[indicesIndex++] = index + w + 1 + 1;
		}

		console.log((w + 1) * (h + 1), (w * 2 + 4) * h, w * h * 6);

		return meshData;
	};

	var terrainShaderDef = {
		attributes: {
			vertexPosition: MeshData.POSITION,
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			diffuseMap: 'DIFFUSE_MAP',
			time: Shader.TIME,
			heightMul: 255,
			resolution: [1024, 1024],
			col: [0, 0, 0]
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform sampler2D diffuseMap;',
			'uniform float heightMul;',
			'uniform vec2 resolution;',

			'varying vec4 worldPos;',

			'void main(void) {',
				'worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
				'worldPos.y = texture2D(diffuseMap, worldPos.xz / resolution).r * heightMul;',
				'gl_Position = projectionMatrix * viewMatrix * worldPos;',
			'}'
		].join('\n'),
		fshader: [
			'uniform vec3 col;',
			'uniform sampler2D diffuseMap;',
			'uniform vec2 resolution;',

			'varying vec4 worldPos;',

			'void main(void)',
			'{',
				'gl_FragColor = texture2D(diffuseMap, worldPos.xz / resolution);',
				// 'gl_FragColor = vec4(col, 1.0);',
			'}'
		].join('\n')
	};

	var terrainShaderDefDebug = {
		attributes: {
			vertexPosition: MeshData.POSITION,
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			diffuseMap: 'DIFFUSE_MAP',
			time: Shader.TIME,
			heightMul: 255,
			resolution: [1024, 1024],
			col: [0, 0, 0]
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform sampler2D diffuseMap;',
			'uniform float heightMul;',
			'uniform vec2 resolution;',

			'varying vec4 worldPos;',

			'void main(void) {',
				'worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
				'worldPos.y = texture2D(diffuseMap, worldPos.xz / resolution).r * heightMul;',
				'gl_Position = projectionMatrix * viewMatrix * worldPos;',
			'}'
		].join('\n'),
		fshader: [
			'uniform vec3 col;',
			'uniform sampler2D diffuseMap;',

			'varying vec4 worldPos;',

			'void main(void)',
			'{',
				'gl_FragColor = vec4(col, 1.0);',
			'}'
		].join('\n')
	};

	return Terrain;
});