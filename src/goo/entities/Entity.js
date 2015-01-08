define([
	'goo/entities/components/Component',
	'goo/util/StringUtil'
],
/** @lends */
function (
	Component,
	StringUtil
	) {
	'use strict';

	/**
	* @class
	* An Entity is a generic container of data. 
	* This data is wrapped in [Components]{@link Component}, which usually provide isolated features (transforms, geometries, materials, scripts and so on). 
	* By setting components to an entity, the entity will get the functionality provided by the components. 
	* For example, an entity with a {@link TransformComponent} and a {@link LightComponent} will be a light source in 3D space. 
	* Note that when attaching components to an entity, methods of the component will be injected into the entity, extending its interface.
	* @param {World} world The {@link World} this entity will be part of after calling .addToWorld().
	* @param {String} [name] Entity name.
	* @param {number} [id] Entity id.
	*/
	function Entity(world, name, id) {
		this._world = world;
		this._components = [];
		this.id = id !== undefined ? id : StringUtil.createUniqueId('entity');
		this._index = Entity.entityCount;

		this._tags = new Set();
		this._attributes = new Map();

		/*Object.defineProperty(this, 'id', {
			value : Entity.entityCount++,
			writable : false
		});*/
		this.name = name !== undefined ? name : 'Entity_' + this._index;

		// (move to meshrenderercomponent)
		/** Set to true to skip all processing (rendering, script updating, et cetera) of the entity.
		 * @type {boolean}
		 * @default false
		 */
		this.skip = false;

		/** Holds the hidden status of the entity. The hidden status will not however propagate to components or child entities.
		 * @deprecated The usage of this flag changed. Please use entity.hide/show() instead to change the hidden status of the entity and entity.isHidden/isVisiblyHidden() to query the status
		 * @type {boolean}
		 * @default false
		 */
		this.hidden = false;
		//! AT: users are always confused about this - I'll have to hide it

		/**
		 * Has the same function as the `hidden` property, except it's now private.
		 * @type {boolean}
		 * @private
		 */
		this._hidden = false;

		/** Mark entity as static.
		 * Non static entities become roots in the tree of combined ones so one can have statics under a moving node that combines but you can still move the parent node.
		 * @type {boolean}
		 * @default false
		 */
		this.static = false;

		Entity.entityCount++;
	}

	//! AT: not sure if 'add' is a better name - need to search for something short and compatible with the other 'set' methods
	/**
	 * Sets components on the entity or tries to create and set components out of the supplied parameters.
	 *
	 * @example <caption>{@linkplain http://code.gooengine.com/latest/examples/goo/entities/Entity/Entity-set-example.html Working example}</caption>
	 * // Create three entities with different components, add them to world
	 * var sphereEntity = new Entity(world).set(sphere, material, [2, 0, 0]).addToWorld();
	 * var lightEntity = new Entity(world).set(light, [0, 1, 0]).addToWorld();
	 * var spinningEntity = new Entity(world).set(box, material, [-2, 0, 0], script).addToWorld();
	 *
	 * @returns {Entity} Returns self to allow chaining.
	 */
	Entity.prototype.set = function () {
		for (var i = 0; i < arguments.length; i++) {
			var argument = arguments[i];
			if (argument instanceof Component) {
				this.setComponent(argument);
			} else {
				// ask all components if they are compatible with the given data
				if (!this._world) { return this; }
				var components = this._world._components;
				for (var j = 0; j < components.length; j++) {
					var component = components[j];
					var applied = component.applyOnEntity(argument, this);
					if (applied) {
						break;
					}
				}
			}
		}

		// allow chaining
		return this;
	};

	/**
	 * Add the entity to the world, making it active and processed by systems and managers.
	 * @param {boolean} [recursive=true] Add children of the transform hierarchy recursively.
	 * @returns {Entity} Returns self to allow chaining.
	 */
	Entity.prototype.addToWorld = function (recursive) {
		this._world.addEntity(this, recursive);
		return this;
	};

	/**
	 * Remove entity from the world.
	 * @param {boolean} [recursive=true] Remove children of the transform hierarchy recursively.
	 * @returns {Entity} Returns self to allow chaining.
	 */
	Entity.prototype.removeFromWorld = function (recursive) {
		this._world.removeEntity(this, recursive);
		return this;
	};

	/**
	 * lower cases the first character of the type parameter.
	 * @param {string} type name.
	 * @returns {string} lower cased type name.
	 * @private
	 */
	function getTypeAttributeName(type) {
		return type.charAt(0).toLowerCase() + type.substr(1);
	}

	/**
	 * Set component of a certain type on entity. The operation has no effect if the entity already contains a component of the same type.
	 *
	 * @param {Component} component Component to set on the entity.
	 * @returns {Entity} Returns self to allow chaining.
	 */
	Entity.prototype.setComponent = function (component) {
		if (this.hasComponent(component.type)) {
			return this;
		} else {
			this._components.push(component);
		}
		this[getTypeAttributeName(component.type)] = component;

		// inform the component it's being attached to an entity
		if (component.attached) {
			component.attached(this);
		}

		component.applyAPI(this);

		if (this._world && this._world.entityManager.containsEntity(this)) {
			this._world.changedEntity(this, component, 'addedComponent');
		}

		return this;
	};

	/**
	 * Checks if a component of a specific type is present or not.
	 *
	 * @param {string} type Type of component to check for (eg. 'meshDataComponent').
	 * @returns {boolean}
	 */
	Entity.prototype.hasComponent = function (type) {
		var typeAttributeName = getTypeAttributeName(type);
		var component = this[typeAttributeName];
		return !!component && this._components.indexOf(component) > -1;
	};

	/**
	 * Retrieve a component of a specific type.
	 *
	 * @param {string} type Type of component to retrieve (eg. 'transformComponent').
	 * @returns {Component} Component with requested type or undefined if not present.
	 */
	Entity.prototype.getComponent = function (type) {
		var typeAttributeName = getTypeAttributeName(type);
		if (this.hasComponent(type)) {
			return this[typeAttributeName];
		}
	};

	/**
	 * Remove a component of a specific type from entity.
	 *
	 * @param {string} type Type of component to remove (eg. 'meshDataComponent').
	 * @returns {Entity} Returns self to allow chaining.
	 */
	Entity.prototype.clearComponent = function (type) {
		var typeAttributeName = getTypeAttributeName(type);
		var component = this[typeAttributeName];

		if (!!component && this._components.indexOf(component) > -1) {
			// inform the component it's being detached from the entity
			if (component.detached) {
				component.detached(this);
			}

			// removing API
			component.removeAPI(this);

			// removing from dense array
			var index = this._components.indexOf(component);
			this._components.splice(index, 1);

			// removing from entity
			delete this[typeAttributeName];

			// notifying the world of the change
			if (this._world && this._world.entityManager.containsEntity(this)) {
				this._world.changedEntity(this, component, 'removedComponent');
			}
		}

		return this;
	};

	/**
	 * Adds a tag to the entity.
	 * @param {string} tag
	 * @example <caption>{@linkplain http://code.gooengine.com/latest/examples/goo/entities/Entity/Entity-tags-example.html Working example}</caption>
	 * var banana = world.createEntity().setTag('fruit').setTag('green');
	 *
	 * @returns {Entity} Returns self to allow chaining.
	 */
	Entity.prototype.setTag = function (tag) {
		this._tags.add(tag);
		return this;
	};

	/**
	 * Checks whether an entity has a tag or not.
	 * @param {string} tag
	 * @example <caption>{@linkplain http://code.gooengine.com/latest/examples/goo/entities/Entity/Entity-tags-example.html Working example}</caption>
	 * if (banana.hasTag('yellow')) {
	 *     console.log('The banana is yellow');
	 * }
	 *
	 * @returns {boolean}.
	 */
	Entity.prototype.hasTag = function (tag) {
		return this._tags.has(tag);
	};

	/**
	 * Clears a tag on an entity.
	 * @param {string} tag
	 * @example <caption>{@linkplain http://code.gooengine.com/latest/examples/goo/entities/Entity/Entity-tags-example.html Working example}</caption>
	 * // Remove 'alive' tag if hit points drops to zero
	 * if (hero.getAttribute('hit-points') <= 0) {
	 *     hero.clearTag('alive');
	 * }
	 *
	 * @returns {Entity} Returns self to allow chaining.
	 */
	Entity.prototype.clearTag = function (tag) {
		this._tags.delete(tag);
		return this;
	};

	/**
	 * Sets an attribute and its value on the entity.
	 *
	 * @param {string} attribute
	 * @param value
	 * @example <caption>{@linkplain http://code.gooengine.com/latest/examples/goo/entities/Entity/Entity-attributes-example.html Working example}</caption>
	 * // Create an entity with tags and attributes, and add it to world
	 * var hero = world.createEntity()
	 *                 .setTag('hero')
	 *                 .setAttribute('hit-points', 30)
	 *                 .setAttribute('attack-power', 3)
	 *                 .setTag('alive')
	 *                 .addToWorld();
	 *
	 * @returns {Entity} Returns self to allow chaining.
	 */
	Entity.prototype.setAttribute = function (attribute, value) {
		this._attributes.set(attribute, value);
		return this;
	};

	/**
	 * Checks whether an entity has an attribute or not.
	 * @param {string} attribute
	 * @returns {boolean}
	 */
	Entity.prototype.hasAttribute = function (attribute) {
		return this._attributes.has(attribute);
	};

	/**
	 * Gets the value of the specified attribute.
	 * @param {string} attribute
	 * @example
	 * // Check hit points on monster entity
	 * if (monster.getAttribute('hit-points') <= 0) {
	 *     console.log('The hero triumphs!');
	 * }
	 *
	 * @returns {*}
	 */
	Entity.prototype.getAttribute = function (attribute) {
		return this._attributes.get(attribute);
	};

	/**
	 * Clears an attribute of the entity.
	 * @param {string} attribute
	 * @returns {Entity} Returns self to allow chaining.
	 */
	Entity.prototype.clearAttribute = function (attribute) {
		this._attributes.delete(attribute);
		return this;
	};

	/**
	 * @returns {string} Name of entity.
	 */
	Entity.prototype.toString = function () {
		//! AT: should also return a list of its components or something more descriptive than just the name
		return this.name;
	};

	Entity.prototype.copy = function (source) {
		for (var i = 0; i < source._components.length; i++) {
			var component = source._components[i];
			if (component.clone) {
				this.setComponent(component.clone());
			}
		}

		// need util methods for cloning maps and sets
		// will share them for now
		this._tags = source._tags;
		this._attributes = source._attributes;

		this.skip = source.skip;

		this.hidden = source.hidden;
		this._hidden = source._hidden;
		this.static = source.static;
	};

	Entity.prototype.clone = function () {
		var clone = new Entity(this._world, this.name, this.id);
		clone.copy(this);
		return clone;
	};

	Entity.entityCount = 0;

	return Entity;
});
