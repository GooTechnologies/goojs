var Transform = require('../../math/Transform');
var Vector3 = require('../../math/Vector3');
var Component = require('../../entities/components/Component');
var EntitySelection = require('../../entities/EntitySelection');

/**
 * Holds the transform of an entity. It also allows for a scene graph to be created,
 * in which transforms are inherited down the tree.
 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/TransformComponent/TransformComponent-vtest.html Working example
 * @extends Component
 */
function TransformComponent() {
	Component.apply(this, arguments);

	this.type = 'TransformComponent';

	/**
	 * Parent TransformComponent in the "scene graph".
	 * @type {TransformComponent}
	 */
	this.parent = null;

	/**
	 * Child TransformComponents in the "scene graph".
	 * @type {Array<TransformComponent>}
	 */
	this.children = [];

	/**
	 * The entity's transform in local space.
	 * @type {Transform}
	 */
	this.transform = new Transform();

	/**
	 * The entity's transform in world space.
	 * @readonly
	 * @type {Transform}
	 */
	this.worldTransform = new Transform();

	this._localTransformDirty = true;
	this._worldTransformDirty = true;

	// @ifdef DEBUG
	Object.seal(this);
	// @endif
}

TransformComponent.type = 'TransformComponent';

TransformComponent.prototype = Object.create(Component.prototype);
TransformComponent.prototype.constructor = TransformComponent;

