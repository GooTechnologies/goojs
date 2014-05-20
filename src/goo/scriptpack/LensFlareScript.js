define([
	'goo/math/Vector3',
	'goo/util/ParticleSystemUtils',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Quad'
], function (
	Vector3,
	ParticleSystemUtils,
	Material,
	ShaderLib,
	Quad
) {
	'use strict';

	/**
	 * This script makes an entity shine with some lensflare effect.
	 * @class
	 */
	function LensFlareScript() {
		var lightEntity;
		var flares = [];
		var world;
		var isActive;
		var quadData;
		var lightColor;
		var globalIntensity;
		var systemScale;
		var highRes;
		var spriteTxSize = 64;
		var flareGeometry;
		var textures = {};
		var edgeRelevance;
		var edgeDampen;
		var edgeScaling;

		var textureShapes = {
			splash:{trailStartRadius:25, trailEndRadius:0},
			ring:[
				{ fraction:0,		value:0},
				{ fraction:0.7,		value:0},
				{ fraction:0.92,	value:1},
				{ fraction:0.98,	value:0}
			],
			dot:[
				{ fraction:0,		value:1},
				{ fraction:0.3,		value:0.75},
				{ fraction:0.5,		value:0.45},
				{ fraction:0.65,	value:0.21},
				{ fraction:0.75,	value:0.1},
				{ fraction:0.98,	value:0}
			],
			bell:[
				{ fraction:0,		value:1},
				{ fraction:0.15,	value:0.75},
				{ fraction:0.3,		value:0.5},
				{ fraction:0.4,		value:0.25},
				{ fraction:0.75,	value:0.05},
				{ fraction:0.98,	value:0}
			],
			none:[
				{fraction:0,	value:1},
				{fraction:1,	value:0}
			]
		};

		var generateTextures = function(txSize) {
			textures.size = txSize;
			textures.splash = ParticleSystemUtils.createSplashTexture(512, {trailStartRadius:25, trailEndRadius:0});
			textures.ring = ParticleSystemUtils.createFlareTexture(txSize, {steps:textureShapes.ring, startRadius:txSize/4, endRadius:txSize/2});
			textures.dot = ParticleSystemUtils.createFlareTexture(txSize, {steps:textureShapes.dot, startRadius:0, endRadius:txSize/2});
			textures.bell = ParticleSystemUtils.createFlareTexture(txSize, {steps:textureShapes.bell, startRadius:0, endRadius:txSize/2});
			textures.default = ParticleSystemUtils.createFlareTexture(txSize, {steps:textureShapes.none, startRadius:0, endRadius:txSize/2});
		};

		var FlareGeometry = function() {
			this.camRot = null;
			this.distance = 0;
			this.offset = 0;
			this.centerRatio = 0;
			this.positionVector = new Vector3();
			this.distanceVector = new Vector3();
			this.centerVector = new Vector3();
			this.displacementVector = new Vector3();
		};

		FlareGeometry.prototype.updateFrameGeometry = function(lightEntity, cameraParent) {
			this.camRot = cameraParent.transformComponent.transform.rotation;
			this.centerVector.set(cameraParent.cameraComponent.camera.translation);
			this.displacementVector.set(lightEntity.getTranslation());
			this.displacementVector.sub(this.centerVector);
			this.distance = this.displacementVector.length();
			this.distanceVector.set(0, 0, -this.distance);
			this.camRot.applyPost(this.distanceVector);
			this.centerVector.add(this.distanceVector);
			this.positionVector.set(this.centerVector);
			this.displacementVector.set(lightEntity.getTranslation());
			this.displacementVector.sub(this.positionVector);
			this.offset = this.displacementVector.length();
			this.centerRatio = 1-(1 / (this.positionVector.length() / (this.offset*edgeRelevance)));
			this.centerRatio = Math.max(1,this.centerRatio);
			//if (Math.random() < 0.05) console.log(this.centerRatio)
		};

		function FlareQuad(lightColor, tx, displace, size, intensity) {
			this.sizeVector = new Vector3(size, size, size);
			this.sizeVector.mul(systemScale);
			this.positionVector = new Vector3();
			this.flareVector = new Vector3();
			this.intensity = intensity;
			this.displace = displace;
			this.color = [lightColor[0]*intensity, lightColor[1]*intensity, lightColor[2]*intensity, 1];
			var material = new Material(ShaderLib.uber, "flareShader");

			material.uniforms.materialEmissive = this.color;
			material.uniforms.materialDiffuse = [0, 0, 0, 1];
			material.uniforms.materialAmbient = [0, 0, 0, 1];
			material.uniforms.materialSpecular = [0, 0, 0, 1];

			var texture = textures[tx];

			material.setTexture('DIFFUSE_MAP', texture);
			material.setTexture('EMISSIVE_MAP', texture);
			material.blendState.blending = "AdditiveBlending";
			material.blendState.blendEquation = "AddEquation";
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
		};

		FlareQuad.prototype.updatePosition = function(flareGeometry) {
			this.flareVector.set(flareGeometry.displacementVector);
			this.positionVector.set(flareGeometry.positionVector);
			this.flareVector.mul(this.displace);
			this.positionVector.add(this.flareVector);

			this.material.uniforms.materialEmissive = [
				this.color[0]*flareGeometry.centerRatio*edgeDampen,
				this.color[1]*flareGeometry.centerRatio*edgeDampen,
				this.color[2]*flareGeometry.centerRatio*edgeDampen,
				1
			];

			var scaleFactor = flareGeometry.distance + flareGeometry.distance*flareGeometry.centerRatio*edgeScaling

			this.quad.transformComponent.transform.scale.set(this.sizeVector);
			this.quad.transformComponent.transform.scale.mul(scaleFactor);
			this.quad.transformComponent.transform.rotation.set(flareGeometry.camRot);
			this.quad.transformComponent.transform.translation.set(this.positionVector);
			this.quad.transformComponent.updateTransform();
			this.quad.transformComponent.updateWorldTransform();
		};

		function createFlareQuads(quads, lightColor) {
			for (var i = 0; i < quads.length; i++) {
				flares.push(new FlareQuad(lightColor, quads[i].tx, quads[i].displace, quads[i].size, quads[i].intensity*globalIntensity));
			}
			return flares;
		}

		function removeFlareQuads(quads) {
			for (var i = 0; i < quads.length; i++) {
				quads[i].quad.removeFromWorld();
			}
		}

		function setup(params, env) {
			flareGeometry = new FlareGeometry();
			systemScale = params.scale;
			globalIntensity = params.intensity;
			edgeRelevance = params.edgeRelevance*100;
			edgeDampen = params.edgeDampen;
			edgeScaling = params.edgeScaling;
			var baseSize = spriteTxSize
			if (params.highRes) baseSize *=4;
			if (textures.size != baseSize) generateTextures(baseSize);
			flares = [];
			lightEntity = env.entity;
			if(lightEntity.meshRendererComponent){
				lightEntity.meshRendererComponent.cullMode = 'Dynamic';
			}
			world = env.world;
			isActive = false;

			lightColor = [params.color[0], params.color[1], params.color[2], 1];

			quadData = [
				{size:2.53,	tx:"bell",		intensity:0.7,	displace: 1},
				{size:0.53,	tx:"dot",		intensity:0.7,	displace: 1},
				{size:0.83,	tx:"bell",		intensity:0.2,	displace: 0.8},
				{size:0.4,	tx:"ring",		intensity:0.1,	displace: 0.6},
				{size:0.3,	tx:"bell",		intensity:0.1,	displace: 0.4},
				{size:0.6,	tx:"bell",		intensity:0.1,	displace: 0.3},
				{size:0.3,	tx:"dot",		intensity:0.1,	displace: 0.15},
				{size:0.22,	tx:"ring",		intensity:0.03,	displace: -0.25},
				{size:0.36,	tx:"dot",		intensity:0.05,	displace: -0.5},
				{size:0.8,	tx:"ring",		intensity:0.1,	displace: -0.8},
				{size:0.86,	tx:"bell",		intensity:0.2,	displace: -1.1},
				{size:1.3,	tx:"ring",		intensity:0.05,	displace: -1.5}
			];
		};

		function cleanup(params, env) {
			removeFlareQuads(flares);
			flares = [];
		}

		function update(params, env) {

			if (env.entity.isVisible) {
				flareGeometry.updateFrameGeometry(lightEntity, env.activeCameraEntity)
				if (!isActive) {
					flares = createFlareQuads(quadData, lightColor);
					isActive = true;
				}

				for (var i = 0; i < flares.length; i++) {
					flares[i].updatePosition(flareGeometry);
				}

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
		name: 'LensFlareScript',
		description: 'Makes an entity shine with some lensflare effect.',
		parameters : [{
			key: 'scale',
			name: 'Scale',
			type: 'float',
			description:'Scale of flare quads',
			control: 'slider',
			'default': 1,
			min: 0.01,
			max: 2
		},{
			key: 'intensity',
			name: 'Intensity',
			type: 'float',
			description:'Intensity of Effect',
			control: 'slider',
			'default': 1,
			min: 0.01,
			max: 2
		},{
			key: 'edgeRelevance',
			name: 'Edge Relevance',
			type: 'float',
			description:'How much the effect cares about being centered or not',
			control: 'slider',
			'default': 1,
			min: 0,
			max: 2
		},{
			key: 'edgeDampen',
			name: 'Edge Dampening',
			type: 'float',
			description:'Intensity adjustment by distance from center',
			control: 'slider',
			'default': 0.2,
			min: 0,
			max: 1
		},{
			key: 'edgeScaling',
			name: 'Edge Scaling',
			type: 'float',
			description:'Scale adjustment by distance from center',
			control: 'slider',
			'default': 0,
			min: -2,
			max: 2
		},{
			key: 'color',
			name: 'Color',
			type: 'vec3',
			description:'Effect Color',
			control: 'color',
			'default': [
				0.8,
				0.75,
				0.7
			]
		},{
			key: 'highRes',
			name: 'High Resolution',
			type: 'boolean',
			description:'Intensity of Effect',
			control: 'checkbox',
			'default': false
		}]
	};

	return LensFlareScript;
});