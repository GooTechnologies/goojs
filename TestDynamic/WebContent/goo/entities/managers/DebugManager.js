define(function() {
	"use strict";

	function DebugManager() {
		this.type = 'DebugManager';

		this._entities = {};
	}

	DebugManager.prototype.added = function(entity) {
		this._entities[entity.id] = entity;
	};

	DebugManager.prototype.removed = function(entity) {
		delete this._entities[entity.id];
	};

	DebugManager.prototype.getEntities = function() {
		var entities = [];
		for (key in this._entities) {
			entities.push(this._entities[key]);
		}
		return entities;
	};

	return DebugManager;
});