//! AT: can this stay not on the prototype, but on the constructor?
// it would require Transform.prototype.constructor = TransformComponent; (for all components)
TransformComponent.prototype.api = {
	// these @target-class comments can sit anywhere in the source (as far as modoc is concerned)
	// I'm placing it here however since it's near the code it documents
	/**
	 * Sets the translation of this entity. Injected on entities with a transformComponent
	 * @target-class Entity setTranslation method
	 * @param {(Vector3|Array<number>)} translation
	 * @returns {Entity} Self to allow chaining
	 */
	setTranslation: function () {
		TransformComponent.prototype.setTranslation.apply(this.transformComponent, arguments);
		return this;
	},

	/**
	 * Sets the rotation of this entity. Injected on entities with a transformComponent
	 * @target-class Entity setRotation method
	 * @param {(Vector3|Array<number>)} angle
	 * @returns {Entity} Self to allow chaining
	 */
	setRotation: function () {
		TransformComponent.prototype.setRotation.apply(this.transformComponent, arguments);
		return this;
	},

	/**
	 * Sets the scale of this entity. Injected on entities with a transformComponent
	 * @target-class Entity setScale method
	 * @param {(Vector3|Array<number>)} scale
	 * @returns {Entity} Self to allow chaining
	 */
	setScale: function () {
		TransformComponent.prototype.setScale.apply(this.transformComponent, arguments);
		return this;
	},

	/**
	 * Orients the entity so it faces the supplied look at point. Injected on entities with a transformComponent
	 * @target-class Entity lookAt method
	 * @param {(Vector3|Array<number>)} lookAtPoint
	 * @returns {Entity} Self to allow chaining
	 */
	lookAt: function () {
		TransformComponent.prototype.lookAt.apply(this.transformComponent, arguments);
		return this;
	},

	/**
	 * Translates the entity with the supplied amount multipled by the entity's orientation. Injected on entities with a transformComponent
	 * @target-class Entity move method
	 * @param {(Vector3|Array<number>)} translation
	 * @returns {Entity} Self to allow chaining
	 */
	move: function () {
		TransformComponent.prototype.move.apply(this.transformComponent, arguments);
		return this;
	},

	/**
	 * Returns the local translation of the entity. Injected on entities with a transformComponent
	 * @target-class Entity getTranslation method
	 * @returns {Vector3} Translation
	 */
	getTranslation: function () {
		return TransformComponent.prototype.getTranslation.apply(this.transformComponent, arguments);
	},

	/**
	 * Returns the local rotation of the entity. Injected on entities with a transformComponent
	 * @target-class Entity getRotation method
	 * @returns {Vector3} Rotation
	 */
	getRotation: function () {
		return TransformComponent.prototype.getRotation.apply(this.transformComponent, arguments);
	},

	/**
	 * Returns the local scale of the entity. Injected on entities with a transformComponent
	 * @target-class Entity getScale method
	 * @returns {Vector3} Scale
	 */
	getScale: function () {
		return TransformComponent.prototype.getScale.apply(this.transformComponent, arguments);
	},

	/**
	 * Translates the entity with the given amount. Injected on entities with a transformComponent
	 * @target-class Entity addTranslation method
	 * @param {(Vector3|Array<number>)} translation
	 * @returns {Entity} Self to allow chaining
	 */
	addTranslation: function () {
		TransformComponent.prototype.addTranslation.apply(this.transformComponent, arguments);
		return this;
	},

	/**
	 * Rotates the entity with the given amount. Injected on entities with a transformComponent
	 * @target-class Entity addRotation method
	 * @param {(Vector3|Array<number>)} rotation
	 * @returns {Entity} Self to allow chaining
	 */
	addRotation: function () {
		TransformComponent.prototype.addRotation.apply(this.transformComponent, arguments);
		return this;
	},

	// no, there's no addScale

	/**
	 * Attaches the supplied entity to this entity as a child. Injected on entities with a transformComponent
	 * @target-class Entity attachChild method
	 * @param {Entity} childEntity
	 * @param {boolean} keepTransform If enabled will preserve the world transform of the child entity
	 * @returns {Entity} Self to allow chaining
	 */
	attachChild: function (childEntity, keepTransform) {
		this.transformComponent.attachChild(childEntity.transformComponent, keepTransform);
		return this;
	},

	/**
	 * Detaches the supplied entity from this entity. Injected on entities with a transformComponent
	 * @target-class Entity detachChild method
	 * @param {Entity} childEntity
	 * @param {boolean} keepTransform If enabled will preserve the world transform of the child entity
	 * @returns {Entity} Self to allow chaining
	 */
	detachChild: function (childEntity, keepTransform) {
		this.transformComponent.detachChild(childEntity.transformComponent, keepTransform);
		return this;
	},

	/**
	 * Returns an {@link EntitySelection} of the children of this entity. Injected on entities with a transformComponent
	 * @target-class Entity children method
	 * @returns {EntitySelection}
	 */
	children: function () {
		return new EntitySelection(this).children();
	},

	/**
	 * Returns an {@link EntitySelection} of the parent of this entity. Injected on entities with a transformComponent
	 * @target-class Entity parent method
	 * @returns {EntitySelection}
	 */
	parent: function () {
		return new EntitySelection(this).parent();
	},

	/**
	 * Traverses the entity hierarchy downwards starting from this entity and applies a function to all entities traversed.
	 * Traversal can be stopped if the function returns 'false'.
	 * Injected on entities with a transformComponent
	 * @target-class Entity traverse method
	 * @param {function (entity: Entity, level: number) : boolean} callback The function to be applied to traversed entities. Takes an entity and the current deph level and returns a boolean.
	 * @param {number} [level=0]
	 * @returns {Entity} Self to allow chaining
	 */
	traverse: function (callback, level) {
		level = level !== undefined ? level : 0;

		if (callback(this, level) !== false) {
			for (var i = 0; i < this.transformComponent.children.length; i++) {
				var childEntity = this.transformComponent.children[i].entity;
				childEntity.traverse(callback, level + 1);
			}
		}

		return this;
	},

	/**
	 * Traverses the entity hierarchy upwards starting from this entity and applies a function to all entities traversed.
	 * Traversal can be stopped if the function returns 'false'.
	 * Injected on entities with a transformComponent
	 * @target-class Entity traverseUp method
	 * @param {function (entity: Entity) : boolean} callback The function to be applied to traversed entities. Takes an entity and returns a boolean.
	 * @returns {Entity} Self to allow chaining
	 */
	traverseUp: function (callback) {
		var transformComponent = this.transformComponent;
		while (callback(transformComponent.entity) !== false && transformComponent.parent) {
			transformComponent = transformComponent.parent;
		}

		return this;
	},

	/**
	 * Hides the entity and its children. Injected on entities with a transformComponent
	 * @target-class Entity hide method
	 * @returns {Entity} Self to allow chaining
	 */
	hide: function () {
		this._hidden = true;

		// hide everything underneath this
		this.traverse(function (entity) {
			// will have to refactor this loop in some function; it's used in other places too
			for (var i = 0; i < entity._components.length; i++) {
				var component = entity._components[i];
				if (typeof component.hidden === 'boolean') {
					component.hidden = true;
				}
			}
		});

		return this;
	},

	/**
	 * Clears the hidden flag on this entity. The entity may still not show if it has a hidden ancestor. Injected on entities with a transformComponent
	 * @target-class Entity show method
	 * @returns {Entity} Self to allow chaining
	 */
	// will not show the entity (and it's children) if any of its ancestors are hidden
	show: function () {
		this._hidden = false;

		// first search if it has hidden parents to determine if itself should be visible
		var pointer = this;
		while (pointer.transformComponent.parent) {
			pointer = pointer.transformComponent.parent.entity;
			if (pointer._hidden) {
				// extra check and set might be needed
				for (var i = 0; i < this._components.length; i++) {
					var component = this._components[i];
					if (typeof component.hidden === 'boolean') {
						component.hidden = true;
					}
				}
				return this;
			}
		}

		this.traverse(function (entity) {
			if (entity._hidden) { return false; }
			for (var i = 0; i < entity._components.length; i++) {
				var component = entity._components[i];
				if (typeof component.hidden === 'boolean') {
					component.hidden = entity._hidden;
				}
			}
		});

		return this;
	},

	/**
	 * Returns whether the entity or any of its ancestors are hidden. Injected on entities with a transformComponent
	 * @target-class Entity isVisiblyHidden method
	 * @returns {boolean}
	 */
	isVisiblyHidden: function () {
		var pointer = this;

		if (pointer._hidden) {
			return true;
		}

		while (pointer.transformComponent.parent) {
			pointer = pointer.transformComponent.parent.entity;
			if (pointer._hidden) {
				return true;
			}
		}

		return false;
	},

	/**
	 * Returns the 'hidden' status of this entity. The entity may still be hidden if one of its ancestors is hidden. Injected on entities with a transformComponent
	 * @target-class Entity isHidden method
	 * @returns {boolean}
	 */
	isHidden: function () {
		return this._hidden;
	}
};

