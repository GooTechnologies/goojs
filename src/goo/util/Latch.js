define(
	/** @lends */
	function () {
	"use strict";

	/**
	 * @class Simple latch with callback
	 * @param {Number} count Latch counter start
	 * @param {Callback} callback Callback function to fire when latch is finished
	 */
	function Latch(count, callback) {
		this.count = count;
		this.callback = callback;
	}

	Latch.prototype.countDown = function () {
		this.count--;
		if (this.isDone() && this.callback.done) {
			this.callback.done();
		} else if (this.callback.progress) {
			this.callback.progress(this.count);
		}
	};

	Latch.prototype.isDone = function () {
		return this.count === 0;
	};

	return Latch;
});