function AbstractTimelineChannel(id) {
	this.id = id;
	this.enabled = true;

	this.keyframes = [];
	this.lastTime = 0;
}

/**
 * Searching for the entry that is previous to the given time
 * @private
 * @param sortedArray
 * @param time
 */
//! AT: could convert into a more general ArrayUtils.pluck and binary search but that creates extra arrays
AbstractTimelineChannel.prototype._find = function (sortedArray, time) {
	var start = 0;
	var end = sortedArray.length - 1;
	var lastTime = sortedArray[sortedArray.length - 1].time;

	if (time > lastTime) { return end; }

	while (end - start > 1) {
		var mid = Math.floor((end + start) / 2);
		var midTime = sortedArray[mid].time;

		if (time > midTime) {
			start = mid;
		} else {
			end = mid;
		}
	}

	return start;
};

/**
 * Called only when mutating the start times of entries to be sure that the order is kept
 * @private
 */
AbstractTimelineChannel.prototype.sort = function () {
	this.keyframes.sort(function (a, b) {
		return a.time - b.time;
	});
	this.lastTime = this.keyframes[this.keyframes.length - 1].time;

	return this;
};

module.exports = AbstractTimelineChannel;