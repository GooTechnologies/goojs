"use strict";

define(function() {
	function BufferData(data, target) {
		this.data = data;

		this.target = target;

		this._dataRefs = new Hashtable();
		this._dataUsage = 'StaticDraw';
		this._dataNeedsRefresh = false;
	}

	return BufferData;
});