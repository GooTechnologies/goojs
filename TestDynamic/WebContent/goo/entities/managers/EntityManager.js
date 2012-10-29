define(function() {
	"use strict";

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

	EntityManager.prototype.containsEntity = function(entity) {
		return this._entities[entity.id] !== undefined;
	};

	EntityManager.prototype.getEntityById = function(id) {
		return this._entities[id];
	};

	EntityManager.prototype.getEntityByName = function(name) {
		for ( var key in this._entities) {
			var entity = this._entities[key];
			if (entity.name === name) {
				return entity;
			}
		}
		return undefined;
	};

	EntityManager.prototype.getEntities = function() {
		var entities = [];
		for ( var key in this._entities) {
			entities.push(this._entities[key]);
		}
		return entities;
	};

	EntityManager.prototype.getTopEntities = function() {
		var entities = [];
		for ( var key in this._entities) {
			var entity = this._entities[key];
			if (entity.transformComponent) {
				if (!entity.transformComponent.parent) {
					entities.push(entity);
				}
			} else {
				entities.push(entity);
			}
		}
		return entities;
	};

	return EntityManager;
});