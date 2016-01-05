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
	'goo/renderer/Renderer',
	'goo/shapes/Quad',
	'goo/addons/particlepack/curves/ConstantCurve'
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
	Renderer,
	Quad,
	ConstantCurve
) {
	'use strict';

	var tmpGravity = new Vector3();

	function hasParent(entity) {
		return !!(entity.transformComponent.parent && entity.transformComponent.parent.entity.name !== 'root');
	}

	var defines = {
		START_LIFETIME_CODE: '5.0',
		START_SIZE_CODE: '1.0',
		START_COLOR_CODE: 'vec4(1.0)',
		SIZE_CURVE_CODE: '1.0',
		ROTATION_CURVE_CODE: '1.0',
		COLOR_CURVE_CODE: 'vec4(1.0)'
	}

	/**
	 * @class
	 * @constructor
	 * @param {Object} [options]
	 * @param {number} [options.alphakill=0]
	 * @param {number} [options.billboard=true]
	 * @param {number} [options.blending='NoBlending']
	 * @param {number} [options.coneAngle]
	 * @param {number} [options.depthTest=true]
	 * @param {number} [options.depthWrite=true]
	 * @param {number} [options.duration=5]
	 * @param {Curve} [options.emissionRate]
	 * @param {number} [options.boxExtents]
	 * @param {number} [options.sphereRadius=1]
	 * @param {Vector3} [options.gravity]
	 * @param {number} [options.localSpace=true]
	 * @param {number} [options.loop=true]
	 * @param {number} [options.maxParticles=100]
	 * @param {MeshData} [options.mesh]
	 * @param {number} [options.preWarm=true]
	 * @param {number} [options.renderQueue=3010]
	 * @param {Curve} [options.rotationSpeed]
	 * @param {number} [options.coneRadius=1]
	 * @param {number} [options.seed]
	 * @param {number} [options.shapeType='sphere']
	 * @param {number} [options.sizeCurve]
	 * @param {number} [options.sortMode]
	 * @param {number} [options.startAngle=0]
	 * @param {number} [options.startLifeTime=5]
	 * @param {number} [options.startSize=1]
	 * @param {number} [options.startSpeed=0]
	 * @param {number} [options.texture]
	 * @param {number} [options.textureTilesX=1]
	 * @param {number} [options.textureTilesY=1]
	 * @param {number} [options.textureAnimationSpeed=1]
	 */
	function ParticleComponent(options) {
		options = options || {};
		Component.apply(this, arguments);
		this.type = ParticleComponent.type;

		this._system = null;
		this._entity = null;

		this.material = new Material({
			defines: defines,
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
				time: 0,
				duration: 5,
				gravity: [0, 0, 0],
				alphakill: 0
			},
			vshader: [
				'attribute vec3 vertexPosition;',
				'attribute vec2 vertexUV0;',
				'attribute vec4 timeInfo;',
				'attribute vec4 startPos;',
				'attribute vec4 startDir;',

				'uniform vec4 textureTileInfo;',
				'uniform mat4 viewMatrix;',
				'uniform mat4 projectionMatrix;',
				'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 worldMatrix;',
				'uniform vec3 cameraPosition;',
				'uniform float time;',
				'uniform float duration;',
				'uniform vec3 gravity;',

				'varying vec4 color;',
				'varying vec2 coords;',

				'vec3 getPosition(float t, vec3 pos, vec3 vel, vec3 g){',
				'    return pos + vel * t + 0.5 * t * t * g;',
				'}',

				'float getScale(float t){',
				'    return clamp(SIZE_CURVE_CODE, 0.0, 1.0);',
				'}',

				'float getStartSize(float t, float emitRandom){',
				'    return START_SIZE_CODE;',
				'}',

				'float getStartLifeTime(float t, float emitRandom){',
				'    return START_LIFETIME_CODE;',
				'}',

				'float getAngle(float t){',
				'    return ROTATION_CURVE_CODE;',
				'}',

				'vec4 getColor(float t){',
				'    return COLOR_CURVE_CODE;',
				'}',

				'vec4 getStartColor(float t, float emitRandom){',
				'    return START_COLOR_CODE;',
				'}',

				'mat4 rotationMatrix(vec3 axis, float angle){',
				'    axis = normalize(axis);',
				'    float s = sin(angle);',
				'    float c = cos(angle);',
				'    float x = axis.x;',
				'    float y = axis.y;',
				'    float z = axis.z;',
				'    float oc = 1.0 - c;',
				'    return mat4(oc * x * x + c, oc * x * y - z * s,  oc * z * x + y * s,  0.0,',
				'    oc * x * y + z * s, oc * y * y + c, oc * y * z - x * s, 0.0,',
				'    oc * z * x - y * s, oc * y * z + x * s,  oc * z * z + c, 0.0,',
				'    0.0, 0.0, 0.0, 1.0);',
				'}',

				'void main(void) {',

				'    float active = timeInfo.y;',
				'    float emitTime = timeInfo.w;',
				'    float age = time * active - emitTime;',
				'    float ageNoMod = time * active - emitTime;',
				'    float startAngle = startPos.w;',

				'    #ifdef LOOP',
				'    age = mod(age, duration);',
				'    emitTime = mod(emitTime, duration);',
				'    #endif',

				'    float unitEmitTime = mod(emitTime / duration, 1.0);',
				'    float emitRandom = fract(sin(unitEmitTime * 12.9898) * 43758.5453);',
				'    float startSize = getStartSize(unitEmitTime, emitRandom);',
				'    float lifeTime = getStartLifeTime(unitEmitTime, emitRandom);',

				'    float unitAge = age / lifeTime;',
				'    color = getStartColor(unitEmitTime, emitRandom) * getColor(unitAge);',

				'    float textureAnimationSpeed = textureTileInfo.z;',
				'    float tileX = floor(mod(textureTileInfo.x * textureTileInfo.y * unitAge * textureAnimationSpeed, textureTileInfo.x));',
				'    float tileY = floor(mod(textureTileInfo.y * unitAge * textureAnimationSpeed, textureTileInfo.y));',
				'    vec2 texOffset = vec2(tileX, tileY) / textureTileInfo.xy;',
				'    coords = vertexUV0 / textureTileInfo.xy + texOffset;',

				'    float rotation = getAngle(unitAge) + startAngle;',
				'    float c = cos(rotation);',
				'    float s = sin(rotation);',
				'    mat3 spinMatrix = mat3(c, s, 0, -s, c, 0, 0, 0, 1);',
				// Particle should show if lifeTime >= age > 0 and within life span
				'    active *= step(0.0, ageNoMod) * step(0.0, age) * step(-lifeTime, -age);',
				'    vec3 position = getPosition(age, startPos.xyz, startDir.xyz, gravity);',
				'    #ifdef BILLBOARD',
				'    vec2 offset = ((spinMatrix * vertexPosition)).xy * startSize * getScale(unitAge) * active;',
				'    mat4 matPos = worldMatrix * mat4(vec4(0),vec4(0),vec4(0),vec4(position,0));',
				'    gl_Position = viewProjectionMatrix * (worldMatrix + matPos) * vec4(0, 0, 0, 1) + projectionMatrix * vec4(offset.xy, 0, 0);',
				'    #else',
				'    mat4 rot = rotationMatrix(normalize(vec3(sin(emitTime*5.0),cos(emitTime*1234.0),sin(emitTime))),rotation);',
				'    gl_Position = viewProjectionMatrix * worldMatrix * (rot * vec4(startSize * getScale(unitAge) * active * vertexPosition, 1.0) + vec4(position,0.0));',
				'    #endif',
				'}'
			].join('\n'),
			fshader: [
				'uniform sampler2D particleTexture;',
				'uniform float alphakill;',

				'varying vec4 color;',
				'varying vec2 coords;',

				'void main(void){',
				'#ifdef PARTICLE_TEXTURE',
				'    vec4 col = color * texture2D(particleTexture, coords);',
				'#else',
				'    vec4 col = color;',
				'#endif',
				'    if (col.a < alphakill) discard;',
				'    gl_FragColor = col;',
				'}'
			].join('\n')
		});
		this.material.cullState.enabled = false;
		this.material.uniforms.textureTileInfo = [1, 1, 1, 0];

		/**
		 * @type {number}
		 */
		this.time = 0;

		this._paused = false;

		/**
		 * @type {Vector3}
		 */
		this.gravity = options.gravity ? options.gravity.clone() : new Vector3();

		/**
		 * Sorted particles.
		 * @hidden
		 */
		this.particles = [];
		
		/**
		 * Same as particles but unsorted.
		 * @hidden
		 */
		this.unsortedParticles = [];

		/**
		 * @type {number}
		 */
		this.seed = options.seed !== undefined ? options.seed : Math.floor(Math.random() * 32768);

		this.startColor = options.startColor !== undefined ? options.startColor.clone() : null;
		this.colorCurve = options.colorCurve !== undefined ? options.colorCurve.clone() : null;

		this.duration = options.duration !== undefined ? options.duration : 5;

		this.shapeType = options.shapeType !== undefined ? options.shapeType : 'sphere';
		this.sphereRadius = options.sphereRadius !== undefined ? options.sphereRadius : 1;
		this.randomDirection = options.randomDirection !== undefined ? options.randomDirection : false;
		this.sphereEmitFromShell = options.sphereEmitFromShell !== undefined ? options.sphereEmitFromShell : false;
		this.coneEmitFrom = options.coneEmitFrom !== undefined ? options.coneEmitFrom : 'base'; // base, volume, volumeshell
		this.boxExtents = options.boxExtents !== undefined ? options.boxExtents.clone() : new Vector3(1, 1, 1);
		this.coneRadius = options.coneRadius !== undefined ? options.coneRadius : 1;
		this.coneAngle = options.coneAngle !== undefined ? options.coneAngle : 10;
		this.coneLength = options.coneLength !== undefined ? options.coneLength : 1;
		this.localSpace = options.localSpace !== undefined ? options.localSpace : true;
		this.startSpeed = options.startSpeed !== undefined ? options.startSpeed.clone() : new ConstantCurve({ value: 5 });
		this._maxParticles = options.maxParticles !== undefined ? options.maxParticles : 100;
		this.emissionRate = options.emissionRate !== undefined ? options.emissionRate.clone() : new ConstantCurve({ value: 10 });
		this.startLifeTime = options.startLifeTime !== undefined ? options.startLifeTime.clone() : new ConstantCurve({ value: 5 });
		this.renderQueue = options.renderQueue !== undefined ? options.renderQueue : 3010;
		this.alphakill = options.alphakill !== undefined ? options.alphakill : 0;
		this.loop = options.loop !== undefined ? options.loop : true;

		/**
		 * Pre-warm the emission. Not available if looping is on.
		 * @type {boolean}
		 */
		this.preWarm = options.preWarm !== undefined ? options.preWarm : true;
		this.blending = options.blending !== undefined ? options.blending : 'NoBlending';
		this.depthWrite = options.depthWrite !== undefined ? options.depthWrite : true;
		this.depthTest = options.depthTest !== undefined ? options.depthTest : true;
		this.textureTilesX = options.textureTilesX !== undefined ? options.textureTilesX : 1;
		this.textureTilesY = options.textureTilesY !== undefined ? options.textureTilesY : 1;
		this.textureAnimationSpeed = options.textureAnimationSpeed !== undefined ? options.textureAnimationSpeed : 1;
		this.startSize = options.startSize !== undefined ? options.startSize.clone() : null;
		this.sortMode = options.sortMode !== undefined ? options.sortMode : ParticleComponent.SORT_NONE;
		this.mesh = options.mesh !== undefined ? options.mesh : new Quad(1, 1, 1, 1);
		this.billboard = options.billboard !== undefined ? options.billboard : true;
		this.sizeCurve = options.sizeCurve !== undefined ? options.sizeCurve.clone() : null;
		
		// Should be a curve
		this.startAngle = options.startAngle !== undefined ? options.startAngle : 0;
		
		this.rotationSpeed = options.rotationSpeed !== undefined ? options.rotationSpeed.clone() : null;

		if (options.texture) {
			this.texture = options.texture;
		}

		this.nextEmitParticle = 0;
	}
	ParticleComponent.prototype = Object.create(Component.prototype);
	ParticleComponent.prototype.constructor = ParticleComponent;

	ParticleComponent.type = 'ParticleComponent';

	/**
	 * Don't sort particles.
	 * @type {number}
	 */
	ParticleComponent.SORT_NONE = 1;

	/**
	 * Sort by camera distance.
	 * @type {number}
	 */
	ParticleComponent.SORT_CAMERA_DISTANCE = 2;

	Object.defineProperties(ParticleComponent.prototype, {

		/**
		 * @target-class ParticleComponent textureAnimationSpeed member
		 * @type {number}
		 */
		textureAnimationSpeed: {
			get: function () {
				return this.material.uniforms.textureTileInfo[2];
			},
			set: function (value) {
				this.material.uniforms.textureTileInfo[2] = value;
			}
		},

		/**
		 * @target-class ParticleComponent paused member
		 * @type {boolean}
		 */
		paused: {
			get: function () {
				return this._paused;
			},
			set: function (value) {
				this._paused = value;
			}
		},

		/**
		 * @target-class ParticleComponent duration member
		 * @type {number}
		 */
		duration: {
			get: function () {
				return this.material.uniforms.duration;
			},
			set: function (value) {
				this.material.uniforms.duration = value;
			}
		},

		/**
		 * @target-class ParticleComponent billboard member
		 * @type {boolean}
		 */
		billboard: {
			get: function () {
				return this.material.shader.hasDefine('BILLBOARD');
			},
			set: function (value) {
				var shader = this.material.shader;
				if (value) {
					shader.setDefine('BILLBOARD', true);
				} else {
					shader.removeDefine('BILLBOARD');
				}
			}
		},

		/**
		 * @target-class ParticleComponent sizeCurve member
		 * @type {Curve|null}
		 */
		sizeCurve: {
			get: function () {
				return this._sizeCurve;
			},
			set: function (value) {
				this._sizeCurve = value;
				this.material.shader.setDefine('SIZE_CURVE_CODE', value ? value.toGLSL('t','emitRandom') : defines.SIZE_CURVE_CODE);
			}
		},

		/**
		 * @target-class ParticleComponent rotationSpeed member
		 * @type {Curve}
		 */
		rotationSpeed: {
			get: function () {
				return this._rotationSpeed;
			},
			set: function (value) {
				this._rotationSpeed = value;
				this.material.shader.setDefine('ROTATION_CURVE_CODE', value ? value.integralToGLSL('t','emitRandom') : defines.ROTATION_CURVE_CODE);
			}
		},

		/**
		 * @target-class ParticleComponent colorCurve member
		 * @type {Vector4Curve}
		 */
		colorCurve: {
			get: function () {
				return this._colorCurve;
			},
			set: function (value) {
				this._colorCurve = value;
				this.material.shader.setDefine('COLOR_CURVE_CODE', value ? value.toGLSL('t','emitRandom') : defines.COLOR_CURVE_CODE);
			}
		},

		/**
		 * @target-class ParticleComponent startColor member
		 * @type {Vector4Curve}
		 */
		startColor: {
			get: function () {
				return this._startColor;
			},
			set: function (value) {
				this._startColor = value;
				this.material.shader.setDefine('START_COLOR_CODE', value ? value.toGLSL('t','emitRandom') : defines.START_COLOR_CODE);
			}
		},

		/**
		 * @target-class ParticleComponent loop member
		 * @type {boolean}
		 */
		loop: {
			get: function () {
				return this.material.shader.hasDefine('LOOP');
			},
			set: function (value) {
				var shader = this.material.shader;
				if (value) {
					shader.setDefine('LOOP', true);
				} else {
					shader.removeDefine('LOOP');
				}
			}
		},

		/**
		 * @target-class ParticleComponent blending member
		 * @type {string}
		 */
		blending: {
			get: function () {
				return this.material.blendState.blending;
			},
			set: function (value) {
				this.material.blendState.blending = value;
			}
		},

		/**
		 * @target-class ParticleComponent localSpace member
		 * @type {boolean}
		 */
		localSpace: {
			get: function () {
				if (!this.meshEntity) {
					// Didn't initialize yet
					return this._localSpace;
				}
				return hasParent(this.meshEntity);
			},
			set: function (value) {
				if (!this.meshEntity) {
					// Didn't initialize yet
					this._localSpace = value;
					return;
				}
				var entity = this.meshEntity;
				var hasParent = this.localSpace;
				if (!value && hasParent) {
					entity.transformComponent.parent.detachChild(entity.transformComponent);
				} else if (value && !hasParent) {
					entity.transformComponent.parent.attachChild(this.meshEntity.transformComponent);
				}
			}
		},

		/**
		 * @target-class ParticleComponent depthTest member
		 * @type {boolean}
		 */
		depthTest: {
			get: function () {
				return this.material.depthState.enabled;
			},
			set: function (value) {
				this.material.depthState.enabled = value;
			}
		},

		/**
		 * @target-class ParticleComponent alphakill member
		 * @type {number}
		 */
		alphakill: {
			get: function () {
				return this.material.uniforms.alphakill;
			},
			set: function (value) {
				this.material.uniforms.alphakill = value;
			}
		},

		/**
		 * @target-class ParticleComponent texture member
		 * @type {Texture|null}
		 */
		texture: {
			get: function () {
				return this.material.getTexture('PARTICLE_TEXTURE');
			},
			set: function (value) {
				var material = this.material;
				var shader = material.shader;
				if (value) {
					material.setTexture('PARTICLE_TEXTURE', value);
					shader.setDefine('PARTICLE_TEXTURE', true);
				} else {
					material.removeTexture('PARTICLE_TEXTURE');
					shader.removeDefine('PARTICLE_TEXTURE');
				}
			}
		},

		/**
		 * @target-class ParticleComponent textureTilesX member
		 * @type {number}
		 */
		textureTilesX: {
			get: function () {
				return this.material.uniforms.textureTileInfo[0];
			},
			set: function (value) {
				this.material.uniforms.textureTileInfo[0] = value;
			}
		},

		/**
		 * @target-class ParticleComponent textureTilesY member
		 * @type {number}
		 */
		textureTilesY: {
			get: function () {
				return this.material.uniforms.textureTileInfo[1];
			},
			set: function (value) {
				this.material.uniforms.textureTileInfo[1] = value;
			}
		},

		/**
		 * @target-class ParticleComponent depthWrite member
		 * @type {boolean}
		 */
		depthWrite: {
			get: function () {
				return this.material.depthState.write;
			},
			set: function (value) {
				this.material.depthState.write = value;
			}
		},

		/**
		 * @target-class ParticleComponent renderQueue member
		 * @type {number}
		 */
		renderQueue: {
			get: function () {
				return this.material.renderQueue;
			},
			set: function (value) {
				this.material.renderQueue = value;
			}
		},

		/**
		 * @target-class ParticleComponent startSpeed member
		 * @type {Curve}
		 */
		startSpeed: {
			get: function () {
				return this._startSpeed;
			},
			set: function (value) {
				this._startSpeed = value;
			}
		},

		/**
		 * @target-class ParticleComponent startLifeTime member
		 * @type {Curve}
		 */
		startLifeTime: {
			get: function () {
				return this._startLifeTime;
			},
			set: function (value) {
				this._startLifeTime = value;
				this.material.shader.setDefine('START_LIFETIME_CODE', value ? value.toGLSL('t','emitRandom') : defines.START_LIFETIME_CODE);
			}
		},

		/**
		 * @target-class ParticleComponent startSize member
		 * @type {Curve}
		 */
		startSize: {
			get: function () {
				return this._startSize;
			},
			set: function (value) {
				this._startSize = value;
				this.material.shader.setDefine('START_SIZE_CODE', value ? value.toGLSL('t','emitRandom') : defines.START_SIZE_CODE);
			}
		},

		/**
		 * @target-class ParticleComponent maxParticles member
		 * @type {number}
		 */
		maxParticles: {
			get: function () {
				return this.meshData ? this.meshData.vertexCount / this.mesh.vertexCount : this._maxParticles;
			},
			set: function (value) {
				if (value * this.mesh.vertexCount !== this.meshData.vertexCount) {
					this.meshData.vertexCount = value * this.mesh.vertexCount;
					this.meshData.indexCount = value * this.mesh.indexCount;
					this.meshData.rebuildData();
					this._updateParticles();
					this._updateVertexData();
				}
			}
		}
	});

	/**
	 * @private
	 */
	ParticleComponent.prototype._random = function () {
		var a = 214013, c = 2531011, m = 32768;
		this.seed = (this.seed * a + c) % m;
		return this.seed / m;
	};

	var invRot = new Matrix3();

	/**
	 * @private
	 */
	ParticleComponent.prototype._updateUniforms = function () {
		var uniforms = this.material.uniforms;

		// Gravity in local space
		tmpGravity.copy(this.gravity);
		invRot.copy(this.meshEntity.transformComponent.worldTransform.rotation).invert();
		tmpGravity.applyPost(invRot);
		uniforms.gravity = uniforms.gravity || [];
		uniforms.gravity[0] = tmpGravity.x;
		uniforms.gravity[1] = tmpGravity.y;
		uniforms.gravity[2] = tmpGravity.z;

		uniforms.time = this.time;
	};

	/**
	 * @private
	 */
	ParticleComponent.prototype._updateParticles = function () {
		var particles = this.particles;
		var unsortedParticles = this.unsortedParticles;
		var maxParticles = this.maxParticles;
		while (particles.length < maxParticles) {
			var particle = new Particle(this);
			particle.index = particles.length;
			particles.push(particle);
			unsortedParticles.push(particle);
		}
		while (particles.length > maxParticles) {
			var particle = particles.pop();
			unsortedParticles.splice(unsortedParticles.indexOf(particle), 1);
		}
	};

	/**
	 * @private
	 */
	ParticleComponent.prototype._updateVertexData = function () {
		var meshData = this.meshData;
		var maxParticles = this.maxParticles;
		var particles = this.particles;
		var duration = this.duration;
		var i, j;

		var offset = meshData.getAttributeBuffer(MeshData.TEXCOORD0);
		var pos = meshData.getAttributeBuffer(MeshData.POSITION);
		var indices = meshData.getIndexBuffer();

		var mesh = this.mesh;
		var meshIndices = mesh.getIndexBuffer();
		var meshPos = mesh.getAttributeBuffer(MeshData.POSITION);
		var meshUV = mesh.getAttributeBuffer(MeshData.TEXCOORD0);
		var meshVertexCount = mesh.vertexCount;
		for (i = 0; i < maxParticles; i++) {
			for (var j = 0; j < meshUV.length; j++) {
				offset[i * meshUV.length + j] = meshUV[j];
			}
			for (var j = 0; j < meshPos.length; j++) {
				pos[i * meshPos.length + j] = meshPos[j];
			}
			for (var j = 0; j < meshIndices.length; j++) {
				indices[i * meshIndices.length + j] = meshIndices[j] + i * meshVertexCount;
			}
		}

		meshData.setAttributeDataUpdated(MeshData.TEXCOORD0);
		meshData.setAttributeDataUpdated(MeshData.POSITION);

		if (!this.localSpace) {
			this.loop = false;
		}

		// Time info
		var timeInfo = meshData.getAttributeBuffer('TIME_INFO');
		var emissionRate = this.emissionRate;
		if(this.localSpace){
			var steps = Math.ceil(duration * 60); // Should not need to emit more precise than 60Hz
			var sum = 0;
			var lastIntegral = 0;
			var particleIndex = 0;
			var fullIntegral = emissionRate.getIntegralValueAt(1);
			for(var i=0; sum < maxParticles; i++){
				var currentIntegral = (Math.floor(i / steps) * fullIntegral + emissionRate.getIntegralValueAt((i / steps) % 1)) * duration;
				var numToEmit = Math.floor(currentIntegral - sum);
				lastIntegral = currentIntegral;
				sum += numToEmit;
				while(particleIndex < sum && particleIndex < maxParticles){
					particles[particleIndex++].emitTime = i / steps * duration;
				}
				if(particleIndex >= maxParticles){
					break;
				}
			}
			while(particleIndex < maxParticles){
				particles[particleIndex++].emitTime = 2 * duration;
			}
		}
		for (i = 0; i < maxParticles; i++) {
			var particle = particles[i];
			particle.active = 1;

			if (this.localSpace) {

				if(this.preWarm && !this.loop){
					// Already emitted, shift emit time back
					particle.emitTime -= duration;
				}

				if (this.loop) {
					particle.active = particle.emitTime < duration ? 1 : 0;
				}

			} else {
				// Set all particles to be active but already dead - ready to be re-emitted at any point
				particle.emitTime = -2 * particle.lifeTime;
			}

			for (j = 0; j < meshVertexCount; j++) {
				timeInfo[meshVertexCount * 4 * i + j * 4 + 0] = particle.lifeTime;
				timeInfo[meshVertexCount * 4 * i + j * 4 + 1] = particle.active;
				timeInfo[meshVertexCount * 4 * i + j * 4 + 2] = particle.lifeTime;
				timeInfo[meshVertexCount * 4 * i + j * 4 + 3] = particle.emitTime;
			}
		}
		meshData.setAttributeDataUpdated('TIME_INFO');

		// Start position
		var startPos = meshData.getAttributeBuffer('START_POS');
		var startDir = meshData.getAttributeBuffer('START_DIR');

		for (i = 0; i < maxParticles; i++) {
			var particle = particles[i];
			var pos = particle.startPosition;
			var dir = particle.startDirection;

			var t = (particle.emitTime / duration) % 1;
			this._generateLocalPositionAndDirection(pos, dir, t);
			particle.startAngle = this._generateStartAngle(t);

			for (j = 0; j < meshVertexCount; j++) {
				startPos[meshVertexCount * 4 * i + j * 4 + 0] = pos.x;
				startPos[meshVertexCount * 4 * i + j * 4 + 1] = pos.y;
				startPos[meshVertexCount * 4 * i + j * 4 + 2] = pos.z;
				startPos[meshVertexCount * 4 * i + j * 4 + 3] = particle.startAngle;

				startDir[meshVertexCount * 4 * i + j * 4 + 0] = dir.x;
				startDir[meshVertexCount * 4 * i + j * 4 + 1] = dir.y;
				startDir[meshVertexCount * 4 * i + j * 4 + 2] = dir.z;
				startDir[meshVertexCount * 4 * i + j * 4 + 3] = particle.startSize;
			}
		}
		meshData.setAttributeDataUpdated('START_POS');
		meshData.setAttributeDataUpdated('START_DIR');
	};

	// TODO make curve
	ParticleComponent.prototype._generateStartAngle = function (time) {
		return this.startAngle;
	};

	/**
	 * @private
	 */
	ParticleComponent.prototype._generateLocalPositionAndDirection = function (position, direction, time) {
		var shapeType = this.shapeType;
		var cos = Math.cos;
		var sin = Math.sin;
		var pi = Math.PI;

		if (shapeType === 'sphere') {
			var theta = Math.acos(2 * this._random() - 1);
			var phi = 2 * pi * this._random();
			var r = this.sphereRadius;
			if(!this.sphereEmitFromShell){
				r *= Math.cbrt(this._random());
			}
			position.setDirect(
				r * cos(phi) * sin(theta),
				r * cos(theta),
				r * sin(phi) * sin(theta)
			);
			direction.setDirect(
				cos(phi) * sin(theta),
				cos(theta),
				sin(phi) * sin(theta)
			);
		} else if (shapeType === 'cone') {

			// TODO: Implement cone base

			var phi = 2 * pi * this._random();
			var yrand = this._random();
			var coneLength = this.coneLength;
			var y = yrand * coneLength;
			var rad = this.coneRadius * Math.sqrt(this._random()) * yrand;
			switch(this.coneEmitFrom){
			case 'base':
				position.setDirect(0, 0, 0);
				direction.setDirect(
					rad * cos(phi),
					coneLength,
					rad * sin(phi)
				);
				break;
			case 'volume':
				position.setDirect(
					rad * cos(phi),
					y,
					rad * sin(phi)
				);
				direction.copy(position);
				break;
			case 'volumeshell':
				rad = this.coneRadius * yrand;
				position.setDirect(
					rad * cos(phi),
					y,
					rad * sin(phi)
				);
				direction.copy(position);
				break;
			}
		} else {
			// box
			position.setDirect(
				this._random() - 0.5,
				this._random() - 0.5,
				this._random() - 0.5
			).mul(this.boxExtents);
			direction.setDirect(0, 1, 0);
		}
		if(this.randomDirection){
			var theta = Math.acos(2 * this._random() - 1);
			var phi = 2 * pi * this._random();
			direction.setDirect(
				cos(phi) * sin(theta),
				cos(theta),
				sin(phi) * sin(theta)
			);
		}
		direction.normalize().scale(this.startSpeed.getValueAt(time, this._random()));
	};

	/**
	 * Emit a particle.
	 * @param {Vector3} position
	 * @param {Vector3} direction
	 */
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
		particle.active = 1;
		particle.startAngle = this._generateStartAngle();

		var meshVertexCount = this.mesh.vertexCount;

		for (var j = 0; j < meshVertexCount; j++) {
			timeInfo[meshVertexCount * 4 * i + j * 4 + 3] = particle.emitTime;

			startPos[meshVertexCount * 4 * i + j * 4 + 0] = particle.startPosition.x;
			startPos[meshVertexCount * 4 * i + j * 4 + 1] = particle.startPosition.y;
			startPos[meshVertexCount * 4 * i + j * 4 + 2] = particle.startPosition.z;
			startPos[meshVertexCount * 4 * i + j * 4 + 3] = particle.startAngle;

			startDir[meshVertexCount * 4 * i + j * 4 + 0] = particle.startDirection.x;
			startDir[meshVertexCount * 4 * i + j * 4 + 1] = particle.startDirection.y;
			startDir[meshVertexCount * 4 * i + j * 4 + 2] = particle.startDirection.z;
			startDir[meshVertexCount * 4 * i + j * 4 + 3] = particle.startSize;
		}

		meshData.setAttributeDataUpdated('START_POS');
		meshData.setAttributeDataUpdated('START_DIR');
		meshData.setAttributeDataUpdated('TIME_INFO');
	};

	/**
	 * @private
	 */
	ParticleComponent.prototype._updateBounds = function () {
		if(this.localSpace){
			return;
		}
		var bounds = this.meshEntity.meshRendererComponent.worldBound;
		bounds.center.copy(this._entity.transformComponent.worldTransform.translation);
		bounds.xExtent = bounds.yExtent = bounds.zExtent = 0;
	};
	
	var tmpWorldPos = new Vector3();

	/**
	 * @private
	 */
	ParticleComponent.prototype._sortParticles = function () {
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

		// Update index buffer
		var meshData = this.meshData;
		var mesh = this.mesh;
		var meshIndices = mesh.getIndexBuffer();
		var indices = meshData.getIndexBuffer();
		meshData.getIndexData().setDataNeedsRefresh();
		var meshVertexCount = mesh.vertexCount;
		for (var i = 0; i < particles.length; i++) {
			for (var j = 0; j < meshIndices.length; j++) {
				indices[i * meshIndices.length + j] = meshIndices[j] + particles[i].index * meshVertexCount;
			}
		}
	};

	var tmpPos = new Vector3();
	var tmpDir = new Vector3();
	ParticleComponent.prototype.process = function (tpf) {
		if(this.paused) return;

		this.lastTime = this.time;
		this.time += tpf;
		// if (this.loop && this.time > this.duration) { // TODO: should this be done in shader only?
		// 	this.time %= this.duration;
		// }
		this._updateUniforms();
		this._sortParticles();
		this._updateBounds();

		// Emit according to emit rate
		if (!this.localSpace) {
			var emissionRate = this.emissionRate;
			var numToEmit = Math.floor(this.time * emissionRate.getValueAt(this.time, this._random())) - Math.floor(this.lastTime * emissionRate.getValueAt(this.time, this._random()));
			for (var i = 0; i < numToEmit; i++) {
				// get pos and direction from the shape
				this._generateLocalPositionAndDirection(tmpPos, tmpDir, this.time);

				// Transform to world space
				var worldTransform = this._entity.transformComponent.worldTransform;
				tmpPos.applyPostPoint(worldTransform.matrix);
				tmpDir.applyPost(worldTransform.rotation);

				// Emit
				this.emitOne(tmpPos, tmpDir);
			}
		}
	};

	/**
	 * @private
	 * @param entity
	 */
	ParticleComponent.prototype.attached = function (entity) {
		this._entity = entity;
		this._system = entity._world.getSystem('PhysicsSystem');

		var maxParticles = this.maxParticles;
		for (var i = 0; i < maxParticles; i++) {
			var particle = new Particle(this);
			particle.index = i;
			this.particles.push(particle);
			this.unsortedParticles.push(particle);
		}

		var attributeMap = MeshData.defaultMap([
			MeshData.POSITION,
			MeshData.TEXCOORD0
		]);
		attributeMap.TIME_INFO = MeshData.createAttribute(4, 'Float');
		attributeMap.START_POS = MeshData.createAttribute(4, 'Float');
		attributeMap.START_DIR = MeshData.createAttribute(4, 'Float');
		var meshData = new MeshData(attributeMap, maxParticles * this.mesh.vertexCount, maxParticles * this.mesh.indexCount);
		meshData.vertexData.setDataUsage('DynamicDraw');
		this.meshData = meshData;
		var meshEntity = this.meshEntity = this._entity._world.createEntity(meshData);
		meshEntity.set(new MeshRendererComponent(this.material));
		meshEntity.name = 'ParticleSystem';
		meshEntity.meshRendererComponent.cullMode = 'Never'; // TODO: cull with approx bounding sphere
		meshEntity.addToWorld();
		if (this._localSpace) {
			this._entity.transformComponent.attachChild(meshEntity.transformComponent, false);
		}
		this._updateVertexData();
	};

	/**
	 * @private
	 * @param entity
	 */
	ParticleComponent.prototype.detached = function (/*entity*/) {
		this.meshEntity.clearComponent('MeshDataComponent');
		this.unsortedParticles.length = this.particles.length = 0;
		if (hasParent(this.meshEntity)) {
			this._entity.detachChild(this.meshEntity);
		}
		this.meshEntity.removeFromWorld();
		this._entity = this._system = this.meshEntity = null;
	};

	/**
	 * @returns ParticleComponent
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
			sphereRadius: this.sphereRadius,
			coneRadius: this.coneRadius,
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