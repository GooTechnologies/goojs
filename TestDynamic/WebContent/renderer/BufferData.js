define(function() {
	function BufferData(data, target) {
		this.data = data;

		this._target = target;

		this._dataRefs = {};
		this._dataUsage = Usage.StaticDraw;
		this._dataNeedsRefresh = false;
	}

	BufferData.prototype.added = function(entity) {
		this._entities[entity.id] = entity;
	};

	return BufferData;
});