TransformComponent.entitySelectionAPI = {
	setTranslation: TransformComponent.prototype.api.setTranslation,
	setRotation: TransformComponent.prototype.api.setRotation,
	setScale: TransformComponent.prototype.api.setScale,
	lookAt: TransformComponent.prototype.api.lookAt,
	move: TransformComponent.prototype.api.move,
	addTranslation: TransformComponent.prototype.api.addTranslation,
	addRotation: TransformComponent.prototype.api.addRotation,
	hide: TransformComponent.prototype.api.hide,
	show: TransformComponent.prototype.api.show
};

var tmpVec = new Vector3();

/**
 * Returns the local translation vector. Do not modify the returned value, use .setTranslation() instead.
 * @returns {Vector3}
 * @example
 * var translation = entity.transformComponent.getTranslation();
 */
TransformComponent.prototype.getTranslation = function () {
	return this.sync().transform.translation;
};

/**
 * Returns the world translation vector. Do not modify the returned value, use .setTranslation() instead.
 * @returns {Vector3}
 * @example
 * var worldTranslation = entity.transformComponent.getWorldTranslation();
 */
TransformComponent.prototype.getWorldTranslation = function () {
	return this.sync().worldTransform.translation;
};

/**
 * Set the local translation vector.
 * @example
 * entity.transformComponent.setTranslation(1, 1, 0);
 * entity.transformComponent.setTranslation(new Vector3(1, 1, 0));
 * entity.transformComponent.setTranslation([1, 1, 0]);
 *
 * @param {(Vector | Array<number>)} translation
 * @returns {TransformComponent} Self for chaining.
 */
TransformComponent.prototype.setTranslation = function () {
	this.transform.translation.set(Vector3.fromAny.apply(null, arguments));
	this.setUpdated();
	return this;
};

/**
 * Adds to this transform's local translation.
 * @example
 * entity.transformComponent.addTranslation(1, 2, 1);
 * entity.transformComponent.addTranslation(new Vector3(1, 2, 1));
 * entity.transformComponent.addTranslation([1, 2, 1]);
 *
 * @param {(Vector | Array<number>)} Component values.
 * @returns {TransformComponent} Self for chaining.
 */
