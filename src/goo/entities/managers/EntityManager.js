var Manager = require('../../entities/managers/Manager');
var EntitySelection = require('../../entities/EntitySelection');

/**
 * Main handler of all entities in the world.
 * @extends Manager
 */
function EntityManager() {
	Manager.call(this);

	this.type = 'EntityManager';

	this._entitiesById = new Map();
	this._entitiesByIndex = new Map();
	this._entityCount = 0;

	/** Entity selector. Its methods return an {@link EntitySelection}. Can select by id or name, see examples for usage.
	 * <br><i>Injected into {@link World}.</i>
	 * @member by
	 * @memberOf EntityManager.prototype
	 * @example
	 * var byId = gooRunner.world.by.id("2b88941938444da8afab8205b1c80616.entity").first();
	 * var byName = gooRunner.world.by.name("Box").first();
	 */
	this.api = {
		id: function () {
			var ret = EntityManager.prototype.getEntityById.apply(this, arguments);
			return new EntitySelection(ret);
		}.bind(this),
		name: function (name) {
			var entities = this.getEntities();
			return new EntitySelection(entities.filter(function (entity) {
				return entity.name === name;
			}));
		}.bind(this)
	};
}

EntityManager.prototype = Object.create(Manager.prototype);

EntityManager.prototype.added = function (entity) {
	if (!this.containsEntity(entity)) {
		this._entitiesById.set(entity.id, entity); //! AT: more entities can share the same id!
		// happens if you're loading the same entity more than once with the dynamic loader
		this._entitiesByIndex.set(entity._index, entity);
		this._entityCount++;
	}
};

EntityManager.prototype.removed = function (entity) {
	if (this.containsEntity(entity)) {
		this._entitiesById.delete(entity.id); //! AT: more entities can share the same id!
		// happens if you're loading the same entity more than once with the dynamic loader
		this._entitiesByIndex.delete(entity._index);
		this._entityCount--;
	}
};

/**
 * Checks if an entity exists
 *
 * @param entity Entity to check for
 * @returns {boolean} true if the entity exists
 */
EntityManager.prototype.containsEntity = function (entity) {
	return this._entitiesByIndex.has(entity._index);
};

/**
 * Retrieve an entity based on an id
 *
 * @param id Id to retrieve entity for
 * @returns Entity or undefined if not existing
 */
EntityManager.prototype.getEntityById = function (id) {
	return this._entitiesById.get(id); //! AT: more entities can share the same id!
	// happens if you're loading the same entity more than once with the dynamic loader
};

/**
 * Retrieve an entity based on an index
 *
 * @param index Index to retrieve entity for
 * @returns Entity or undefined if not existing
 */
EntityManager.prototype.getEntityByIndex = function (index) {
	return this._entitiesByIndex.get(index);
};

/**
 * Retrieve an entity based on its name
 *
 * @param name Name to retrieve entity for
 * @returns Entity or undefined if not existing
 */
EntityManager.prototype.getEntityByName = function (name) {
	if (this._entityCount <= 0) { return; }

	var foundEntity;
	this._entitiesByIndex.forEach(function (entity) {
		if (entity.name === name) {
			foundEntity = entity;
		}
	});

	return foundEntity;
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
//! AT: this need to return an EntitySelection object
EntityManager.prototype.getEntities = function () {
	var entities = [];

	this._entitiesByIndex.forEach(function (entity) {
		entities.push(entity);
	});

	return entities;
};

/**
 * Get all entities on top level based on the transform scenegraph
 *
 * @returns {Array} Array containing all top entities
 */
EntityManager.prototype.getTopEntities = function () {
	var entities = [];

	this._entitiesByIndex.forEach(function (entity) {
		if (!entity.transformComponent || !entity.transformComponent.parent) {
			entities.push(entity);
		}
	});

	return entities;
};

/**
 * Removes all entities
 */
EntityManager.prototype.clear = function () {
	this._entitiesById.clear();
	this._entitiesByIndex.clear();
	this._entityCount = 0;
};

module.exports = EntityManager;