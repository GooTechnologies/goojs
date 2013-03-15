define(
	/** @lends EntityManager */
	function () {
	"use strict";

	/**
	 * @class Main handler of all entities in the world.
	 */
	function EntityManager() {
		this.type = 'EntityManager';

		this._entities = [];
	}

	EntityManager.prototype.added = function (entity) {
		if (this._entities.indexOf(entity) === -1) {
			this._entities.push(entity);
		}
	};

	EntityManager.prototype.removed = function (entity) {
		var index = this._entities.indexOf(entity);
		if (index !== -1) {
			this._entities.splice(index, 1);
		}
	};

	/**
	 * Checks if an entity exists
	 *
	 * @param entity Entity to check for
	 * @returns {Boolean} true if the entity exists
	 */
	EntityManager.prototype.containsEntity = function (entity) {
		return this._entities.indexOf(entity) !== -1;
	};

	/**
	 * Retrieve an entity based on an id
	 *
	 * @param id Id to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	EntityManager.prototype.getEntityById = function (id) {
		for (var i = 0; i < this._entities.length; i++) {
			var entity = this._entities[i];
			if (entity.id === id) {
				return entity;
			}
		}
		return undefined;
	};

	/**
	 * Retrieve an entity based on its name
	 *
	 * @param name Name to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	EntityManager.prototype.getEntityByName = function (name) {
		for (var i = 0; i < this._entities.length; i++) {
			var entity = this._entities[i];
			if (entity.name === name) {
				return entity;
			}
		}
		return undefined;
	};

	/**
	 * Get all entities in the world
	 *
	 * @returns {Array} Array containing all entities in the world
	 */
	EntityManager.prototype.getEntities = function () {
		return this._entities;
	};

	/**
	 * Get all entities on top level based on the transform scenegraph
	 *
	 * @returns {Array} Array containing all top entities
	 */
	EntityManager.prototype.getTopEntities = function () {
		var entities = [];
		for (var i = 0; i < this._entities.length; i++) {
			var entity = this._entities[i];
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