TransformComponent.prototype.addTranslation = function () {
	this.transform.translation.add(Vector3.fromAny.apply(null, arguments));
	this.setUpdated();
	return this;
};

/**
 * Get the local transform scale. Do not modify the returned value, use .setScale() instead.
 * @returns {Vector3}
 * @example
 * var scale = entity.transformComponent.getScale();
 */
TransformComponent.prototype.getScale = function () {
	return this.sync().transform.scale;
};

/**
 * Get the world transform scale. Do not modify the returned value, use .setScale() instead.
 * @returns {Vector3}
 * @example
 * var scale = entity.transformComponent.getWorldScale();
 */
TransformComponent.prototype.getWorldScale = function () {
	return this.sync().worldTransform.scale;
};

/**
 * Sets this transform local scale.
 * @param {(Vector | Array<number>)} Component values.
 * @returns {TransformComponent} Self for chaining
 * @example
 * entity.transformComponent.setScale(1, 1, 0);
 * entity.transformComponent.setScale(new Vector3(1, 1, 0));
 * entity.transformComponent.setScale([1, 1, 0]);
 */
TransformComponent.prototype.setScale = function () {
	this.transform.scale.set(Vector3.fromAny.apply(null, arguments));
	this.setUpdated();
	return this;
};


/**
 * Returns the local rotation matrix. Do not modify the returned value, use .setRotationMatrix() instead.
 * @returns {Matrix3}
 * @example
 * var matrix = entity.transformComponent.getRotationMatrix();
 */
TransformComponent.prototype.getRotationMatrix = function () {
	return this.sync().transform.rotation;
};

/**
 * Sets the local rotation matrix.
 * @returns {TransformComponent} Self for chaining
 * @example
 * entity.transformComponent.setRotationMatrix(new Matrix3());
 */
TransformComponent.prototype.setRotationMatrix = function (matrix) {
	this.transform.rotation.copy(matrix);
	this.setUpdated();
	return this;
};

/**
 * Returns the world rotation matrix. Do not modify the returned value, use .setRotationMatrix() instead.
 * @returns {Matrix3}
 * @example
 * var worldRotation = entity.transformComponent.getWorldRotationMatrix();
 */
TransformComponent.prototype.getWorldRotationMatrix = function () {
	return this.sync().worldTransform.rotation;
};

/**
 * Gets the local rotation in Euler angles (in radians, Euler order YZX).
 * @param {Vector3} [target] Target vector for storage. If not provided, a new vector object will be created and returned.
 * @returns {Vector3}
 *
 * @example
 * var localRotation = entity.transformComponent.getRotation(); // warning: creates a new Vector3 object
 * var localRotation2 = new Vector3();
 * entity.transformComponent.getRotation(localRotation2); // stores the result without creating a new object
 */
TransformComponent.prototype.getRotation = function (target) {
	target = target || new Vector3();
	return this.sync().transform.rotation.toAngles(target);
};

/**
 * Adds to this transform's rotation using Euler angles (in radians, Euler order YZX).
 * @param {(Vector | Array<number>)} Component values.
 * @returns {TransformComponent} Self for chaining.
 *
 * @example
 * entity.transformComponent.addRotation(Math.PI / 4, 0, 0);
 * entity.transformComponent.addRotation(new Vector3(Math.PI / 4, 0, 0));
 * entity.transformComponent.addRotation([Math.PI / 4, 0, 0]);
 */
TransformComponent.prototype.addRotation = function () {
	this.getRotation(tmpVec);
	if (arguments.length === 1 && typeof (arguments[0]) === 'object') {
		var arg0 = arguments[0];
		if (arg0 instanceof Vector3) {
			this.transform.rotation.fromAngles(tmpVec.x + arg0.x, tmpVec.y + arg0.y, tmpVec.z + arg0.z);
		} else if (arg0.length === 3) {
			this.transform.rotation.fromAngles(tmpVec.x + arg0[0], tmpVec.y + arg0[1], tmpVec.z + arg0[2]);
		}
	} else {
		this.transform.rotation.fromAngles(tmpVec.x + arguments[0], tmpVec.y + arguments[1], tmpVec.z + arguments[2]);
	}

	this.setUpdated();
	return this;
};

