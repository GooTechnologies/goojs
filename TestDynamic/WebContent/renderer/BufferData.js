define(function() {
	function BufferData(data, target) {
		this.data = data;

		this._target = target;

		this._dataRefs = {};
		this._dataUsage = 'StaticDraw';
		this._dataNeedsRefresh = false;
	}

	return BufferData;
});