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
		if (index == -1) {
			this._components.push(component);
		} else {
			this._components[index] = component;
		}
		this[component.type] = component;

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
		if (index != -1) {
			this._components.splice(index, 1);
		}
		delete this[type];

		if (this._world._entityManager.contains(this)) {
			this._world.changedEntity(this);
		}
	};

	Entity.prototype.toString = function() {
		return this.name + ' [' + this._components.length + ']';
	};

	Entity.ENTITY_COUNT = 0;

	return Entity;
});