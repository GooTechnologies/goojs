define(
/** @lends */
function () {
	"use strict";

	/**
	 * @class A gameworld object and container of components
	 * @param {World} world A {@link World} reference
	 * @param {String} [name] Entity name
	 */
	function Entity(world, name) {
		this._world = world;
		this._components = [];

		Object.defineProperty(this, 'id', {
			value : Entity.entityCount++,
			writable : false
		});
		this.name = name !== undefined ? name : 'Entity_' + this.id;

		/** Set to true to skip rendering (move to meshrenderercomponent)
		 * @type {boolean}
		 * @default false
		 */
		this.skip = false;

		this.hidden = false;
	}

	/**
	 * Add the entity to the world, making it active and processed by systems and managers.
	 * @param {boolean} [recursive=true] Add children recursively
	 * @returns {Entity} Returns itself to allow chaining
	 */
	Entity.prototype.addToWorld = function (recursive) {
		this._world.addEntity(this, recursive);
		return this;
	};

	/**
	 * Remove entity from the world.
	 * @param {boolean} [recursive=true] Remove children recursively
	 * @returns {Entity} Returns itself to allow chaining
	 */
	Entity.prototype.removeFromWorld = function (recursive) {
		this._world.removeEntity(this, recursive);
		return this;
	};

	function getTypeAttributeName(type) {
		return type.charAt(0).toLowerCase() + type.substr(1);
	}

	/**
	 * Set component of a certain type on entity. The operation has no effect if the entity already contains a component of the same type.
	 *
	 * @param {Component} component Component to set on the entity
	 * @returns {Entity} Returns itself to allow chaining
	 */
	Entity.prototype.setComponent = function (component) {
		if (this.hasComponent(component.type)) {
			return;
		} else {
			this._components.push(component);
		}
		this[getTypeAttributeName(component.type)] = component;

		// inform the component it's being attached to an entity
		if (component.attached) {
			component.attached(this);
		}

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
	 * @returns {Entity} Returns itself to allow chaining
	 */
	Entity.prototype.clearComponent = function (type) {
		var typeAttributeName = getTypeAttributeName(type);
		var component = this[typeAttributeName];

		if (!!component && this._components.indexOf(component) > -1) {
			// inform the component it's being detached from the entity
			if (component.detached) {
				component.detached(this);
			}

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
	 * @returns {string} Name of entity
	 */
	Entity.prototype.toString = function () {
		// should also return a list of its components
		return this.name;
	};

	Entity.entityCount = 0;

	return Entity;
});
