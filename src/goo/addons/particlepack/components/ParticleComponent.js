define([
	'goo/math/Matrix3',
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
	'goo/renderer/Renderer'
], function (
	Matrix3,
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
	Renderer
) {
	'use strict';

	var tmpGravity = new Vector3();

	var particleShader = {
		defines: {
			START_SCALE: '1.0'
		},
		attributes: {
			vertexPosition: MeshData.POSITION,
			timeInfo: 'TIME_INFO',
			startPos: 'START_POS',
			startDir: 'START_DIR',
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			textureTileInfo: [1, 1, 1, 0], // tilesX, tilesY, cycles over lifetime, unused
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			particleTexture: 'PARTICLE_TEXTURE',
			cameraPosition: Shader.CAMERA,
			time: 0.0,
			gravity: [0, 0, 0],
			uColor: [1, 1, 1, 1],
			alphakill: 0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',
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
			'    return clamp(1.0 - t, 0.0, 1.0) * START_SCALE;',
			'}',

			'float getAngle(float t){',
			'    return t;',
			'}',

			'void main(void) {',
			'    color = uColor;',

			'    float lifeTime = timeInfo.x;',
			'    float timeScale = timeInfo.y;',
			'    float emitTime = timeInfo.w;',
			'    float age = time * timeScale - emitTime;',
			'    float ageNoMod = time * timeScale - emitTime;',

			'    #ifdef LOOP',
			'    age = mod(age, lifeTime);',
			'    #endif',

			'    float unitAge = age / lifeTime;',

			'    float tileX = floor(mod(textureTileInfo.x * textureTileInfo.y * unitAge, textureTileInfo.x));',
			'    float tileY = floor(mod(textureTileInfo.y * unitAge, textureTileInfo.y));',
			'    vec2 texOffset = vec2(tileX, tileY) / textureTileInfo.xy;',
			'    coords = vertexUV0 / textureTileInfo.xy + texOffset;',

			'    float rotation = getAngle(age);',
			'    float c = cos(rotation);',
			'    float s = sin(rotation);',
			'    mat3 spinMatrix = mat3(c, s, 0, -s, c, 0, 0, 0, 1);',
			'    vec2 offset = ((spinMatrix * vertexPosition.xyz)).xy * getScale(unitAge) * timeScale;',

			// Particle should show if lifeTime >= age > 0 and within life span
			'    offset *= step(0.0, ageNoMod) * step(0.0, age) * step(-lifeTime, -age);',

			'    vec4 pos = vec4(getPosition(age, startPos, startDir, gravity),0);',
			'    mat4 matPos = worldMatrix * mat4(vec4(0),vec4(0),vec4(0),pos);',
			'    gl_Position = viewProjectionMatrix * (worldMatrix + matPos) * vec4(0, 0, 0, 1) + projectionMatrix * vec4(offset.xy, 0, 0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D particleTexture;',
			'uniform float alphakill;',

			'varying vec4 color;',
			'varying vec2 coords;',

			'void main(void){',
			'    vec4 col = color * texture2D(particleTexture, coords);',
			'    if (col.a <= alphakill) discard;',
			'    gl_FragColor = col;',
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

		this.time = 0;

		/**
		 * @type {Vector3}
		 */
		this.gravity = new Vector3();
		if (options.gravity) {
			this.gravity.copy(options.gravity);
		}

		this.startColor = new Vector4(1, 1, 1, 1);
		this.particles = [];
		this.unsortedParticles = []; // Same as particles but unsorted
		this.shapeType = options.shapeType !== undefined ? options.shapeType : 'sphere';
		this.duration = options.duration !== undefined ? options.duration : 10;
		this.emitterRadius = options.emitterRadius !== undefined ? options.emitterRadius : 1;
		this.emitterExtents = options.emitterExtents !== undefined ? options.emitterExtents.clone() : new Vector3(1, 1, 1);
		this.shapeRadius = options.shapeRadius !== undefined ? options.shapeRadius : 1;
		this.coneAngle = options.coneAngle !== undefined ? options.coneAngle : 10;
		this.localSpace = options.localSpace !== undefined ? options.localSpace : true;
		this._startSpeed = options.startSpeed !== undefined ? options.startSpeed : 5;
		this._maxParticles = options.maxParticles !== undefined ? options.maxParticles : 1000;
		this.emissionRate = options.emissionRate !== undefined ? options.emissionRate : 10;
		this.startLifeTime = options.startLifeTime !== undefined ? options.startLifeTime : 5;
		this.renderQueue = options.renderQueue !== undefined ? options.renderQueue : 3010;
		this.alphakill = options.alphakill !== undefined ? options.alphakill : 0;
		this.loop = options.loop !== undefined ? options.loop : true;
		this.preWarm = options.preWarm !== undefined ? options.preWarm : true;
		this.blending = options.blending !== undefined ? options.blending : true;
		this.depthWrite = options.depthWrite !== undefined ? options.depthWrite : true;
		this.depthTest = options.depthTest !== undefined ? options.depthTest : true;
		this.textureTilesX = options.textureTilesX !== undefined ? options.textureTilesX : 1;
		this.textureTilesY = options.textureTilesY !== undefined ? options.textureTilesY : 1;
		this.startSize = options.startSize !== undefined ? options.startSize : 1;
		this.sortMode = options.sortMode !== undefined ? options.sortMode : ParticleComponent.SORT_NONE;
		if (options.texture) {
			this.texture = options.texture;
		}

		this.nextEmitParticle = 0;
	}
	ParticleComponent.prototype = Object.create(Component.prototype);
	ParticleComponent.prototype.constructor = ParticleComponent;

	ParticleComponent.type = 'ParticleComponent';

	ParticleComponent.SORT_NONE = 1;
	ParticleComponent.SORT_CAMERA_DISTANCE = 2;

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
		localSpace: {
			get: function () {
				if (!this.entity) {
					return this._localSpace;
				}
				return !!this.entity.transformComponent.parent;
			},
			set: function (value) {
				if (!this.entity) {
					this._localSpace = value;
					return;
				}

				if (!value && this.entity.transformComponent.parent) {
					this.entity.transformComponent.parent.detachChild(this.entity.transformComponent);
				} else if (value && !this.entity.transformComponent.parent) {
					this.entity.transformComponent.parent.attachChild(this.entity.transformComponent);
				}
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
			var particle = new Particle(this);
			this.particles.push(particle);
			this.unsortedParticles.push(particle);
		}

		var attributeMap = MeshData.defaultMap([
			MeshData.POSITION,
			MeshData.TEXCOORD0
		]);
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
		if (this._localSpace) {
			this._entity.transformComponent.attachChild(entity.transformComponent, false);
		}

		this.updateVertexData();
	};

	var invRot = new Matrix3();
	ParticleComponent.prototype.updateUniforms = function () {
		var uniforms = this.material.uniforms;

		// Gravity in local space
		tmpGravity.copy(this.gravity);
		invRot.copy(this.entity.transformComponent.worldTransform.rotation).invert();
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

		uniforms.time = this.time;
	};

	ParticleComponent.prototype.updateParticles = function () {
		var particles = this.particles;
		var unsortedParticles = this.unsortedParticles;
		var maxParticles = this.maxParticles;
		while (particles.length < maxParticles) {
			var particle = new Particle(this);
			particles.push(particle);
			unsortedParticles.push(particle);
		}
		while (particles.length > maxParticles) {
			var particle = particles.pop();
			unsortedParticles.splice(unsortedParticles.indexOf(particle), 1);
		}
	};

	ParticleComponent.prototype.updateVertexData = function () {
		var meshData = this.meshData;
		var maxParticles = this.maxParticles;
		var i, j;

		var offset = meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		var pos = meshData.getAttributeBuffer(MeshData.POSITION);

		var indices = meshData.getIndexBuffer();
		for (i = 0; i < maxParticles; i++) {
			offset[8 * i + 0] = 0;
			offset[8 * i + 1] = 0;

			offset[8 * i + 2] = 0;
			offset[8 * i + 3] = 1;

			offset[8 * i + 4] = 1;
			offset[8 * i + 5] = 1;

			offset[8 * i + 6] = 1;
			offset[8 * i + 7] = 0;

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

		meshData.setAttributeDataUpdated(MeshData.TEXCOORD0);
		meshData.setAttributeDataUpdated(MeshData.POSITION);

		// Time info
		var timeInfo = meshData.getAttributeBuffer('TIME_INFO');
		for (i = 0; i < maxParticles; i++) {
			var particle = this.particles[i];
			particle.timeScale = 1;
			particle.lifeTime = this.startLifeTime;

			if (this.localSpace) {
				particle.emitTime = this.preWarm ? -i / this.emissionRate : i / this.emissionRate;
				if (particle.emitTime >= this.time + this.startLifeTime) {
					particle.timeScale = 0;
					particle.emitTime = -9999;
					particle.active = false;
				} else {
					particle.active = true;
				}
			} else {
				particle.active = true;
				particle.emitTime = -particle.lifeTime;
			}

			for (j = 0; j < 4; j++) {
				timeInfo[16 * i + j * 4 + 0] = particle.lifeTime;
				timeInfo[16 * i + j * 4 + 1] = particle.timeScale;
				timeInfo[16 * i + j * 4 + 2] = particle.lifeTime;
				timeInfo[16 * i + j * 4 + 3] = particle.emitTime;
			}
		}
		meshData.setAttributeDataUpdated('TIME_INFO');

		// Start position
		var startPos = meshData.getAttributeBuffer('START_POS');
		var startDir = meshData.getAttributeBuffer('START_DIR');

		for (i = 0; i < maxParticles; i++) {
			var particle = this.particles[i];
			var pos = particle.startPosition;
			var dir = particle.startDirection;

			this._generateLocalPositionAndDirection(pos, dir);

			for (j = 0; j < 4; j++) {
				startPos[4 * 3 * i + j * 3 + 0] = pos.x;
				startPos[4 * 3 * i + j * 3 + 1] = pos.y;
				startPos[4 * 3 * i + j * 3 + 2] = pos.z;

				startDir[4 * 3 * i + j * 3 + 0] = dir.x;
				startDir[4 * 3 * i + j * 3 + 1] = dir.y;
				startDir[4 * 3 * i + j * 3 + 2] = dir.z;
			}
		}
		meshData.setAttributeDataUpdated('START_POS');
		meshData.setAttributeDataUpdated('START_DIR');
	};

	ParticleComponent.prototype._generateLocalPositionAndDirection = function (position, direction) {
		// Default
		direction.setDirect(0, this.startSpeed, 0);

		if (this.shapeType === 'cube') {
			position.setDirect(
				Math.random() - 0.5,
				Math.random() - 0.5,
				Math.random() - 0.5
			);
		} else if (this.shapeType === 'sphere') {
			var theta = Math.acos(2 * Math.random() - 1);
			var phi = 2 * Math.PI * Math.random();
			var r = this.emitterRadius;
			position.setDirect(
				r * Math.cos(phi) * Math.sin(theta),
				r * Math.cos(theta),
				r * Math.sin(phi) * Math.sin(theta)
			);
			direction.setDirect(
				Math.cos(phi) * Math.sin(theta),
				Math.cos(theta),
				Math.sin(phi) * Math.sin(theta)
			).normalize().scale(this.startSpeed);
		} else if (this.shapeType === 'cone') {
			var phi = 2 * Math.PI * Math.random();
			var y = Math.random();
			var rad = this.shapeRadius * Math.random() * y;
			position.setDirect(
				rad * Math.cos(phi),
				y,
				rad * Math.sin(phi)
			);
			direction.copy(position).normalize().scale(this.startSpeed);
			position.y -= 0.5;
		}
	};

	ParticleComponent.prototype.emitOne = function (position, direction) {
		var meshData = this.meshData;
		var startPos = meshData.getAttributeBuffer('START_POS');
		var startDir = meshData.getAttributeBuffer('START_DIR');
		var timeInfo = meshData.getAttributeBuffer('TIME_INFO');

		// Get the last emitted particle
		var i = this.nextEmitParticle = (this.nextEmitParticle + 1) % this.maxParticles;
		var particle = this.unsortedParticles[i];
		particle.emitTime = this.time; // Emitting NOW
		particle.startPosition.copy(position);
		particle.startDirection.copy(direction);
		particle.active = true;

		for (var j = 0; j < 4; j++) {
			timeInfo[16 * i + j * 4 + 3] = particle.emitTime;

			startPos[4 * 3 * i + j * 3 + 0] = particle.startPosition.x;
			startPos[4 * 3 * i + j * 3 + 1] = particle.startPosition.y;
			startPos[4 * 3 * i + j * 3 + 2] = particle.startPosition.z;

			startDir[4 * 3 * i + j * 3 + 0] = particle.startDirection.x;
			startDir[4 * 3 * i + j * 3 + 1] = particle.startDirection.y;
			startDir[4 * 3 * i + j * 3 + 2] = particle.startDirection.z;
		}

		meshData.setAttributeDataUpdated('START_POS');
		meshData.setAttributeDataUpdated('START_DIR');
		meshData.setAttributeDataUpdated('TIME_INFO');
	};

	var tmpWorldPos = new Vector3();
	ParticleComponent.prototype.sortParticles = function () {
		if (this.sortMode === ParticleComponent.SORT_NONE) {
			return;
		}

		var particles = this.particles;

		// Update sort values
		for (var i = 0; i < particles.length; i++) {
			var particle = particles[i];
			particle.sortValue = -particle.getWorldPosition(tmpWorldPos).dot(Renderer.mainCamera._direction);
		}

		// Insertion sort in-place
		var a = particles;
		for (var i = 1, l = a.length; i < l; i++) {
			var v = a[i];
			for (var j = i - 1; j >= 0; j--) {
				if (a[j].sortValue <= v.sortValue) {
					break;
				}
				a[j + 1] = a[j];
			}
			a[j + 1] = v;
		}

		// Update buffers
		var meshData = this.meshData;
		var startPos = meshData.getAttributeBuffer('START_POS');
		var startDir = meshData.getAttributeBuffer('START_DIR');
		var timeInfo = meshData.getAttributeBuffer('TIME_INFO');
		for (var i = 0; i < particles.length; i++) {
			var particle = particles[i];
			var emitTime = particle.emitTime;
			var pos = particle.startPosition;
			var dir = particle.startDirection;

			for (var j = 0; j < 4; j++) {
				timeInfo[16 * i + j * 4 + 3] = emitTime;

				startPos[4 * 3 * i + j * 3 + 0] = pos.x;
				startPos[4 * 3 * i + j * 3 + 1] = pos.y;
				startPos[4 * 3 * i + j * 3 + 2] = pos.z;

				startDir[4 * 3 * i + j * 3 + 0] = dir.x;
				startDir[4 * 3 * i + j * 3 + 1] = dir.y;
				startDir[4 * 3 * i + j * 3 + 2] = dir.z;
			}
		}
		meshData.setAttributeDataUpdated('START_POS');
		meshData.setAttributeDataUpdated('START_DIR');
		meshData.setAttributeDataUpdated('TIME_INFO');
	};

	var tmpPos = new Vector3();
	var tmpDir = new Vector3();
	ParticleComponent.prototype.process = function (tpf) {
		this.lastTime = this.time;
		this.time += tpf;
		this.updateUniforms();

		this.sortParticles();

		// Emit according to emit rate
		if (!this.localSpace) {
			var numToEmit = Math.floor(this.time * this.emissionRate) - Math.floor(this.lastTime * this.emissionRate);
			for (var i = 0; i < numToEmit; i++) {
				// get pos and direction from the shape
				this._generateLocalPositionAndDirection(tmpPos, tmpDir);

				// Transform to world space
				tmpPos.applyPostPoint(this._entity.transformComponent.worldTransform.matrix);
				tmpDir.applyPost(this._entity.transformComponent.worldTransform.rotation);

				// Emit
				this.emitOne(tmpPos, tmpDir);
			}
		}
	};

	ParticleComponent.prototype.destroy = function () {
		if (this.entity.parent) {
			this._entity.detachChild(this.entity);
		}
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