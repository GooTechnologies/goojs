define(['goo/animation/clip/JointData', 'goo/animation/clip/TransformData'], function(JointData, TransformData) {
	"use strict";

	/**
	 * @name SimpleAnimationApplier
	 * @class Very simple applier. Just applies joint transform data, calls any callbacks and updates the pose's global transforms.
	 */
	function SimpleAnimationApplier() {
		// map of key -> function(SkeletonPost, AnimationManager)
		this._triggerCallbacks = {};
	}

	/**
	 * @description Apply the current status of the manager to non-skeletal assets.
	 * @param entityManager the entityManager we will use to find entities to animate. if null or undefined, this method is NOOP.
	 * @param manager the animation manager to pull state from.
	 */
	SimpleAnimationApplier.prototype.apply = function(entityManager, manager) {
		if (!entityManager) {
			return;
		}
		var data = manager.getCurrentSourceData();

		// cycle through, pulling out and applying those we know about
		if (data) {
			for ( var key in data) {
				var value = data[key];
				if (value instanceof JointData) { // ignore
				} else if (value instanceof TransformData) {
					var applyTo = entityManager.getEntityByName(key);
					if (applyTo && applyTo.transformComponent) {
						value.applyTo(applyTo.transformComponent);
					}
				}
			}
		}
	};

	SimpleAnimationApplier.prototype.applyTo = function(applyToPose, manager) {
		var data = manager.getCurrentSourceData();

		// cycle through, pulling out and applying those we know about
		if (data) {
			for ( var key in data) {
				var value = data[key];
				if (value instanceof JointData) {
					if (value._jointIndex >= 0) {
						value.applyTo(applyToPose._localTransforms[value._jointIndex]);
					}
				} else if (value instanceof TriggerData) {
					if (value.isArmed()) {
						// pull callback(s) for the current trigger key, if exists, and call.
						for ( var i = 0, maxI = value._currentTriggers.length; i < maxI; i++) {
							var callbacks = this._triggerCallbacks[value._currentTriggers[i]];
							for ( var j = 0, maxJ = callbacks.length; j < maxJ; j++) {
								callbacks[j](applyToPose, manager);
							}
						}
						trigger.setArmed(false);
					}
				}
			}

			applyToPose.updateTransforms();
		}
	};

	return SimpleAnimationApplier;
});