define(
	/** @lends */
	function () {
	"use strict";

	/**
	 * @class Main handler of all entities in the world.
	 */
	function FastEntityManager() {
		this.type = 'EntityManager';

		this._entitiesById = [];
		console.log('aaaaaaaaaa');
	}

	FastEntityManager.prototype.added = function (entity) {
		if (!this.containsEntity(entity)) {
			this._entitiesById[entity.id] = entity;
		}
	};

	FastEntityManager.prototype.removed = function (entity) {
		if (this.containsEntity(entity)) {
			delete this._entitiesById[entity.id];
		}
	};

	/**
	 * Checks if an entity exists
	 *
	 * @param entity Entity to check for
	 * @returns {Boolean} true if the entity exists
	 */
	FastEntityManager.prototype.containsEntity = function (entity) {
		return this._entitiesById[entity.id] !== undefined;
	};

	/**
	 * Retrieve an entity based on an id
	 *
	 * @param id Id to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	FastEntityManager.prototype.getEntityById = function (id) {
		return this._entitiesById[id];
	};

	/**
	 * Retrieve an entity based on its name
	 *
	 * @param name Name to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	FastEntityManager.prototype.getEntityByName = function (name) {
		for(var i in this._entitiesById) {
			var entity = this._entitiesById[i];
			if (entity.name === name) {
				return entity;
			}
		}
	};

	/**
	 * Get all entities in the world
	 *
	 * @returns {Array} Array containing all entities in the world
	 */
	FastEntityManager.prototype.getEntities = function () {
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
	FastEntityManager.prototype.getTopEntities = function () {
		var entities = [];
		for (var i in this._entitiesById) {
			var entity = this._entitiesById[i];
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

	return FastEntityManager;
});