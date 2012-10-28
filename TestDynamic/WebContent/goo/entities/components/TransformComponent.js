define(['goo/math/Transform', 'goo/entities/components/Component'], function(Transform, Component) {
	"use strict";

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

	TransformComponent.prototype.setUpdated = function() {
		this._dirty = true;
	};

	TransformComponent.prototype.attachChild = function(childComponent) {
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

	TransformComponent.prototype.detachChild = function(childComponent) {
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

	TransformComponent.prototype.updateTransform = function() {
		this.transform.update();
	};

	TransformComponent.prototype.updateWorldTransform = function() {
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