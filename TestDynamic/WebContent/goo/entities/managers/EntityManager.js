"use strict";

define(function() {
	function EntityManager() {
		this.type = 'EntityManager';

		this._entities = {};
	}

	EntityManager.prototype.added = function(entity) {
		this._entities[entity.id] = entity;
	};

	EntityManager.prototype.removed = function(entity) {
		delete this._entities[entity.id];
	};

	EntityManager.prototype.contains = function(entity) {
		return this._entities[entity.id] != undefined;
	};

	EntityManager.prototype.getEntities = function() {
		var entities = [];
		for (key in this._entities) {
			entities.push(this._entities[key]);
		}
		return entities;
	};

	return EntityManager;
});