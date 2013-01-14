define(
	/** @lends EntityManager */
	function () {
	"use strict";

	/**
	 * @class Main handler of all entities in the world.
	 */
	function EntityManager() {
		this.type = 'EntityManager';

		this._entities = {};
	}

	EntityManager.prototype.added = function (entity) {
		this._entities[entity.id] = entity;
	};

	EntityManager.prototype.removed = function (entity) {
		delete this._entities[entity.id];
	};

	/**
	 * Checks if an entity exists
	 *
	 * @param entity Entity to check for
	 * @returns {Boolean} true if the entity exists
	 */
	EntityManager.prototype.containsEntity = function (entity) {
		return this._entities[entity.id] !== undefined;
	};

	/**
	 * Retrieve an entity based on an id
	 *
	 * @param id Id to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	EntityManager.prototype.getEntityById = function (id) {
		return this._entities[id];
	};

	/**
	 * Retrieve an entity based on its name
	 *
	 * @param name Name to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	EntityManager.prototype.getEntityByName = function (name) {
		for (var key in this._entities) {
			var entity = this._entities[key];
			if (entity.name === name) {
				return entity;
			}
		}
		return undefined;
	};

	/**
	 * Get all entities in the world as an array
	 *
	 * @returns {Array} Array containing all entities in the world
	 */
	EntityManager.prototype.getEntities = function () {
		var entities = [];
		for (var key in this._entities) {
			entities.push(this._entities[key]);
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
		for (var key in this._entities) {
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