define([
	'goo/entities/Entity',
	'goo/math/Transform'
],
/** @lends */
function (
	Entity,
	Transform
) {

	'use strict';

	/**
	 * @class
	 */
	function RenderInfo(parameters) {
		parameters = parameters || {};
		this.lights = typeof(parameters.lights) !== 'undefined' ? parameters.lights : null;
		this.materials = typeof(parameters.materials) !== 'undefined' ? parameters.materials : null;
		this.meshData = typeof(parameters.meshData) !== 'undefined' ? parameters.meshData : null;
		this.camera = typeof(parameters.camera) !== 'undefined' ? parameters.camera : null;
		this.mainCamera = typeof(parameters.mainCamera) !== 'undefined' ? parameters.mainCamera : null;
		this.lights = typeof(parameters.lights) !== 'undefined' ? parameters.lights : null;
		this.shadowHandler = typeof(parameters.shadowHandler) !== 'undefined' ? parameters.shadowHandler : null;
		this.renderer = typeof(parameters.renderer) !== 'undefined' ? parameters.renderer : null;
		this.material = typeof(parameters.material) !== 'undefined' ? parameters.material : null;
		this.transform = typeof(parameters.transform) !== 'undefined' ? parameters.transform : null;
		this.currentPose = typeof(parameters.currentPose) !== 'undefined' ? parameters.currentPose : null;
	}

	RenderInfo.prototype.reset = function () {
		this.lights = null;
		this.materials = null;
		this.meshData = null;
		this.camera = null;
		this.mainCamera = null;
		this.lights = null;
		this.shadowHandler = null;
		this.renderer = null;
		this.material = null;
		this.transform = null;
		this.currentPose = null;
	};

	RenderInfo.prototype.fill = function (renderable) {
		if (renderable instanceof Entity) {
			this.meshData = renderable.meshDataComponent.meshData;
			this.materials = renderable.meshRendererComponent.materials;
			this.transform = renderable.particleComponent ? Transform.IDENTITY : renderable.transformComponent.worldTransform;
			if (renderable.meshDataComponent.currentPose) {
				this.currentPose = renderable.meshDataComponent.currentPose;
			} else {
				this.currentPose = null;
			}
		} else {
			this.meshData = renderable.meshData;
			this.materials = renderable.materials;
			this.transform = renderable.transform;
			if (renderable.currentPose) {
				this.currentPose = renderable.currentPose;
			} else {
				this.currentPose = null;
			}
		}

		this.renderable = renderable;
	};

	return RenderInfo;
});