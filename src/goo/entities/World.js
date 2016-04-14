var Entity = require('./Entity');
var EntityManager = require('./managers/EntityManager');
var TransformComponent = require('./components/TransformComponent');
var Manager = require('./managers/Manager');
var System = require('./systems/System');
var Component = require('./components/Component');
var EntitySelection = require('./EntitySelection');
var ObjectUtils = require('../util/ObjectUtils');

var lastInstantiatedWorld;

/**
 * Main handler for an entity world. The World keeps track of managers and systems,
 * and also provides methods to create, select and remove entities.
 * Note that process() has to be called manually if objects need to be added and retrieved within the same update loop.
 * See [this engine overview article]{@link http://www.gootechnologies.com/learn/tutorials/engine/engine-overview/} for more info.
 * @param {object} [options]
 * @param {GooRunner} [options.gooRunner]
 * @param {boolean} [options.tpfSmoothingCount=10] Specifies the amount of previous frames to use when computing the 'time per frame'
 */
function World(options) {
	if (options && options._registerBaseComponents) {
		console.warn('World constructor changed! Please use it like this instead: new World({ gooRunner: gooRunner })');
		var tmp = options;
		options = {};
		options.gooRunner = tmp;
	}

	options = options || {};

	/** GooRunner for updating the world and calling the renderers.
	 * @type {GooRunner}
	 */
	this.gooRunner = options.gooRunner !== undefined ? options.gooRunner : null;

	/** Accumulated time per frames(tpf) the world has been running.  Calculated at the start of each frame.
	 * @type {number}
	 */
	this.time = 0;

	/** Current fixed step accumulated time.
	 * @type {number}
	 */
	this.fixedTpfTime = 0;

	/** The fixed time step to use for physics and other fixed-updates.
	 * @type {number}
	 */
	this.fixedTpf = options.fixedTpf !== undefined ? options.fixedTpf : 1 / 60;

	/** Max fixed steps to use for the fixed update loop.
	 * @type {number}
	 */
	this.maxSubSteps = options.maxSubSteps !== undefined ? options.maxSubSteps : 10;

	/** Time since last frame in seconds.
	 * @type {number}
	 */
	this.tpf = 0;

	/** The tpf, averaged by a number of samples.
	 * @type {number}
	 */
	this.smoothedTpf = this.tpf;

	/** Interpolation alpha time value: a number between 0 and 1. Use to interpolate between two fixed updates from the frame update.
	 * @type {number}
	 */
	this.interpolationTime = 0;

	/** Number of samples to use for smoothing the tpf.
	 * @type {number}
	 */
	this.tpfSmoothingCount = options.tpfSmoothingCount !== undefined ? options.tpfSmoothingCount : 10;

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

	this._components = [];

	this._tpfIndex = 0;
	this._tpfSmoothingArray = [];
	this._accumulator = 0;

	lastInstantiatedWorld = this;
}

// Deprecated these with warnings on 2016-04-06
Object.defineProperties(World, {
	time: {
		get: ObjectUtils.warnOnce('World.time is deprecated, use world.time instead.', function () {
			return lastInstantiatedWorld && lastInstantiatedWorld.time || 0;
		}),
		set: function () {
			throw new Error('Don\'t set World.time!');
		}
	},
	tpf: {
		get: ObjectUtils.warnOnce('World.tpf is deprecated, use world.tpf instead.', function () {
			return lastInstantiatedWorld && lastInstantiatedWorld.tpf || 1;
		}),
		set: function () {
			throw new Error('Don\'t set World.time!');
		}
	}
});

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
			return entity.hasComponent(componentType);
		}));
	}.bind(this);

	//! AT: this will be relocated into the Tag Manager once it gets implemented
	this.by.tag = function (tag) {
		var entities = this.entityManager.getEntities();

		return new EntitySelection(entities.filter(function (entity) {
			return entity.hasTag(tag);
		}));
	}.bind(this);

	//! AT: this will be relocated into the Attribute Manager once it gets implemented
	this.by.attribute = function (attribute) {
		var entities = this.entityManager.getEntities();

		return new EntitySelection(entities.filter(function (entity) {
			return entity.hasAttribute(attribute);
		}));
	}.bind(this);
};

