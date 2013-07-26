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
	}

	/**
	 * Add the entity to the world, making it active and processed by systems and managers.
	 */
	Entity.prototype.addToWorld = function () {
		this._world.addEntity(this);
	};

	/**
	 * Remove entity from the world.
	 */
	Entity.prototype.removeFromWorld = function () {
		this._world.removeEntity(this);
	};

	function getTypeAttributeName(type) {
		return type.charAt(0).toLowerCase() + type.substr(1);
	}

	/**
	 * Set component of a certain type on entity. Existing component of the same type will be overwritten.
	 *
	 * @param {Component} component Component to set on the entity
	 */
	Entity.prototype.setComponent = function (component) {
		if (this.hasComponent(component.type)) {
			for (var i = 0; i < this._components.length; i++) {
				if (this._components[i].type === component.type) {
					this._components[i] = component;
					break;
				}
			}
		} else {
			this._components.push(component);
		}
		this[getTypeAttributeName(component.type)] = component;

		if (component.type === 'TransformComponent') {
			component.entity = this;
		}

		if (this._world.entityManager.containsEntity(this)) {
			this._world.changedEntity(this, component, 'addedComponent');
		}
	};

	/**
	 * Checks if a component of a specific type is present or not
	 *
	 * @param {string} type Type of component to check for (eg. 'transformComponent')
	 * @returns {boolean}
	 */
	Entity.prototype.hasComponent = function (type) {
		return this[getTypeAttributeName(type)] !== undefined;
	};

	/**
	 * Retrieve a component of a specific type
	 *
	 * @param {string} type Type of component to retrieve (eg. 'transformComponent')
	 * @returns {Component} component with requested type or undefined if not present
	 */
	Entity.prototype.getComponent = function (type) {
		return this[getTypeAttributeName(type)];
	};

	/**
	 * Remove a component of a specific type from entity.
	 *
	 * @param {string} type Type of component to remove (eg. 'transformComponent')
	 */
	Entity.prototype.clearComponent = function (type) {
		var component = this[getTypeAttributeName(type)];
		var index = this._components.indexOf(component);
		if (index !== -1) {
			var component = this._components[index];
			if (component.type === 'TransformComponent') {
				component.entity = undefined;
			}
			this._components.splice(index, 1);
		}
		delete this[getTypeAttributeName(type)];

		if (this._world.entityManager.containsEntity(this)) {
			this._world.changedEntity(this, component, 'removedComponent');
		}
	};

	/**
	 * @returns {string} Name of entity
	 */
	Entity.prototype.toString = function () {
		return this.name;
	};

	Entity.entityCount = 0;

	return Entity;
});