/**
 * Sets this transform's rotation around X, Y and Z axis (in radians, Euler order YZX). The rotation is applied in X, Y, Z order.
 * @param {(Vector | Array<number>)} Component values.
 * @returns {TransformComponent} Self for chaining.
 *
 * @example
 * entity.transformComponent.setRotation(Math.PI / 4, 0, 0);
 * entity.transformComponent.setRotation(new Vector3(Math.PI / 4, 0, 0));
 * entity.transformComponent.setRotation([Math.PI / 4, 0, 0]);
 */
TransformComponent.prototype.setRotation = function () {
	if (arguments.length === 1 && typeof (arguments[0]) === 'object') {
		var arg0 = arguments[0];
		if (arg0 instanceof Vector3) {
			this.transform.rotation.fromAngles(arg0.x, arg0.y, arg0.z);
		} else if (arg0.length === 3) {
			this.transform.rotation.fromAngles(arg0[0], arg0[1], arg0[2]);
		}
	} else {
		this.transform.rotation.fromAngles(arguments[0], arguments[1], arguments[2]);
	}

	this.setUpdated();
	return this;
};

/**
 * Sets the transform to look in a specific direction.
 * <br /><i>Injected into entity when adding component.</i>
 *
 * @param {(Vector3|Entity)} position Target position.
 * @param {Vector3} [up=(0, 1, 0)] Up vector.
 * @returns {TransformComponent} Self for chaining.
 *
 * @example
 * // Omitted up vector assumes Y is up:
 * entity.transformComponent.lookAt(1, 2, 3);
 * entity.transformComponent.lookAt([1, 2, 3]);
 * entity.transformComponent.lookAt(new Vector3(1, 2, 3));
 * entity.transformComponent.lookAt(otherEntity);
 *
 * // However, you can pass the up vector as well:
 * entity.transformComponent.lookAt([1, 2, 3], [0, 1, 0]);
 * entity.transformComponent.lookAt(new Vector3(1, 2, 3), new Vector3(0, 1, 0));
 * entity.transformComponent.lookAt(otherEntity, new Vector3(0, 1, 0));
 */
TransformComponent.prototype.lookAt = function (position, up) {
	if (arguments.length === 3) {
		this.transform.lookAt(new Vector3(arguments[0], arguments[1], arguments[2]));
	} else if (position.transformComponent) {
		this.transform.lookAt(position.transformComponent.sync().worldTransform.translation, up);
	} else {
		if (Array.isArray(position)) {
			position = Vector3.fromArray(position);
		}
		if (Array.isArray(up)) {
			up = Vector3.fromArray(up);
		}
		this.transform.lookAt(position, up);
	}
	this.setUpdated();
	return this;
};

/**
 * Adds to the translation in a local direction.
 * @param {(Vector | Array<number>)} component values.
 * @returns {TransformComponent} Self for chaining.
 *
 * @example
 * // Move the spaceShip entity in its own forward direction
 * spaceShip.transformComponent.move(new Vector3(0, 0, -1));
 */
TransformComponent.prototype.move = (function () {
	var moveWorldDirection = new Vector3();
	return function () {
		var moveLocalDirection = Vector3.fromAny.apply(null, arguments);
		this.transform.applyForwardVector(moveLocalDirection, moveWorldDirection);
		this.addTranslation(moveWorldDirection);
		return this;
	};
})();

/**
 * Mark the component for updates of world transform. Needs to be called after manually changing the transform without using helper functions.
 */
TransformComponent.prototype.setUpdated = function () {
	this._worldTransformDirty = this._localTransformDirty = true;
};

/**
 * Handles attaching itself to an entity. Should only be called by the engine.
 * @private
 * @param entity
 */
TransformComponent.prototype.attached = function (entity) {
	this.entity = entity;
};

/**
 * Handles detaching itself to an entity. Should only be called by the engine.
 * @private
 * @param entity
 */
TransformComponent.prototype.detached = function (/*entity*/) {
	this.entity = undefined; //! AT: used to be 'undefined' when it was handled in Entity; should instead be null
};

/**
 * Attach a child transform to this component tree
 * <br /><i>Injected into entity when adding component.</i>
 *
 * @param {TransformComponent} childComponent Child transform component to attach
 * @param {boolean} [keepTransform=false] If enabled, the child's position, rotation and scale will appear unaffected
 */
