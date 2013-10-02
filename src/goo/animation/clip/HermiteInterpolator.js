define([],
/** @lends */
function () {
	"use strict";

	function HermiteInterpolator(data) {
		this.data = data;
		this.lastKey = 0;
		this.minTime = this.getMinTime(data);
		this.maxTime = this.getMaxTime(data);
	}

	HermiteInterpolator.prototype.getMinTime = function() {
		if (this.data.length === 0) return 0;
		var firstIndex = 0;
		return this.data.length ? this.data[firstIndex].time : 0;
	};

	HermiteInterpolator.prototype.getMaxTime = function() {
		if (this.data.length === 0) return 0;
		var lastIndex = this.data.length - 1;
		return this.data.length ? this.data[lastIndex].time : 0;
	};

	HermiteInterpolator.prototype.getKeyBefore = function(time) {
		// if time > this.data[this.lastkey].time do a linear search
		// else do a binary search from the beginning
		// would that be faster? probably, but in rare circumstances when there are a lot of frames skipped

		if (time > this.data[this.lastKey].time) {
			for (; this.data[this.lastKey].time <= time; this.lastKey++) ;
			this.lastKey--;
		} else {
			for (this.lastKey = 0; this.data[this.lastKey].time <= time; this.lastKey++) ;
			this.lastKey--;
		}

		return this.lastKey;
	};

	HermiteInterpolator.prototype.getAt = function(time) {
		if (this.data.length === 1) return this.data[0].value;

		if (time < this.minTime) return this.data[0].value;
		if (time > this.maxTime) return this.data[this.data.length - 1].value;

		var keyBeforeIndex = this.getKeyBefore(time);
		var keyAfterIndex = keyBeforeIndex + 1;

		var keyBefore = this.data[keyBeforeIndex];
		var keyAfter = this.data[keyAfterIndex];

		// hermite interpolation starts here
		var dt = keyAfter.time - keyBefore.time;
		if( dt > 0 ) {
			var dts = dt;// / 1000;
			var t  = ( time - keyBefore.time ) / dt;
			var t2 = t * t;
			var t3 = t2 * t;
			var h1 =  2 * t3 - 3 * t2 + 1;
			var h2 = -2 * t3 + 3 * t2;
			var h3 = t3 - 2 * t2 + t;
			var h4 = t3 - t2;
			return h1 * keyBefore.value + h2 * keyAfter.value + h3 * keyBefore.tangentOut * dts + h4 * keyAfter.tangentIn * dts;
		}
		return keyAfter.value;
		//
	};

	return HermiteInterpolator;
});