define(function () {
	"use strict";

	/**
	 * @name DebugManager
	 * @class Simple manager for keeping a list of all current entities
	 */
	function DebugManager() {
		this.type = 'DebugManager';

		this._entities = {};
	}

	DebugManager.prototype.added = function (entity) {
		this._entities[entity.id] = entity;
	};

	DebugManager.prototype.removed = function (entity) {
		delete this._entities[entity.id];
	};

	DebugManager.prototype.getEntities = function () {
		var entities = [];
		for (var key in this._entities) {
			entities.push(this._entities[key]);
		}
		return entities;
	};

	return DebugManager;
});