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
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 */
	TransformComponent.prototype.setTranslation = function (x,y,z) {
		if( toString.call(x) === "[object Array]") {
			if( x.length != 3)
				throw "length of the array argument to setTranslation must be 3";
			for( var i=0; i<3; i++) {
				if( typeof x[i] !== 'number') {
					throw "elements of the array argument to setTranslation must be of type number";
				}
			}
			this.transform.translation.seta(x);
		} else if( x instanceof Vector3) {
			this.transform.translation.setv(x);
		} else if( typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
			this.transform.translation.setd(x,y,z);
		} else {
			throw "arguments to setTranslation must be either 3 numbers or one Vector3 or one Array with 3 numbers.";
		}
		this._dirty = true;
	};

	/**
	 * Set this transform's rotation around X, Y and Z axis.
	 * The rotation is applied in XYZ order.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 */
	TransformComponent.prototype.setRotation = function (x,y,z) {
		this.transform.rotation.fromAngles(x,y,z);
		this._dirty = true;
	};

	/**
	 * Sets the transform to look in a specific direction.
	 * @param {Vector3} position Target position.
	 * @param {Vector3} up Up vector.
	 */
	TransformComponent.prototype.lookAt = function (position, up) {
		this.transform.lookAt(position, up);
		this._dirty = true;
	};

	/**
	 * Mark the component for updates of world transform
	 */
	TransformComponent.prototype.setUpdated = function () {
		this._dirty = true;
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