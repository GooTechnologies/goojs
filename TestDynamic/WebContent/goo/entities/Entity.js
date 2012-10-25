define(function() {
	"use strict";

	/**
	 * Creates a new Entity
	 * 
	 * @name Entity
	 * @class A gameworld object and container of components
	 * @param {World} world A {@link World} reference
	 * @property {Number} id Unique id
	 * @property {String} name Entity name
	 */
	function Entity(world) {
		this._world = world;
		this._components = [];

		Object.defineProperty(this, 'id', {
			value : Entity.entityCount++,
			writable : false
		});
		this.name = 'Entity_' + this.id;
	}

	Entity.prototype.addToWorld = function() {
		this._world.addEntity(this);
	};

	Entity.prototype.removeFromWorld = function() {
		this._world.removeEntity(this);
	};

	function getTypeAttributeName(type) {
		return type.charAt(0).toLowerCase() + type.substr(1);
	}

	Entity.prototype.setComponent = function(component) {
		var index = this._components.indexOf(component);
		if (index === -1) {
			this._components.push(component);
		} else {
			this._components[index] = component;
		}
		// REVIEW: The API would look more natural if the attribute name was lower case.
		// e.g. transformComponent instead of TransformComponent. Like:
		//
		// getTypeAttributeName = function(type) {
		// return component.type.charAt(0).toLowerCase() + component.type.substr(1)}
		// }
		// this[getTypeAttributeName[component.type] = component;
		//
		// Maybe even better to access component like entity.components.transform
		// instead of entity.transformComponent?
		// Perhaps just let the component.type be a short lower-case name?
		this[getTypeAttributeName(component.type)] = component;

		// TODO: Give access to the entity from TransformComponent. Other components can be shared between entities
		// and can thus not be handled in this way (they should go through the entitymanager). TBD
		if (component.type === 'TransformComponent') {
			component.entity = this;
		}

		if (this._world.entityManager.contains(this)) {
			this._world.changedEntity(this);
		}
	};

	Entity.prototype.getComponent = function(type) {
		return this[getTypeAttributeName(type)];
	};

	Entity.prototype.clearComponent = function(type) {
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

		if (this._world.entityManager.contains(this)) {
			this._world.changedEntity(this);
		}
	};

	Entity.prototype.toString = function() {
		return this.name;
	};

	Entity.entityCount = 0;

	return Entity;
});
