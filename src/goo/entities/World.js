define(['goo/entities/Entity', 'goo/entities/managers/EntityManager', 'goo/entities/components/TransformComponent'],
/** @lends World */
function (Entity, EntityManager, TransformComponent) {
	"use strict";

	/**
	 * @class Main handler for an entity world
	 * @property {Float} tpf Timer per frame in seconds
	 * @property {Manager} entityManager Main keeper of entities
	 */
	function World () {
		this._managers = [];
		this._systems = [];

		this._addedEntities = [];
		this._changedEntities = [];
		this._removedEntities = [];

		this.entityManager = new EntityManager();
		this.setManager(this.entityManager);

		this.time = 0.0;
		this.tpf = 1.0;
	}

	World.time = 0.0;

	/**
	 * Adds a Manager to the world
	 *
	 * @param {Manager} manager
	 */
	World.prototype.setManager = function (manager) {
		this._managers.push(manager);
	};

	/**
	 * Retrive a manager of type 'type'
	 *
	 * @param {String} type Type of manager to retrieve
	 * @returns manager
	 */
	World.prototype.getManager = function (type) {
		for (var i = 0; i < this._managers.length; i++) {
			var manager = this._managers[i];
			if (manager.type === type) {
				return manager;
			}
		}
	};

	/**
	 * Adds a {@link System} to the world
	 *
	 * @param {System} system
	 */
	World.prototype.setSystem = function (system) {
		this._systems.push(system);
	};

	/**
	 * Retrive a {@link System} of type 'type'
	 *
	 * @param {String} type Type of system to retrieve
	 * @returns System
	 */
	World.prototype.getSystem = function (type) {
		for (var i = 0; i < this._systems.length; i++) {
			var system = this._systems[i];
			if (system.type === type) {
				return system;
			}
		}
	};

	/**
	 * Creates a new {@link Entity}
	 *
	 * @returns {Entity}
	 */
	World.prototype.createEntity = function (name) {
		var entity = new Entity(this, name);
		entity.setComponent(new TransformComponent());
		return entity;
	};

	/**
	 * Get all entities in world
	 *
	 * @returns All entities existing in world
	 */
	World.prototype.getEntities = function () {
		return this.entityManager.getEntities();
	};

	/**
	 * Add an entity to the world
	 *
	 * @param entity
	 */
	World.prototype.addEntity = function (entity) {
		this._addedEntities.push(entity);
	};

	/**
	 * Remove an entity from the world
	 *
	 * @param entity
	 */
	World.prototype.removeEntity = function (entity) {
		this._removedEntities.push(entity);
	};

	/**
	 * Let the system know that an entity has been changed/updated
	 *
	 * @param entity
	 * @param component
	 * @param eventType
	 */
	World.prototype.changedEntity = function (entity, component, eventType) {
		var event = {
			entity : entity
		};
		if (component !== undefined) {
			event.component = component;
		}
		if (eventType !== undefined) {
			event.eventType = eventType;
		}
		this._changedEntities.push(event);
	};

	/**
	 * Process all added/changed/removed entities and callback to active systems and managers. Usually called each frame
	 */
	World.prototype.process = function () {
		this._check(this._addedEntities, function (observer, entity) {
			if (observer.added) {
				observer.added(entity);
			}
			if (observer.addedComponent) {
				for (var i = 0; i < entity._components.length; i++) {
					observer.addedComponent(entity, entity._components[i]);
				}
			}
		});
		this._check(this._changedEntities, function (observer, event) {
			if (observer.changed) {
				observer.changed(event.entity);
			}
			if (event.eventType !== undefined) {
				if (observer[event.eventType]) {
					observer[event.eventType](event.entity, event.component);
				}
			}
		});
		this._check(this._removedEntities, function (observer, entity) {
			if (observer.removed) {
				observer.removed(entity);
			}
			if (observer.removedComponent) {
				for (var i = 0; i < entity._components.length; i++) {
					observer.removedComponent(entity, entity._components[i]);
				}
			}
		});

		for (var i = 0; i < this._systems.length; i++) {
			var system = this._systems[i];
			if (!system.passive) {
				system._process(this.tpf);
			}
		}
	};

	World.prototype._check = function (entities, callback) {
		// REVIEW: Code style? Spaces before and after "("?
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			for (var managerIndex = 0; managerIndex < this._managers.length; managerIndex++) {
				var manager = this._managers[managerIndex];
				callback(manager, entity);
			}
			for (var systemIndex = 0; systemIndex < this._systems.length; systemIndex++) {
				var system = this._systems[systemIndex];
				callback(system, entity);
			}
		}
		entities.length = 0;
	};

	return World;
});