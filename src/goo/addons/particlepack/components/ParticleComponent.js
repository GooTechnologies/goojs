define([
	'goo/math/Vector3',
	'goo/math/Vector',
	'goo/math/Vector4',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/math/MathUtils',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/Component',
	'goo/renderer/Texture',
	'goo/renderer/Shader',
	'goo/math/Transform',
	'goo/addons/particlepack/Particle',
	'goo/addons/particlepack/LinearCurve'
], function (
	Vector3,
	Vector,
	Vector4,
	MeshData,
	Material,
	MathUtils,
	MeshRendererComponent,
	Component,
	Texture,
	Shader,
	Transform,
	Particle,
	LinearCurve
) {
	'use strict';

	var tmpGravity = new Vector3();

	var particleShader = {
		defines: {
			START_SCALE: '1.0'
		},
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexData: 'DATA',
			timeInfo: 'TIME_INFO',
			startPos: 'START_POS',
			startDir: 'START_DIR',
			vertexOffset: 'OFFSET',
			textureTile: 'TILE'
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			particleMap: 'PARTICLE_MAP',
			particleTexture: 'PARTICLE_TEXTURE',
			cameraPosition: Shader.CAMERA,
			time: Shader.TIME,
			gravity: [0, 0, 0],
			uColor: [1, 1, 1, 1],
			alphakill: 0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexData;',
			'attribute vec2 vertexOffset;',
			'attribute vec4 textureTile;',
			'attribute vec4 timeInfo;',
			'attribute vec3 startPos;',
			'attribute vec3 startDir;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',
			'uniform float time;',
			'uniform vec3 gravity;',

			'uniform vec4 uColor;',
			'varying vec4 color;',

			'varying vec2 coords;',

			'vec3 getPosition(float t, vec3 pos, vec3 dir, vec3 g){',
			'    return pos + dir * t + 0.5 * t * t * g;',
			'}',

			'float getScale(float t){',
			'    return (1.0 - t) * START_SCALE;',
			'}',

			'float getAngle(float t){',
			'    return t;',
			'}',

			'void main(void) {',
				'color = uColor;',

				'float rotation = vertexData.y;',

				'coords = (vertexOffset * 0.5 + 0.5) * textureTile.zw + textureTile.xy;',

				'float rand = timeInfo.x;',
				'float duration = timeInfo.y;',
				'float lifeTime = timeInfo.z;',
				'float timeOffset = timeInfo.w;',
				'float t = mod(time + timeOffset, duration);',

				'rotation = getAngle(t);',
				'float c = cos(rotation);',
				'float s = sin(rotation);',
				'mat3 spinMatrix = mat3(c, s, 0, -s, c, 0, 0, 0, 1);',
				'vec2 offset = ((spinMatrix * vertexPosition.xyz)).xy * getScale(t / duration) * (1.0 - step(lifeTime, mod(time - timeOffset, duration)));',
				'vec4 pos = vec4(getPosition(t, startPos, startDir, gravity),0);',
				'mat4 matPos = worldMatrix * mat4(vec4(0),vec4(0),vec4(0),pos);',
				'gl_Position = viewProjectionMatrix * (worldMatrix + matPos) * vec4(0, 0, 0, 1) + projectionMatrix * vec4(offset.xy, 0, 0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D particleMap;',
			'uniform sampler2D particleTexture;',
			'uniform float alphakill;',

			'varying vec4 color;',
			'varying vec2 coords;',

			'void main(void)',
			'{',
				'vec4 col = color * texture2D(particleTexture, coords);',
				'if (col.a <= alphakill) discard;',
				'gl_FragColor = col;',
			'}'
		].join('\n')
	};

	function numberToGLSL(n) {
		return (n + '').indexOf('.') === -1 ? n + '.0' : n + '';
	}

	/**
	 */
	function ParticleComponent(options) {
		Component.apply(this, arguments);

		options = options || {};

		this.gravity = new Vector3();
		this.startColor = new Vector4(1, 1, 1, 1);

		this.shapeType = 'sphere';

		this.type = ParticleComponent.type;

		this.textureTilesX = 1;
		this.textureTilesY = 1;

		this.particles = [];
		this.duration = 10;

		this.emitterRadius = 1;
		this.shapeRadius = 1;
		this.coneAngle = 10;

		this.localSpace = true;
		this._startSpeed = options.startSpeed !== undefined ? options.startSpeed : 5;

		this.emissionRate = options.emissionRate || 10;
		this.startLifeTime = options.startLifeTime || 5;

		var material = this.material = new Material(particleShader);
		material.renderQueue = 3010;
		material.uniforms.alphakill = options.alphakill !== undefined ? options.alphakill : 0;

		if (this.texture) {
			material.setTexture('PARTICLE_TEXTURE', this.texture);
		}

	}

	ParticleComponent.prototype = Object.create(Component.prototype);
	ParticleComponent.prototype.constructor = ParticleComponent;

	ParticleComponent.type = 'ParticleComponent';

	Object.defineProperties(ParticleComponent.prototype, {
		blending: {
			get: function () {
				return this.material.blendState.blending;
			},
			set: function (value) {
				this.material.blendState.blending = value;
			}
		},
		depthTest: {
			get: function () {
				return this.material.blendState.enabled;
			},
			set: function (value) {
				this.material.blendState.enabled = value;
			}
		},
		alphakill: {
			get: function () {
				return this.material.uniforms.alphakill;
			},
			set: function (value) {
				this.material.uniforms.alphakill = value;
			}
		},
		depthWrite: {
			get: function () {
				return this.material.blendState.write;
			},
			set: function (value) {
				this.material.blendState.write = value;
			}
		},
		renderQueue: {
			get: function () {
				return this.material.blendState.write;
			},
			set: function (value) {
				this.material.blendState.write = value;
			}
		},
		startSpeed: {
			get: function () {
				return this._startSpeed;
			},
			set: function (value) {
				if (this._startSpeed !== value) {
					this._startSpeed = value;
					this.updateVertexData();
				}
			}
		},
		startSize: {
			get: function () {
				return Number(this.material.shader.defines.START_SCALE);
			},
			set: function (value) {
				this.material.shader.setDefine('START_SCALE', numberToGLSL(value));
			}
		},
		maxParticles: {
			get: function () {
				return this.meshData ? this.meshData.vertexCount / 4 : 1000;
			},
			set: function (value) {
				if (value * 4 !== this.meshData.vertexCount) {
					this.meshData.vertexCount = value * 4;
					this.meshData.indexCount = value * 6;
					this.meshData.rebuildData();
					this.updateParticles();
					this.updateVertexData();
				}
			}
		}
	});

	ParticleComponent.prototype.init = function () {
		var maxParticles = this.maxParticles;
		for (var i = 0; i < maxParticles; i++) {
			this.particles.push(new Particle());
		}

		var attributeMap = MeshData.defaultMap([
			MeshData.POSITION
		]);
		attributeMap.DATA = MeshData.createAttribute(2, 'Float');
		attributeMap.OFFSET = MeshData.createAttribute(2, 'Float');
		attributeMap.TILE = MeshData.createAttribute(4, 'Float');
		attributeMap.TIME_INFO = MeshData.createAttribute(4, 'Float');
		attributeMap.START_POS = MeshData.createAttribute(3, 'Float');
		attributeMap.START_DIR = MeshData.createAttribute(3, 'Float');
		var meshData = new MeshData(attributeMap, maxParticles * 4, maxParticles * 6);
		meshData.vertexData.setDataUsage('DynamicDraw');
		this.meshData = meshData;

		var entity = this.entity = this._entity._world.createEntity(meshData);
		entity.set(new MeshRendererComponent(this.material));
		entity.name = 'ParticleSystem';
		entity.meshRendererComponent.cullMode = 'Never'; // TODO: cull with approx bounding sphere
		entity.addToWorld();

		this._entity.transformComponent.attachChild(entity.transformComponent, false);

		this.updateVertexData();
	};
	ParticleComponent.prototype.updateUniforms = function () {
		var uniforms = this.material.uniforms;

		// Gravity in local space
		tmpGravity.copy(this.gravity);
		var invRot = this.entity.transformComponent.worldTransform.rotation.clone().invert(); // todo optimize
		tmpGravity.applyPost(invRot);
		uniforms.gravity = uniforms.gravity||[];
		uniforms.gravity[0] = tmpGravity.x;
		uniforms.gravity[1] = tmpGravity.y;
		uniforms.gravity[2] = tmpGravity.z;

		// Color
		var d = this.startColor;
		uniforms.uColor = uniforms.uColor || [];
		uniforms.uColor[0] = d.x;
		uniforms.uColor[1] = d.y;
		uniforms.uColor[2] = d.z;
		uniforms.uColor[3] = d.w;
	};

	ParticleComponent.prototype.updateParticles = function () {
		while (this.particles.length < this.maxParticles) {
			this.particles.push(new Particle());
		}
		while (this.particles.length > this.maxParticles) {
			this.particles.pop();
		}
	};

	ParticleComponent.prototype.updateVertexData = function () {
		var meshData = this.meshData;
		var maxParticles = this.maxParticles;
		var i, j;

		var scaleX = 1 / this.textureTilesX;
		var scaleY = 1 / this.textureTilesY;

		var offset = meshData.getAttributeBuffer('OFFSET');
		var pos = meshData.getAttributeBuffer('POSITION');

		var tile = meshData.getAttributeBuffer('TILE');
		var indices = meshData.getIndexBuffer();
		for (i = 0; i < maxParticles; i++) {
			offset[8 * i + 0] = -1;
			offset[8 * i + 1] = -1;

			offset[8 * i + 2] = -1;
			offset[8 * i + 3] = 1;

			offset[8 * i + 4] = 1;
			offset[8 * i + 5] = 1;

			offset[8 * i + 6] = 1;
			offset[8 * i + 7] = -1;

			var offsetX = Math.floor(this.textureTilesX * Math.random()) / this.textureTilesX;
			var offsetY = Math.floor(this.textureTilesY * Math.random()) / this.textureTilesY;

			for (j = 0; j < 4; j++) {
				tile[(16 * i + 0) + 4 * j] = offsetX;
				tile[(16 * i + 1) + 4 * j] = offsetY;
				tile[(16 * i + 2) + 4 * j] = scaleX;
				tile[(16 * i + 3) + 4 * j] = scaleY;
			}

			indices[6 * i + 0] = 4 * i + 0;
			indices[6 * i + 1] = 4 * i + 3;
			indices[6 * i + 2] = 4 * i + 1;
			indices[6 * i + 3] = 4 * i + 1;
			indices[6 * i + 4] = 4 * i + 3;
			indices[6 * i + 5] = 4 * i + 2;

			pos[12 * i + 0] = -0.5;
			pos[12 * i + 1] = -0.5;
			pos[12 * i + 2] = 0;

			pos[12 * i + 3] = -0.5;
			pos[12 * i + 4] = 0.5;
			pos[12 * i + 5] = 0;

			pos[12 * i + 6] = 0.5;
			pos[12 * i + 7] = 0.5;
			pos[12 * i + 8] = 0;

			pos[12 * i + 9] = 0.5;
			pos[12 * i + 10] = -0.5;
			pos[12 * i + 11] = 0;
		}

		// Time info
		var timeInfo = meshData.getAttributeBuffer('TIME_INFO');

		for (i = 0; i < maxParticles; i++) {
			var rand = Math.random();
			for (j = 0; j < 4; j++) {
				timeInfo[16 * i + j * 4 + 0] = rand; // random
				timeInfo[16 * i + j * 4 + 1] = this.duration; // timescale
				timeInfo[16 * i + j * 4 + 2] = 5; // lifetime
				timeInfo[16 * i + j * 4 + 3] = this.duration * i / maxParticles; // timeOffset
			}
		}

		// Start position
		var startPos = meshData.getAttributeBuffer('START_POS');
		var startDir = meshData.getAttributeBuffer('START_DIR');

		for (i = 0; i < maxParticles; i++) {
			var particle = this.particles[i];

			// Default
			particle.localStartDirection.setDirect(0, this.startSpeed, 0);

			if (this.shapeType === 'cube') {

				particle.localStartPosition.setDirect(
					Math.random() - 0.5,
					Math.random() - 0.5,
					Math.random() - 0.5
				);

			} else if (this.shapeType === 'sphere') {

				var theta = Math.acos(2 * Math.random() - 1);
				var phi = 2 * Math.PI * Math.random();
				var r = this.emitterRadius;
				particle.localStartPosition.setDirect(
					r * Math.cos(phi) * Math.sin(theta),
					r * Math.cos(theta),
					r * Math.sin(phi) * Math.sin(theta)
				);
				particle.localStartDirection.setDirect(
					r * Math.cos(phi) * Math.sin(theta),
					r * Math.cos(theta),
					r * Math.sin(phi) * Math.sin(theta)
				).normalize().scale(this.startSpeed);

			} else if (this.shapeType === 'cone') {

				var theta = Math.PI / 2 + Math.random() * (this.coneAngle * Math.PI / 360);
				var phi = 2 * Math.PI * Math.random();
				var y = Math.random();
				var rad = this.shapeRadius * Math.random() * y;
				particle.localStartPosition.setDirect(
					rad * Math.cos(phi),
					y,
					rad * Math.sin(phi)
				);
				particle.localStartDirection.copy(particle.localStartPosition).normalize().scale(this.startSpeed);
				particle.localStartPosition.y -= 0.5;
			}

			for (j = 0; j < 4; j++) {
				startPos[4 * 3 * i + j * 3 + 0] = particle.localStartPosition.x;
				startPos[4 * 3 * i + j * 3 + 1] = particle.localStartPosition.y;
				startPos[4 * 3 * i + j * 3 + 2] = particle.localStartPosition.z;

				startDir[4 * 3 * i + j * 3 + 0] = particle.localStartDirection.x;
				startDir[4 * 3 * i + j * 3 + 1] = particle.localStartDirection.y;
				startDir[4 * 3 * i + j * 3 + 2] = particle.localStartDirection.z;
			}
		}

		meshData.setVertexDataUpdated();
	};

	ParticleComponent.prototype.update = function () {
		this.updateUniforms();
	};

	ParticleComponent.prototype.destroy = function () {
		this._entity.detachChild(this.entity);
		this.entity.removeFromWorld();
	};

	/**
	 * @private
	 * @param entity
	 */
	ParticleComponent.prototype.attached = function (entity) {
		this._entity = entity;
		this._system = entity._world.getSystem('PhysicsSystem');
		this.init();
	};

	/**
	 * @returns RigidBodyComponent
	 */
	ParticleComponent.prototype.clone = function () {
		return new ParticleComponent({
		});
	};

	return ParticleComponent;
});