define([
	'goo/math/Vector3',
	'goo/scripts/ScriptUtils',
	'goo/math/MathUtils'
], function(
	Vector3,
	ScriptUtils,
	MathUtils
) {
	'use strict';

	/**
	 * @class Enables a camera with parallel projection to zoom. Ideal for 2D view.
	 */
	function TwoDimCamControlScript() {

		var zoomDistanceFactor = 0.035;
		var size = 10;					// Current size
		var targetSize = size;			// Animation target size

		function setup(params, env) {
			setupMouseControls(params, env);
			env.targetSize = targetSize = env.size = size = params.size;
			env.smoothness = Math.pow(MathUtils.clamp(params.smoothness, 0, 1), 0.3);
			env.twoDimDirty = true;
		}

		function update(params, env) {
			if (!env.twoDimDirty) {
				return;
			}
			var entity = env.entity;
			var camera = entity.cameraComponent.camera;
			var delta = MathUtils.lerp(env.smoothness, 1, env.world.tpf);
			size = env.size = MathUtils.lerp(delta, size, targetSize);
			camera.setFrustum(1, 1000, -size, size, size, -size, 1);
			if(Math.abs(targetSize-size) < 0.00001){
				env.twoDimDirty = false;
			} else {
				env.twoDimDirty = true;
			}
		}

		// Removes all listeners
		function cleanup(params, env) {
			for (var event in env.listeners) {
				env.domElement.removeEventListener(event, env.listeners[event]);
			}
		}

		// Attaches the needed mouse event listeners
		function setupMouseControls(params, env) {
			// Define listeners
			var listeners = env.listeners = {
				mousewheel: function(event) {
					if (!params.whenUsed || env.entity === env.activeCameraEntity) {
						applyWheel(event, params, env);
					}
				},
			};
			listeners.DOMMouseScroll = listeners.mousewheel;

			// Attach listeners
			for (var event in listeners) {
				env.domElement.addEventListener(event, listeners[event]);
			}
		}

		// Applies the mousewheel event data
		function applyWheel(evt, params, env) {
			var delta = Math.max(-1, Math.min(1, -evt.wheelDelta || evt.detail));
			delta *= zoomDistanceFactor * targetSize;
			var amount = params.zoomSpeed * delta;
			targetSize = env.targetSize = MathUtils.clamp(targetSize + amount, params.minSize, params.maxSize);
			env.twoDimDirty = true;
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	/**
	 * @static
	 * @type {Object}
	 */
	TwoDimCamControlScript.externals = {
		name: 'TwoDimCamControlScript',
		description: 'Enables a camera with parallel projection to zoom.',
		parameters: [{
			key: 'whenUsed',
			'default': true,
			type: 'boolean'
		}, {
			key: 'zoomSpeed',
			'default': 1.0,
			type: 'float',
			scale: 0.1
		}, {
			key: 'smoothness',
			'default': 0,
			type: 'float',
			min: 0,
			max: 1,
			control: 'slider'
		}, {
			key: 'minSize',
			'default': 1,
			type: 'float',
			min: 0.01
		}, {
			key: 'size',
			'default': 100,
			type: 'float',
			min: 0.1
		}, {
			key: 'maxSize',
			'default': 1000,
			type: 'float',
			min: 1
		}]
	};

	return TwoDimCamControlScript;
});