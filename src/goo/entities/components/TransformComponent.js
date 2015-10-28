define([
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/entities/components/Component',
	'goo/entities/EntitySelection'
], function (
	Transform,
	Vector3,
	Component,
	EntitySelection
) {
	'use strict';

	/**
	 * Holds the transform of an entity. It also allows for a scene graph to be created,
	 * in which transforms are inherited down the tree.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/entities/components/TransformComponent/TransformComponent-vtest.html Working example
	 * @extends Component
	 */
	function TransformComponent() {
		Component.apply(this, arguments);

		this.type = 'TransformComponent';

		this.entity = null;
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

		this._dirty = true;
		this._updated = false;

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
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
	 * Gets the value of transformComponent.transform.translation.
	 * To change the translation, the returned object can be modified
	 * after which transformComponent.setUpdated() must be called.
	 * Alternatively, use setTranslation or addTranslation which call
	 * setUpdated() automatically.
	 * <br /><i>Injected into entity when adding component.</i>
	 * @example
	 * var boxTranslation1 = boxEntity.transformComponent.getTranslation();
	 * var boxTranslation2 = boxEntity.getTranslation();
	 * console.log(boxTranslation1 === boxTranslation2); // true
	 *
	 * @returns {Vector3} translation
	 */
	TransformComponent.prototype.getTranslation = function () {
		return this.transform.translation;
	};

	/**
	 * Sets this transform's translation.
	 * <br /><i>Injected into entity when adding component.</i>
	 * @example
	 * // The lines below are equivalent.
	 * sphereEntity.transformComponent.setTranslation(1, 1, 0);
	 * sphereEntity.setTranslation(1, 1, 0);
	 * sphereEntity.setTranslation(new Vector3(1, 1, 0));
	 *
	 * @param {(Vector | Array<number>)} translation Component values.
	 * @returns {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setTranslation = function () {
		this.transform.translation.set(Vector3.fromAny.apply(null, arguments));
		this._dirty = true;
		return this;
	};

	/**
	 * Gets the value of transformComponent.transform.scale.
	 * To change the scale, the returned object can be modified
	 * after which transformComponent.setUpdated() must be called.
	 * Alternatively, use setScale which calls setUpdated() automatically.
	 * <br /><i>Injected into entity when adding component.</i>
	 * @example
	 * var scale1 = entity.transformComponent.getScale();
	 * var scale2 = entity.getScale();
	 * console.log(scale1 === scale2); // true
	 *
	 * @returns {Vector3} scale
	 */
	TransformComponent.prototype.getScale = function () {
		return this.transform.scale;
	};

	/**
	 * Sets this transform's scale.
	 * <br /><i>Injected into entity when adding component.</i>
	 *
	 * @param {(Vector | Array<number>)} Component values.
	 * @returns {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setScale = function () {
		this.transform.scale.set(Vector3.fromAny.apply(null, arguments));
		this._dirty = true;
		return this;
	};

	/**
	 * Adds to this transform's translation.
	 * <br /><i>Injected into entity when adding component.</i>
	 * @example
	 * // Lines below are equivalent
	 * boxEntity.addTranslation(new Vector(1, 2, 1));
	 * boxEntity.transformComponent.addTranslation(1, 2, 1);
	 *
     * @param {(Vector | Array<number>)} Component values.
	 * @returns {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.addTranslation = function () {
		this.transform.translation.add(Vector3.fromAny.apply(null, arguments));
		this._dirty = true;
		return this;
	};

	/**
	 * Gets the value of transformComponent.transform.rotation in Euler angles (in radians, Euler order YZX).
	 * Returns a new Vector3 that cannot be used for modifying the rotation.
	 * <br /><i>Injected into entity when adding component.</i>.
	 * @example
	 * var rot1 = sphereEntity.getRotation();
	 * var rot2 = sphereEntity.transformComponent.getRotation();
	 * console.log(rot1 === rot2); // true
	 *
	 * @param {Vector3} [target] Target vector for storage.
	 * @returns {Vector3} rotation
	 */
	TransformComponent.prototype.getRotation = function (target) {
		target = target || new Vector3();
		return this.transform.rotation.toAngles(target);
	};

	/**
	 * Adds to this transform's rotation using Euler angles (in radians, Euler order YZX).
	 * <br /><i>Injected into entity when adding component.</i>
	 * @example
	 * boxEntity.setRotation(Math.PI/4.0, 0, 0);
	 * console.log(boxEntity.getRotation().toString()); // [0.79, 0, 0]
	 * boxEntity.addRotation(new Vector3(MathUtils.DEG_TO_RAD * 45.0, 0, 0));
	 * console.log(boxEntity.getRotation().toString()); // [1.57, 0, 0]
	 *
	 * @param {(Vector | Array<number>)} Component values.
	 * @returns {TransformComponent} Self for chaining.
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

		this._dirty = true;
		return this;
	};

	/**
	 * Sets this transform's rotation around X, Y and Z axis (in radians, Euler order YZX).
	 * The rotation is applied in X, Y, Z order.
	 * <br /><i>Injected into entity when adding component.</i>
	 * @example
	 * boxEntity.setRotation(Math.PI, 0, 0);
	 * console.log(boxEntity.getRotation().toString()); // [3.14, 0, 0]
	 *
	 * @param {(Vector | Array<number>)} Component values.
	 * @returns {TransformComponent} Self for chaining.
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

		this._dirty = true;
		return this;
	};

	/**
	 * Sets the transform to look in a specific direction.
	 * <br /><i>Injected into entity when adding component.</i>
	 *
	 * @param {(Vector3|Entity)} position Target position.
	 * @param {Vector3} [up=(0, 1, 0)] Up vector.
	 * @returns {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.lookAt = function (position, up) {
		//! AT: needs updating of transform before the actual lookAt to account for changes in translation
		if (arguments.length === 3) {
			this.transform.lookAt(new Vector3(arguments[0], arguments[1], arguments[2]));
		} else if (position.transformComponent) {
			if (position.transformComponent._dirty) {
				position.transformComponent.updateWorldTransform();
			}
			this.transform.lookAt(position.transformComponent.worldTransform.translation, up);
		} else {
			if (Array.isArray(position)) {
				position = Vector3.fromArray(position);
			}
			if (Array.isArray(up)) {
				up = Vector3.fromArray(up);
			}
			this.transform.lookAt(position, up);
		}
		this._dirty = true;
		return this;
	};

	/**
	 * Adds to the translation in a local direction.<br/>
	 * This is similar to addTranslation but this function takes the argument in local coordinate space and converts it for you.<br/>
	 * So for example move(0, 0, -1) moves forward (because of the right handed coordinate system).<br/>
	 * <i>Injected into entity when adding component.</i>
	 *
	 * @function
	 * @param {(Vector | Array<number>)} component values.
	 * @returns {TransformComponent} Self for chaining.
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
		this._dirty = true;
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
			childComponent.updateTransform();
			this.updateTransform();
			this.updateWorldTransform();
			childComponent.transform.multiply(this.worldTransform.invert(), childComponent.transform);
		}

		childComponent.parent = this;
		this.children.push(childComponent);

		childComponent.setUpdated();
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
			childComponent.transform.copy(childComponent.worldTransform);
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
	};

	/**
	 * Update component's world transform (resulting transform considering parent transformations).
	 */
	TransformComponent.prototype.updateWorldTransform = function () {
		if (this.parent) {
			this.worldTransform.multiply(this.parent.worldTransform, this.transform);
		} else {
			this.worldTransform.copy(this.transform);
		}

		this.worldTransform.updateNormalMatrix();

		this._dirty = false;
		this._updated = true;
	};

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

	return TransformComponent;
});