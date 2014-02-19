define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
	) {
	'use strict';

	/**
	 * @class An entity is the basic object in the [World]{@link World} and a container of [Components]{@link Component}.
	 * @param {World} world A {@link World} reference
	 * @param {String} [name] Entity name
	 */
	function Entity(world, name, id) {
		this._world = world;
		this._components = [];
		this.id = id !== undefined ? id : Entity.entityCount;
		this._index = Entity.entityCount;

		//! AT: not sure if this tags/attributes abstraction is really needed or if they are just glorified properties
		this._tags = {};
		this._attributes = {};

		/*Object.defineProperty(this, 'id', {
			value : Entity.entityCount++,
			writable : false
		});*/
		this.name = name !== undefined ? name : 'Entity_' + this.id;

		/** Set to true to skip rendering (move to meshrenderercomponent)
		 * @type {boolean}
		 * @default false
		 */
		this.skip = false;

		this.hidden = false;
		this.static = false;
		Entity.entityCount++;
	}

	//! AT: not sure if 'add' is a better name - need to search for something short and compatible with the other 'set' methods
	/**
	 * Sets components on the entity or tries to create and set components out of the supplied parameters
	 * @returns {Entity} Returns self to allow chaining
	 */
	Entity.prototype.set = function() {
		for (var i = 0; i < arguments.length; i++) {
			var argument = arguments[i];
			if (argument instanceof Component) {
				this.setComponent(argument);
			} else {
				// ask all components if they are compatible with the given data
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
	 * @param {boolean} [recursive=true] Add children recursively
	 * @returns {Entity} Returns self to allow chaining
	 */
	Entity.prototype.addToWorld = function (recursive) {
		this._world.addEntity(this, recursive);
		return this;
	};

	/**
	 * Remove entity from the world.
	 * @param {boolean} [recursive=true] Remove children recursively
	 * @returns {Entity} Returns self to allow chaining
	 */
	Entity.prototype.removeFromWorld = function (recursive) {
		this._world.removeEntity(this, recursive);
		return this;
	};

	/**
	 * lower cases the first character of the type parameter.
	 * @param {string} type name
	 * @returns {string} lower cased type name
	 * @private
	 */
	function getTypeAttributeName(type) {
		return type.charAt(0).toLowerCase() + type.substr(1);
	}

	/**
	 * Set component of a certain type on entity. The operation has no effect if the entity already contains a component of the same type.
	 *
	 * @param {Component} component Component to set on the entity
	 * @returns {Entity} Returns self to allow chaining
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

		if (this._world.entityManager.containsEntity(this)) {
			this._world.changedEntity(this, component, 'addedComponent');
		}

		return this;
	};

	/**
	 * Checks if a component of a specific type is present or not
	 *
	 * @param {string} type Type of component to check for (eg. 'meshDataComponent')
	 * @returns {boolean}
	 */
	Entity.prototype.hasComponent = function (type) {
		var typeAttributeName = getTypeAttributeName(type);
		var component = this[typeAttributeName];
		return !!component && this._components.indexOf(component) > -1;
	};

	/**
	 * Retrieve a component of a specific type
	 *
	 * @param {string} type Type of component to retrieve (eg. 'transformComponent')
	 * @returns {Component} component with requested type or undefined if not present
	 */
	Entity.prototype.getComponent = function (type) {
		var typeAttributeName = getTypeAttributeName(type);
		if (this.hasComponent(type)) {
			return this[typeAttributeName];
		}
	};

	/**
	 * Remove a component of a specific type from entity
	 *
	 * @param {string} type Type of component to remove (eg. 'meshDataComponent')
	 * @returns {Entity} Returns self to allow chaining
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
			if (this._world.entityManager.containsEntity(this)) {
				this._world.changedEntity(this, component, 'removedComponent');
			}
		}

		return this;
	};

	/**
	 * Adds a tag to the entity
	 * @param tag
	 * @returns {Entity} Returns self to allow chaining
	 */
	Entity.prototype.setTag = function (tag) {
		this._tags[tag] = true;
		return this;
	};

	/**
	 * Checks whether an entity has a tag or not
	 * @param tag
	 * @returns {boolean}
	 */
	Entity.prototype.hasTag = function (tag) {
		return !!this._tags[tag];
	};

	/**
	 * Clears a tag on an entity
	 * @param tag
	 * @returns {Entity} Returns self to allow chaining
	 */
	Entity.prototype.clearTag = function (tag) {
		delete this._tags[tag];
		return this;
	};

	/**
	 * Sets an attribute and its value on the entity
	 * @param attribute
	 * @param value
	 * @returns {Entity} Returns self to allow chaining
	 */
	Entity.prototype.setAttribute = function (attribute, value) {
		this._attributes[attribute] = value;
		return this;
	};

	/**
	 * Checks whether an entity has an attribute or not
	 * @param tag
	 * @returns {boolean}
	 */
	Entity.prototype.hasAttribute = function (attribute) {
		return typeof this._attributes[attribute] !== 'undefined';
	};

	/**
	 * Gets the value of the specified attribute
	 * @param attribute
	 * @returns {*}
	 */
	Entity.prototype.getAttribute = function (attribute) {
		return this._attributes[attribute];
	};

	/**
	 * Clears an attribute of the entity
	 * @param attribute
	 * @returns {Entity} Returns self to allow chaining
	 */
	Entity.prototype.clearAttribute = function (attribute) {
		delete this._attributes[attribute];
		return this;
	};

	/**
	 * @returns {string} Name of entity
	 */
	Entity.prototype.toString = function () {
		//! AT: should also return a list of its components or something more descriptive than just the name
		return this.name;
	};

	Entity.entityCount = 0;

	return Entity;
});
