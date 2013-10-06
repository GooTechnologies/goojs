define(
	/** @lends */
	function () {
	"use strict";

	/**
	 * @class Main handler of all entities in the world.
	 */
	function EntityManager() {
		this.type = 'EntityManager';

		this._entitiesById = [];
		this._entityCount = 0;
	}

	EntityManager.prototype.added = function (entity) {
		if (!this.containsEntity(entity)) {
			this._entitiesById[entity.id] = entity;
			this._entityCount++;
		}
	};

	EntityManager.prototype.removed = function (entity) {
		if (this.containsEntity(entity)) {
			delete this._entitiesById[entity.id];
			this._entityCount--;
		}
	};

	/**
	 * Checks if an entity exists
	 *
	 * @param entity Entity to check for
	 * @returns {Boolean} true if the entity exists
	 */
	EntityManager.prototype.containsEntity = function (entity) {
		return this._entitiesById[entity.id] !== undefined;
	};

	/**
	 * Retrieve an entity based on an id
	 *
	 * @param id Id to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	EntityManager.prototype.getEntityById = function (id) {
		return this._entitiesById[id];
	};

	/**
	 * Retrieve an entity based on its name
	 *
	 * @param name Name to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	EntityManager.prototype.getEntityByName = function (name) {
		for(var i in this._entitiesById) {
			var entity = this._entitiesById[i];
			if (entity.name === name) {
				return entity;
			}
		}
	};

	/**
	 * Get the number of entities currently indexed by the Entity Manager
	 *
	 * @returns {number}
	 */
	EntityManager.prototype.size = function () {
		return this._entityCount;
	};

	/**
	 * Get all entities in the world
	 *
	 * @returns {Array} Array containing all entities in the world
	 */
	EntityManager.prototype.getEntities = function () {
		var entities = [];
		for(var i in this._entitiesById) {
			entities.push(this._entitiesById[i]);
		}
		return entities;
	};

	/**
	 * Get all entities on top level based on the transform scenegraph
	 *
	 * @returns {Array} Array containing all top entities
	 */
	EntityManager.prototype.getTopEntities = function () {
		var entities = [];
		for (var i in this._entitiesById) {
			var entity = this._entitiesById[i];
			if (!entity.parent) {
				entities.push(entity);
			}
		}
		return entities;
	};

	return EntityManager;
});