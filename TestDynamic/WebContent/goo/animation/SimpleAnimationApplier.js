define(['goo/animation/JointData'], function(JointData) {
	"use strict";

	/**
	 * @name SimpleAnimationApplier
	 * @class Very simple applier. Just applies joint transform data, calls any callbacks and updates the pose's global transforms.
	 */
	function SimpleAnimationApplier() {
		this.triggerCallbacks = [];
		this.spatialCache = {};
	}

	SimpleAnimationApplier.prototype.apply = function(root, manager) {
		if (root === null) {
			return;
		}
		var data = manager.getCurrentSourceData();

		// cycle through, pulling out and applying those we know about
		if (data != null) {
			for ( var key in data) {
				var value = data[key];
				if (value instanceof JointData) { // ignore
				} else if (value instanceof TransformData) {
					var transformData = value;
					var applyTo = findChild(root, key);
					if (applyTo != null) {
						transformData.applyTo(applyTo);
					}
				}
			}
		}
	};

	SimpleAnimationApplier.prototype.findChild = function(root, key) {
		if (this.spatialCache[key]) {
			return this.spatialCache[key];
		}
		if (key.equals(root.getName())) {
			this.spatialCache[key] = root;
			return root;
		} else if (root instanceof Node) {
			var spat = root.getChild(key);
			if (spat != null) {
				this.spatialCache[key] = spat;
				return spat;
			}
		}
		return null;
	};

	SimpleAnimationApplier.prototype.applyTo = function(applyToPose, manager) {
		var data = manager.getCurrentSourceData();

		// cycle through, pulling out and applying those we know about
		if (data !== null) {
			for ( var key in data) {
				var value = data[key];
				if (value instanceof JointData) {
					if (value._jointIndex >= 0) {
						value.applyTo(applyToPose.localTransforms[value._jointIndex]);
					}
				} else if (value instanceof TriggerData) {
					if (value.isArmed()) {
						// pull callback(s) for the current trigger key, if exists, and call.
						for ( var curTrig in value.getCurrentTriggers()) {
							for ( var cb in this.triggerCallbacks[curTrig]) {
								cb.doTrigger(applyToPose, manager);
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