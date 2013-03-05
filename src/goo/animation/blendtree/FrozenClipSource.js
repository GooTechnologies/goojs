define(
/** @lends FrozenTreeSource */
function () {
	"use strict";

	/**
	 * @class A blend tree node that does not update any clips or sources below it in the blend tree. This is useful for freezing an animation, often
	 *        for purposes of transitioning between two unrelated animations. Originally implemented BlendTreeSource.
	 * @param source Our sub source.
	 * @param frozenTime The time we are frozen at.
	 */
	function FrozenTreeSource (source, frozenTime) {
		this._source = source;
		this._time = frozenTime;
	}

	FrozenTreeSource.prototype.getSourceData = function (manager) {
		return this._source.getSourceData(manager);
	};

	// Was: function (manager, globalStartTime)
	FrozenTreeSource.prototype.resetClips = function (manager) {
		// ignores the command to reset our subtree
		this._source.resetClips(manager, 0);
	};

	FrozenTreeSource.prototype.setTime = function (globalTime, manager) {
		this._source.setTime(this._time, manager);
		return true;
	};

	// Was: function (manager)
	FrozenTreeSource.prototype.isActive = function () {
		return true;
	};

	return FrozenTreeSource;
});