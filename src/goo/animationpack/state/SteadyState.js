define([
	'goo/animationpack/state/AbstractState'
], function (
	AbstractState
) {
	'use strict';

	/**
	 * A "steady" state is an animation state that is concrete and stand-alone (vs. a state that handles transitioning between two states, for example.)
	 * @extends AbstractState
	 * @param {string} name Name of state
	 */
	function SteadyState(name) {
		AbstractState.call(this);

		this.id = null;
		this._name = name;
		this._transitions = {};
		this._sourceTree = null;
	}

	SteadyState.prototype = Object.create(AbstractState.prototype);
	SteadyState.prototype.constructor = SteadyState;

	/**
	 * Sets the clipsource of the steadystate
	 * @param {ClipSource|BinaryLERPSource|FrozenClipSource|ManagedTransformSource} clipSource
	 */
	SteadyState.prototype.setClipSource = function (clipSource) {
		this._sourceTree = clipSource;
	};

	/*
	 * Updates the states clip instances
	 */
	SteadyState.prototype.update = function (globalTime) {
		if (!this._sourceTree.setTime(globalTime)) {
			if (this.onFinished) {
				this.onFinished();
			}
		}
	};

	/*
	 * Gets the current animation data, used in {@link AnimationLayer}
	 */
	SteadyState.prototype.getCurrentSourceData = function () {
		return this._sourceTree.getSourceData();
	};

	/*
	 * Resets the animationclips in the sourcetree
	 * @param {number} globalStartTime Usually current time
	 */
	SteadyState.prototype.resetClips = function (globalStartTime) {
		AbstractState.prototype.resetClips.call(this, globalStartTime);
		this._sourceTree.resetClips(globalStartTime);
	};

	SteadyState.prototype.shiftClipTime = function (shiftTime) {
		AbstractState.prototype.shiftClipTime.call(this, shiftTime);
		this._sourceTree.shiftClipTime(shiftTime);
	};

	SteadyState.prototype.setTimeScale = function (timeScale) {
		this._sourceTree.setTimeScale(timeScale);
	};

	SteadyState.prototype.clone = function () {
		var cloned = new SteadyState(this._name);

		for (var key in this._transitions) {
			cloned._transitions[key] = this._transitions[key];
		}

		cloned._sourceTree = this._sourceTree.clone();
		 cloned._sourceTree._name = this._sourceTree.name;
		return cloned;
	};

	return SteadyState;
});