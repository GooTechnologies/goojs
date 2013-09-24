define([],
/** @lends */
function () {
	"use strict";

	function LinearInterpolator(data) {
		this.data = data;
		this.lastKey = 0;
		this.minTime = this.getMinTime(data);
		this.maxTime = this.getMaxTime(data);
	}

	LinearInterpolator.prototype.getMinTime = function() {
		var firstIndex = 0;
		return this.data[firstIndex].time;
	};

	LinearInterpolator.prototype.getMaxTime = function() {
		var lastIndex = this.data.length - 1;
		return this.data[lastIndex].time;
	};

	LinearInterpolator.prototype.getKeyBefore = function(time) {
		// if time > this.data[this.lastkey].time do a linear search
		// else do a binary search from the beginning

		//for (this.lastKey = 0; this.data[this.lastKey].time <= time; this.lastKey++) ;
		//this.lastKey--;

		if (time > this.data[this.lastKey].time) {
			for (; this.data[this.lastKey].time <= time; this.lastKey++) ;
			this.lastKey--;
		} else {
			for (this.lastKey = 0; this.data[this.lastKey].time <= time; this.lastKey++) ;
			this.lastKey--;
		}

		return this.lastKey;
	};

	LinearInterpolator.prototype.getAt = function(time) {
		if (this.data.length === 1) return this.data[0].value;

		if (time < this.minTime) return this.data[0].value;
		if (time > this.maxTime) return this.data[this.data.length - 1].value;

		var keyBefore = this.getKeyBefore(time);
		var keyAfter = keyBefore + 1;

		var timeBefore = this.data[keyBefore].time;
		var timeAfter = this.data[keyAfter].time;

		var fraction = (time - timeBefore) / (timeAfter - timeBefore);

		var interpolatedValue = fraction * this.data[keyAfter].value + (1 - fraction) * this.data[keyBefore].value;

		return interpolatedValue;
	};

	return LinearInterpolator;
});