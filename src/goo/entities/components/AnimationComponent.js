define([
	'goo/entities/components/Component',
	'goo/entities/World',
	'goo/animation/layer/AnimationLayer',
	'goo/animation/clip/JointData',
	'goo/animation/clip/TransformData',
	'goo/animation/clip/TriggerData',
	'goo/math/Matrix4x4'
],
/** @lends */
function (
	Component,
	World,
	AnimationLayer,
	JointData,
	TransformData,
	TriggerData,
	Matrix4x4
) {
	"use strict";

	/**
	 * @class Holds the animation data.
	 */
	function AnimationComponent(pose) {
		/**
		 * @type {string}
		 * @readonly
		 * @default
		 */
		this.type = 'AnimationComponent';
		/**
		 * @type {AnimationLayer[]}
		 */
		this.layers = [];
		this.floats = {};

		this._updateRate = 1.0 / 60.0;
		this._lastUpdate = 0.0;
		this._triggerCallbacks = {};

		// Base layer
		var layer = new AnimationLayer(AnimationLayer.BASE_LAYER_NAME);
		this.layers.push(layer);
		this._skeletonPose = pose;
	}

	AnimationComponent.prototype = Object.create(Component.prototype);

	/**
	 * Transition to another state. This is shorthand for applying transitions on the base layer, see {@link AnimationLayer.transitionTo} for more info
	 * @param {string} stateKey
	 * @returns {boolean} true if a transition was found and started
	 */
	AnimationComponent.prototype.transitionTo = function(stateKey) {
		return this.layers[0].transitionTo(stateKey);
	};
	/**
	 * Get available states
	 * returns {string[]} available state keys
	 */
	AnimationComponent.prototype.getStates = function() {
		return this.layers[0].getStates();
	};
	AnimationComponent.prototype.getCurrentState = function() {
		return this.layers[0].getCurrentState();
	};
	/**
	 * Get available transitions
	 * returns {string[]} available state keys
	 */
	AnimationComponent.prototype.getTransitions = function() {
		return this.layers[0].getTransitions();
	};

	/**
	 * Update animations
	 */
	AnimationComponent.prototype.update = function (globalTime) {
		// grab current global time
		var globalTime = globalTime || World.time;

		// check throttle
		if (this._updateRate !== 0.0) {
			if (globalTime > this._lastUpdate && globalTime - this._lastUpdate < this._updateRate) {
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

	/**
	 * Applying calculated animations to the concerned data
	 */
	AnimationComponent.prototype.apply = function(transformComponent) {
		var data = this.getCurrentSourceData();
		var pose = this._skeletonPose;

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
						// TODO: Integrate with GameMaker somehow
						// through the BUS!!!
						for ( var i = 0, maxI = value._currentTriggers.length; i < maxI; i++) {
							var callbacks = this._triggerCallbacks[value._currentTriggers[i]];
							if (callbacks && callbacks.length) {
								for ( var j = 0, maxJ = callbacks.length; j < maxJ; j++) {
									callbacks[j]();
								}
							}
						}
						value.armed = false;
					}
				} else if (value instanceof Array) {
					this.floats[key] = value[0];
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

	/**
	 * Called after the animations are applied
	 */
	AnimationComponent.prototype.postUpdate = function() {
		// post update to clear states
		for ( var i = 0, max = this.layers.length; i < max; i++) {
			this.layers[i].postUpdate();
		}
	};

	var tmpMatrix = new Matrix4x4();
	var tmpMatrix2 = new Matrix4x4();

	function getDefaults(datas, skeleton) {
		var keys = Object.keys(datas);
		for (var i = 0; i < keys.length; i++) {
			var data = datas[keys[i]];

			var cur = skeleton._joints[data._jointIndex];
			var parent = skeleton._joints[cur._parentIndex];

			Matrix4x4.invert(cur._inverseBindPose.matrix, tmpMatrix);

			if (parent) {
				Matrix4x4.combine(parent._inverseBindPose.matrix, tmpMatrix, tmpMatrix2);

				if (data._translation.data[0] === -1234) {
					data._translation.data[0] = tmpMatrix2.data[12];
				}
				if (data._translation.data[1] === -1234) {
					data._translation.data[1] = tmpMatrix2.data[13];
				}
				if (data._translation.data[2] === -1234) {
					data._translation.data[2] = tmpMatrix2.data[14];
				}
			} else {
				if (data._translation.data[0] === -1234) {
					data._translation.data[0] = tmpMatrix.data[12];
				}
				if (data._translation.data[1] === -1234) {
					data._translation.data[1] = tmpMatrix.data[13];
				}
				if (data._translation.data[2] === -1234) {
					data._translation.data[2] = tmpMatrix.data[14];
				}
			}
		}
	}

	/**
	 * Gets the current animation data for all layers blended together
	 */
	AnimationComponent.prototype.getCurrentSourceData = function () {
		// set up our layer blending.
		var last = this.layers.length - 1;
		for ( var i = 0; i < last; i++) {
			this.layers[i + 1].updateLayerBlending(this.layers[i]);
		}
		var ret = this.layers[last].getCurrentSourceData();

		getDefaults(ret, this._skeletonPose._skeleton);

		return ret;
	};

	/**
	 * Add a new {@link AnimationLayer} to the stack
	 * @param {AnimationLayer} layer
	 * @param {number} [index] if no index is supplied, it's put on top of the stack
	 */
	AnimationComponent.prototype.addLayer = function (layer, index) {
		if (!isNaN(index)) {
			this.layers.splice(index, 0, layer);
		} else {
			this.layers.push(layer);
		}
	};

	AnimationComponent.prototype.resetClips = function(globalTime) {
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].resetClips(globalTime);
		}
	};

	AnimationComponent.prototype.setTimeScale = function(timeScale) {
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].setTimeScale(timeScale);
		}
	};

	return AnimationComponent;
});