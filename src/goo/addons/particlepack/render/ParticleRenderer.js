define([
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/renderer/Material',
		'goo/entities/components/MeshRendererComponent'
	],

	function (
		MeshData,
		Shader,
		Material,
		MeshRendererComponent
	) {
		"use strict";

		function ParticleRenderer() {
			this.settings = null;
			this.entity = null;
			this.meshData = null;
			this.sprites = {};
		}

		ParticleRenderer.prototype.init = function (goo, simConf, settings, spriteAtlas, texture) {



			this.settings = settings;
			this.atlasConf = spriteAtlas;

			for (var i = 0; i < this.atlasConf.sprites.length; i++) {
				this.sprites[this.atlasConf.sprites[i].id] = this.atlasConf.sprites[i];
			}

			var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR]);
			attributeMap.DATA = MeshData.createAttribute(2, 'Float');
			attributeMap.OFFSET = MeshData.createAttribute(2, 'Float');
			attributeMap.TILE = MeshData.createAttribute(4, 'Float');
			var meshData = new MeshData(attributeMap, simConf.poolCount * 4, simConf.poolCount * 6);
			meshData.vertexData.setDataUsage('DynamicDraw');
			this.meshData = meshData;

			var material = new Material(particleShader);
			material.uniforms.alphakill = simConf.alphakill.value;
			material.blendState.blending = simConf.blending.value;

			material.depthState.write = simConf.depthWrite || false;
			material.renderQueue = simConf.renderQueue || 3010;
			console.log(material.renderQueue);
			var entity = this.entity = goo.world.createEntity(meshData);
			entity.set(new MeshRendererComponent(material));
			entity.name = 'ParticleRenderer';
			entity.meshRendererComponent.cullMode = 'Never';
			entity.addToWorld();

			material.setTexture('PARTICLE_MAP', texture);

			var offset = this.meshData.getAttributeBuffer('OFFSET');
			var tile = this.meshData.getAttributeBuffer('TILE');
			var indices = this.meshData.getIndexBuffer();
			for (i = 0; i < simConf.poolCount; i++) {
				offset[8 * i] = -1;
				offset[8 * i + 1] = -1;

				offset[8 * i + 2] = -1;
				offset[8 * i + 3] = 1;

				offset[8 * i + 4] = 1;
				offset[8 * i + 5] = 1;

				offset[8 * i + 6] = 1;
				offset[8 * i + 7] = -1;

				for (var j = 0; j < 4; j++) {
					tile[16 * i + j * 4] = 0; //offset u
					tile[16 * i + j * 4 + 1] = 0; //offset w
					tile[16 * i + j * 4 + 2] = 1; //scale u
					tile[16 * i + j * 4 + 3] = 1; //scale w
				}

				indices[6 * i] = 4 * i;
				indices[6 * i + 1] = 4 * i + 3;
				indices[6 * i + 2] = 4 * i + 1;
				indices[6 * i + 3] = 4 * i + 1;
				indices[6 * i + 4] = 4 * i + 3;
				indices[6 * i + 5] = 4 * i + 2;
			}
		};

		ParticleRenderer.prototype.rebuild = function () {
			if (this.settings.textureUrl.valueLoaded) {
				this.entity.meshRendererComponent.materials[0].setTexture('PARTICLE_MAP', this.settings.textureUrl.valueLoaded);
			}
		};

		ParticleRenderer.prototype.remove = function () {
			this.entity.removeFromWorld();
		};

		ParticleRenderer.prototype.setVisible = function (visible) {
			this.entity.meshRendererComponent.hidden = !visible;
			this.entity.hidden = !visible;
		};

		ParticleRenderer.prototype.died = function (particle) {
			var data = this.meshData.getAttributeBuffer('DATA');

			for (var j = 0; j < 4; j++) {
				data[(4 * 2 * particle.index) + 2 * j] = 0;
			}
		};

		ParticleRenderer.prototype.initFrame = function () {

			this.pos = this.meshData.getAttributeBuffer(MeshData.POSITION);
			this.col = this.meshData.getAttributeBuffer(MeshData.COLOR);
			this.data = this.meshData.getAttributeBuffer('DATA');
			this.tile = this.meshData.getAttributeBuffer('TILE');



			this.tileInfo = this.settings.tile;
			//	this.isTiled = this.tileInfo !== undefined && this.tileInfo.enabled.value;
			this.tileCountX = this.atlasConf.textureUrl.tilesX;
			this.tileCountY = this.atlasConf.textureUrl.tilesY;
			this.loopScale = 1;
			//	if (this.isTiled) {
			//		this.tileCountX = this.tileInfo.tileCountX.value;
			//		this.tileCountY = this.tileInfo.tileCountY.value;
			//		this.loopScale  = this.tileInfo.loopScale.value;
			//	}
			this.scaleX = 1 / this.tileCountX;
			this.scaleY = 1 / this.tileCountY;
			//	this.totalTileCount = this.tileCountX * this.tileCountY;
			//	this.tileFrameCount = this.totalTileCount;
			//	if (this.isTiled && this.tileInfo.frameCount) {
			//		this.tileFrameCount = this.tileInfo.frameCount;
			//	}

			this.lastAlive = 0;

		};

		ParticleRenderer.prototype.updateParticleBufferData = function (tpf, particle) {
			var j, i;
			i = this.renderedCount;

			particle.setTileInfo(this.sprites[particle.sprite], this.scaleX, this.scaleY);
			particle.updateAtlasOffsets(this.loopScale);
			//	if (this.isTiled) {


			for (j = 0; j < 4; j++) {
				this.tile[(4 * 4 * i) + 4 * j] = particle.offsetX;
				this.tile[(4 * 4 * i + 1) + 4 * j] = particle.offsetY;
				this.tile[(4 * 4 * i + 2) + 4 * j] = particle.scaleX;
				this.tile[(4 * 4 * i + 3) + 4 * j] = particle.scaleY;
			}
			//	}

			var posdata = particle.position.data;
			var coldata = particle.color.data;
			for (j = 0; j < 4; j++) {
				this.pos[(4 * 3 * i) + 3 * j] = posdata[0];
				this.pos[(4 * 3 * i + 1) + 3 * j] = posdata[1];
				this.pos[(4 * 3 * i + 2) + 3 * j] = posdata[2];

				this.col[(4 * 4 * i) + 4 * j] = coldata[0];
				this.col[(4 * 4 * i + 1) + 4 * j] = coldata[1];
				this.col[(4 * 4 * i + 2) + 4 * j] = coldata[2];
				this.col[(4 * 4 * i + 3) + 4 * j] = coldata[3];

				this.data[(4 * 2 * i) + 2 * j] = particle.size;
				this.data[(4 * 2 * i + 1) + 2 * j] = particle.rotation;
			}

			this.lastAlive = i + 1;
		};

		ParticleRenderer.prototype.updateParticle = function (tpf, particle) {
			if (!this.renderedCount) {
				this.initFrame();
			}

			this.renderedCount++;

			if (particle.dead) {
				return;
			}

			this.updateParticleBufferData(tpf, particle);
		};

		ParticleRenderer.prototype.updateMeshdata = function () {
			if (this.entity.hidden) {
				return;
			}

			this.meshData.indexLengths = [this.lastAlive * 6];
			this.meshData.indexCount = this.lastAlive * 6;
			this.renderedCount = 0;
			this.meshData.setVertexDataUpdated();
		};



		var particleShader = {
			processors: [
				function (shader, shaderInfo) {
					shader.defines.BILLBOARD_TYPE = shaderInfo.xxx || 0;
				}
			],
			defines: {
				SPIN: true,
				BILLBOARD_TYPE: 0
			},
			attributes: {
				vertexPosition: MeshData.POSITION,
				vertexColor: MeshData.COLOR,
				vertexData: 'DATA',
				vertexOffset: 'OFFSET',
				textureTile: 'TILE'
			},
			uniforms: {
				viewMatrix: Shader.VIEW_MATRIX,
				projectionMatrix: Shader.PROJECTION_MATRIX,
				worldMatrix: Shader.WORLD_MATRIX,
				particleMap: 'PARTICLE_MAP',
				cameraPosition: Shader.CAMERA,
				alphakill: 0,
				upVec: [0, 0, 1],
				dirVec: [0, 1, 0]
			},
			vshader: [
				'attribute vec3 vertexPosition;',
				'attribute vec4 vertexColor;',
				'attribute vec2 vertexData;',
				'attribute vec2 vertexOffset;',
				'attribute vec4 textureTile;',

				'uniform mat4 viewMatrix;',
				'uniform mat4 projectionMatrix;',
				'uniform mat4 worldMatrix;',
				'#if BILLBOARD_TYPE == 1',
				'uniform vec3 cameraPosition;',
				'#elif BILLBOARD_TYPE == 2',
				'uniform vec3 upVec;',
				'uniform vec3 dirVec;',
				'#endif',

				'varying vec4 color;',
				'varying vec2 coords;',

				'void main(void) {',
				'color = vertexColor;',
				'coords = (vertexOffset * 0.5 + 0.5) * textureTile.zw + textureTile.xy;',

				'#ifdef SPIN',
				'float rotation = vertexData.y;',
				'float c = cos(rotation); float s = sin(rotation);',
				'mat3 spinMatrix = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);',
				'vec2 offset = (spinMatrix * vec3(vertexOffset, 1.0)).xy * vertexData.x;',
				'#else',
				'vec2 offset = vertexOffset * vertexData.x;',
				'#endif',

				'#if BILLBOARD_TYPE == 0', // camera facing
				'gl_Position = viewMatrix * worldMatrix * vec4(vertexPosition.xyz, 1.0);',
				'gl_Position.xy += offset;',
				'#elif BILLBOARD_TYPE == 1', // locked in y-axis
				'vec3 worldPos = (worldMatrix * vec4(vertexPosition.xyz, 1.0)).xyz;',

				'vec3 dirVec = cameraPosition - worldPos;',
				'dirVec.y = 0.0;',
				'dirVec = normalize(dirVec);',
				'vec3 upVec = vec3(0.0, 1.0, 0.0);',
				'vec3 leftVec = cross(upVec, dirVec) * offset.x;',

				'gl_Position = viewMatrix * vec4(worldPos + leftVec + upVec * offset.y, 1.0);',
				'#elif BILLBOARD_TYPE == 2', // facing dirVec (with up)
				'vec3 worldPos = (worldMatrix * vec4(vertexPosition.xyz, 1.0)).xyz;',
				'vec3 leftVec = cross(upVec, dirVec) * offset.x;',
				'gl_Position = viewMatrix * vec4(worldPos + leftVec + upVec * offset.y, 1.0);',
				'#endif',

				'gl_Position = projectionMatrix * gl_Position;',
				'}'
			].join('\n'),
			fshader: [
				'uniform sampler2D particleMap;',
				'uniform float alphakill;',

				'varying vec4 color;',
				'varying vec2 coords;',

				'void main(void)',
				'{',
				'vec4 col = color * texture2D(particleMap, coords);',
				'if (col.a <= alphakill) discard;',
				'gl_FragColor = col;',
				'}'
			].join('\n')
		};

		return ParticleRenderer;
	});