TransformComponent.prototype.attachChild = function (childComponent, keepTransform) {
	var component = this;
	while (component) {
		if (component === childComponent) {
			console.warn('attachChild: An object can\'t be added as a descendant of itself.');
			return;
		}
		component = component.parent;
	}
	if (childComponent.parent) {
		childComponent.parent.detachChild(childComponent);
	}

	if (keepTransform) {
		childComponent.sync();
		this.sync();
		childComponent.transform.multiply(this.worldTransform.invert(), childComponent.transform);
		childComponent.setUpdated();
	}

	childComponent.parent = this;
	this.children.push(childComponent);
};

/**
 * Detach a child transform from this component tree.
 * <br /><i>Injected into entity when adding component.</i>
 *
 * @param {TransformComponent} childComponent child transform component to detach
 * @param {boolean} [keepTransform=false] If enabled, the child's position, rotation and scale will appear unaffected
 */
TransformComponent.prototype.detachChild = function (childComponent, keepTransform) {
	if (childComponent === this) {
		console.warn('detachChild: An object can\'t be removed from itself.');
		return;
	}

	if (keepTransform) {
		childComponent.transform.copy(childComponent.sync().worldTransform);
	}

	var index = this.children.indexOf(childComponent);
	if (index !== -1) {
		childComponent.parent = null;
		this.children.splice(index, 1);
	}

	childComponent.setUpdated();
};

/**
 * Update component's transform.
 */
TransformComponent.prototype.updateTransform = function () {
	this.transform.update();
	this._localTransformDirty = false;
	this._worldTransformDirty = true;
};

/**
 * Update component's world transform (resulting transform considering parent transformations).
 */
TransformComponent.prototype.updateWorldTransform = (function () {
	var transformUpdatedEvent = {
		type: 'transformUpdated'
	};
	return function () {
		if (this._localTransformDirty) {
			this.updateTransform();
		}

		var worldTransform = this.worldTransform;
		var transform = this.transform;

		if (this.parent) {
			worldTransform.multiply(this.parent.worldTransform, transform);
		} else {
			worldTransform.copy(transform);
		}

		worldTransform.updateNormalMatrix();

		var entity = this.entity;
		if (entity) {
			entity.fire(transformUpdatedEvent);
		}
		this._worldTransformDirty = false;
	};
})();

/**
 * Update the local and world transforms of the entity tree above this component (and the component itself).
 */
TransformComponent.prototype.sync = (function () {
	var parents = [];
	return function () {
		var current = this;

		while (current !== null) {
			parents.push(current);
			current = current.parent;
		}

		var update = false;
		for (var i = parents.length - 1; i >= 0; i--) {
			var component = parents[i];
			if (component._worldTransformDirty || update) {
				update = true; // update the rest of the tree branch
				component.updateWorldTransform();

				// Parent was dirty but we set it to undirty. The children still need to be dirty because we didn't update them yet.
				var children = component.children;
				var l = children.length;
				while (l--) {
					children[l]._worldTransformDirty = true;
				}
			}
		}

		parents.length = 0;

		return this;
	};
})();

TransformComponent.applyOnEntity = function (obj, entity) {
	var transformComponent = entity.transformComponent;

	if (!transformComponent) {
		transformComponent = new TransformComponent();
	}

	var matched = false;
	if (Array.isArray(obj) && obj.length === 3) {
		transformComponent.transform.translation.setDirect(obj[0], obj[1], obj[2]);
		matched = true;
	} else if (obj instanceof Vector3) {
		transformComponent.transform.translation.setDirect(obj.x, obj.y, obj.z);
		matched = true;
	} else if (typeof obj === 'object' &&
		typeof obj.x !== 'undefined' && typeof obj.y !== 'undefined' && typeof obj.z !== 'undefined') {
		transformComponent.transform.translation.setDirect(obj.x, obj.y, obj.z);
		matched = true;
	} else if (obj instanceof Transform) {
		transformComponent.transform = obj;
		matched = true;
	}

	if (matched) {
		transformComponent.setUpdated();
		entity.setComponent(transformComponent);
		return true;
	}
};

module.exports = TransformComponent;