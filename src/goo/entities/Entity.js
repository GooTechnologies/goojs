define(function () {
	"use strict";

	/**
	 * @name Entity
	 * @class A gameworld object and container of components
	 * @param {World} world A {@link World} reference
	 * @property {Number} id Automatically generated unique id for this entity
	 * @property {String} name Entity name
	 */
	function Entity(world, name) {
		this._world = world;
		this._components = [];

		Object.defineProperty(this, 'id', {
			value : Entity.entityCount++,
			writable : false
		});
		this.name = name !== undefined ? name : 'Entity_' + this.id;
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
	 * @param component Component to set on the entity
	 */
	Entity.prototype.setComponent = function (component) {
		var index = this._components.indexOf(component);
		if (index === -1) {
			this._components.push(component);
		} else {
			this._components[index] = component;
		}
		this[getTypeAttributeName(component.type)] = component;

		// TODO: Give access to the entity from TransformComponent. Other components can be shared between entities
		// and can thus not be handled in this way (they should go through the entitymanager). TBD
		if (component.type === 'TransformComponent') {
			component.entity = this;
		}

		if (this._world.entityManager.containsEntity(this)) {
			this._world.changedEntity(this, component, 'addedComponent');
		}
	};

	/**
	 * Retrieve a component of a specific type
	 *
	 * @param type Type of component to retrieve
	 * @returns component with requested type or undefined if not present
	 */
	Entity.prototype.getComponent = function (type) {
		return this[getTypeAttributeName(type)];
	};

	/**
	 * Remove a component of a specific type from entity.
	 *
	 * @param type Type of component to remove
	 */
	Entity.prototype.clearComponent = function (type) {
		var component = this[type];
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

	Entity.prototype.toString = function () {
		return this.name;
	};

	Entity.entityCount = 0;

	return Entity;
});
