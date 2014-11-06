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
	function RenderInfo() {
		this.reset();
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