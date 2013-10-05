define([
	'goo/math/Transform'
],
/** @lends */
function (
	Transform
) {
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

		/** Parent transformcomponent in the "scene graph"
		 * @type {TransformComponent}
		 * @default
		 */
		this.parent = null;
		/**
		 * Child transformcomponents in the "scenegraph"
		 * @type {TransformComponent[]}
		 */
		this.children = [];

		/** @type {Transform} */
		this.transform = new Transform();

		/** The entity's transform in world space.
		 * Read only. Automatically updated.
		 * @type {Transform} */
		this.worldTransform = new Transform();

		this._dirty = true;
		this._updated = false;

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
	 */
	Entity.prototype.addToWorld = function (recursive) {
		this._world.addEntity(this, recursive);
	};

	/**
	 * Remove entity from the world.
	 * @param {boolean} [recursive=true] Remove children recursively
	 */
	Entity.prototype.removeFromWorld = function (recursive) {
		this._world.removeEntity(this, recursive);
	};

	function getTypeAttributeName(type) {
		return type.charAt(0).toLowerCase() + type.substr(1);
	}

	Entity.prototype.addComponent = function (component) {
		if (component instanceof Function) {
			component = new component();
		}
		if (!component.allowMultiple && this.hasComponent(component.type)) {
			// TODO: Overwrite or reject?
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

		component.ownerEntity = this;

		if (this._world.entityManager.containsEntity(this)) {
			this._world.changedEntity(this, component, 'addedComponent');
		}
	};

	/**
	 * Set component of a certain type on entity. Existing component of the same type will be overwritten.
	 *
	 * @param {Component} component Component to set on the entity
	 * @deprecated Since v0.5.x. Should now use addComponent
	 */
	Entity.prototype.setComponent = function (component) {
		this.addComponent(component);
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
	 * Mark the component for updates of world transform
	 */
	Entity.prototype.setUpdated = function () {
		this._dirty = true;
	};

	/**
	 * Attach a child entity to this entity
	 *
	 * @param {Entity} childEntity child entity to attach
	 */
	Entity.prototype.attachChild = function (childEntity) {
		var entity = this;
		while(entity) {
			if (entity === childEntity) {
				console.warn('attachChild: An object can\'t be added as a descendant of itself.');
				return;
			}
			entity = entity.parent;
		}
		if (childEntity.parent) {
			childEntity.parent.detachChild(childEntity);
		}
		childEntity.parent = this;
		this.children.push(childEntity);
	};

	/**
	 * Detach a child transform from this component tree
	 *
	 * @param {Entity} childComponent child transform component to detach
	 */
	Entity.prototype.detachChild = function (childEntity) {
		if (childEntity === this) {
			console.warn('attachChild: An object can\'t be removed from itself.');
			return;
		}

		var index = this.children.indexOf(childEntity);
		if (index !== -1) {
			childEntity.parent = null;
			this.children.splice(index, 1);
		}
	};

	/**
	 * Update target transform contained by this component
	 */
	Entity.prototype.updateTransform = function () {
		this.transform.update();
	};

	/**
	 * Update this transform components world transform (resulting transform considering parent transformations)
	 */
	Entity.prototype.updateWorldTransform = function () {
		if (this.parent) {
			this.worldTransform.multiply(this.parent.worldTransform, this.transform);
		} else {
			this.worldTransform.copy(this.transform);
		}
		this._dirty = false;
		this._updated = true;
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
