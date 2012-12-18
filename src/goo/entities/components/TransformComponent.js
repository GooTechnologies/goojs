define(['goo/math/Transform', 'goo/entities/components/Component'], function (Transform, Component) {
	"use strict";

	/**
	 * @name TransformComponent
	 * @class The transform component holds the transform of an entity. It also allows for a scenegraph to be created, where transforms are inherited
	 *        down the tree.
	 * @property {TransformComponent} parent Parent transformcomponent in the "scenegraph"
	 * @property {TransformComponent[]} children Child transformcomponents in the "scenegraph"
	 */
	function TransformComponent() {
		this.type = 'TransformComponent';

		this.parent = null;
		this.children = [];
		this.transform = new Transform();
		this.worldTransform = new Transform();

		this._dirty = true;
		this._updated = false;
	}

	TransformComponent.prototype = Object.create(Component.prototype);

	/**
	 * Mark the component for updates of world transform
	 */
	TransformComponent.prototype.setUpdated = function () {
		this._dirty = true;
	};

	/**
	 * Attach a child transform to this component tree
	 *
	 * @param childComponent child transform component to attach
	 */
	TransformComponent.prototype.attachChild = function (childComponent) {
		if (childComponent === this) {
			// REVIEW: Do we need to check this recursively? ANSWER: Yes
			console.warn('attachChild: An object can\'t be added as a child of itself.');
			return;
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
	 * @param childComponent child transform component to detach
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