/**
 * Universal shorthand for adding managers, systems, entities and registering components.
 * Arguments can be of types Entity, Manager, System or Component and added in any order or combination.
 * @param {Entity} [entity]
 * @param {Manager} [manager]
 * @param {System} [system]
 * @param {Component} [component]
 * @example
 * // Add two entities and register a component, all in one swoop
 * var entity1 = new Entity(gooRunner.world, 'Entity 1');
 * var entity2 = new Entity(gooRunner.world, 'Entity 2');
 * var animationComponent = new AnimationComponent();
 * gooRunner.world.add(entity1, animationComponent, entity2);
 *
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
			//! AT: TransformComponent and co and NOT instances of Component
			this.registerComponent(argument);
		}
	}

	return this;
};

/**
 * Registers a component type. This is necessary to allow automatic creation of components
 * from 'basic' data types (CameraComponents from Cameras, MeshRendererComponents from materials and so on).
 * When a {@link GooRunner} is created, it registers {@link TransformComponent}, {@link MeshDataComponent},
 * {@link MeshRendererComponent}, {@link CameraComponent}, {@link LightComponent} and {@link ScriptComponent} automatically.
 * @example
 * // Register the animation component type so that animations
 * // can be automatically created.
 * gooRunner.world.registerComponent(AnimationComponent);
 *
 * @param {Component} componentConstructor
 * @returns {World} Returns self to allow chaining.
 */
World.prototype.registerComponent = function (componentConstructor) {
	if (this._components.indexOf(componentConstructor) === -1) {
		this._components.push(componentConstructor);
		Component.applyEntitySelectionAPI(componentConstructor.entitySelectionAPI, componentConstructor.type);
	}
	return this;
};

/**
 * Adds a {@link Manager} to the world.
 *
 * @param {Manager} manager
 * @returns {World} Returns self to allow chaining.
 */
World.prototype.setManager = function (manager) {
	this._managers.push(manager);
	manager.applyAPI(this.by);
	return this;
};

/**
 * Retrieves a {@link Manager} of a certain type.
 *
 * @param {string} type Type of manager to retrieve eg. 'EntityManager'.
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
 * Adds a {@link System} to the world.
 *
 * @param {System} system
 * @returns {World} Returns self to allow chaining.
 */
World.prototype.setSystem = function (system) {
	if (this._systems.indexOf(system) !== -1) {
		return this;
	}

	var priority = system.priority;

	for (var i = 0; i < this._systems.length; i++) {
		if (this._systems[i].priority > priority) {
			break;
		}
	}
	this._systems.splice(i, 0, system);

	system.world = this;
	system.setup(this);

	return this;
};

/**
 * Retrieve a {@link System} of type 'type'.
 *
 * @param {string} type Type of system to retrieve.
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
 * Removes the {@link System} of type 'type'.
 * Entities tracked by the removed system will not get handled properly when they are removed from the world
 * or when their components (that are tracked by this system) change.
 *
 * @param {string} type Type of system to remove.
 * @returns {World} Returns self to allow chaining.
 */
World.prototype.clearSystem = function (type) {
	for (var i = 0; i < this._systems.length; i++) {
		var system = this._systems[i];
		if (system.type === type) {
			system.cleanup();
			system.world = null;
			this._systems.splice(i, 1);
		}
	}
	return this;
};

/**
 * Creates a new {@link Entity} with an optional MeshData, MeshRenderer, Camera, Script and Light component, placed optionally at a location. Parameters can be given in any order.
 * @example
 * // Create a sphere entity and add it to the world
 * var sphereEntity = world.createEntity(new Sphere(32, 32), material, [0, 0, 5]).addToWorld();
 * // Create a camera entity and add it to the world
 * var cameraEntity = world.createEntity(new Camera(), [0, 0, 3]).lookAt(new Vector3(0, 0, 0)).addToWorld();
 *
 * @param {MeshData} [meshData]
 * @param {Material} [material]
 * @param {string} [name]
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
 * Get an array of all entities in world.
 *
 * @returns {Array<Entity>} All entities existing in world.
 */
World.prototype.getEntities = function () {
	return this.entityManager.getEntities();
};

/**
 * Add an {@link Entity} to the world.
 *
 * @param {Entity} entity Entity to add.
 * @param {boolean} [recursive=true] If entity hierarchy should be added recursively.
 * @returns {World} Returns self to allow chaining.
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

	// directly add to managers
	for (var i = 0; i < this._managers.length; i++) {
		var manager = this._managers[i];
		manager.added(entity);
	}

	return this;
};

/**
 * Remove an {@link Entity} from the world.
 *
 * @param {Entity} entity Entity to remove.
 * @param {boolean} [recursive=true] If entity hierarchy should be removed recursively.
 * @returns {World} Returns self to allow chaining.
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

	// directly remove from managers
	for (var i = 0; i < this._managers.length; i++) {
		var manager = this._managers[i];
		manager.removed(entity);
	}

	return this;
};

World.prototype._recursiveRemoval = function (entity, recursive) {
	if (this._removedEntities.indexOf(entity) === -1) {
		this._removedEntities.push(entity);
	}

	// this and the whole recursive removal needs refactoring
	for (var i = 0; i < this._managers.length; i++) {
		var manager = this._managers[i];
		manager.removed(entity);
	}

	if (entity.transformComponent && (recursive === undefined || recursive === true)) {
		var children = entity.transformComponent.children;
		for (var i = 0; i < children.length; i++) {
			this._recursiveRemoval(children[i].entity, recursive);
		}
	}
};

/**
 * Let the world and its systems know that an entity has been changed/updated.
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
 * Processes newly added entities, changed entities and removed entities
 */
