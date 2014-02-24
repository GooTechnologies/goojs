define([
	'goo/entities/EntityUtils',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/MathUtils',
	'goo/math/Transform',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/TextureCreator',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/Texture',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/FullscreenUtil',
	'goo/shapes/ShapeCreator',
	'goo/shapes/Box',
	'goo/renderer/Util'
],
/** @lends */
function(
	EntityUtils,
	MeshDataComponent,
	MeshRendererComponent,
	MathUtils,
	Transform,
	MeshData,
	Material,
	Shader,
	ShaderBuilder,
	ShaderLib,
	TextureCreator,
	RenderTarget,
	Texture,
	FullscreenPass,
	FullscreenUtil,
	ShapeCreator,
	Box,
	Util
) {
	"use strict";

	/**
	 * @class A terrain
	 */
	function Terrain(goo, floatHeightMap, size, count) {
		var brush = ShapeCreator.createQuad(2/size,2/size);
		var mat = Material.createMaterial(brushShader);
		mat.blendState.blending = 'AdditiveBlending';
		this.defaultBrushTexture = new TextureCreator().loadTexture2D('res/images/flare.png');
		mat.setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
		this.renderable = {
			meshData: brush,
			materials: [mat],
			transform: new Transform()
		};


		var world = goo.world;
		this.renderer = goo.renderer;
		this.size = size;
		this.count = count;
		this.first = true;

		this.copyPass = new FullscreenPass(ShaderLib.screenCopy);
		this.copyPass.material.depthState.enabled = false;

		this.upsamplePass = new FullscreenPass(upsampleShader);
		this.upsamplePass.material.depthState.enabled = false;

		this.normalmapPass = new FullscreenPass(ShaderLib.normalmap);
		this.normalmapPass.material.depthState.enabled = false;
		this.normalmapPass.material.uniforms.resolution = [size, size];
		this.normalmapPass.material.uniforms.height = 10;

		this.extractFloatPass = new FullscreenPass(extractShader);

		this.floatTexture = new Texture(floatHeightMap, {
			magFilter: 'NearestNeighbor',
			minFilter: 'NearestNeighborNoMipMaps',
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp',
			generateMipmaps: false,
			format: 'Luminance'
		}, size, size);

		this.normalMap = new RenderTarget(size, size);

		this.textures = [];
		this.texturesBounce = [];
		for (var i = 0; i < count; i++) {
			this.textures[i] = new RenderTarget(size, size, {
				magFilter: 'NearestNeighbor',
				minFilter: 'NearestNeighborNoMipMaps',
				type: 'Float'
			});
			this.texturesBounce[i] = new RenderTarget(size, size, {
				magFilter: 'NearestNeighbor',
				minFilter: 'NearestNeighborNoMipMaps',
				type: 'Float'
			});

			size *= 0.5;
		}

		this.n = 31;
		// this.n = 8;
		this.gridSize = (this.n + 1) * 4 - 1;
		console.log('grid size: ', this.gridSize);

		this.height = 1;

		var anisotropy = 4;
		var grass1 = new TextureCreator().loadTexture2D('res/images/grass1.jpg', {
			anisotropy: anisotropy
		});
		var grass2 = new TextureCreator().loadTexture2D('res/images/grass2.jpg', {
			anisotropy: anisotropy
		});
		var stone = new TextureCreator().loadTexture2D('res/images/stone.jpg', {
			anisotropy: anisotropy
		});

		var grass1n = new TextureCreator().loadTexture2D('res/images/grass1n.jpg', {
			anisotropy: anisotropy
		});
		var grass2n = new TextureCreator().loadTexture2D('res/images/grass2n.jpg', {
			anisotropy: anisotropy
		});
		var stonen = new TextureCreator().loadTexture2D('res/images/stonen.jpg', {
			anisotropy: anisotropy
		});

		// var tw = textures[0].image.width;
		// var th = textures[0].image.height;

		var entity = world.createEntity('TerrainRoot');
		entity.addToWorld();
		this.clipmaps = [];
		for (var i = 0; i < count; i++) {
			var size = Math.pow(2, i);

			var texture = this.textures[i];
			var material = Material.createMaterial(Util.clone(terrainShaderDefFloat), 'clipmap' + i);
			// var material = Material.createMaterial(Util.clone(terrainShaderDef), 'clipmap' + i);

			material.uniforms.materialAmbient = [0.0, 0.0, 0.0, 1.0];
			material.uniforms.materialDiffuse = [1.0, 1.0, 1.0, 1.0];
			// material.uniforms.materialDiffuse = [1.2, 1.2, 1.2, 1.0];

			material.setTexture('HEIGHT_MAP', texture);
			material.setTexture('NORMAL_MAP', this.normalMap);

			material.setTexture('GROUND_MAP1', grass1);
			material.setTexture('GROUND_MAP2', grass2);
			material.setTexture('GROUND_MAP4', stone);
			material.setTexture('GROUND_MAP1_NORMALS', grass1n);
			material.setTexture('GROUND_MAP2_NORMALS', grass2n);
			material.setTexture('GROUND_MAP4_NORMALS', stonen);

			material.cullState.frontFace = 'CW';
			// material.wireframe = true;
			material.uniforms.resolution = [this.height, 1 / size, this.size, this.size];
			material.uniforms.resolutionNorm = [this.size, this.size];

			var clipmapEntity = this.createClipmapLevel(world, material, i);
			clipmapEntity.setScale(size, 1, size);
			entity.attachChild(clipmapEntity);
			this.clipmaps[i] = {
				clipmapEntity: clipmapEntity,
				level: i,
				size: size,
				currentX: 100000,
				currentY: 100000,
				currentZ: 100000
			};

			console.log(clipmapEntity);
		}

		var parentClipmap = this.clipmaps[this.clipmaps.length - 1];
		for (var i = this.clipmaps.length - 2; i >= 0; i--) {
			var clipmap = this.clipmaps[i];
			clipmap.parentClipmap = parentClipmap;
			parentClipmap = clipmap;
		}
	}

	Terrain.prototype.draw = function(type, size, x, y, power, brushTexture) {
		this.renderable.materials[0].uniforms.opacity = power;

		if (type === 'add') {
			this.renderable.materials[0].blendState.blending = 'AdditiveBlending';
		} else if (type === 'sub') {
			this.renderable.materials[0].blendState.blending = 'SubtractiveBlending';
		} else if (type === 'mul') {
			this.renderable.materials[0].blendState.blending = 'MultiplyBlending';
		}

		if (brushTexture) {
			this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
		} else {
			this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
		}

		this.renderable.transform.translation.setd(x/this.size, y/this.size, 0);
		this.renderable.transform.scale.setd(size, size, size);
		this.renderable.transform.update();
		this.renderer.render(this.renderable, FullscreenUtil.camera, [], this.textures[0], false);
	};

	Terrain.prototype.getTerrainData = function() {
		var terrainBuffer = new Uint8Array(this.size * this.size * 4);
		this.extractFloatPass.render(this.renderer, this.texturesBounce[0], this.textures[0]);
		this.renderer.readPixels(0, 0, this.size, this.size, terrainBuffer);
		var terrainFloats = new Float32Array(terrainBuffer.buffer);

		var normalBuffer = new Uint8Array(this.size * this.size * 4);
		this.normalmapPass.render(this.renderer, this.normalMap, this.textures[0]);
		this.renderer.readPixels(0, 0, this.size, this.size, normalBuffer);

		return {
			heights: terrainFloats,
			normals: normalBuffer
		};
	};

	Terrain.prototype.updateTextures = function() {
		if (this.first) {
			this.copyPass.render(this.renderer, this.textures[0], this.floatTexture);
			this.first = false;
		}

		for (var i = 0; i < this.count - 1; i++) {
			var mipmap = this.textures[i];
			var child = this.textures[i + 1];

			mipmap.magFilter = 'Bilinear';
			mipmap.minFilter = 'BilinearNoMipMaps';

			this.copyPass.render(this.renderer, child, mipmap);
		}

		var size = this.size;
		for (var i = 0; i < this.count; i++) {
			var mipmapTarget = this.texturesBounce[i];
			var mipmap = this.textures[i];
			var child = this.textures[i + 1];

			this.upsamplePass.material.setTexture('MAIN_MAP', mipmap);
			this.upsamplePass.material.uniforms.res =  [size, size, 2/size, 2/size];

			if (child) {
				child.magFilter = 'NearestNeighbor';
				child.minFilter = 'NearestNeighborNoMipMaps';

				this.upsamplePass.render(this.renderer, mipmapTarget, child);
			} else {
				mipmap.magFilter = 'NearestNeighbor';
				mipmap.minFilter = 'NearestNeighborNoMipMaps';

				this.upsamplePass.render(this.renderer, mipmapTarget, mipmap);
			}

			size *= 0.5;
		}

		for (var i = 0; i < this.count; i++) {
			this.copyPass.render(this.renderer, this.textures[i], this.texturesBounce[i]);
		}

		this.normalmapPass.render(this.renderer, this.normalMap, this.textures[0]);
	};

	Terrain.prototype.update = function(pos) {
		var x = pos.x;
		var y = pos.y;
		var z = pos.z;

		for (var i = 0; i < this.clipmaps.length; i++) {
			var clipmap = this.clipmaps[i];

			var xx = Math.floor(x * 0.5 / clipmap.size);
			var yy = Math.floor(y * 0.5 / clipmap.size);
			var zz = Math.floor(z * 0.5 / clipmap.size);

			if (yy !== clipmap.currentY) {
				clipmap.currentY = yy;
				var compSize = this.gridSize * clipmap.size * 2;
				if (clipmap.clipmapEntity.hidden === false && y > compSize) {
					EntityUtils.hide(clipmap.clipmapEntity);

					if (i < this.clipmaps.length - 1) {
						var childClipmap = this.clipmaps[i + 1];
						childClipmap.clipmapEntity.innermost.meshRendererComponent.hidden = false;
						childClipmap.clipmapEntity.interior1.meshRendererComponent.hidden = true;
						childClipmap.clipmapEntity.interior2.meshRendererComponent.hidden = true;
					}

					continue;
				} else if (clipmap.clipmapEntity.hidden === true && y <= compSize) {
					EntityUtils.show(clipmap.clipmapEntity);

					if (i < this.clipmaps.length - 1) {
						var childClipmap = this.clipmaps[i + 1];
						childClipmap.clipmapEntity.innermost.meshRendererComponent.hidden = true;
						childClipmap.clipmapEntity.interior1.meshRendererComponent.hidden = false;
						childClipmap.clipmapEntity.interior2.meshRendererComponent.hidden = false;
					}
				}
			}

			if (xx === clipmap.currentX && zz === clipmap.currentZ) {
				continue;
			}

			var n = this.n;

			if (clipmap.parentClipmap) {
				var interior1 = clipmap.parentClipmap.clipmapEntity.interior1;
				var interior2 = clipmap.parentClipmap.clipmapEntity.interior2;

				var xxx = MathUtils.moduloPositive(xx + 1, 2);
				var zzz = MathUtils.moduloPositive(zz + 1, 2);
				var xmove = xxx % 2 === 0 ? -n : n + 1;
				var zmove = zzz % 2 === 0 ? -n : n + 1;
				interior1.setTranslation(-n, 0, zmove);
				zzz = MathUtils.moduloPositive(zz, 2);
				zmove = zzz % 2 === 0 ? -n : -n + 1;
				interior2.setTranslation(xmove, 0, zmove);
			}

			clipmap.clipmapEntity.setTranslation(xx * clipmap.size * 2, 0, zz * clipmap.size * 2);

			clipmap.currentX = xx;
			clipmap.currentZ = zz;
		}
	};

	Terrain.prototype.createClipmapLevel = function(world, material, level) {
		var entity = world.createEntity('clipmap' + level);
		entity.addToWorld();

		var n = this.n;

		// 0
		this.createQuadEntity(world, material, level, entity, -2 * n, -2 * n, n, n);
		this.createQuadEntity(world, material, level, entity, -1 * n, -2 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 0 * n, -2 * n, 2, n);
		this.createQuadEntity(world, material, level, entity, 2, -2 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, -2 * n, n, n);

		// 1
		this.createQuadEntity(world, material, level, entity, -2 * n, -1 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, -1 * n, n, n);

		// 2
		this.createQuadEntity(world, material, level, entity, -2 * n, 0, n, 2);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, 0, n, 2);

		// 3
		this.createQuadEntity(world, material, level, entity, -2 * n, 2, n, n);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, 2, n, n);

		// 4
		this.createQuadEntity(world, material, level, entity, -2 * n, 2 + 1 * n, n, n);
		this.createQuadEntity(world, material, level, entity, -1 * n, 2 + 1 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 0, 2 + 1 * n, 2, n);
		this.createQuadEntity(world, material, level, entity, 2, 2 + 1 * n, n, n);
		this.createQuadEntity(world, material, level, entity, 2 + 1 * n, 2 + 1 * n, n, n);

		entity.innermost = this.createQuadEntity(world, material, level, entity, -n, -n, n * 2 + 2, n * 2 + 2);

		if (level !== 0) {
			entity.innermost.meshRendererComponent.hidden = true;

			// interior
			entity.interior1 = this.createQuadEntity(world, material, level, entity, -n, -n, n * 2 + 2, 1);
			entity.interior2 = this.createQuadEntity(world, material, level, entity, -n, -n, 1, n * 2 + 1);
		}

		return entity;
	};

	Terrain.prototype.createQuadEntity = function(world, material, level, parentEntity, x, y, w, h) {
		var meshData = this.createGrid(w, h);
		var entity = world.createEntity('mesh_' + w + '_' + h, meshData, material);

		entity.meshDataComponent.modelBound.xExtent = w * 0.5;
		entity.meshDataComponent.modelBound.yExtent = 255 * this.height;
		entity.meshDataComponent.modelBound.zExtent = h * 0.5;
		entity.meshDataComponent.modelBound.center.setd(w * 0.5, 128 * this.height, h * 0.5);
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

	var terrainShaderDefFloat = {
		defines: {
			SKIP_SPECULAR: true
		},
		processors: [
			ShaderBuilder.light.processor
		],
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
			heightMap: 'HEIGHT_MAP',
			normalMap: 'NORMAL_MAP',
			groundMap1: 'GROUND_MAP1',
			groundMap2: 'GROUND_MAP2',
			groundMap4: 'GROUND_MAP4',
			groundMapN1: 'GROUND_MAP1_NORMALS',
			groundMapN2: 'GROUND_MAP2_NORMALS',
			groundMapN4: 'GROUND_MAP4_NORMALS',
			fogSettings: function() {
				return ShaderBuilder.FOG_SETTINGS;
			},
			fogColor: function() {
				return ShaderBuilder.FOG_COLOR;
			},
			resolution: [255, 1, 1024, 1024],
			resolutionNorm: [1024, 1024],
			col: [0, 0, 0]
		},
		builder: function(shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function() {
			return [
				'attribute vec3 vertexPosition;',

				'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 worldMatrix;',
				'uniform vec3 cameraPosition;',
				'uniform sampler2D heightMap;',
				'uniform vec4 resolution;',

				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec4 alphaval;',

				ShaderBuilder.light.prevertex,

				'const vec2 alphaOffset = vec2(45.0);',
				'const vec2 oneOverWidth = vec2(1.0 / 16.0);',
				// 'const vec2 alphaOffset = vec2(10.0);',
				// 'const vec2 oneOverWidth = vec2(1.0 / 5.0);',

				'void main(void) {',
				'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
				'vec2 coord = (worldPos.xz + vec2(0.5, 0.5)) / resolution.zw;',

				// 'vec4 heightCol = texture2DLod(heightMap, worldPos.xz * 1.0 / resolution, 0.0);',
				'vec4 heightCol = texture2D(heightMap, coord);',
				'float zf = heightCol.r;',
				'float zd = heightCol.g;',

				'vec2 alpha = clamp((abs(worldPos.xz - cameraPosition.xz) * resolution.y - alphaOffset) * oneOverWidth, vec2(0.0), vec2(1.0));',
				'alpha.x = max(alpha.x, alpha.y);',
				'float z = mix(zf, zd, alpha.x);',
				'alphaval = vec4(zf, zd, alpha.x, z);',

				'worldPos.y = z * resolution.x;',
				'gl_Position = viewProjectionMatrix * worldPos;',

				'vWorldPos = worldPos.xyz;',
				'viewPosition = cameraPosition - vWorldPos;',

				ShaderBuilder.light.vertex,
				'}'
			].join('\n');
		},
		fshader: function() {
			return [
				'uniform vec3 col;',
				'uniform sampler2D normalMap;',
				'uniform sampler2D groundMap1;',
				'uniform sampler2D groundMap2;',
				'uniform sampler2D groundMap4;',
				'uniform sampler2D groundMapN1;',
				'uniform sampler2D groundMapN2;',
				'uniform sampler2D groundMapN4;',

				'uniform vec2 fogSettings;',
				'uniform vec3 fogColor;',

				'uniform vec2 resolutionNorm;',

				// 'uniform vec2 resolution;',
				// 'uniform sampler2D heightMap;',

				'varying vec3 vWorldPos;',
				'varying vec3 viewPosition;',
				'varying vec4 alphaval;',

				ShaderBuilder.light.prefragment,

				'void main(void)',
				'{',
				'vec2 mapcoord = vWorldPos.xz / resolutionNorm;',
				'vec2 coord = mapcoord * 256.0;',
				'vec4 final_color = vec4(1.0);',

				// 'vec3 N = (texture2D(normalMap, mapcoord).xyz * vec3(2.0) - vec3(1.0));',
				'vec3 N = (texture2D(normalMap, mapcoord).xyz * vec3(2.0) - vec3(1.0)).xzy;',
				'N.y = 0.25;',
				'N.z = -N.z;',
				'N = normalize(N);',

				'float slope = clamp(1.0 - dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
				'slope = smoothstep(0.0, 0.1, slope);',

				'const float NMUL = 1.2;',

				'vec3 n1 = texture2D(groundMapN1, coord).xyz * vec3(2.0) - vec3(1.0);', 'n1.z = NMUL;',
				'vec3 n2 = texture2D(groundMapN2, coord).xyz * vec3(2.0) - vec3(1.0);', 'n2.z = NMUL;',
				'vec3 mountainN = texture2D(groundMapN4, coord).xyz * vec3(2.0) - vec3(1.0);', 'mountainN.z = NMUL;',

				'vec3 tangentNormal = mix(n1, n2, smoothstep(0.0, 1.0, 1.0));',
				'tangentNormal = mix(tangentNormal, mountainN, slope);',

				'N = normalize(vec3(N.x + tangentNormal.x, N.y, N.z + tangentNormal.y));',

				'vec4 g1 = texture2D(groundMap1, coord);',
				'vec4 g2 = texture2D(groundMap2, coord);',
				'vec4 mountain = texture2D(groundMap4, coord);',

				'final_color = mix(g1, g2, smoothstep(0.0, 1.0, 1.0));',

				'slope = clamp(1.0 - dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);',
				'slope = smoothstep(0.0, 0.1, slope);',
				'final_color = mix(final_color, mountain, slope);',

				ShaderBuilder.light.fragment,

				'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
				'final_color.rgb = mix(final_color.rgb, fogColor, d);',

				'gl_FragColor = final_color;',

				// 'gl_FragColor.rgb = vec3(abs(alphaval.x - alphaval.y)) * 0.1;',

				// 'gl_FragColor.r += alphaval.z >= 1.0 ? 0.5 : 0.0;',
				// 'gl_FragColor.g += alphaval.z * 0.25;',
				// 'gl_FragColor.b += alphaval.z <= 0.0 ? 0.5 : 0.0;',
				'}'
			].join('\n');
		}
	};

	var upsampleShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			diffuseMap: 'MAIN_MAP',
			childMap: Shader.DIFFUSE_MAP,
			res: [1, 1, 1, 1]
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'varying vec2 texCoord0;',

			'void main(void) {',
			'	texCoord0 = vertexUV0;',
			'	gl_Position = vec4(vertexPosition, 1.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D diffuseMap;',
			'uniform sampler2D childMap;',

			'uniform vec4 res;',

			'varying vec2 texCoord0;',

			'void main(void)',
			'{',
			'	gl_FragColor = texture2D(diffuseMap, texCoord0);',

			'	vec2 coordMod = mod(floor(texCoord0 * res.xy), 2.0);',
			'	bvec2 test = equal(coordMod, vec2(0.0));',

			'	if (all(test)) {',
			'		gl_FragColor.g = texture2D(childMap, texCoord0).r;',
			'	} else if (test.x) {',
			'		gl_FragColor.g = (texture2D(childMap, texCoord0).r + texture2D(childMap, texCoord0 + vec2(0.0, res.w)).r) * 0.5;',
			'	} else if (test.y) {',
			'		gl_FragColor.g = (texture2D(childMap, texCoord0).r + texture2D(childMap, texCoord0 + vec2(res.z, 0.0)).r) * 0.5;',
			'	} else {',
			'		gl_FragColor.g = (texture2D(childMap, texCoord0).r + texture2D(childMap, texCoord0 + vec2(res.z, res.w)).r) * 0.5;',
			'	}',
			'	gl_FragColor.ba = vec2(0.0);',
			'}'
		].join('\n')
	};

	var brushShader = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			opacity : 1.0,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
		'	texCoord0 = vertexUV0;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform sampler2D diffuseMap;',
		'uniform float opacity;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	gl_FragColor = texture2D(diffuseMap, texCoord0);',
		'	gl_FragColor.a *= opacity;',
		'}'//
		].join('\n')
	};

	var extractShader = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
		'	texCoord0 = vertexUV0;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',

		'float shift_right (float v, float amt) {',
			'v = floor(v) + 0.5;',
			'return floor(v / exp2(amt));',
		'}',
		'float shift_left (float v, float amt) {',
			'return floor(v * exp2(amt) + 0.5);',
		'}',
		'float mask_last (float v, float bits) {',
			'return mod(v, shift_left(1.0, bits));',
		'}',
		'float extract_bits (float num, float from, float to) {',
			'from = floor(from + 0.5); to = floor(to + 0.5);',
			'return mask_last(shift_right(num, from), to - from);',
		'}',
		'vec4 encode_float (float val) {',
			'if (val == 0.0) return vec4(0, 0, 0, 0);',
			'float sign = val > 0.0 ? 0.0 : 1.0;',
			'val = abs(val);',
			'float exponent = floor(log2(val));',
			'float biased_exponent = exponent + 127.0;',
			'float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;',
			'float t = biased_exponent / 2.0;',
			'float last_bit_of_biased_exponent = fract(t) * 2.0;',
			'float remaining_bits_of_biased_exponent = floor(t);',
			'float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;',
			'float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;',
			'float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;',
			'float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;',
			'return vec4(byte4, byte3, byte2, byte1);',
		'}',

		'void main(void)',
		'{',
		// '	gl_FragColor = encode_float(texture2D(diffuseMap, texCoord0).r);',
		'	gl_FragColor = encode_float(texture2D(diffuseMap, vec2(texCoord0.x, 1.0 - texCoord0.y) + vec2(0.0/512.0, 1.0/512.0)).r);',
		'}'//
		].join('\n')
	};

	return Terrain;
});