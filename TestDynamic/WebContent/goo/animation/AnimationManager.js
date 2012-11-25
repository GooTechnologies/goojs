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
		var globalTime = _globalTimer.getTimeInSeconds();

		// check throttle
		if (_updateRate != 0.0) {
			if (globalTime - _lastUpdate < _updateRate) {
				return;
			}

			// we subtract a bit to maintain our desired rate, even if there are some gc pauses, etc.
			_lastUpdate = globalTime - (globalTime - _lastUpdate) % _updateRate;
		}

		// move the time forward on the layers
		for ( var i = 0; i < _layers.size(); ++i) {
			var layer = _layers.get(i);
			var state = layer.getCurrentState();
			if (state != null) {
				state.update(globalTime, layer);
			}
		}

		// call apply on blend module, passing in pose
		if (!_applyToPoses.isEmpty()) {
			for ( var i = 0; i < _applyToPoses.size(); ++i) {
				var pose = _applyToPoses.get(i);
				_applier.applyTo(pose, this);
			}
		}

		// apply for non-pose related assets
		_applier.apply(_sceneRoot, this);

		// post update to clear states
		for ( var i = 0; i < _layers.size(); ++i) {
			var layer = _layers.get(i);
			var state = layer.getCurrentState();
			if (state != null) {
				state.postUpdate(layer);
			}
		}
	};

	return AnimationManager;
});