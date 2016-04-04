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
	this.type = type;
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
 * Called when an entity is added to the world and systems need to be informed
 * @param entity
 */
System.prototype.added = function (entity) {
	this._check(entity);
};

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
		if (this.deleted) {
			this.deleted(entity);
		}
	}
};

/**
 * Called when the system is added to the world.
 * This method is called automatically when the system is added to a world.
 * By default it will go through all entities
 * accounted by the entity manager and try to add them to this system.
 * @param {World} world
 */
System.prototype.setup = function (world) {
	world.entityManager.getEntities().forEach(this._check.bind(this));
};

/**
 * Called when the system is removed from the world.
 * By default it will call the deleted method on all entities it is keeping track of.
 */
System.prototype.cleanup = function () {
	if (this.deleted) {
		for (var i = 0; i < this._activeEntities.length; i++) {
			var entity = this._activeEntities[i];
			this.deleted(entity);
		}
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
		if (this.inserted) {
			this.inserted(entity);
		}
	} else if (!isInterested && index !== -1) {
		this._activeEntities.splice(index, 1);
		if (this.deleted) {
			this.deleted(entity);
		}
	}
};

System.prototype._process = function (tpf) {
	this.process(this._activeEntities, tpf);
};

System.prototype._lateProcess = function (tpf) {
	this.lateProcess(this._activeEntities, tpf);
};

System.prototype.clear = function () {
	this._activeEntities = [];
};

module.exports = System;