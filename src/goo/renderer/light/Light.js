define([
	'goo/math/Vector3'
], function (
	Vector3
) {
	'use strict';

	/**
	 * A plain light source in the scene, to be handled by shaders<br>
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/renderer/light/Lights-vtest.html Working example
	 * @param {Vector3} [color=(1, 1, 1)] The color of the light
	 */
	function Light(color) {
		/**
		 * The light's translation in world space
		 * @type {Vector3}
		 */
		this.translation = new Vector3();

		/**
		 * The color of the light
		 * @type {Vector3}
		 */
		this.color = color ? color.clone() : new Vector3(1, 1, 1);

		/**
		 * The intensity of the light (typically between 0 and 1)
		 * @type {number}
		 */
		this.intensity = 1;

		/**
		 * The specular intensity of the light (typically between 0 and 1)
		 * @type {number}
		 */
		this.specularIntensity = 1;

		/**
		 * Dictates wether this light will 'cast' shadows or not
		 * @type {boolean}
		 * @default
		 */
		this.shadowCaster = false;

		/**
		 * By default lights shine a single color on surfaces. If however this parameter is used then the light will project a texture (called 'light cookie') on surfaces. The light cookie will be multiplied with the color of the light
		 * @type {null}
		 */
		this.lightCookie = null;

		/**
		 * @type {Object}
		 * @property {number} size 2000
		 * @property {number} near 1
		 * @property {number} far 1000
		 * @property {Array<number>} resolution 512x512
		 * @property {Vector3} upVector UNIT_Y
		 * @property {number} darkness Shadow contribution
		 * @property {string} shadowType Possible values 'VSM' = Variance Shadow Maps, 'PCF' = Percentage Closer Filtering, 'Basic' = No filtering
		 */
		this.shadowSettings = {
			size: 100,
			near: 1,
			far: 1000,
			resolution: [512, 512],
			upVector: Vector3.UNIT_Y.clone(),
			darkness: 1.0,
			shadowOffset: 0.96,
			shadowType: 'VSM'
		};
		//! AT: please extract this in its own class

		this.changedProperties = false;
		this.changedColor = false;
	}

	Light.prototype.destroy = function (renderer) {
		var shadowSettings = this.shadowSettings;
		if (shadowSettings.shadowData) {
			if (shadowSettings.shadowData.shadowTarget) {
				shadowSettings.shadowData.shadowTarget.destroy(renderer.context);
			}
			if (shadowSettings.shadowData.shadowTargetDown) {
				shadowSettings.shadowData.shadowTargetDown.destroy(renderer.context);
			}
			if (shadowSettings.shadowData.shadowBlurred) {
				shadowSettings.shadowData.shadowBlurred.destroy(renderer.context);
			}
		}
		delete shadowSettings.shadowData;
	};

	// should be overridable by light type (some may have more/less allocated resources)
	Light.prototype.invalidateHandles = function (renderer) {
		var shadowSettings = this.shadowSettings;
		if (shadowSettings.shadowData) {
			if (shadowSettings.shadowData.shadowTarget) {
				renderer.invalidateRenderTarget(shadowSettings.shadowData.shadowTarget);
			}
			if (shadowSettings.shadowData.shadowTargetDown) {
				renderer.invalidateRenderTarget(shadowSettings.shadowData.shadowTargetDown);
			}
			if (shadowSettings.shadowData.shadowBlurred) {
				renderer.invalidateRenderTarget(shadowSettings.shadowData.shadowBlurred);
			}
		}
	};

	Light.prototype.copy = function (source) {
		this.translation.copy(source.translation);
		this.color.copy(source.color);
		this.intensity = source.intensity;
		this.specularIntensity = source.specularIntensity;
		this.shadowCaster = source.shadowCaster;

		if (source.lightCookie) {
			this.lightCookie = source.lightCookie.clone();
		}

		this.shadowSettings.size = source.shadowSettings.size;
		this.shadowSettings.near = source.shadowSettings.near;
		this.shadowSettings.far = source.shadowSettings.far;
		this.shadowSettings.resolution[0] = source.shadowSettings.resolution[0];
		this.shadowSettings.resolution[1] = source.shadowSettings.resolution[1];
		this.shadowSettings.upVector.copy(source.shadowSettings.upVector);
		this.shadowSettings.darkness = source.shadowSettings.darkness;
		this.shadowSettings.shadowType = source.shadowSettings.shadowType;

		// since these are brand new they should probably be whatever value they are set in the constructor
		this.changedProperties = source.changedProperties; // false?
		this.changedColor = source.changedColor; // false?

		return this;
	};

	return Light;
});