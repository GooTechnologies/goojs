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
function (
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
	'use strict';

	/**
	 * @class Handles shadow techniques
	 */
	function ShadowHandler() {
		this.depthMaterial = new Material(ShaderLib.lightDepth, 'depthMaterial');
		this.depthMaterial.cullState.cullFace = 'Back';
		this.depthMaterial.fullOverride = true;
		this.fullscreenPass = new FullscreenPass();
		this.downsample = Material.createShader(ShaderLib.downsample, 'downsample');

		var sigma = 2;
		this.blurfilter = Material.createShader(ShaderLib.convolution, 'blurfilter');
		var kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;
		this.blurfilter.defines = {
			KERNEL_SIZE_FLOAT : kernelSize.toFixed(1),
			KERNEL_SIZE_INT : kernelSize.toFixed(0)
		};
		this.blurfilter.uniforms.cKernel = ShaderLib.convolution.buildKernel(sigma);

		this.oldClearColor = new Vector4(0, 0, 0, 0);
		this.shadowClearColor = new Vector4(1, 1, 1, 1);

		this.renderList = [];
		this.shadowList = [];

		this.first = true;
	}

	var tmpVec = new Vector3();

	ShadowHandler.prototype._createShadowData = function (shadowSettings, renderer) {
		var shadowX = shadowSettings.resolution[0];
		var shadowY = shadowSettings.resolution[1];

		var linearFloat = !!renderer.glExtensionTextureFloatLinear;

		if (shadowSettings.shadowData.shadowTarget) {
			renderer._deallocateRenderTarget(shadowSettings.shadowData.shadowTarget);
		}

		shadowSettings.shadowData.shadowTarget = new RenderTarget(shadowX, shadowY, {
				type: 'Float',
				magFilter : 'NearestNeighbor',
				minFilter : 'NearestNeighborNoMipMaps'
			});
		shadowSettings.shadowData.shadowResult = null;

		if (shadowSettings.shadowType === 'VSM') {
			var type = {
				type: 'Float'
			};
			if (!linearFloat) {
				type.magFilter = 'NearestNeighbor';
				type.minFilter = 'NearestNeighborNoMipMaps';
			}
			if (shadowSettings.shadowData.shadowTargetDown) {
				renderer._deallocateRenderTarget(shadowSettings.shadowData.shadowTargetDown);
			}
			shadowSettings.shadowData.shadowTargetDown = new RenderTarget(shadowX / 2, shadowY / 2, type);
			if (shadowSettings.shadowData.shadowBlurred) {
				renderer._deallocateRenderTarget(shadowSettings.shadowData.shadowBlurred);
			}
			shadowSettings.shadowData.shadowBlurred = new RenderTarget(shadowX / 2, shadowY / 2, type);
		}

		shadowSettings.shadowRecord.resolution = shadowSettings.shadowRecord.resolution || [];
		shadowSettings.shadowRecord.resolution[0] = shadowX;
		shadowSettings.shadowRecord.shadowType = shadowSettings.shadowType;
	};

	//! AT: unused;
	// what is this doing here? looks like a generic shallow object equality test that should stay elsewhere
	ShadowHandler.prototype._testStatesEqual = function (state1, state2) {
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

	ShadowHandler.prototype.checkShadowRendering = function (renderer, partitioner, entities, lights) {
		if (this.first === true) {
			this.first = false;
			return;
		}
		for (var i = 0; i < lights.length; i++) {
			var light = lights[i];

			if (light.shadowCaster || light.lightCookie) {
				var shadowSettings = light.shadowSettings;

				if (!shadowSettings.shadowData) {
					shadowSettings.shadowData = {};
					shadowSettings.shadowRecord = {};
					shadowSettings.shadowData.lightCamera = new Camera(55, 1, 1, 1000);
				}

				var record = shadowSettings.shadowRecord;
				var lightCamera = shadowSettings.shadowData.lightCamera;

				// Update transformation
				lightCamera.translation.copy(light.translation);
				if (light.direction) {
					tmpVec.setVector(light.translation).addVector(light.direction);
					lightCamera.lookAt(tmpVec, shadowSettings.upVector);
				} else {
					lightCamera.lookAt(Vector3.ZERO, shadowSettings.upVector);
				}

				// Update settings
				if (!shadowSettings.shadowData.shadowTarget ||
					record.angle !== light.angle ||
					!record.resolution ||
					record.resolution[0] !== shadowSettings.resolution[0] ||
					record.resolution[1] !== shadowSettings.resolution[1] ||
					record.near !== shadowSettings.near ||
					record.far !== shadowSettings.far ||
					record.size !== shadowSettings.size) {

					if (!record.resolution ||
						record.resolution[0] !== shadowSettings.resolution[0] ||
						record.resolution[1] !== shadowSettings.resolution[1]) {
						this._createShadowData(shadowSettings, renderer);
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
					this._createShadowData(shadowSettings, renderer);

					record.shadowType = shadowSettings.shadowType;
				}
				lightCamera.onFrameChange();

				var matrix = lightCamera.getViewProjectionMatrix().data;
				lightCamera.vpm = lightCamera.vpm || [];
				for (var j = 0; j < 16; j++) {
					lightCamera.vpm[j] = matrix[j];
				}
				
				if (light.shadowCaster) {
					this.depthMaterial.shader.setDefine('SHADOW_TYPE', shadowSettings.shadowType === 'VSM' ? 2 : 0);
					this.depthMaterial.uniforms.cameraScale = 1.0 / (lightCamera.far - lightCamera.near);
					lightCamera.cameraScale = this.depthMaterial.uniforms.cameraScale;

					this.oldClearColor.copy(renderer.clearColor);
					renderer.setClearColor(this.shadowClearColor.r, this.shadowClearColor.g, this.shadowClearColor.b, this.shadowClearColor.a);

					this.shadowList.length = 0;
					for (var j = 0; j < entities.length; j++) {
						var entity = entities[j];
						if (entity.meshRendererComponent && entity.meshRendererComponent.castShadows && !entity.isSkybox) {
							this.shadowList.push(entity);
						}
					}
					partitioner.process(lightCamera, this.shadowList, this.renderList);
					renderer.render(this.renderList, lightCamera, [], shadowSettings.shadowData.shadowTarget, true, this.depthMaterial);

					switch (shadowSettings.shadowType) {
					case 'VSM':
						this.fullscreenPass.material.shader = this.downsample;
						this.fullscreenPass.render(renderer, shadowSettings.shadowData.shadowTargetDown, shadowSettings.shadowData.shadowTarget);

						this.fullscreenPass.material.shader = this.blurfilter;
						this.fullscreenPass.material.uniforms.uImageIncrement = [2 / shadowSettings.resolution[0], 0.0];
						this.fullscreenPass.render(renderer, shadowSettings.shadowData.shadowBlurred, shadowSettings.shadowData.shadowTargetDown);
						this.fullscreenPass.material.uniforms.uImageIncrement = [0.0, 2 / shadowSettings.resolution[1]];
						this.fullscreenPass.render(renderer, shadowSettings.shadowData.shadowTargetDown, shadowSettings.shadowData.shadowBlurred);

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
		}
	};

	ShadowHandler.prototype.invalidateHandles = function (renderer) {
		this.fullscreenPass.invalidateHandles(renderer);
		renderer.invalidateMaterial(this.depthMaterial);
		renderer.invalidateShader(this.downsample);
		renderer.invalidateShader(this.blurfilter);
	};

	return ShadowHandler;
});