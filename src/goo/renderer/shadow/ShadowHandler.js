define([
	'goo/math/Vector3',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/Camera',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/RenderTarget',
	'goo/math/Vector4',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight'
],
/** @lends */

function(
	Vector3,
	FullscreenPass,
	Camera,
	Material,
	ShaderLib,
	RenderTarget,
	Vector4,
	PointLight,
	DirectionalLight,
	SpotLight
) {
	"use strict";

	/**
	 * @class Handles shadow techniques
	 */

	function ShadowHandler() {
		this.depthMaterial = Material.createMaterial(ShaderLib.lightDepth, 'depthMaterial');
		this.depthMaterial.cullState.cullFace = 'Back';
		this.fullscreenPass = new FullscreenPass();
		this.downsample = Material.createShader(ShaderLib.downsample, 'downsample');

		var sigma = 2.0;
		this.blurfilter = Material.createShader(ShaderLib.convolution, 'blurfilter');
		var kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;
		this.blurfilter.defines = {
			"KERNEL_SIZE_FLOAT" : kernelSize.toFixed(1),
			"KERNEL_SIZE_INT" : kernelSize.toFixed(0)
		};
		this.blurfilter.uniforms.cKernel = ShaderLib.convolution.buildKernel(sigma);

		this.oldClearColor = new Vector4(0, 0, 0, 0);
		this.shadowClearColor = new Vector4(1, 1, 1, 1);

		this.renderList = [];
		this.shadowList = [];

		this.tmpVec = new Vector3();
		this.first = true;
	}

	ShadowHandler.prototype._createShadowData = function(shadowSettings) {
		var shadowX = shadowSettings.resolution[0];
		var shadowY = shadowSettings.resolution[1];

		shadowSettings.shadowData = shadowSettings.shadowData || {};

		shadowSettings.shadowData.shadowTarget = new RenderTarget(shadowX, shadowY, {
				type: 'Float',
				magFilter : 'NearestNeighbor',
				minFilter : 'NearestNeighborNoMipMaps'
			});
		shadowSettings.shadowData.shadowResult = null;

		if (shadowSettings.shadowType === 'VSM') {
			shadowSettings.shadowData.shadowTargetDown = new RenderTarget(shadowX / 2, shadowY / 2, {
				type: 'Float'
			});
			shadowSettings.shadowData.shadowBlurred = new RenderTarget(shadowX / 2, shadowY / 2, {
				type: 'Float'
			});
		}

		shadowSettings.shadowRecord = shadowSettings.shadowRecord || {};
		shadowSettings.shadowRecord.resolution = shadowSettings.shadowRecord.resolution || [];
		shadowSettings.shadowRecord.resolution[0] = shadowX;
		shadowSettings.shadowRecord.resolution[0] = shadowX;
		shadowSettings.shadowRecord.shadowType = shadowSettings.shadowType;
	};

	ShadowHandler.prototype._testStatesEqual = function(state1, state2) {
		var keys1 = Object.keys(state1);
		var keys2 = Object.keys(state2);
		if (keys1.length !== keys2.length) {
			return false;
		}
		for (var i = 0; i < keys1.length; i++) {
			var key = keys1[i];
			if (state1[key] !== state2[key]) {
				return false;
			}
		}
		return true;
	};

	ShadowHandler.prototype.checkShadowRendering = function(renderer, partitioner, entities, lights) {
		if (this.first === true) {
			this.first = false;
			return;
		}
		this.shadowResults = [];
		this.shadowLights = [];
		for (var i = 0; i < lights.length; i++) {
			var light = lights[i];

			if (light.shadowCaster) {
				var shadowSettings = light.shadowSettings;

				if (!shadowSettings.shadowData) {
					this._createShadowData(shadowSettings);
					shadowSettings.shadowData.lightCamera = new Camera(55, 1, 1, 1000);
				}

				var record = shadowSettings.shadowRecord;
				var lightCamera = shadowSettings.shadowData.lightCamera;

				// Update transformation
				lightCamera.translation.copy(light.translation);
				if (light.direction) {
					this.tmpVec.setv(light.translation).addv(light.direction);
					lightCamera.lookAt(this.tmpVec, shadowSettings.upVector);
				} else {
					lightCamera.lookAt(Vector3.ZERO, shadowSettings.upVector);
				}

				// Update settings
				if (record.angle !== light.angle ||
					!record.resolution ||
					record.resolution[0] !== shadowSettings.resolution[0] ||
					record.resolution[1] !== shadowSettings.resolution[1] ||
					record.near !== shadowSettings.near ||
					record.far !== shadowSettings.far ||
					record.size !== shadowSettings.size) {

					if (!record.resolution ||
						record.resolution[0] !== shadowSettings.resolution[0] ||
						record.resolution[1] !== shadowSettings.resolution[1]) {
						this._createShadowData(shadowSettings);
					}

					if (light instanceof SpotLight) {
						lightCamera.setFrustumPerspective(light.angle, shadowSettings.resolution[0] / shadowSettings.resolution[1], shadowSettings.near, shadowSettings.far);
					} else if (light instanceof PointLight) {
						lightCamera.setFrustumPerspective(90, shadowSettings.resolution[0] / shadowSettings.resolution[1], shadowSettings.near, shadowSettings.far);
					} else {
						var radius = shadowSettings.size;
						lightCamera.setFrustum(shadowSettings.near, shadowSettings.far, -radius, radius, radius, -radius);
						lightCamera.projectionMode = Camera.Parallel;
					}

					lightCamera.update();

					record.resolution = record.resolution || [];
					record.resolution[0] = shadowSettings.resolution[0];
					record.resolution[1] = shadowSettings.resolution[1];
					record.angle = light.angle;
					record.near = shadowSettings.near;
					record.far = shadowSettings.far;
					record.size = shadowSettings.size;
				}

				if (shadowSettings.shadowType === 'VSM' && record.shadowType !== shadowSettings.shadowType) {
					this._createShadowData(shadowSettings);

					record.shadowType = shadowSettings.shadowType;
				}
				lightCamera.onFrameChange();

				this.depthMaterial.shader.defines.SHADOW_TYPE = shadowSettings.shadowType === 'VSM' ? 2 : 0;
				this.depthMaterial.uniforms.cameraScale = 1.0 / (lightCamera.far - lightCamera.near);

				this.oldClearColor.copy(renderer.clearColor);
				renderer.setClearColor(this.shadowClearColor.r, this.shadowClearColor.g, this.shadowClearColor.b, this.shadowClearColor.a);

				this.shadowList.length = 0;
				for (var j = 0; j < entities.length; j++) {
					var entity = entities[j];
					if (entity.meshRendererComponent && entity.meshRendererComponent.castShadows) {
						this.shadowList.push(entity);
					}
				}
				partitioner.process(lightCamera, this.shadowList, this.renderList);
				renderer.render(this.renderList, lightCamera, [], shadowSettings.shadowData.shadowTarget, true, this.depthMaterial);

				switch (shadowSettings.shadowType) {
					case 'VSM':
						this.fullscreenPass.material.shader = this.downsample;
						this.fullscreenPass.render(renderer, shadowSettings.shadowData.shadowTargetDown, shadowSettings.shadowData.shadowTarget, 0);

						this.fullscreenPass.material.shader = this.blurfilter;
						this.fullscreenPass.material.uniforms.uImageIncrement = [2 / shadowSettings.resolution[0], 0.0];
						this.fullscreenPass.render(renderer, shadowSettings.shadowData.shadowBlurred, shadowSettings.shadowData.shadowTargetDown, 0);
						this.fullscreenPass.material.uniforms.uImageIncrement = [0.0, 2 / shadowSettings.resolution[1]];
						this.fullscreenPass.render(renderer, shadowSettings.shadowData.shadowTargetDown, shadowSettings.shadowData.shadowBlurred, 0);

						shadowSettings.shadowData.shadowResult = shadowSettings.shadowData.shadowTargetDown;
						break;
					case 'PCF':
						shadowSettings.shadowData.shadowResult = shadowSettings.shadowData.shadowTarget;
						break;
					case 'Basic':
						shadowSettings.shadowData.shadowResult = shadowSettings.shadowData.shadowTarget;
						break;
					default:
						shadowSettings.shadowData.shadowResult = shadowSettings.shadowData.shadowTarget;
						break;
				}

				renderer.setClearColor(this.oldClearColor.r, this.oldClearColor.g, this.oldClearColor.b, this.oldClearColor.a);
			}
		}
	};

	return ShadowHandler;
});