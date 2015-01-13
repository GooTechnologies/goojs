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

		material.depthState.write = false;
		material.renderQueue = 3010;
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
			offset[8 * i + 0] = -1;
			offset[8 * i + 1] = -1;

			offset[8 * i + 2] = -1;
			offset[8 * i + 3] = 1;

			offset[8 * i + 4] = 1;
			offset[8 * i + 5] = 1;

			offset[8 * i + 6] = 1;
			offset[8 * i + 7] = -1;

			for (var j = 0; j < 4; j++) {
				tile[16 * i + j * 4 + 0] = 0; //offset u
				tile[16 * i + j * 4 + 1] = 0; //offset w
				tile[16 * i + j * 4 + 2] = 1; //scale u
				tile[16 * i + j * 4 + 3] = 1; //scale w
			}

			indices[6 * i + 0] = 4 * i + 0;
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
			data[(4 * 2 * particle.index + 0) + 2 * j] = 0;
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
		var j, i, l;
		i = this.renderedCount;

		particle.setTileInfo(this.sprites[particle.sprite], this.scaleX, this.scaleY);
		particle.updateAtlasOffsets(this.loopScale);
		//	if (this.isTiled) {


		for (j = 0; j < 4; j++) {
			this.tile[(4 * 4 * i + 0) + 4 * j] = particle.offsetX;
			this.tile[(4 * 4 * i + 1) + 4 * j] = particle.offsetY;
			this.tile[(4 * 4 * i + 2) + 4 * j] = particle.scaleX;
			this.tile[(4 * 4 * i + 3) + 4 * j] = particle.scaleY;
		}
		//	}

		var posdata = particle.position.data;
		var coldata = particle.color.data;
		for (j = 0; j < 4; j++) {
			this.pos[(4 * 3 * i + 0) + 3 * j] = posdata[0];
			this.pos[(4 * 3 * i + 1) + 3 * j] = posdata[1];
			this.pos[(4 * 3 * i + 2) + 3 * j] = posdata[2];

			this.col[(4 * 4 * i + 0) + 4 * j] = coldata[0];
			this.col[(4 * 4 * i + 1) + 4 * j] = coldata[1];
			this.col[(4 * 4 * i + 2) + 4 * j] = coldata[2];
			this.col[(4 * 4 * i + 3) + 4 * j] = coldata[3];

			this.data[(4 * 2 * i + 0) + 2 * j] = particle.size;
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
			time: Shader.TIME,
			alphakill: 0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec4 vertexColor;',
			'attribute vec2 vertexData;',
			'attribute vec2 vertexOffset;',
			'attribute vec4 textureTile;',
			// 'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',
			'uniform float time;',

			'varying vec4 color;',
			'varying vec2 coords;',

			'void main(void) {',
				'color = vertexColor;',
				
				'float rotation = vertexData.y;',

				'coords = (vertexOffset * 0.5 + 0.5) * textureTile.zw + textureTile.xy;',
				// 'coords = coords * 0.98 + 0.01;',

				'float c = cos(rotation); float s = sin(rotation);',
				'mat3 spinMatrix = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);',
				'vec2 offset = (spinMatrix * vec3(vertexOffset, 1.0)).xy * vertexData.x;',

				'gl_Position = viewMatrix * worldMatrix * vec4(vertexPosition.xyz, 1.0);',
				'gl_Position.xy += offset;',
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