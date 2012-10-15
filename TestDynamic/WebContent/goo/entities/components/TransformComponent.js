define([ 'goo/math/Transform' ], function(Transform) {
	function TransformComponent() {
		this.type = 'TransformComponent';

		this.parent = undefined;
		this.children = [];
		this.transform = new Transform();
		this.worldTransform = new Transform();

		this._dirty = true;
		this._updated = false;
	}

	TransformComponent.prototype.attachChild = function(childComponent) {
		if (childComponent === this) {
			console.warn('attachChild: An object can\'t be added as a child of itself.');
			return;
		}

		if (childComponent.parent !== undefined) {
			childComponent.parent.remove(childComponent);
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
			childComponent.parent = undefined;
			this.children.splice(index, 1);
		}
	};

	TransformComponent.prototype.updateWorldTransform = function() {
		if (parent != null) {
			parent.worldTransform.multiply(this.transform, this.worldTransform);
		} else {
			this.worldTransform.set(this.transform);
		}
		_dirty = false;
		_updates = true;
	};

	return TransformComponent;
});