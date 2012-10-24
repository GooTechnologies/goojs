"use strict";

define(function() {
	// REVIEW: What is the point of this class?
	function BufferData(data, target) {
		this.data = data;

		this.target = target;

		this._dataRefs = new Hashtable();
		this._dataUsage = 'StaticDraw';
		this._dataNeedsRefresh = false;
	}

	return BufferData;
});