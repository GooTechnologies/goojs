"use strict";

define(function() {
	function Entity(world) {
		this._world = world;
		this._components = [];

		Object.defineProperty(this, 'id', {
			value : Entity.ENTITY_COUNT++,
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
		//   return component.type.charAt(0).toLowerCase() + component.type.substr(1)}
		// }
		// this[getTypeAttributeName[component.type] = component;
		//
		// Maybe even better to access component like entity.components.transform
		// instead of entity.transformComponent?
		// Perhaps just let the component.type be a short lower-case name?
		this[component.type] = component;

		if (component.type === 'TransformComponent') {
			// REVIEW: Is there a reason not to do this on all kinds of components, not just TransformComponent?
			component.entity = this;
		}

		if (this._world._entityManager.contains(this)) {
			this._world.changedEntity(this);
		}
	};

	Entity.prototype.getComponent = function(type) {
		return this[type];
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
		delete this[type];

		if (this._world._entityManager.contains(this)) {
			this._world.changedEntity(this);
		}
	};

	Entity.prototype.toString = function() {
		return this.name;
	};

	// REVIEW: Why caps? It's not a constant.
	Entity.ENTITY_COUNT = 0;

	return Entity;
});
