define([
	'goo/math/Matrix3',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/Component',
	'goo/renderer/Shader',
	'goo/math/Transform',
	'goo/addons/particlepack/ParticleData',
	'goo/renderer/Renderer',
	'goo/shapes/Quad',
	'goo/addons/particlepack/curves/ConstantCurve',
	'goo/util/ObjectUtils'
], function (
	Matrix3,
	Vector3,
	Vector4,
	MeshData,
	Material,
	MeshRendererComponent,
	Component,
	Shader,
	Transform,
	ParticleData,
	Renderer,
	Quad,
	ConstantCurve,
	ObjectUtils
) {
	'use strict';

	function mod(a,b) {
	    return ((a % b) + b) % b;
	};

	function hasParent(entity) {
		return !!(entity.transformComponent.parent && entity.transformComponent.parent.entity.name !== 'root');
	}

	var defines = {
		START_LIFETIME_CODE: '5.0',
		START_SIZE_CODE: '1.0',
		START_ROTATION_CURVE_CODE: '0.0',
		START_COLOR_CODE: 'vec4(1.0)',
		SIZE_CURVE_CODE: '1.0',
		ROTATION_CURVE_CODE: '0.0',
		COLOR_CURVE_CODE: 'vec4(1.0)',
		VELOCITY_CURVE_CODE: 'vec3(0.0)',
		WORLD_VELOCITY_CURVE_CODE: 'vec3(0.0)',
		TEXTURE_FRAME_CODE: 't'
	}

	/**
	 * A Particle System component simulates things like clouds and flames by generating and animating large numbers of small 2D images in the scene.
	 * @class
	 * @constructor
 	 * @param {boolean} [billboard=true]
 	 * @param {boolean} [depthTest=true]
 	 * @param {boolean} [depthWrite=true]
 	 * @param {boolean} [loop=true]
 	 * @param {boolean} [paused=false]
 	 * @param {boolean} [preWarm=false]
 	 * @param {boolean} [randomDirection=false]
 	 * @param {boolean} [sphereEmitFromShell=false]
 	 * @param {Curve} [colorOverLifetime]
 	 * @param {Curve} [localVelocityOverLifetime]
 	 * @param {Curve} [rotationSpeedOverLifetime]
 	 * @param {Curve} [sizeOverLifetime]
 	 * @param {Curve} [startAngle]
 	 * @param {Curve} [startColor]
 	 * @param {Curve} [startLifetime]
 	 * @param {Curve} [startSize]
 	 * @param {Curve} [startSpeed]
 	 * @param {Curve} [textureFrameOverLifetime]
 	 * @param {Curve} [worldVelocityOverLifetime]
 	 * @param {number} [blending='NoBlending']
 	 * @param {number} [coneAngle] Default is pi/8
 	 * @param {number} [coneLength=1]
 	 * @param {number} [coneRadius=1]
 	 * @param {number} [discardThreshold=0]
 	 * @param {number} [duration=5]
 	 * @param {number} [localSpace=true]
 	 * @param {number} [maxParticles=100]
 	 * @param {number} [renderQueue=3010]
 	 * @param {number} [rotationSpeedScale=1]
 	 * @param {number} [seed=-1]
 	 * @param {number} [startAngleScale=1]
 	 * @param {number} [startSizeScale=1]
 	 * @param {number} [texture]
 	 * @param {number} [textureAnimationCycles=1]
 	 * @param {number} [textureTilesX=1]
 	 * @param {number} [textureTilesY=1]
 	 * @param {number} [time=0]
 	 * @param {string} [coneEmitFrom='base']
 	 * @param {string} [shapeType='cone']
 	 * @param {Vector3} [boxExtents] Default is new Vector3(1,1,1)
 	 * @param {Vector3} [gravity]  Default is zero
 	 * @param {Vector4} [startColorScale] Default is new Vector4(1,1,1,1)
	 * @example
	 * var particleComponent = new ParticleSystemComponent({
	 *     loop: true,
	 *     preWarm: true,
	 *     shapeType: 'sphere',
	 *     sphereRadius: 0.5
	 * });
	 * var entity = world.createEntity([0, 0, 0], particleComponent).addToWorld();
	 */
	function ParticleSystemComponent(options) {
		options = options || {};
		Component.apply(this, arguments);
		this.type = 'ParticleSystemComponent';

		this.material = new Material({
			defines: ObjectUtils.clone(defines),
			attributes: {
				vertexPosition: MeshData.POSITION,
				timeInfo: 'TIME_INFO',
				startPos: 'START_POS',
				startDir: 'START_DIR',
				vertexUV0: MeshData.TEXCOORD0
			},
			uniforms: {
				viewMatrix: Shader.VIEW_MATRIX,
				projectionMatrix: Shader.PROJECTION_MATRIX,
				viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
				worldMatrix: Shader.WORLD_MATRIX,
				cameraPosition: Shader.CAMERA,

				textureTileInfo: [1, 1, 1, 0],
				invWorldRotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
				worldRotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
				particleTexture: 'PARTICLE_TEXTURE',
				time: 0,
				duration: 5,
				gravity: [0, 0, 0],
				discardThreshold: 0,

				// Uniforms for scaling the curves
				uColor: [1, 1, 1, 1],
				uStartSize: 1,
				uStartAngle: 1,
				uRotationSpeed: 1
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
				'uniform mat3 invWorldRotation;',
				'uniform mat3 worldRotation;',
				'uniform vec3 cameraPosition;',
				'uniform float time;',
				'uniform float duration;',
				'uniform vec3 gravity;',

				'uniform vec4 uColor;',
				'uniform float uStartSize;',
				'uniform float uStartAngle;',
				'uniform float uRotationSpeed;',

				'varying vec4 color;',
				'varying vec2 coords;',

				'vec3 getVelocityCurveIntegral(float t, float emitRandom){',
				'    return VELOCITY_CURVE_CODE;',
				'}',

				'vec3 getWorldVelocityCurveIntegral(float t, float emitRandom){',
				'    return WORLD_VELOCITY_CURVE_CODE;',
				'}',

				'vec3 getPosition(mat3 invWorldRotation, mat3 worldRotation, float t, vec3 pos, vec3 vel, vec3 g, float emitRandom, float duration){',
				'    return pos + vel * t + 0.5 * t * t * g + worldRotation * getVelocityCurveIntegral(t / duration, emitRandom) + invWorldRotation * getWorldVelocityCurveIntegral(t / duration, emitRandom);',
				'}',

				'float getScale(float t, float emitRandom){',
				'    return SIZE_CURVE_CODE;',
				'}',

				'float getStartSize(float t, float emitRandom){',
				'    return START_SIZE_CODE;',
				'}',

				'float getTextureFrame(float t, float emitRandom){',
				'    return TEXTURE_FRAME_CODE;',
				'}',

				'float getAngle(float t, float emitRandom){',
				'    return ROTATION_CURVE_CODE;',
				'}',

				'vec4 getColor(float t, float emitRandom){',
				'    return COLOR_CURVE_CODE;',
				'}',

				'vec4 getStartColor(float t, float emitRandom){',
				'    return START_COLOR_CODE;',
				'}',

				'float getStartAngle(float t, float emitRandom){',
				'    return START_ROTATION_CURVE_CODE;',
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
				'    float age = time - emitTime;',
				'    float ageNoMod = age;',
				'    float loopAfter = startDir.w;',

				'    #ifdef LOOP',
				'    age = mod(age, loopAfter);',
				'    emitTime = mod(emitTime, loopAfter);',
				'    #endif',

				'    float unitEmitTime = emitTime / duration;',
				'    float emitRandom = timeInfo.z;',
				'    float startSize = uStartSize * getStartSize(unitEmitTime, emitRandom);',
				'    float lifeTime = timeInfo.x;',
				'    float startAngle = uStartAngle * getStartAngle(unitEmitTime, emitRandom);',

				'    float unitAge = age / lifeTime;',
				'    color = uColor * getStartColor(unitAge, emitRandom) * getColor(unitAge, emitRandom);',

				'    float textureAnimationCycles = textureTileInfo.z;',
				'    float tileX = floor(mod(textureTileInfo.x * textureTileInfo.y * getTextureFrame(unitAge, emitRandom) * textureAnimationCycles, textureTileInfo.x));',
				'    float tileY = floor(mod(-textureTileInfo.y * getTextureFrame(unitAge, emitRandom) * textureAnimationCycles, textureTileInfo.y));',
				'    vec2 texOffset = vec2(tileX, tileY) / textureTileInfo.xy;',
				'    coords = (vertexUV0 / textureTileInfo.xy + texOffset);',

				'    float rotation = uRotationSpeed * getAngle(unitAge, emitRandom) + startAngle;',
				'    float c = cos(rotation);',
				'    float s = sin(rotation);',
				'    mat3 spinMatrix = mat3(c, s, 0, -s, c, 0, 0, 0, 1);',

				// hide if age > lifeTime
				'    active *= step(-lifeTime, -age);',

				// hide if age < 0
				'    #ifdef HIDE_IF_EMITTED_BEFORE_ZERO',
				'    active *= step(0.0, ageNoMod) * step(0.0, age);',
				'    #endif',

				'    vec3 position = getPosition(invWorldRotation, worldRotation, age, startPos.xyz, startDir.xyz, gravity, emitRandom, duration);',
				'    #ifdef BILLBOARD',
				'    vec2 offset = ((spinMatrix * vertexPosition)).xy * startSize * getScale(unitAge, emitRandom) * active;',
				'    mat4 matPos = worldMatrix * mat4(vec4(0),vec4(0),vec4(0),vec4(position,0));',
				'    gl_Position = viewProjectionMatrix * (worldMatrix + matPos) * vec4(0, 0, 0, 1) + projectionMatrix * vec4(offset.xy, 0, 0);',
				'    #else',
				'    mat4 rot = rotationMatrix(normalize(vec3(sin(emitTime*5.0),cos(emitTime*1234.0),sin(emitTime))),rotation);',
				'    gl_Position = viewProjectionMatrix * worldMatrix * (rot * vec4(startSize * getScale(unitAge, emitRandom) * active * vertexPosition, 1.0) + vec4(position,0.0));',
				'    #endif',
				'}'
			].join('\n'),
			fshader: [
				'uniform sampler2D particleTexture;',
				'uniform float discardThreshold;',

				'varying vec4 color;',
				'varying vec2 coords;',

				'void main(void){',
				'#ifdef PARTICLE_TEXTURE',
				'    vec4 col = color * texture2D(particleTexture, coords);',
				'#else',
				'    vec4 col = color;',
				'#endif',
				'    if (col.a < discardThreshold) discard;',
				'    gl_FragColor = col;',
				'}'
			].join('\n')
		});
		this.material.cullState.enabled = false;
		this.material.uniforms.textureTileInfo = [1, 1, 1, 0];

		ObjectUtils.extend(this.material.uniforms, {
			textureTileInfo: [1, 1, 1, 0],
			invWorldRotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
			worldRotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
			gravity: [0, 0, 0],
			uColor: [1, 1, 1, 1]
		});

		this._nextEmitParticleIndex = 0;
		this._localGravity = new Vector3();
		this._lastTime = this.time;
		this._worldToLocalRotation = new Matrix3();
		this._localToWorldRotation = new Matrix3();

		/**
		 * Read only. The entity which the component is attached on. Will be set when the component is attached to the entity.
		 * @type {Entity|null}
		 */
		this.entity = null;

		/**
		 * Read only. Use the pause/play/stop methods if you want to modify the state.
		 * @type {boolean}
		 * @default false
		 */
		this.paused = options.paused !== undefined ? options.paused : false;

		/**
		 * The current particles in the system.
		 * @type {Array<ParticleData>}
		 */
		this.particles = [];

		/**
		 * The particles in the system, sorted according to the sortMode.
		 * @type {Array<ParticleData>}
		 */
		this.particlesSorted = [];

		/**
		 * Current time in the system. Read only.
		 * @type {number}
		 */
		this.time = options.time || 0;
		
		/**
		 * Force that makes particles fall.
		 * @type {Vector3}
		 */
		this.gravity = options.gravity ? options.gravity.clone() : new Vector3();

		/**
		 * Extents of the box, if box shape is used. Read only. To change it, see the method setBoxExtents().
		 * @type {Vector3}
		 */
		this.boxExtents = options.boxExtents ? options.boxExtents.clone() : new Vector3(1, 1, 1);
		
		/**
		 * Acts as a scale on the color curve. Should be used at runtime.
		 * @type {Vector4}
		 * @todo rename to color?
		 */
		this.startColorScale = options.startColorScale ? options.startColorScale.clone() : new Vector4(1,1,1,1);

		this.emissionRate = options.emissionRate ? options.emissionRate.clone() : new ConstantCurve({ value: 10 });
		this.preWarm = options.preWarm !== undefined ? options.preWarm : false;
		this._initSeed = this._seed = this.seed = (options.seed !== undefined && options.seed > 0 ? options.seed : Math.floor(Math.random() * 32768));
		this.shapeType = options.shapeType || 'cone';
		this.sphereRadius = options.sphereRadius !== undefined ? options.sphereRadius : 1;
		this.sphereEmitFromShell = options.sphereEmitFromShell || false;
		this.randomDirection = options.randomDirection || false;
		this.coneEmitFrom = options.coneEmitFrom || 'base'; // base, volume, volumeshell
		this.coneRadius = options.coneRadius !== undefined ? options.coneRadius : 1;
		this.coneAngle = options.coneAngle !== undefined ? options.coneAngle : Math.PI / 8;
		this.coneLength = options.coneLength !== undefined ? options.coneLength : 1;
		this.startColor = options.startColor ? options.startColor.clone() : null;
		this.colorOverLifetime = options.colorOverLifetime ? options.colorOverLifetime.clone() : null;
		this.duration = options.duration !== undefined ? options.duration : 5;
		this.localSpace = options.localSpace !== undefined ? options.localSpace : true;
		this.startSpeed = options.startSpeed ? options.startSpeed.clone() : new ConstantCurve({ value: 5 });
		this.localVelocityOverLifetime = options.localVelocityOverLifetime ? options.localVelocityOverLifetime.clone() : null;
		this.worldVelocityOverLifetime = options.worldVelocityOverLifetime ? options.worldVelocityOverLifetime.clone() : null;
		this._maxParticles = options.maxParticles !== undefined ? options.maxParticles : 100;
		this.startLifetime = options.startLifetime ? options.startLifetime.clone() : new ConstantCurve({ value: 5 });
		this.renderQueue = options.renderQueue !== undefined ? options.renderQueue : 3010;
		this.discardThreshold = options.discardThreshold || 0;
		this.loop = options.loop !== undefined ? options.loop : true;
		this.blending = options.blending || 'NoBlending';
		this.depthWrite = options.depthWrite !== undefined ? options.depthWrite : true;
		this.depthTest = options.depthTest !== undefined ? options.depthTest : true;
		this.textureTilesX = options.textureTilesX !== undefined ? options.textureTilesX : 1;
		this.textureTilesY = options.textureTilesY !== undefined ? options.textureTilesY : 1;
		this.textureAnimationCycles = options.textureAnimationCycles !== undefined ? options.textureAnimationCycles : 1;
		this.textureFrameOverLifetime = options.textureFrameOverLifetime ? options.textureFrameOverLifetime.clone() : null;
		this.startSize = options.startSize ? options.startSize.clone() : null;
		this.sortMode = options.sortMode !== undefined ? options.sortMode : ParticleSystemComponent.SORT_NONE;
		this.mesh = options.mesh ? options.mesh : new Quad();
		this.billboard = options.billboard !== undefined ? options.billboard : true;
		this.sizeOverLifetime = options.sizeOverLifetime ? options.sizeOverLifetime.clone() : null;
		this.startAngle = options.startAngle ? options.startAngle.clone() : null;
		this.rotationSpeedOverLifetime = options.rotationSpeedOverLifetime ? options.rotationSpeedOverLifetime.clone() : null;
		this.texture = options.texture ? options.texture : null;
		this.boundsRadius = options.boundsRadius !== undefined ? options.boundsRadius : Number.MAX_VALUE;
	}
	ParticleSystemComponent.prototype = Object.create(Component.prototype);
	ParticleSystemComponent.prototype.constructor = ParticleSystemComponent;

	ParticleSystemComponent.type = 'ParticleSystemComponent';

	/**
	 * No sorting of particles.
	 * @type {number}
	 */
	ParticleSystemComponent.SORT_NONE = 1;

	/**
	 * Sort particles by camera distance.
	 * @type {number}
	 */
	ParticleSystemComponent.SORT_CAMERA_DISTANCE = 2;

	Object.defineProperties(ParticleSystemComponent.prototype, {

		/**
		 * If set to true, the particles will always face the camera.
		 * @target-class ParticleSystemComponent billboard member
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
		 * What type of blending to use for the particle mesh.
		 * @target-class ParticleSystemComponent blending member
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
		 * Color of particles, as a curve over their life time.
		 * @target-class ParticleSystemComponent colorOverLifetime member
		 * @type {Vector4Curve|null}
		 */
		colorOverLifetime: {
			get: function () {
				return this._colorOverLifetime;
			},
			set: function (value) {
				this._colorOverLifetime = value;
				this.material.shader.setDefine('COLOR_CURVE_CODE', value ? value.toGLSL('t','emitRandom') : defines.COLOR_CURVE_CODE);
			}
		},
		
		/**
		 * Angle of the cone, if cone shape is used.
		 * @target-class ParticleSystemComponent coneAngle member
		 * @type {number}
		 */
		coneAngle: {
			get: function () {
				return this._coneAngle;
			},
			set: function (value) {
				this._coneAngle = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * Where to emit from, if using the cone shape. Set to 'base', 'volume' or 'volumeshell'.
		 * @target-class ParticleSystemComponent coneEmitFrom member
		 * @type {string}
		 */
		coneEmitFrom: {
			get: function () {
				return this._coneEmitFrom;
			},
			set: function (value) {
				this._coneEmitFrom = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * Length of the cone, if cone shape is used.
		 * @target-class ParticleSystemComponent coneLength member
		 * @type {number}
		 */
		coneLength: {
			get: function () {
				return this._coneLength;
			},
			set: function (value) {
				this._coneLength = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * Radius of the cone, if cone shape is used.
		 * @target-class ParticleSystemComponent coneRadius member
		 * @type {number}
		 */
		coneRadius: {
			get: function () {
				return this._coneRadius;
			},
			set: function (value) {
				this._coneRadius = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * @target-class ParticleSystemComponent depthTest member
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
		 * @target-class ParticleSystemComponent depthWrite member
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
		 * At what alpha threshold should the fragments be discarded?
		 * @target-class ParticleSystemComponent discardThreshold member
		 * @type {number}
		 */
		discardThreshold: {
			get: function () {
				return this.material.uniforms.discardThreshold;
			},
			set: function (value) {
				this.material.uniforms.discardThreshold = value;
			}
		},

		/**
		 * The time for a full animation cycle of the emission.
		 * @target-class ParticleSystemComponent duration member
		 * @type {number}
		 */
		duration: {
			get: function () {
				return this.material.uniforms.duration;
			},
			set: function (value) {
				this.material.uniforms.duration = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * @target-class ParticleSystemComponent emissionRate member
		 * @type {Curve}
		 */
		emissionRate: {
			get: function () {
				return this._emissionRate;
			},
			set: function (value) {
				this._emissionRate = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * If set to true, the partiles will be simulated in local entity space. If set to false, world space is used.
		 * @target-class ParticleSystemComponent localSpace member
		 * @type {boolean}
		 */
		localSpace: {
			get: function () {
				return this._localSpace;
			},
			set: function (value) {
				this._localSpace = value;
				if(this.meshEntity){
					var transformComponent = this.meshEntity.transformComponent;
					transformComponent.transform.setIdentity();
					transformComponent.setUpdated();
				}
			}
		},

		/**
		 * The velocity of particles in local particle space.
		 * @target-class ParticleSystemComponent localVelocityOverLifetime member
		 * @type {Vector3Curve|null}
		 */
		localVelocityOverLifetime: {
			get: function () {
				return this._localVelocityOverLifetime;
			},
			set: function (value) {
				this._localVelocityOverLifetime = value;
				this.material.shader.setDefine('VELOCITY_CURVE_CODE', value ? value.integralToGLSL('t','emitRandom') : defines.VELOCITY_CURVE_CODE);
			}
		},

		/**
		 * Whether to loop the particle emission after one duration cycle.
		 * @target-class ParticleSystemComponent loop member
		 * @type {boolean}
		 */
		loop: {
			get: function () {
				return this._loop;
			},
			set: function (value) {
				this._loop = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * Maximum number of particles visible at the same time.
		 * @target-class ParticleSystemComponent maxParticles member
		 * @type {number}
		 */
		maxParticles: {
			get: function () {
				return this._maxParticles;
			},
			set: function (value) {
				this._maxParticles = value;
				var mesh = this.mesh;
				var meshData = this.meshData;
				if (value * mesh.vertexCount !== meshData.vertexCount) { // Only rebuild if changed
					meshData.vertexCount = value * mesh.vertexCount;
					meshData.indexCount = value * mesh.indexCount;
					meshData.rebuildData(meshData.vertexCount, meshData.indexCount);
					this._syncParticleDataArrays();
					this._updateVertexData();
					this._updateIndexBuffer(this.particles);
					this._vertexDataDirty = true;
				}
			}
		},

		/**
		 * @target-class ParticleSystemComponent mesh member
		 * @type {MeshData}
		 */
		mesh: {
			get: function () {
				return this._mesh;
			},
			set: function (mesh) {
				this._mesh = mesh;
				var meshData = this.meshData;
				if(meshData){
					meshData.vertexCount = this.maxParticles * mesh.vertexCount;
					meshData.indexCount = this.maxParticles * mesh.indexCount;
					meshData.rebuildData(meshData.vertexCount, meshData.indexCount);
					this._vertexDataDirty = true;
				}
			}
		},

		/**
		 * Pre-warm the emission (fast forward time one duration). Not available if looping is on.
		 * @target-class ParticleSystemComponent preWarm member
		 * @type {boolean}
		 */
		preWarm: {
			get: function () {
				return this._preWarm;
			},
			set: function (value) {
				this._preWarm = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * Emit in random directions, instead of in the emitter volume direction.
		 * @target-class ParticleSystemComponent randomDirection member
		 * @type {boolean}
		 */
		randomDirection: {
			get: function () {
				return this._randomDirection;
			},
			set: function (value) {
				this._randomDirection = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * @target-class ParticleSystemComponent renderQueue member
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
		 * The rotation speed in radians per second, specified using a curve over the particle life time.
		 * @target-class ParticleSystemComponent rotationSpeedOverLifetime member
		 * @type {Curve|null}
		 */
		rotationSpeedOverLifetime: {
			get: function () {
				return this._rotationSpeedOverLifetime;
			},
			set: function (value) {
				this._rotationSpeedOverLifetime = value;
				this.material.shader.setDefine('ROTATION_CURVE_CODE', value ? value.integralToGLSL('t','emitRandom') : defines.ROTATION_CURVE_CODE);
			}
		},

		/**
		 * Acts as a scale on the rotationSpeed curve.
		 * @target-class ParticleSystemComponent rotationSpeedScale member
		 * @type {number}
		 */
		rotationSpeedScale: {
			get: function () {
				return this.material.uniforms.uRotationSpeed;
			},
			set: function (value) {
				this.material.uniforms.uRotationSpeed = value;
			}
		},

		/**
		 * Randomization seed.
		 * @target-class ParticleSystemComponent seed member
		 * @type {number}
		 */
		seed: {
			get: function () {
				return this._initSeed;
			},
			set: function (value) {
				if(value !== this._initSeed){
					this._initSeed = value;
					this._vertexDataDirty = true;
				}
			}
		},

		/**
		 * Emitter volume. Set to 'sphere', 'cone', or 'box'.
		 * @target-class ParticleSystemComponent shapeType member
		 * @type {string}
		 */
		shapeType: {
			get: function () {
				return this._shapeType;
			},
			set: function (value) {
				this._shapeType = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * This curve alters the size of particles over their life time.
		 * @target-class ParticleSystemComponent sizeOverLifetime member
		 * @type {Curve|null}
		 */
		sizeOverLifetime: {
			get: function () {
				return this._sizeOverLifetime;
			},
			set: function (value) {
				this._sizeOverLifetime = value;
				this.material.shader.setDefine('SIZE_CURVE_CODE', value ? value.toGLSL('t','emitRandom') : defines.SIZE_CURVE_CODE);
			}
		},
		
		/**
		 * @target-class ParticleSystemComponent sortMode member
		 * @type {string}
		 */
		sortMode: {
			get: function () {
				return this._sortMode;
			},
			set: function (value) {
				this._sortMode = value;

				var meshData = this.meshData;
				var mesh = this.mesh;
				if(!meshData || !mesh){
					return;
				}
				this._updateIndexBuffer(this.particles);
			}
		},

		/**
		 * Whether to emit from the sphere shell, if sphere shape is used.
		 * @target-class ParticleSystemComponent sphereEmitFromShell member
		 * @type {boolean}
		 */
		sphereEmitFromShell: {
			get: function () {
				return this._sphereEmitFromShell;
			},
			set: function (value) {
				this._sphereEmitFromShell = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * The initial angle of particles, as a curve over the emitter duration.
		 * @target-class ParticleSystemComponent startAngle member
		 * @type {Curve|null}
		 */
		startAngle: {
			get: function () {
				return this._startAngle;
			},
			set: function (value) {
				this._startAngle = value;
				this.material.shader.setDefine('START_ROTATION_CURVE_CODE', value ? value.toGLSL('t','emitRandom') : defines.START_ROTATION_CURVE_CODE);
			}
		},

		/**
		 * Acts as a scale on the startAngle curve.
		 * @target-class ParticleSystemComponent startAngleScale member
		 * @type {number}
		 */
		startAngleScale: {
			get: function () {
				return this.material.uniforms.uStartAngle;
			},
			set: function (value) {
				this.material.uniforms.uStartAngle = value;
			}
		},

		/**
		 * The initial color of particles as a color curve over the emitter duration.
		 * @target-class ParticleSystemComponent startColor member
		 * @type {Vector4Curve|null}
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
		 * Initial life time of particles, as a curve over the emitter duration.
		 * @target-class ParticleSystemComponent startLifetime member
		 * @type {Curve|null}
		 */
		startLifetime: {
			get: function () {
				return this._startLifetime;
			},
			set: function (value) {
				this._startLifetime = value;
				this.material.shader.setDefine('START_LIFETIME_CODE', value ? value.toGLSL('t','emitRandom') : defines.START_LIFETIME_CODE);
			}
		},

		/**
		 * Initial size of particles, as a curve over the emitter duration.
		 * @target-class ParticleSystemComponent startSize member
		 * @type {Curve|null}
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
		 * Acts as a scale on the startSize curve.
		 * @target-class ParticleSystemComponent startSizeScale member
		 * @type {number}
		 * @todo should this be .scale?
		 */
		startSizeScale: {
			get: function () {
				return this.material.uniforms.uStartSize;
			},
			set: function (value) {
				this.material.uniforms.uStartSize = value;
			}
		},

		/**
		 * Initial speed of the particles, described by a curve over the emitter duration.
		 * @target-class ParticleSystemComponent startSpeed member
		 * @type {Curve|null}
		 */
		startSpeed: {
			get: function () {
				return this._startSpeed;
			},
			set: function (value) {
				this._startSpeed = value;
				this._vertexDataDirty = true;
			}
		},

		/**
		 * A texture for the particles.
		 * @target-class ParticleSystemComponent texture member
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
		 * How fast the texture animation should cycle. Acts as a scale on the textureFrameOverLifetime curve.
		 * @target-class ParticleSystemComponent textureAnimationCycles member
		 * @type {number}
		 */
		textureAnimationCycles: {
			get: function () {
				return this.material.uniforms.textureTileInfo[2];
			},
			set: function (value) {
				this.material.uniforms.textureTileInfo[2] = value;
			}
		},

		/**
		 * The current texture frame, given by a curve over the particle life time.
		 * @target-class ParticleSystemComponent textureFrameOverLifetime member
		 * @type {Curve|null}
		 */
		textureFrameOverLifetime: {
			get: function () {
				return this._textureFrameOverLifetime;
			},
			set: function (value) {
				this._textureFrameOverLifetime = value;
				this.material.shader.setDefine('TEXTURE_FRAME_CODE', value ? value.toGLSL('t','emitRandom') : defines.TEXTURE_FRAME_CODE);
			}
		},

		/**
		 * Texture tiling in the X direction.
		 * @target-class ParticleSystemComponent textureTilesX member
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
		 * Texture tiling in the Y direction.
		 * @target-class ParticleSystemComponent textureTilesY member
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
		 * Velocity of particles in world space.
		 * @target-class ParticleSystemComponent worldVelocityOverLifetime member
		 * @type {Vector3Curve|null}
		 */
		worldVelocityOverLifetime: {
			get: function () {
				return this._worldVelocityOverLifetime;
			},
			set: function (value) {
				this._worldVelocityOverLifetime = value;
				this.material.shader.setDefine('WORLD_VELOCITY_CURVE_CODE', value ? value.integralToGLSL('t','emitRandom') : defines.WORLD_VELOCITY_CURVE_CODE);
			}
		}
	});

	/**
	 * Set the boxExtents.
	 * @param {Vector3} extents
	 */
	ParticleSystemComponent.prototype.setBoxExtents = function (extents) {
		this.boxExtents.copy(extents);
		this._vertexDataDirty = true;
	};

	/**
	 * @private
	 */
	ParticleSystemComponent.prototype._random = function () {
	    var x = Math.sin(this._seed++) * 100000;
	    return x - Math.floor(x);
	};

	/**
	 * @private
	 */
	ParticleSystemComponent.prototype._updateUniforms = function () {
		var uniforms = this.material.uniforms;

		// Gravity in local space
		var worldToLocalRotation = this._worldToLocalRotation;
		var localToWorldRotation = this._localToWorldRotation;

		if(this.localSpace){
			// In local space:
			// 1. Need to multiply the worldVelocity with the inverse rotation, to get local velocity
			// 2. World velocity is good as it is
			worldToLocalRotation.copy(this.meshEntity.transformComponent.worldTransform.rotation).invert();
			localToWorldRotation.copy(Matrix3.IDENTITY);
		} else {
			// 1. Need to multiply the localVelocity with the world rotation, to get local velocity
			// 2. Local velocity is good as it is
			worldToLocalRotation.copy(Matrix3.IDENTITY);
			localToWorldRotation.copy(this.entity.transformComponent.worldTransform.rotation);
		}

		var localGravity = this._localGravity;
		localGravity.copy(this.gravity);
		localGravity.applyPost(worldToLocalRotation);
		var g = uniforms.gravity;
		g[0] = localGravity.x;
		g[1] = localGravity.y;
		g[2] = localGravity.z;

		for(var i=0; i<9; i++){
			uniforms.invWorldRotation[i] = worldToLocalRotation.data[i]; // will be multiplied with the world velocity
			uniforms.worldRotation[i] = localToWorldRotation.data[i]; // will be multiplied with the local velocity
		}

		uniforms.time = this.time;

		var uColor = uniforms.uColor;
		var colorScale = this.startColorScale;
		uColor[0] = colorScale.x;
		uColor[1] = colorScale.y;
		uColor[2] = colorScale.z;
		uColor[3] = colorScale.w;
	};

	/**
	 * @private
	 */
	ParticleSystemComponent.prototype._updateIndexBuffer = function (particles) {
		var mesh = this.mesh;
		var meshData = this.meshData;
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

	/**
	 * Pause the animation.
	 */
	ParticleSystemComponent.prototype.pause = function () {
		this.paused = true;
	};

	/**
	 * Resume the animation.
	 */
	ParticleSystemComponent.prototype.resume = function () {
		this.play();
	};

	/**
	 * Play the animation.
	 */
	ParticleSystemComponent.prototype.play = function () {
		this.paused = false;
	};

	/**
	 * Stop the animation.
	 */
	ParticleSystemComponent.prototype.stop = function () {
		this.pause();
		this.time = 0;
		this._seed = this._initSeed;
		this._nextEmitParticleIndex = 0;
		this._syncParticleDataArrays();
		this._updateVertexData();
		var meshData = this.meshData;
		meshData.rebuildData(meshData.vertexCount, meshData.indexCount);
		this._vertexDataDirty = true;
		this._updateIndexBuffer(this.particles);
		this._updateUniforms();
	};

	/**
	 * @private
	 */
	ParticleSystemComponent.prototype._syncParticleDataArrays = function () {
		var particles = this.particlesSorted;
		var particlesUnSorted = this.particles;
		var maxParticles = this.maxParticles;
		while (particles.length < maxParticles) {
			var particle = new ParticleData(this);
			particle.index = particles.length;
			particle.loopAfter = this.duration;
			particles.push(particle);
			particlesUnSorted.push(particle);
		}
		while (particles.length > maxParticles) {
			var particle = particlesUnSorted.pop();
			particles.splice(particles.indexOf(particle), 1);
		}
	};

	/**
	 * @private
	 */
	ParticleSystemComponent.prototype._updateVertexData = function () {
		var meshData = this.meshData;
		var maxParticles = this.maxParticles;
		var particles = this.particles;
		var duration = this.duration;
		var material = this.material;
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
			material.shader.removeDefine('LOOP');
		} else {
			if(this._loop){
				material.shader.setDefine('LOOP', true);
			} else {
				material.shader.removeDefine('LOOP');
			}
		}

		if(this.preWarm){
			material.shader.removeDefine('HIDE_IF_EMITTED_BEFORE_ZERO');
		} else {
			material.shader.setDefine('HIDE_IF_EMITTED_BEFORE_ZERO', true);
		}

		// Time info
		var timeInfo = meshData.getAttributeBuffer('TIME_INFO');
		var emissionRate = this.emissionRate;
		if(this.localSpace){
			var steps = Math.min(Math.ceil(duration * 60), 1e5); // Should not need to emit more precise than 60Hz
			var sum = 0;
			var lastIntegral = 0;
			var particleIndex = 0;
			var fullIntegral = emissionRate.getIntegralValueAt(1);
			for(var i=0; sum < maxParticles &&  i < steps; i++){
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
				particles[particleIndex++].emitTime = 2 * duration; // ???
			}
		}
		var preWarm = this.preWarm;
		var loop = this.loop;
		for (i = 0; i < maxParticles; i++) {
			var particle = particles[i];
			particle.active = 1;

			var rand = particle.emitRandom = this._random();
			var t = mod(particle.emitTime / duration, 1);
			particle.lifeTime = this.startLifetime.getValueAt(t, this._random());

			if (this.localSpace) {

				if(preWarm && loop){
					// Already emitted, shift emit time back
					particle.emitTime -= duration;
				}

				if (loop) {
					var emitTime = particle.emitTime;
					if(((!preWarm && emitTime >= 0) || preWarm) && ((emitTime <= 0 && preWarm) || (emitTime <= duration && !preWarm))){
						particle.active = 1;
					} else {
						particle.active = 0;
					}
					particle.loopAfter = Math.max(duration, particle.lifeTime);
				}

			} else {
				// Set all particles to be active but already dead - ready to be re-emitted at any point
				particle.emitTime = -2 * particle.lifeTime;
				particle.active = 0;
			}

			for (j = 0; j < meshVertexCount; j++) {
				timeInfo[meshVertexCount * 4 * i + j * 4 + 0] = particle.lifeTime;
				timeInfo[meshVertexCount * 4 * i + j * 4 + 1] = particle.active;
				timeInfo[meshVertexCount * 4 * i + j * 4 + 2] = rand;
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

			for (j = 0; j < meshVertexCount; j++) {
				startPos[meshVertexCount * 4 * i + j * 4 + 0] = pos.x;
				startPos[meshVertexCount * 4 * i + j * 4 + 1] = pos.y;
				startPos[meshVertexCount * 4 * i + j * 4 + 2] = pos.z;
				startPos[meshVertexCount * 4 * i + j * 4 + 3] = 0;

				startDir[meshVertexCount * 4 * i + j * 4 + 0] = dir.x;
				startDir[meshVertexCount * 4 * i + j * 4 + 1] = dir.y;
				startDir[meshVertexCount * 4 * i + j * 4 + 2] = dir.z;
				startDir[meshVertexCount * 4 * i + j * 4 + 3] = particle.loopAfter;
			}
		}
		meshData.setAttributeDataUpdated('START_POS');
		meshData.setAttributeDataUpdated('START_DIR');
	};

	/**
	 * Get a random position and location inside the current shape.
	 * @private
	 */
	ParticleSystemComponent.prototype._generateLocalPositionAndDirection = function (position, direction, time) {
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

			var phi = 2 * pi * this._random();
			var yrand = this._random();
			var coneLength = this.coneLength;
			var y = yrand * coneLength;
			var rad = this.coneRadius * Math.sqrt(this._random()) * yrand;
			switch(this.coneEmitFrom){
			case 'base':
				// Somewhere in the base
				var ra = Math.sqrt(this._random());
				var r = this.coneRadius * ra;
				position.setDirect(r * cos(phi), 0, r * sin(phi));

				var r2 = (this.coneRadius + this.coneLength * Math.tan(this.coneAngle)) * ra;
				direction.setDirect(
					r2 * cos(phi),
					this.coneLength,
					r2 * sin(phi)
				).sub(position);
				break;

			case 'volume':
				// Somewhere in the base
				var ra = Math.sqrt(this._random());
				var r = this.coneRadius * ra;
				position.setDirect(r * cos(phi), 0, r * sin(phi));

				var r2 = (this.coneRadius + this.coneLength * Math.tan(this.coneAngle)) * ra;
				direction.setDirect(
					r2 * cos(phi),
					this.coneLength,
					r2 * sin(phi)
				).sub(position);

				direction.setDirect(
					r2 * cos(phi),
					this.coneLength,
					r2 * sin(phi)
				)
				position.lerp(direction, this._random());
				direction.sub(position);
				break;

			case 'volumeshell':

				var r = this.coneRadius;
				position.setDirect(r * cos(phi), 0, r * sin(phi));

				var r2 = (this.coneRadius + this.coneLength * Math.tan(this.coneAngle));
				direction.setDirect(
					r2 * cos(phi),
					this.coneLength,
					r2 * sin(phi)
				);
				position.lerp(direction, this._random());
				direction.sub(position);
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

		var speed = this.startSpeed.getValueAt(time, this._random());
		direction.normalize().scale(speed);
	};

	/**
	 * Emit a particle.
	 * @param {Vector3} position
	 * @param {Vector3} direction
	 */
	ParticleSystemComponent.prototype.emitOne = function (position, direction) {
		var meshData = this.meshData;
		var startPos = meshData.getAttributeBuffer('START_POS');
		var startDir = meshData.getAttributeBuffer('START_DIR');
		var timeInfo = meshData.getAttributeBuffer('TIME_INFO');

		// Get the last emitted particle
		var i = this._nextEmitParticleIndex;
		this._nextEmitParticleIndex = (this._nextEmitParticleIndex + 1) % this.maxParticles;
		var particle = this.particles[i];

		var startPosition = particle.startPosition;
		var startDirection = particle.startDirection;
		particle.emitTime = this.time; // Emitting NOW

		startPosition.copy(position);
		startDirection.copy(direction);
		particle.active = 1;

		var meshVertexCount = this.mesh.vertexCount;

		var rand = particle.emitRandom = this._random();
		for (var j = 0; j < meshVertexCount; j++) {
			timeInfo[meshVertexCount * 4 * i + j * 4 + 0] = particle.lifeTime;
			timeInfo[meshVertexCount * 4 * i + j * 4 + 1] = particle.active;
			timeInfo[meshVertexCount * 4 * i + j * 4 + 2] = rand;
			timeInfo[meshVertexCount * 4 * i + j * 4 + 3] = particle.emitTime;

			startPos[meshVertexCount * 4 * i + j * 4 + 0] = startPosition.x;
			startPos[meshVertexCount * 4 * i + j * 4 + 1] = startPosition.y;
			startPos[meshVertexCount * 4 * i + j * 4 + 2] = startPosition.z;
			startPos[meshVertexCount * 4 * i + j * 4 + 3] = 0;

			startDir[meshVertexCount * 4 * i + j * 4 + 0] = startDirection.x;
			startDir[meshVertexCount * 4 * i + j * 4 + 1] = startDirection.y;
			startDir[meshVertexCount * 4 * i + j * 4 + 2] = startDirection.z;
			startDir[meshVertexCount * 4 * i + j * 4 + 3] = particle.loopAfter;
		}

		meshData.setAttributeDataUpdated('START_POS');
		meshData.setAttributeDataUpdated('START_DIR');
		meshData.setAttributeDataUpdated('TIME_INFO');
	};

	/**
	 * @private
	 */
	ParticleSystemComponent.prototype._updateBounds = function () {
		if(!this.meshEntity || !this.meshEntity.meshRendererComponent.worldBound){
			return;
		}
		var bounds = this.meshEntity.meshRendererComponent.worldBound;
		bounds.center.copy(this.entity.transformComponent.worldTransform.translation);
		var r = this.boundsRadius;
		bounds.xExtent = bounds.yExtent = bounds.zExtent = r * 2;
	};
	
	var tmpWorldPos = new Vector3();

	/**
	 * @private
	 */
	ParticleSystemComponent.prototype._sortParticles = function () {
		if (this.sortMode === ParticleSystemComponent.SORT_NONE) {
			return;
		}
		var particles = this.particlesSorted;

		// Update sort values
		var l = particles.length;
		while(l--){
			var particle = particles[l];
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
		this._updateIndexBuffer(particles);
	};

	var tmpPos = new Vector3();
	var tmpDir = new Vector3();

	function copyPositionAndRotation(destTransform, srcTransform){
		destTransform.rotation.copy(srcTransform.rotation);
		destTransform.translation.copy(srcTransform.translation);
		destTransform.update();
	}

	/**
	 * @private
	 * @param entity
	 */
	ParticleSystemComponent.prototype.process = function (tpf) {
		if(this._vertexDataDirty){
			this._updateVertexData();
			this._vertexDataDirty = false;
		}

		this.meshEntity.meshRendererComponent.hidden = this.entity.isVisiblyHidden();

		if(this.paused) return;

		this._lastTime = this.time;
		this.time += tpf;

		var time = this.time;
		var entity = this.entity;
		var worldTransform = entity.transformComponent.worldTransform;
		var particles = this.particles;
		var maxParticles = this.maxParticles;

		if(this.localSpace){

			// Copy the parent mesh translation and rotation.
			var meshEntity = this.meshEntity;
			copyPositionAndRotation(meshEntity.transformComponent.transform, entity.transformComponent.transform);
			copyPositionAndRotation(meshEntity.transformComponent.worldTransform, entity.transformComponent.worldTransform);

		} else {

			// Emit according to emit rate.
			var emissionRate = this.emissionRate;
			var loop = this.loop;
			var duration = this.duration;
			var normalizedTime = mod(time / duration, 1);
			var numToEmit = Math.floor(time * emissionRate.getValueAt(normalizedTime, this._random())) - Math.floor(this._lastTime * emissionRate.getValueAt(normalizedTime, this._random()));
			for (var i = 0; i < numToEmit; i++) {

				if(loop){
					var particle = this._findGoodParticle();
					if(!particle){
						continue;
					} else {
						this._nextEmitParticleIndex = particle.index;
					}
				} else {
					var particle = particles[this._nextEmitParticleIndex];
					var age = time - particle.emitTime;
					if(particle.active){
						continue;
					}
				}

				// get pos and direction from the shape
				this._generateLocalPositionAndDirection(tmpPos, tmpDir, normalizedTime);

				// Transform to world space
				// TODO: interpolation between last and current transforms
				tmpPos.applyPostPoint(worldTransform.matrix);
				tmpDir.applyPost(worldTransform.rotation);

				// Emit
				//var interpolationCompensation = (time - this._lastTime) * (i + 1) / numToEmit;
				this.emitOne(tmpPos, tmpDir);
			}
		}

		this._updateUniforms();
		this._sortParticles();
		this._updateBounds();
	};

	ParticleSystemComponent.prototype._findGoodParticle = function () {
		var time = this.time;
		var duration = this.duration;
		var particles = this.particles;
		for(var i=this._nextEmitParticleIndex; i<this._nextEmitParticleIndex + particles.length; i++){
			var particle = particles[i % particles.length];
			var age = time - particle.emitTime;
			if(age > particle.lifeTime){
				return particle;
			}
		}
	};

	/**
	 * @private
	 * @param entity
	 */
	ParticleSystemComponent.prototype.attached = function (entity) {
		this.entity = entity;

		this._syncParticleDataArrays();

		var attributeMap = MeshData.defaultMap([
			MeshData.POSITION,
			MeshData.TEXCOORD0
		]);
		attributeMap.TIME_INFO = MeshData.createAttribute(4, 'Float');
		attributeMap.START_POS = MeshData.createAttribute(4, 'Float');
		attributeMap.START_DIR = MeshData.createAttribute(4, 'Float');

		var maxParticles = this.maxParticles;
		var meshData = new MeshData(attributeMap, maxParticles * this.mesh.vertexCount, maxParticles * this.mesh.indexCount);
		meshData.vertexData.setDataUsage('DynamicDraw');
		this.meshData = meshData;

		var meshRendererComponent = new MeshRendererComponent(this.material);
		meshRendererComponent.castShadows = meshRendererComponent.receiveShadows = meshRendererComponent.isPickable = meshRendererComponent.isReflectable = false;
		
		var meshEntity = this.meshEntity = this.entity._world.createEntity(meshData, 'ParticleSystemComponentMesh')
			.set(meshRendererComponent)
			.addToWorld();

		this.localSpace = this._localSpace;
		this._vertexDataDirty = true;
	};

	/**
	 * @private
	 * @param entity
	 */
	ParticleSystemComponent.prototype.detached = function (/*entity*/) {
		this.meshEntity.clearComponent('MeshDataComponent');
		this.particles.length = this.particlesSorted.length = 0;
		this.meshEntity.removeFromWorld();
		this.entity = this.meshEntity = null;
	};
	
	/**
	 * @private
	 * @param obj
	 * @param entity
	 */
	ParticleSystemComponent.applyOnEntity = function (obj, entity) {
		if (obj instanceof ParticleSystemComponent) {
			entity.setComponent(obj);
		}
	};

	/**
	 * @returns {ParticleSystemComponent}
	 */
	ParticleSystemComponent.prototype.clone = function () {
		return new ParticleSystemComponent(this);
	};

	return ParticleSystemComponent;
});