define([
		'goo/math/Vector3',
		'goo/renderer/pass/FullscreenPass',
		'goo/renderer/Camera',
		'goo/renderer/Material',
		'goo/renderer/shaders/ShaderLib',
		'goo/renderer/pass/RenderTarget',
		'goo/math/Vector4'
        ],
	/** @lends */
	function (
		Vector3,
		FullscreenPass,
		Camera,
		Material,
		ShaderLib,
		RenderTarget,
		Vector4
	) {
	"use strict";

	/**
	 * @class Handles shadow techniques
	 */
	function ShadowHandler() {
		this.shadowX = 512;
		this.shadowY = 512;
		this.nearZ = 1;
		this.farZ = 1000;

		this.lightCam = new Camera(55, 1, this.nearZ, this.farZ);
		this.currentState = 'Perspective';

		this.depthMaterial = Material.createMaterial(ShaderLib.lightDepth, 'depthMaterial');
		this.depthMaterial.cullState.cullFace = 'Front';

		this.shadowTarget = new RenderTarget(this.shadowX, this.shadowY, {
			type: 'Float'
		});
		this.shadowTargetDown = new RenderTarget(this.shadowX/2, this.shadowY/2, {
			type: 'Float'
		});
		this.shadowTargetDown2 = new RenderTarget(this.shadowX/4, this.shadowY/4, {
			type: 'Float'
		});
		this.shadowBlurred = new RenderTarget(this.shadowX/4, this.shadowY/4, {
			type: 'Float'
		});
		this.shadowResult = this.shadowBlurred;

		this.fullscreenPass = new FullscreenPass();
		this.downsample = Material.createShader(ShaderLib.downsample, 'downsample');
		this.boxfilter = Material.createShader(ShaderLib.boxfilter, 'boxfilter');
		this.boxfilter.uniforms.viewport = [this.shadowX/4, this.shadowY/4];

		this.oldClearColor = new Vector4(0,0,0,0);
		this.shadowClearColor = new Vector4(1,1,1,1);
	}

	ShadowHandler.prototype.checkShadowRendering = function (renderer, renderList, camera, lights) {
		renderer.shadowCount = 0;
		for (var i=0; i<lights.length; i++) {
			var light = lights[i];
			if (light.shadowCaster) {
				var lightCam = this.lightCam;

				lightCam.translation.copy(light.translation);
				if (light.shadowSettings.projection === 'Perspective') {
					lightCam.lookAt(Vector3.ZERO, Vector3.UNIT_Y);
				}

				if (this.currentState !== light.shadowSettings.projection) {
					this.currentState = light.shadowSettings.projection;
					if (light.shadowSettings.projection === 'Perspective') {
						lightCam.setFrustumPerspective(light.shadowSettings.fov, 1, light.shadowSettings.near, light.shadowSettings.far);
					} else if (light.shadowSettings.projection === 'Parallel') {
						var radius = light.shadowSettings.size;
						lightCam.setFrustum(light.shadowSettings.near, light.shadowSettings.far, -radius, radius, radius, -radius);
						lightCam.projectionMode = Camera.Parallel;
						lightCam.update();
					}
				}

				lightCam.onFrameChange();

				this.oldClearColor.copy(renderer.clearColor);
				renderer.setClearColor(this.shadowClearColor.r, this.shadowClearColor.g,
					this.shadowClearColor.b, this.shadowClearColor.a);

				renderer.overrideMaterial = this.depthMaterial;
				renderer.render(renderList, lightCam, [], this.shadowTarget, true, true);
				renderer.overrideMaterial = null;

				switch (light.shadowSettings.type) {
					case 'Blur':
						this.fullscreenPass.material.shader = this.downsample;
						this.fullscreenPass.render(renderer, this.shadowTargetDown, this.shadowTarget, 0);
						this.fullscreenPass.render(renderer, this.shadowTargetDown2, this.shadowTargetDown, 0);
						this.fullscreenPass.material.shader = this.boxfilter;
						this.fullscreenPass.render(renderer, this.shadowBlurred, this.shadowTargetDown2, 0);
						this.shadowResult = this.shadowBlurred;
						break;
					case 'None':
						this.shadowResult = this.shadowTarget;
						break;
					default:
						this.shadowResult = this.shadowBlurred;
						break;
				}

				renderer.setClearColor(this.oldClearColor.r, this.oldClearColor.g, this.oldClearColor.b, this.oldClearColor.a);
				renderer.shadowCount++;
			}
		}
	};

	return ShadowHandler;
});