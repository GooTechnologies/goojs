/**
 * Creates a new System
 *
 * Base class for all entity systems
 *        <ul>
 *        <li> interests = null -> listen to all entities
 *        <li> interests = [] -> don't listen to any entities
 *        <li> interests = ['coolComponent', 'testComponent'] -> listen to entities that contains at minimum 'coolComponent' and 'testComponent'
 *        </ul>
 * See [this engine overview article]{@link http://www.gootechnologies.com/learn/tutorials/engine/engine-overview/} for more info.
 * @param {string} type System type name as a string
 * @param {Array<String>} interests Array of component types this system is interested in
 * @property {string} type System type
 * @property {Array<String>} interests Array of component types this system is interested in
 */
function System(type, interests) {

	/**
	 * @type {World}
	 */
	this.world = null;

	/**
	 * @type {string}
	 */
	this.type = type;

	/**
	 * @type {array}
	 */
	this.interests = interests;

	this._activeEntities = [];

	/**
	 * @type {boolean}
	 */
	this.passive = false;

	/**
	 * Priority of a system. The lower the number the higher the priority is. By default a systems has priority 0. Internal goo systems (like TransformSystem and CameraSystem) should have negative priority.
	 * @type {number}
	 */
	this.priority = 0;
}

/**
 * Called on each render frame, if the system is not passive.
 * @param {array} entities
 * @param {number} tpf
 */
System.prototype.process = function (/*entities, tpf*/) {};

/**
 * Called on each physics tick, if the system is not passive.
 * @param {array} entities
 * @param {number} fixedTpf
 */
System.prototype.fixedUpdate = function (/*entities, fixedTpf*/) {};

/**
 * Called when an entity is added to the world and systems need to be informed. Called by the world.
 * @hidden
 * @param entity
 */
System.prototype.added = function (entity) {
	this._check(entity);
};

/**
 * Called when an entity is added to the world and systems need to be informed. To be implemented in subclasses.
 * @param entity
 */
System.prototype.inserted = function (/*entity*/) {};

/**
 * Called when an Entity is removed from the World. To be implemented in subclasses.
 * @param entity
 */
System.prototype.deleted = function (/*entity*/) {};

/**
 * Called when an entity gets/loses components
 * @param entity
 */
System.prototype.changed = function (entity) {
	this._check(entity);
};

/**
 * Called when an entity is removed from the world
 * @param entity
 */
System.prototype.removed = function (entity) {
	var index = this._activeEntities.indexOf(entity);
	if (index !== -1) {
		this._activeEntities.splice(index, 1);
		this.deleted(entity);
	}
};

/**
 * Called when a component was added to an entity.
 * @param {Entity} entity
 * @param {Component} component
 */
System.prototype.addedComponent = function (/*entity, component*/) {};

/**
 * Called when a component was removed from an entity.
 * @param {Entity} entity
 * @param {Component} component
 */
System.prototype.removedComponent = function (/*entity, component*/) {};

/**
 * Called when the system is added to the world.
 * @param {World} world
 */
System.prototype.setup = function (world) {
	this.checkEntities(world);
};

/**
 * Adds the current entities from the world to this._activeEntities.
 * @param {World} world
 */
System.prototype.checkEntities = function (world) {
	world.entityManager.getEntities().forEach(this._check.bind(this));
};

/**
 * Called when the world changes play mode.
 */
System.prototype.playModeChanged = function () {};

/**
 * Called when the system is removed from the world.
 * By default it will call the deleted method on all entities it is keeping track of.
 */
System.prototype.cleanup = function () {
	for (var i = 0; i < this._activeEntities.length; i++) {
		var entity = this._activeEntities[i];
		this.deleted(entity);
	}
};

function getTypeAttributeName(type) {
	return type.charAt(0).toLowerCase() + type.substr(1);
}

/**
 * Checks if a system is interested in an entity based on its interests list and adds or removed the entity from the system's index
 * @param entity {Entity} to check if the system is interested in
 * @private
 */
System.prototype._check = function (entity) {
	if (this.interests && this.interests.length === 0) {
		return;
	}
	var isInterested = this.interests === null;
	if (!isInterested && this.interests.length <= entity._components.length) {
		isInterested = true;
		for (var i = 0; i < this.interests.length; i++) {
			var interest = getTypeAttributeName(this.interests[i]);

			if (!entity[interest]) {
				isInterested = false;
				break;
			}
		}
	}

	var index = this._activeEntities.indexOf(entity);
	if (isInterested && index === -1) {
		this._activeEntities.push(entity);
		this.inserted(entity);
	} else if (!isInterested && index !== -1) {
		this._activeEntities.splice(index, 1);
		this.deleted(entity);
	}
};

System.prototype._fixedUpdate = function (fixedTpf) {
	this.fixedUpdate(this._activeEntities, fixedTpf);
};

System.prototype._process = function (tpf) {
	this.process(this._activeEntities, tpf);
};

System.prototype._lateProcess = function (tpf) {
	this.lateProcess(this._activeEntities, tpf);
};

System.prototype.clear = function () {
	this._activeEntities.length  = 0;
};

/**
 * Called before the scene is being rendered
 */
System.prototype.onPreRender = function () {};

/**
 * Called after the scene is being rendered
 */
System.prototype.onPostRender = function () {};

module.exports = System;