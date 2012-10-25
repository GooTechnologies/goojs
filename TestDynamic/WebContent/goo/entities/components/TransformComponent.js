"use strict";

define([ 'goo/math/Transform' ], function(Transform) {
	function TransformComponent() {
		this.type = 'TransformComponent';

		this.children = [];
		this.transform = new Transform();
		this.worldTransform = new Transform();

		this._dirty = true;
		this._updated = false;
	}

	TransformComponent.prototype.setUpdated = function() {
		this._dirty = true;
	};

	TransformComponent.prototype.attachChild = function(childComponent) {
		if (childComponent === this) {
			// REVIEW: Do we need to check this recursively?
			console.warn('attachChild: An object can\'t be added as a child of itself.');
			return;
		}

		// REVIEW: I'd use null instead of undefined in this case, or just:
		// if (!childComponent.parent) ...
		if (childComponent.parent !== undefined) {
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
			// REVIEW: What is TransformComponent.root? Undefined?
			childComponent.parent = TransformComponent.root;
			this.children.splice(index, 1);
		}
	};

	TransformComponent.prototype.updateTransform = function() {
		this.transform.update();
	};

	TransformComponent.prototype.updateWorldTransform = function() {
		if (this.parent !== undefined) {
			this.worldTransform.multiply(this.parent.worldTransform, this.transform);
		} else {
			this.worldTransform.copy(this.transform);
		}
		this._dirty = false;
		this._updated = true;
	};

	return TransformComponent;
});