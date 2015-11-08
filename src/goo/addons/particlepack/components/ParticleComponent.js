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
			START_SCALE: '2.0'
		},
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexData: 'DATA',
			timeInfo: 'TIME_INFO',
			startPos: 'START_POS',
			startDir: 'START_DIR',
			vertexOffset: 'OFFSET',
		},
		uniforms: {
			textureTileInfo: [1, 1, 1, 0], // tilesX, tilesY, cycles over lifetime, unused
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
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
			'attribute vec4 timeInfo;',
			'attribute vec3 startPos;',
			'attribute vec3 startDir;',

			'uniform vec4 textureTileInfo;',
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

				'float duration = timeInfo.y;',
				'float lifeTime = timeInfo.z;',
				'float timeOffset = timeInfo.w;',
				'float t = time + timeOffset;',
				'float tNoMod = time + timeOffset;',

				'#ifdef LOOP',
				't = mod(t, duration);',
				'#endif',

				'float tileX = floor(mod(textureTileInfo.x * textureTileInfo.y * t / lifeTime, textureTileInfo.x));',
				'float tileY = floor(mod(textureTileInfo.y * t / lifeTime, textureTileInfo.y));',
				'vec2 texOffset = vec2(tileX, tileY) / textureTileInfo.xy;',
				'coords = (vertexOffset * 0.5 + 0.5) / textureTileInfo.xy + texOffset;',

				'rotation = getAngle(t);',
				'float c = cos(rotation);',
				'float s = sin(rotation);',
				'mat3 spinMatrix = mat3(c, s, 0, -s, c, 0, 0, 0, 1);',
				'vec2 offset = ((spinMatrix * vertexPosition.xyz)).xy * getScale(t / duration);',

				// Particle should show if t > 0 and within life span
				'offset *= step(0.0, tNoMod) * step(0.0, t) * step(-lifeTime, -t);',

				'vec4 pos = vec4(getPosition(t, startPos, startDir, gravity),0);',
				'mat4 matPos = worldMatrix * mat4(vec4(0),vec4(0),vec4(0),pos);',
				'gl_Position = viewProjectionMatrix * (worldMatrix + matPos) * vec4(0, 0, 0, 1) + projectionMatrix * vec4(offset.xy, 0, 0);',
			'}'
		].join('\n'),
		fshader: [
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
		options = options || {};
		Component.apply(this, arguments);
		this.type = ParticleComponent.type;

		this.material = new Material(particleShader);
		this.material.cullState.enabled = false;
		this.material.uniforms.textureTileInfo = [1, 1, 1, 0];

		/**
		 * @type {Vector3}
		 */
		this.gravity = new Vector3();
		if (options.gravity) {
			this.gravity.copy(options.gravity);
		}

		this.startColor = new Vector4(1, 1, 1, 1);
		this.shapeType = 'sphere';
		this.particles = [];
		this.duration = options.duration !== undefined ? options.duration : 10;
		this.emitterRadius = options.emitterRadius !== undefined ? options.emitterRadius : 1;
		this.shapeRadius = 1;
		this.coneAngle = 10;
		this.localSpace = true;
		this._startSpeed = options.startSpeed !== undefined ? options.startSpeed : 5;
		this._maxParticles = options.maxParticles !== undefined ? options.maxParticles : 1000;
		this.emissionRate = options.emissionRate || 10;
		this.startLifeTime = options.startLifeTime || 5;
		this.renderQueue = options.renderQueue !== undefined ? options.renderQueue : 3010;
		this.alphakill = options.alphakill !== undefined ? options.alphakill : 0;
		this.loop = options.loop !== undefined ? options.loop : true;
		this.preWarm = options.preWarm !== undefined ? options.preWarm : true;
		this.blending = options.blending !== undefined ? options.blending : true;
		this.depthWrite = options.depthWrite !== undefined ? options.depthWrite : true;
		this.textureTilesX = options.textureTilesX !== undefined ? options.textureTilesX : 1;
		this.textureTilesY = options.textureTilesY !== undefined ? options.textureTilesY : 1;
		if (options.texture) {
			this.texture = options.texture;
		}
	}

	ParticleComponent.prototype = Object.create(Component.prototype);
	ParticleComponent.prototype.constructor = ParticleComponent;

	ParticleComponent.type = 'ParticleComponent';

	Object.defineProperties(ParticleComponent.prototype, {
		loop: {
			get: function () {
				return this.material.shader.hasDefine('LOOP');
			},
			set: function (value) {
				if (value) {
					this.material.shader.setDefine('LOOP', true);
				} else {
					this.material.shader.removeDefine('LOOP');
				}
			}
		},
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
				return this.material.depthState.enabled;
			},
			set: function (value) {
				this.material.depthState.enabled = value;
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
		texture: {
			get: function () {
				return this.material.getTexture('PARTICLE_TEXTURE');
			},
			set: function (value) {
				this.material.setTexture('PARTICLE_TEXTURE', value);
			}
		},
		textureTilesX: {
			get: function () {
				return this.material.uniforms.textureTileInfo[0];
			},
			set: function (value) {
				this.material.uniforms.textureTileInfo[0] = value;
			}
		},
		textureTilesY: {
			get: function () {
				return this.material.uniforms.textureTileInfo[1];
			},
			set: function (value) {
				this.material.uniforms.textureTileInfo[1] = value;
			}
		},
		depthWrite: {
			get: function () {
				return this.material.depthState.write;
			},
			set: function (value) {
				this.material.depthState.write = value;
			}
		},
		renderQueue: {
			get: function () {
				return this.material.renderQueue;
			},
			set: function (value) {
				this.material.renderQueue = value;
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
				return this.meshData ? this.meshData.vertexCount / 4 : this._maxParticles;
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
		uniforms.gravity = uniforms.gravity || [];
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

		var offset = meshData.getAttributeBuffer('OFFSET');
		var pos = meshData.getAttributeBuffer('POSITION');

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
			var timeOffset = i / this.emissionRate;
			var timeScale = this.duration;
			if (timeOffset > this.duration) {
				timeScale = 0;
			}
			if (!this.preWarm) {
				timeOffset -= this.duration;
			}
			for (j = 0; j < 4; j++) {
				timeInfo[16 * i + j * 4 + 0] = rand; // random
				timeInfo[16 * i + j * 4 + 1] = timeScale; // timescale
				timeInfo[16 * i + j * 4 + 2] = Math.min(this.startLifeTime, this.duration); // lifetime
				timeInfo[16 * i + j * 4 + 3] = timeOffset;//-this.duration * i / maxParticles + (this.preWarm ? this.duration : 0); // timeOffset
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
					Math.cos(phi) * Math.sin(theta),
					Math.cos(theta),
					Math.sin(phi) * Math.sin(theta)
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

	ParticleComponent.prototype.process = function () {
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
			gravity: this.gravity,
			startColor: this.startColor,
			shapeType: this.shapeType,
			textureTilesX: this.textureTilesX,
			textureTilesY: this.textureTilesY,
			particles: this.particles,
			duration: this.duration,
			emitterRadius: this.emitterRadius,
			shapeRadius: this.shapeRadius,
			coneAngle: this.coneAngle,
			localSpace: this.localSpace,
			emissionRate: this.emissionRate,
			startLifeTime: this.startLifeTime,
			renderQueue: this.renderQueue,
			alphakill: this.alphakill,
			loop: this.loop
		});
	};

	return ParticleComponent;
});