World.prototype.processEntityChanges = function () {
	this._check(this._addedEntities, function (observer, entity) {
		observer.added(entity);

		// not in use by any system
		if (observer.addedComponent) {
			for (var i = 0; i < entity._components.length; i++) {
				observer.addedComponent(entity, entity._components[i]);
			}
		}
	});
	this._check(this._changedEntities, function (observer, event) {
		observer.changed(event.entity);
		if (event.eventType !== undefined) {
			if (observer[event.eventType]) {
				observer[event.eventType](event.entity, event.component);
			}
		}
	});
	this._check(this._removedEntities, function (observer, entity) {
		observer.removed(entity);

		// not in use by any system
		if (observer.removedComponent) {
			for (var i = 0; i < entity._components.length; i++) {
				observer.removedComponent(entity, entity._components[i]);
			}
		}
	});
};

/**
 * Update the world. This will run process and fixedUpdate.
 * @param  {number} tpf Time since last called, in seconds.
 * @return {World} the self object
 */
World.prototype.update = function (tpf) {
	// Increment time
	var time = this.time;
	time += tpf;

	// Set current values
	this.time = time;
	this.tpf = tpf;

	// Compute .smoothedTpf
	var tpfSmoothingArray = this._tpfSmoothingArray;
	this._tpfSmoothingArray[this._tpfIndex] = tpf;
	this._tpfIndex = (this._tpfIndex + 1) % this.tpfSmoothingCount;
	var avg = 0;
	for (var i = 0; i < tpfSmoothingArray.length; i++) {
		avg += tpfSmoothingArray[i];
	}
	avg /= this.tpfSmoothingCount;
	this.smoothedTpf = avg;

	// Fixed updates
	var numSteps = 0;
	var fixedTpf = this.fixedTpf;
	var fixedTpfTime = this.fixedTpfTime;
	var maxSubSteps = this.maxSubSteps;
	var accumulator = this._accumulator;

	accumulator += tpf;
	while (accumulator >= fixedTpf && numSteps < maxSubSteps) {
		fixedTpfTime += fixedTpf;
		numSteps++;
		this.fixedUpdate();
		accumulator -= fixedTpf;
	}
	this.fixedTpfTime = fixedTpfTime;
	this.interpolationTime = (accumulator % fixedTpf) / fixedTpf;
	this._accumulator = accumulator;

	// Frame update (process)
	this.process();

	return this;
};

/**
 * Do a fixed time update of all systems.
 */
World.prototype.fixedUpdate = function () {
	this.processEntityChanges();
	for (var i = 0; i < this._systems.length; i++) {
		var system = this._systems[i];
		if (!system.passive) {
			system._fixedUpdate(this.fixedTpf);
		}
	}
};

/**
 * Process all added/changed/removed entities and callback to active systems and managers. Usually called automatically each frame.
 * Has to be called between adding an entity to the world and getting it back.
 */
World.prototype.process = function () {
	this.processEntityChanges();

	for (var i = 0; i < this._systems.length; i++) {
		var system = this._systems[i];
		if (!system.passive) {
			system._process(this.tpf);
		}
	}
};

World.prototype.onPreRender = function () {
	for (var i = 0; i < this._systems.length; i++) {
		var system = this._systems[i];
		system.onPreRender();
	}
};

World.prototype.onPostRender = function () {
	for (var i = 0; i < this._systems.length; i++) {
		var system = this._systems[i];
		system.onPostRender();
	}
};

World.prototype._check = function (entities, callback) {
	// each entity needs to be "checked" against each system
	for (var i = 0; i < entities.length; i++) {
		var entity = entities[i];
		for (var systemIndex = 0; systemIndex < this._systems.length; systemIndex++) {
			var system = this._systems[systemIndex];
			callback(system, entity);
		}
	}

	entities.length = 0;
};

/**
 * Calls .clear on all systems that support this method
 */
World.prototype.clear = function () {
	for (var i = 0; i < this._systems.length; i++) {
		var system = this._systems[i];
		if (system.clear) {
			system.clear();
		}
	}

	this._systems = [];

	// severe all connections from entities to this world
	var allEntities = this.entityManager.getEntities();
	for (var i = 0; i < allEntities.length; i++) {
		var entity = allEntities[i];
		entity._world = null;
	}

	this.entityManager.clear();

	this._addedEntities = [];
	this._changedEntities = [];
	this._removedEntities = [];

	// severe the connection to gooRunner
	this.gooRunner = null;

	// todo: remove when World.time is removed
	if (lastInstantiatedWorld === this) {
		lastInstantiatedWorld = undefined;
	}
};

module.exports = World;