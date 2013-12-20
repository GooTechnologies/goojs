define([
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/entities/components/Component'
],
/** @lends */
function (
	Transform,
	Vector3,
	Component
) {
	"use strict";

	/**
	 * @class Holds the transform of an entity. It also allows for a scene graph to be created, where transforms are inherited
	 * down the tree.
	 */
	function TransformComponent() {
		this.type = 'TransformComponent';

		this.entity = null;
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
	}

	TransformComponent.prototype = Object.create(Component.prototype);

	/**
	 * Set this transform's translation.
	 * @param {Vector|Float[]|...Float} arguments Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setTranslation = function () {
		this.transform.translation.set(arguments);
		this._dirty = true;
		return this;
	};

	/**
	 * Set this transform's scale.
	 * @param {Vector|Float[]|...Float} arguments Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setScale = function () {
		this.transform.scale.set(arguments);
		this._dirty = true;
		return this;
	};

	/**
	 * Add to this transform's translation.
	 * @param {Vector|Float[]|...Float} arguments Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.addTranslation = function () {
		if(arguments.length === 3) {
			this.transform.translation.add(arguments);
		} else {
			this.transform.translation.add(arguments[0]);
		}
		this._dirty = true;
		return this;
	};

	/**
	 * Set this transform's rotation around X, Y and Z axis.
	 * The rotation is applied in XYZ order.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setRotation = function () {
		if (arguments.length === 1 && typeof (arguments[0]) === "object") {
			var arg0 = arguments[0];
			if (arg0 instanceof Vector3) {
				this.transform.rotation.fromAngles(arg0.x,arg0.y,arg0.z);
			} else if (arg0.length === 3) {
				this.transform.rotation.fromAngles(arg0[0],arg0[1],arg0[2]);
			}
		} else {
			this.transform.rotation.fromAngles(arguments[0], arguments[1], arguments[2]);
		}

		this._dirty = true;
		return this;
	};

	/**
	 * Sets the transform to look in a specific direction.
	 * @param {Vector3} position Target position.
	 * @param {Vector3} up Up vector.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.lookAt = function (position, up) {
		this.transform.lookAt(position, up);
		this._dirty = true;
		return this;
	};

	/**
	 * Mark the component for updates of world transform
	 */
	TransformComponent.prototype.setUpdated = function () {
		this._dirty = true;
	};

	/**
	 * Handles attaching itself to an entity. Should only be called by the engine.
	 * @param entity
	 */
	TransformComponent.prototype.attached = function (entity) {
		this.entity = entity;
	};

	/**
	 * Handles detaching itself to an entity. Should only be called by the engine.
	 * @param entity
	 */
	TransformComponent.prototype.detached = function (/*entity*/) {
		this.entity = undefined; // used to be 'undefined' when it was handled in Entity; should instead be null
	};

	/**
	 * Attach a child transform to this component tree
	 *
	 * @param {TransformComponent} childComponent child transform component to attach
	 */
	TransformComponent.prototype.attachChild = function (childComponent) {
		var component = this;
		while(component) {
			if (component === childComponent) {
				console.warn('attachChild: An object can\'t be added as a descendant of itself.');
				return;
			}
			component = component.parent;
		}
		if (childComponent.parent) {
			childComponent.parent.detachChild(childComponent);
		}
		childComponent.parent = this;
		this.children.push(childComponent);
	};

	/**
	 * Detach a child transform from this component tree
	 *
	 * @param {TransformComponent} childComponent child transform component to detach
	 */
	TransformComponent.prototype.detachChild = function (childComponent) {
		if (childComponent === this) {
			console.warn('attachChild: An object can\'t be removed from itself.');
			return;
		}

		var index = this.children.indexOf(childComponent);
		if (index !== -1) {
			childComponent.parent = null;
			this.children.splice(index, 1);
		}
	};

	/**
	 * Update target transform contained by this component
	 */
	TransformComponent.prototype.updateTransform = function () {
		this.transform.update();
	};

	/**
	 * Update this transform components world transform (resulting transform considering parent transformations)
	 */
	TransformComponent.prototype.updateWorldTransform = function () {
		if (this.parent) {
			this.worldTransform.multiply(this.parent.worldTransform, this.transform);
		} else {
			this.worldTransform.copy(this.transform);
		}
		this._dirty = false;
		this._updated = true;
	};

	return TransformComponent;
});