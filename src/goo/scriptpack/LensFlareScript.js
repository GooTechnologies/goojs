var Vector3 = require('../math/Vector3');
var ParticleSystemUtils = require('../util/ParticleSystemUtils');
var Material = require('../renderer/Material');
var ShaderLib = require('../renderer/shaders/ShaderLib');
var Quad = require('../shapes/Quad');
var BoundingSphere = require('../renderer/bounds/BoundingSphere');



	/**
	 * This script makes an entity shine with some lensflare effect.
	 */
	function LensFlareScript() {
		var lightEntity;
		var flares = [];
		var world;
		var isActive;
		var quadData;
		var lightColor;
		var globalIntensity;
		var spriteTxSize = 64;
		var flareGeometry;
		var textures = {};

		var textureShapes = {
			splash: { trailStartRadius: 25, trailEndRadius: 0 },
			ring: [
				{ fraction: 0.00, value: 0 },
				{ fraction: 0.70, value: 0 },
				{ fraction: 0.92, value: 1 },
				{ fraction: 0.98, value: 0 }
			],
			dot: [
				{ fraction: 0.00, value: 1 },
				{ fraction: 0.30, value: 0.75 },
				{ fraction: 0.50, value: 0.45 },
				{ fraction: 0.65, value: 0.21 },
				{ fraction: 0.75, value: 0.1 },
				{ fraction: 0.98, value: 0 }
			],
			bell: [
				{ fraction: 0.00, value: 1 },
				{ fraction: 0.15, value: 0.75 },
				{ fraction: 0.30, value: 0.5 },
				{ fraction: 0.40, value: 0.25 },
				{ fraction: 0.75, value: 0.05 },
				{ fraction: 0.98, value: 0 }
			],
			none: [
				{ fraction: 0, value: 1 },
				{ fraction: 1, value: 0 }
			]
		};

		function generateTextures(txSize) {
			textures.size = txSize;
			textures.splash = ParticleSystemUtils.createSplashTexture(512, { trailStartRadius: 25, trailEndRadius: 0 });
			textures.ring = ParticleSystemUtils.createFlareTexture(txSize, { steps: textureShapes.ring, startRadius: txSize / 4, endRadius: txSize / 2 });
			textures.dot = ParticleSystemUtils.createFlareTexture(txSize, { steps: textureShapes.dot, startRadius: 0, endRadius: txSize / 2 });
			textures.bell = ParticleSystemUtils.createFlareTexture(txSize, { steps: textureShapes.bell, startRadius: 0, endRadius: txSize / 2 });
			textures['default'] = ParticleSystemUtils.createFlareTexture(txSize, { steps: textureShapes.none, startRadius: 0, endRadius: txSize / 2 });
		}

		function createFlareQuads(quads, lightColor, systemScale, edgeDampen, edgeScaling) {
			for (var i = 0; i < quads.length; i++) {
				var quad = quads[i];
				flares.push(
					new FlareQuad(
						lightColor,
						quad.tx,
						quad.displace,
						quad.size,
						quad.intensity * globalIntensity,
						systemScale,
						edgeDampen,
						edgeScaling,
						textures,
						world
					)
				);
			}
			return flares;
		}

		function removeFlareQuads(quads) {
			for (var i = 0; i < quads.length; i++) {
				quads[i].quad.removeFromWorld();
			}
		}

		function setup(args, ctx) {
			globalIntensity = args.intensity;
			flareGeometry = new FlareGeometry(args.edgeRelevance * 100);
			var baseSize = spriteTxSize;
			if (args.highRes) {
				baseSize *= 4;
			}
			if (textures.size !== baseSize) {
				generateTextures(baseSize);
			}
			flares = [];
			lightEntity = ctx.entity;

			world = ctx.world;
			isActive = false;

			lightColor = [args.color[0], args.color[1], args.color[2], 1];

			quadData = [
				{ size: 2.53, tx: 'bell', intensity: 0.70, displace: 1 },
				{ size: 0.53, tx: 'dot',  intensity: 0.70, displace: 1 },
				{ size: 0.83, tx: 'bell', intensity: 0.20, displace: 0.8 },
				{ size: 0.40, tx: 'ring', intensity: 0.10, displace: 0.6 },
				{ size: 0.30, tx: 'bell', intensity: 0.10, displace: 0.4 },
				{ size: 0.60, tx: 'bell', intensity: 0.10, displace: 0.3 },
				{ size: 0.30, tx: 'dot',  intensity: 0.10, displace: 0.15 },
				{ size: 0.22, tx: 'ring', intensity: 0.03, displace: -0.25 },
				{ size: 0.36, tx: 'dot',  intensity: 0.05, displace: -0.5 },
				{ size: 0.80, tx: 'ring', intensity: 0.10, displace: -0.8 },
				{ size: 0.86, tx: 'bell', intensity: 0.20, displace: -1.1 },
				{ size: 1.30, tx: 'ring', intensity: 0.05, displace: -1.5 }
			];

			ctx.bounds = new BoundingSphere(ctx.entity.transformComponent.worldTransform.translation, 0);
		}

		function cleanup(/*args, ctx*/) {
			removeFlareQuads(flares);
			flares = [];
		}

		function update(args, ctx) {
			ctx.bounds.center.copy(ctx.entity.transformComponent.worldTransform.translation);
			if (ctx.activeCameraEntity.cameraComponent.camera.contains(ctx.bounds)) {
				flareGeometry.updateFrameGeometry(lightEntity, ctx.activeCameraEntity);
				if (!isActive) {
					flares = createFlareQuads(quadData, lightColor, args.scale, args.edgeDampen, args.edgeScaling);
					isActive = true;
				}

				for (var i = 0; i < flares.length; i++) {
					flares[i].updatePosition(flareGeometry);
				}
			// # REVIEW: if the entity has ever been visible then the FlareQuads
			// are staying. Is it a problem with removeFlareQuads?
			} else {
				if (isActive) {
					removeFlareQuads(flares);
					isActive = false;
				}
			}
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	LensFlareScript.externals = {
		key: 'LensFlareScript',
		name: 'Lens Flare Script',
		description: 'Makes an entity shine with some lensflare effect.',
		parameters: [{
			key: 'scale',
			name: 'Scale',
			type: 'float',
			description: 'Scale of flare quads',
			control: 'slider',
			'default': 1,
			min: 0.01,
			max: 2
		}, {
			key: 'intensity',
			name: 'Intensity',
			type: 'float',
			description: 'Intensity of Effect',
			control: 'slider',
			'default': 1,
			min: 0.01,
			// REVIEW: why 2 for so many of these params? can they be normalized
			//! AT: [0, 1] might be the normal domain but the upper allowed bound is 2 because it allows for superbright/superfancy lens flares
			max: 2
		}, {
			key: 'edgeRelevance',
			name: 'Edge Relevance',
			type: 'float',
			description: 'How much the effect cares about being centered or not',
			control: 'slider',
			'default': 0,
			min: 0,
			max: 2
		}, {
			key: 'edgeDampen',
			name: 'Edge Dampening',
			type: 'float',
			description: 'Intensity adjustment by distance from center',
			control: 'slider',
			'default': 0.2,
			min: 0,
			max: 1
		}, {
			key: 'edgeScaling',
			name: 'Edge Scaling',
			type: 'float',
			description: 'Scale adjustment by distance from center',
			control: 'slider',
			'default': 0,
			min: -2,
			max: 2
		}, {
			key: 'color',
			name: 'Color',
			type: 'vec3',
			description: 'Effect Color',
			control: 'color',
			'default': [
				0.8,
				0.75,
				0.7
			]
		}, {
			key: 'highRes',
			name: 'High Resolution',
			type: 'boolean',
			description: 'Intensity of Effect',
			control: 'checkbox',
			'default': false
		}]
	};

	function FlareGeometry(edgeRelevance) {
		this.camRot = null;
		this.distance = 0;
		this.offset = 0;
		this.centerRatio = 0;
		this.positionVector = new Vector3();
		this.distanceVector = new Vector3();
		this.centerVector = new Vector3();
		this.displacementVector = new Vector3();
		this.edgeRelevance = edgeRelevance;
	}

	FlareGeometry.prototype.updateFrameGeometry = function (lightEntity, cameraEntity) {
		this.camRot = cameraEntity.transformComponent.transform.rotation;
		this.centerVector.set(cameraEntity.cameraComponent.camera.translation);
		this.displacementVector.set(lightEntity.transformComponent.worldTransform.translation);
		this.displacementVector.sub(this.centerVector);
		this.distance = this.displacementVector.length();
		this.distanceVector.setDirect(0, 0, -this.distance);
		this.distanceVector.applyPost(this.camRot);
		this.centerVector.add(this.distanceVector);
		this.positionVector.set(this.centerVector);
		this.displacementVector.set(lightEntity.transformComponent.worldTransform.translation);
		this.displacementVector.sub(this.positionVector);
		this.offset = this.displacementVector.length();
		var positionVectorLength = this.positionVector.length();
		if (positionVectorLength) {
			this.centerRatio = 1 - (this.offset * this.edgeRelevance) / this.positionVector.length();
		} else {
			this.centerRatio = 1 - (this.offset * this.edgeRelevance);
		}
		this.centerRatio = Math.max(0, this.centerRatio);
	};

	function FlareQuad(lightColor, tx, displace, size, intensity, systemScale, edgeDampen, edgeScaling, textures, world) {
		this.sizeVector = new Vector3(size, size, size);
		this.sizeVector.scale(systemScale);
		this.positionVector = new Vector3();
		this.flareVector = new Vector3();
		this.intensity = intensity;
		this.displace = displace;
		this.color = [lightColor[0] * intensity, lightColor[1] * intensity, lightColor[2] * intensity, 1];
		this.edgeDampen = edgeDampen;
		this.edgeScaling = edgeScaling;
		var material = new Material(ShaderLib.uber, 'flareShader');

		material.uniforms.materialEmissive = this.color;
		material.uniforms.materialDiffuse = [0, 0, 0, 1];
		material.uniforms.materialAmbient = [0, 0, 0, 1];
		material.uniforms.materialSpecular = [0, 0, 0, 1];

		var texture = textures[tx];

		material.setTexture('DIFFUSE_MAP', texture);
		material.setTexture('EMISSIVE_MAP', texture);
		material.blendState.blending = 'AdditiveBlending';
		material.blendState.blendEquation = 'AddEquation';
		material.blendState.blendSrc = 'OneFactor';
		material.blendState.blendDst = 'OneFactor';
		material.depthState.enabled = false;
		material.depthState.write = false;
		material.cullState.enabled = false;

		var meshData = new Quad(1, 1);
		var entity = world.createEntity(meshData, material);
		entity.meshRendererComponent.cullMode = 'Never';
		entity.addToWorld();

		this.material = material;
		this.quad = entity;
	}

	FlareQuad.prototype.updatePosition = function (flareGeometry) {
		this.flareVector.set(flareGeometry.displacementVector);
		this.positionVector.set(flareGeometry.positionVector);
		this.flareVector.scale(this.displace);
		this.positionVector.add(this.flareVector);

		this.material.uniforms.materialEmissive = [
			this.color[0] * flareGeometry.centerRatio * this.edgeDampen,
			this.color[1] * flareGeometry.centerRatio * this.edgeDampen,
			this.color[2] * flareGeometry.centerRatio * this.edgeDampen,
			1
		];

		var scaleFactor = flareGeometry.distance + flareGeometry.distance * flareGeometry.centerRatio * this.edgeScaling;

		var quadTransform = this.quad.transformComponent.transform;
		quadTransform.scale.set(this.sizeVector);
		quadTransform.scale.scale(scaleFactor);
		quadTransform.rotation.set(flareGeometry.camRot);
		quadTransform.translation.set(this.positionVector);
		this.quad.transformComponent.updateTransform();
		this.quad.transformComponent.updateWorldTransform();
	};

	module.exports = LensFlareScript;