define([
	'goo/entities/components/Component',
	'goo/entities/World',
	'goo/animation/layer/AnimationLayer',
	'goo/animation/clip/JointData',
	'goo/animation/clip/TransformData',
	'goo/animation/clip/TriggerData'
],
/** @lends */
function (
	Component,
	World,
	AnimationLayer,
	JointData,
	TransformData,
	TriggerData
) {
	"use strict";

	/**
	 * @class Holds the animation data.
	 */
	function AnimationComponent() {
		this.type = 'AnimationComponent';
		this.layers = [];

		this._updateRate = 1.0 / 60.0;
		this._lastUpdate = 0.0;
		this._triggerCallbacks = {};

		// Base layer
		var layer = new AnimationLayer(AnimationLayer.BASE_LAYER_NAME);
		this.layers.push(layer);
	}

	AnimationComponent.prototype = Object.create(Component.prototype);


	AnimationComponent.prototype.doTransition = function(key) {
		this.layers[0].doTransition(key);
	};

	/**
	 * Update animations
	 */
	AnimationComponent.prototype.update = function (globalTime) {
		// grab current global time
		var globalTime = globalTime || World.time;

		// check throttle
		if (this._updateRate !== 0.0) {
			if (globalTime - this._lastUpdate < this._updateRate) {
				return;
			}

			// we subtract a bit to maintain our desired rate, even if there are some gc pauses, etc.
			this._lastUpdate = globalTime - (globalTime - this._lastUpdate) % this._updateRate;
		}

		// move the time forward on the layers
		for ( var i = 0, max = this.layers.length; i < max; i++) {
			this.layers[i].update(globalTime);
		}
	};

	AnimationComponent.prototype.apply = function(transformComponent, pose) {
		var data = this.getCurrentSourceData();

		// cycle through, pulling out and applying those we know about
		if (data) {
			for ( var key in data) {
				var value = data[key];
				if (value instanceof JointData) {
					if (pose && value._jointIndex >= 0) {
						value.applyTo(pose._localTransforms[value._jointIndex]);
					}
				} else if (value instanceof TransformData) {
					if (transformComponent) {
						value.applyTo(transformComponent.transform);
						transformComponent.updateTransform();
						this._updateWorldTransform(transformComponent);
					}
				} else if (value instanceof TriggerData) {
					if (value.armed) {
						// pull callback(s) for the current trigger key, if exists, and call.
						for ( var i = 0, maxI = value._currentTriggers.length; i < maxI; i++) {
							var callbacks = this._triggerCallbacks[value._currentTriggers[i]];
							for ( var j = 0, maxJ = callbacks.length; j < maxJ; j++) {
								callbacks[j]();
							}
						}
						value.armed = false;
					}
				}
			}
			if (pose) {
				pose.updateTransforms();
			}
		}
	};

	AnimationComponent.prototype._updateWorldTransform = function(transformComponent) {
		transformComponent.updateWorldTransform();

		for (var i = 0; i < transformComponent.children.length; i++) {
			this._updateWorldTransform(transformComponent.children[i]);
		}
	};

	AnimationComponent.prototype.postUpdate = function() {
		// post update to clear states
		for ( var i = 0, max = this.layers.length; i < max; i++) {
			this.layers[i].postUpdate();
		}
	};

	AnimationComponent.prototype.getCurrentSourceData = function () {
		// set up our layer blending.
		var last = this.layers.length - 1;
		for ( var i = 0; i < last; i++) {
			this.layers[i + 1].updateLayerBlending(this.layers[i]);
		}
		return this.layers[last].getCurrentSourceData();
	};

	AnimationComponent.prototype.addLayer = function (layer, index) {
		if (!isNaN(index)) {
			this.layers.splice(index, 0, layer);
		} else {
			this.layers.push(layer);
		}
	};


	return AnimationComponent;
});