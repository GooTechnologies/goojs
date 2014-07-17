define(
	/** @lends */
	function () {
	'use strict';

	/**
	 * @class Simple latch with callback
	 * @param {Number} count Latch counter start
	 * @param {object} callback Callback functions to fire during progress and when done
	 * @param {function()} callback.done
	 * @param {function(latchesLeft)} callback.progress
	 */
	function Latch(count, callback) {
		this.count = count;
		this.callback = callback;
	}

	/** Counts down the latch. Calls done callback if latch is finished, otherwise progress callback with number of latches left.
	*/
	Latch.prototype.countDown = function () {
		this.count--;
		if (this.isDone() && this.callback && this.callback.done) {
			this.callback.done();
		} else if (this.callback && this.callback.progress) {
			this.callback.progress(this.count);
		}
	};

	Latch.prototype.isDone = function () {
		return this.count === 0;
	};

	return Latch;
});