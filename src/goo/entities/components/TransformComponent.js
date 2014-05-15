define([
	'goo/math/Transform',
	'goo/math/Vector3',
	'goo/entities/components/Component',
	'goo/entities/EntitySelection',
	'goo/math/Matrix4x4'
],
/** @lends */
function (
	Transform,
	Vector3,
	Component,
	EntitySelection,
	Matrix4x4
) {
	'use strict';

	/**
	 * @class Holds the transform of an entity. It also allows for a scene graph to be created,
	 * in which transforms are inherited down the tree.
	 * @extends Component
	 */
	function TransformComponent() {
		this.type = 'TransformComponent';

		this.entity = null;
		/** Parent TransformComponent in the "scene graph".
		 * @type {TransformComponent}
		 * @default
		 */
		this.parent = null;
		/**
		 * Child TransformComponents in the "scene graph".
		 * @type {TransformComponent[]}
		 */
		this.children = [];

		/**
		 * The entity's transform in local space.
		 * @type {Transform}
		 */
		this.transform = new Transform();

		/** The entity's transform in world space.
		 * Read only. Automatically updated.
		 * @type {Transform}
		 */
		this.worldTransform = new Transform();

		this._dirty = true;
		this._updated = false;
	}

	TransformComponent.type = 'TransformComponent';

	TransformComponent.prototype = Object.create(Component.prototype);
	TransformComponent.prototype.constructor = TransformComponent;

	TransformComponent.prototype.api = {
		setTranslation: function () {
			TransformComponent.prototype.setTranslation.apply(this.transformComponent, arguments);
			return this;
		},
		setRotation: function () {
			TransformComponent.prototype.setRotation.apply(this.transformComponent, arguments);
			return this;
		},
		setScale: function () {
			TransformComponent.prototype.setRotation.apply(this.transformComponent, arguments);
			return this;
		},
		lookAt: function () {
			TransformComponent.prototype.lookAt.apply(this.transformComponent, arguments);
			return this;
		},

		getTranslation: function () {
			return TransformComponent.prototype.getTranslation.apply(this.transformComponent, arguments);
		},
		getRotation: function () {
			return TransformComponent.prototype.getRotation.apply(this.transformComponent, arguments);
		},
		getScale: function () {
			return TransformComponent.prototype.getScale.apply(this.transformComponent, arguments);
		},

		addTranslation: function () {
			TransformComponent.prototype.addTranslation.apply(this, arguments);
			return this;
		},
		addRotation: function () {
			TransformComponent.prototype.addRotation.apply(this, arguments);
			return this;
		},
		// no, there's no addScale


		// attachChild: Entity | Selection, boolean -> this
		attachChild: function (entity) {
			this.transformComponent.attachChild(entity.transformComponent);
			return this;
		},
		// detachChild: Entity | Selection, boolean -> this
		detachChild: function (entity) {
			this.transformComponent.detachChild(entity.transformComponent);
			return this;
		},

		children: function () {
			return new EntitySelection(this).children();
		},
		parent: function () {
			return new EntitySelection(this).parent();
		},

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
		traverseUp: function (callback) {
			var transformComponent = this.transformComponent;
			while (callback(transformComponent.entity) !== false && transformComponent.parent) {
				transformComponent = transformComponent.parent;
			}

			return this;
		}
	};

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
	 * @return {Vector3} translation
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
	 * @param {Vector | number[] | number...} Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setTranslation = function () {
		this.transform.translation.set(arguments);
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
	 * @return {Vector3} scale
	 */
	TransformComponent.prototype.getScale = function () {
		return this.transform.scale;
	};

	/**
	 * Sets this transform's scale.
	 * <br /><i>Injected into entity when adding component.</i>
	 *
	 * @param {Vector | number[] | number...} Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setScale = function () {
		this.transform.scale.set(arguments);
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
     * @param {Vector | number[] | number...} Component values.
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
	 * Gets the value of transformComponent.transform.rotation in Euler angles (in radians).
	 * Returns a new Vector3 that cannot be used for modifying the rotation.
	 * <br /><i>Injected into entity when adding component.</i>.
	 * @example
	 * var rot1 = sphereEntity.getRotation();
	 * var rot2 = sphereEntity.transformComponent.getRotation();
	 * console.log(rot1 === rot2); // true
	 *
	 * @param {Vector3} [target] Target vector for storage.
	 * @return {Vector3} rotation
	 */
	TransformComponent.prototype.getRotation = function (target) {
		this.tmpRotVec = this.tmpRotVec || new Vector3();
		target = target || this.tmpRotVec;
		return this.transform.rotation.toAngles(target);
	};

	/**
	 * Adds to this transform's rotation using Euler angles (in radians).
	 * <br /><i>Injected into entity when adding component.</i>
	 * @example
	 * boxEntity.setRotation(Math.PI/4.0, 0, 0);
	 * console.log(boxEntity.getRotation().toString()); // [0.79, 0, 0]
	 * boxEntity.addRotation(new Vector3(MathUtils.DEG_TO_RAD*45.0, 0, 0));
	 * console.log(boxEntity.getRotation().toString()); // [1.57, 0, 0]
	 *
	 * @param {Vector | number[] | number...} Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.addRotation = function () {
		this.tmpVec = this.tmpVec || new Vector3();
		this.getRotation( this.tmpVec);
		if (arguments.length === 1 && typeof (arguments[0]) === 'object') {
			var arg0 = arguments[0];
			if (arg0 instanceof Vector3) {
				this.transform.rotation.fromAngles(this.tmpVec.x+arg0.x, this.tmpVec.y+arg0.y, this.tmpVec.z+arg0.z);
			} else if (arg0.length === 3) {
				this.transform.rotation.fromAngles(this.tmpVec.x+arg0[0], this.tmpVec.y+arg0[1], this.tmpVec.z+arg0[2]);
			}
		} else {
			this.transform.rotation.fromAngles(this.tmpVec.x+arguments[0], this.tmpVec.y+arguments[1], this.tmpVec.z+arguments[2]);
		}

		this._dirty = true;
		return this;
	};

	/**
	 * Sets this transform's rotation around X, Y and Z axis (Euler angles, in radians).
	 * The rotation is applied in X, Y, Z order.
	 * <br /><i>Injected into entity when adding component.</i>
	 * @example
	 * boxEntity.setRotation(Math.PI, 0, 0);
	 * console.log(boxEntity.getRotation().toString()); // [3.14, 0, 0]
	 *
	 * @param {Vector | number[] | number...} Component values.
	 * @return {TransformComponent} Self for chaining.
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
	 * @param {Vector3} position Target position.
	 * @param {Vector3} [up=(0, 1, 0)] Up vector.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.lookAt = function (position, up) {
		//! AT: needs updating of transform before the actual lookAt to account for changes in translation
		if (arguments.length === 3) {
			this.transform.lookAt(new Vector3(arguments[0], arguments[1], arguments[2]));
		} else {
			if (Array.isArray(position)) {
				position = new Vector3(position);
			}
			if (Array.isArray(up)) {
				up = new Vector3(up);
			}
			this.transform.lookAt(position, up);
		}

		this._dirty = true;
		return this;
	};

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

		if (keepTransform) {
			childComponent.updateTransform();
			this.updateTransform();
			this.updateWorldTransform();
			childComponent.transform.multiply(this.worldTransform.invert(), childComponent.transform);
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
			console.warn('attachChild: An object can\'t be removed from itself.');
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

		// update the normal matrix
		Matrix4x4.invert(this.worldTransform.matrix, this.worldTransform.normalMatrix);
		Matrix4x4.transpose(this.worldTransform.normalMatrix, this.worldTransform.normalMatrix);

		this._dirty = false;
		this._updated = true;
	};

	TransformComponent.applyOnEntity = function(obj, entity) {
		var transformComponent = entity.transformComponent;

		if (!transformComponent) {
			transformComponent = new TransformComponent();
		}

		var matched = false;
		if (Array.isArray(obj) && obj.length === 3) {
			transformComponent.transform.translation.setd(obj[0], obj[1], obj[2]);
			matched = true;
		} else if (obj instanceof Vector3) {
			transformComponent.transform.translation.setd(obj.data[0], obj.data[1], obj.data[2]);
			matched = true;
		} else if (typeof obj === 'object' &&
			typeof obj.x !== 'undefined' && typeof obj.y !== 'undefined' && typeof obj.z !== 'undefined') {
			transformComponent.transform.translation.setd(obj.x, obj.y, obj.z);
			matched = true;
		} else if (obj instanceof Transform) {
			transformComponent.transform = obj;
			matched = true;
		}

		if (matched) {
			entity.setComponent(transformComponent);
			return true;
		}
	};

	return TransformComponent;
});