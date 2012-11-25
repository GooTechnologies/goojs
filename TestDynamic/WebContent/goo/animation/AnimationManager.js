define(['goo/math/Transform'], function(Transform) {
	"use strict";

	/**
	 * @name AnimationManager
	 * @class The purpose of this class is to hold additional information regarding a typedarray buffer, like vbo 'usage' flags
	 * @param {ArrayBuffer} data Data to wrap
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function AnimationManager(globalTimer, pose) {
		this.globalTimer = globalTimer;

		this.layers = [];
		this.applier = null; // animationapplier

		this.updateRate = 1.0 / 60.0;
		this.lastUpdate = 0.0;

		// add our base layer
		var layer = new AnimationLayer(AnimationLayer.BASE_LAYER_NAME);
		layer.setManager(this);
		this.layers.push(layer);

		this.applyToPoses = [];
		if (pose) {
			this.applyToPoses.push(pose);
		}

		// this.valuesStore.setLogOnReplace(false);
		// this.valuesStore.setDefaultValue(0.0);
	}

	AnimationManager.prototype.update = function() {
		// grab current global time
		var globalTime = this.globalTimer.getTimeInSeconds();

		// check throttle
		if (this.updateRate != 0.0) {
			if (globalTime - this.lastUpdate < this.updateRate) {
				return;
			}

			// we subtract a bit to maintain our desired rate, even if there are some gc pauses, etc.
			this.lastUpdate = globalTime - (globalTime - this.lastUpdate) % this.updateRate;
		}

		// move the time forward on the layers
		for ( var i = 0; i < this.layers.length; ++i) {
			var layer = this.layers[i];
			var state = layer.getCurrentState();
			if (state != null) {
				state.update(globalTime, layer);
			}
		}

		// call apply on blend module, passing in pose
		if (this.applyToPoses.length > 0) {
			for ( var i = 0; i < this.applyToPoses.length; ++i) {
				var pose = this.applyToPoses[i];
				this.applier.applyTo(pose, this);
			}
		}

		// apply for non-pose related assets
		// this.applier.apply(S_sceneRoot, this);

		// post update to clear states
		for ( var i = 0; i < this.layers.length; ++i) {
			var layer = this.layers[i];
			var state = layer.getCurrentState();
			if (state != null) {
				state.postUpdate(layer);
			}
		}
	};

	return AnimationManager;
});