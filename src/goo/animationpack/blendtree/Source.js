define(function () {


	/**
	 * Class to use for animation sources. Base class - not supposed to be used directly.
	 */
	function Source() {}

	/**
	 */
	Source.prototype.getSourceData = function () {};

	/**
	 * Sets the current time and moves the {@link AnimationClipInstance} forward.
	 * @param {number} globalTime
	 * @returns {boolean} True to stay active - false to not stay active.
	 */
	Source.prototype.setTime = function (globalTime) {
		return true;
	};

	/**
	 * Sets start time. If set to current time, clip is reset
	 * @param {number} globalStartTime
	 */
	Source.prototype.resetClips = function (globalStartTime) {};

	/**
	 * @param {number} shiftTime
	 */
	Source.prototype.shiftClipTime = function (shiftTime) {};

	/**
	 * Sets the time scale for the source.
	 * @param {number} timeScale
	 */
	Source.prototype.setTimeScale = function (timeScale) {};

	/**
	 * @returns {boolean}
	 */
	Source.prototype.isActive = function () {
		return true;
	};

	/**
	 * @returns {Source}
	 */
	Source.prototype.clone = function () {};

	return Source;
});