define([
	'goo/entities/Entity',
	'goo/entities/managers/EntityManager',
	'goo/entities/components/TransformComponent',
	'goo/entities/managers/Manager',
	'goo/entities/systems/System',
	'goo/entities/components/Component',
	'goo/entities/EntitySelection'
],
/** @lends */
function (
	Entity,
	EntityManager,
	TransformComponent,
	Manager,
	System,
	Component,
	EntitySelection
) {
	'use strict';

	/**
	 * @class Main handler for an entity world.
	 * @param {GooRunner} gooRunner GooRunner for updating the world.
	 */
	function World (gooRunner) {
		this.gooRunner = gooRunner;
		this._managers = [];
		this._systems = [];

		this._addedEntities = [];
		this._changedEntities = [];
		this._removedEntities = [];

		this.by = {};
		this._installDefaultSelectors();

		/** Main keeper of entities.
		 * @type {EntityManager}
		 */
		this.entityManager = new EntityManager();
		this.setManager(this.entityManager);

		this.time = 0.0;

		/** Time since last frame in seconds.
		 * @type {number}
		 */
		this.tpf = 1.0;

		this._components = [];
	}

	World.time = 0.0;
	World.tpf = 1.0;


		/** Entity selector. Its methods return an {@link EntitySelection}. Can select by system, component, attribute or tag. See examples for usage.
		 * <br><i>Will get additional methods when an {@link EntityManager} is attached.</i>
		 * @member by
		 * @memberOf World.prototype
		 * @example
		 * var bySystem = gooRunner.world.by.system("RenderSystem").toArray();
		 * var byComponent = gooRunner.world.by.component("cameraComponent").toArray();
		 * var byTag = gooRunner.world.by.tag("monster").toArray()
		 * var byAttribute = gooRunner.world.by.attribute("hit-points").toArray();
		 */

	World.prototype._installDefaultSelectors = function () {

		this.by.system = function (systemType) {
			var system = this.getSystem(systemType);
			return new EntitySelection(system._activeEntities);
		}.bind(this);

		this.by.component = function (componentType) {
			var entities = this.entityManager.getEntities();

			return new EntitySelection(entities.filter(function (entity) {
				return !!entity[componentType];
			}));
		}.bind(this);

		this.by.tag = function (tag) {
			var entities = this.entityManager.getEntities();

			return new EntitySelection(entities.filter(function (entity) {
				return entity.hasTag(tag);
			}));
		}.bind(this);

		this.by.attribute = function (attribute) {
			var entities = this.entityManager.getEntities();

			return new EntitySelection(entities.filter(function (entity) {
				return entity.hasAttribute(attribute);
			}));
		}.bind(this);
	};

	/**
	 * Universal shorthand for adding managers, systems, entities and registering components
	 * @returns {World} Returns self to allow chaining
	 */
	//! AT: again, 'set' vs 'add' - entities are added to the world, systems/managers are set
	World.prototype.add = function () {
		for (var i = 0; i < arguments.length; i++) {
			var argument = arguments[i];

			if (argument instanceof Entity) {
				this.addEntity(argument);
			} else if (argument instanceof Manager) {
				this.setManager(argument);
			} else if (argument instanceof System) {
				this.setSystem(argument);
			} else if (argument instanceof Component) {
			    this.registerComponent(argument);
			}
		}

		return this;
	};

	/**
	 * Registers a component type. This is necessary to allow automatic creation of components from 'basic' data types (CameraComponents from Cameras, MeshRendererComponents from materials and so on)
	 *
	 * @param {Component} componentConstructor
	 * @returns {World} Returns self to allow chaining
	 */
	World.prototype.registerComponent = function (componentConstructor) {
		if (this._components.indexOf(componentConstructor) === -1) {
			this._components.push(componentConstructor);
		}
		return this;
	};

	/**
	 * Adds a Manager to the world
	 *
	 * @param {Manager} manager
	 * @returns {World} Returns self to allow chaining
	 */
	World.prototype.setManager = function (manager) {
		this._managers.push(manager);
		manager.applyAPI(this.by);
		return this;
	};

	/**
	 * Retrieve a manager of type 'type'
	 *
	 * @param {String} type Type of manager to retrieve eg. 'EntityManager'
	 * @returns {Manager}
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
	 * @returns {World} Returns self to allow chaining
	 */
	World.prototype.setSystem = function (system) {
		var priority = system.priority;

		for (var i = 0; i < this._systems.length; i++) {
			if (this._systems[i].priority > priority) {
				break;
			}
		}
		this._systems.splice(i, 0, system);

		return this;
	};

	/**
	 * Retrieve a {@link System} of type 'type'
	 *
	 * @param {String} type Type of system to retrieve
	 * @returns {System}
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
	 * Creates a new {@link Entity} with an optional MeshData, MeshRenderer, Camera, Script and Light component, placed optionally at a location. Parameters can be given in any order.
	 * @param {MeshData} [meshData]
	 * @param {Material} [material]
	 * @param {String} [name]
	 * @param {Camera} [camera]
	 * @param {Light} [light]
	 * @returns {Entity}
	 */
	World.prototype.createEntity = function () {
		var entity = new Entity(this);
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] === 'string') { // does not cover new String()
				entity.name = arguments[i];
			} else {
				entity.set(arguments[i]);
			}
		}

		// separate treatment
		if (!entity.transformComponent) {
			entity.setComponent(new TransformComponent());
		}

		return entity;
	};

	/**
	 * Get all entities in world
	 *
	 * @returns {Entity[]} All entities existing in world
	 */
	World.prototype.getEntities = function () {
		return this.entityManager.getEntities();
	};

	/**
	 * Add an entity to the world
	 *
	 * @param {Entity} entity Entity to add
	 * @param {boolean} [recursive=true] If entity hierarchy should be added recursively
	 * @returns {World} Returns self to allow chaining
	 */
	World.prototype.addEntity = function (entity, recursive) {
		if (this._addedEntities.indexOf(entity) === -1) {
			this._addedEntities.push(entity);
		}

		if (entity.transformComponent && (recursive === undefined || recursive === true)) {
			var children = entity.transformComponent.children;
			for (var i = 0; i < children.length; i++) {
				this.addEntity(children[i].entity, recursive);
			}
		}

		return this;
	};

	/**
	 * Remove an entity from the world
	 *
	 * @param {Entity} entity Entity to remove
	 * @param {boolean} [recursive=true] If entity hierarchy should be removed recursively
	 * @returns {World} Returns self to allow chaining
	 */
	World.prototype.removeEntity = function (entity, recursive) {
		if (this._removedEntities.indexOf(entity) === -1) {
			this._removedEntities.push(entity);
		}

		var transformComponent = entity.transformComponent;
		if (transformComponent.parent) {
			transformComponent.parent.detachChild(transformComponent);
			transformComponent.parent = null;
		}

		if (recursive === false) {
			var children = transformComponent.children;
			for (var i = 0; i < children.length; i++) {
				children[i].parent = null;
			}

			transformComponent.children = [];
		} else {
			var children = transformComponent.children;
			for (var i = 0; i < children.length; i++) {
				this._recursiveRemoval(children[i].entity, recursive);
			}
		}

		return this;
	};

	World.prototype._recursiveRemoval = function (entity, recursive) {
		if (this._removedEntities.indexOf(entity) === -1) {
			this._removedEntities.push(entity);
		}

		if (entity.transformComponent && (recursive === undefined || recursive === true)) {
			var children = entity.transformComponent.children;
			for (var i = 0; i < children.length; i++) {
				this._recursiveRemoval(children[i].entity, recursive);
			}
		}
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
			entity: entity
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

			// not in use by any system
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

			// not in use by any system
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