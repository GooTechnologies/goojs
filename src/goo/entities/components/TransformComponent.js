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

		this.api = {
			setTranslation: function () {
				TransformComponent.prototype.setTranslation.apply(this, arguments);
				return this.entity;
			}.bind(this),
			setScale: function () {
				TransformComponent.prototype.setScale.apply(this, arguments);
				return this.entity;
			}.bind(this),
			addTranslation: function () {
				TransformComponent.prototype.addTranslation.apply(this, arguments);
				return this.entity;
			}.bind(this),
			setRotation: function () {
				TransformComponent.prototype.setRotation.apply(this, arguments);
				return this.entity;
			}.bind(this),
			lookAt: function() {
				TransformComponent.prototype.lookAt.apply(this, arguments);
				return this.entity;
			}.bind(this),

			// attachChild: Entity | Selection, boolean -> this
			attachChild: function (entity) {
				this.attachChild(entity.transformComponent);
				return this.entity;
			}.bind(this),

			// detachChild: Entity | Selection, boolean -> this
			detachChild: function (entity) {
				this.detachChild(entity.transformComponent);
				return this.entity;
			}.bind(this),

			children: function () {
				return new EntitySelection(this.entity).children();
			}.bind(this),

			parent: function () {
				return new EntitySelection(this.entity).parent();
			}.bind(this),

			traverse: function (callback, level) {
				level = level !== undefined ? level : 0;

				if (callback(this.entity, level) !== false) {
					for (var i = 0; i < this.children.length; i++) {
						var childEntity = this.children[i].entity;
						childEntity.traverse(callback, level + 1);
					}
				}

				return this.entity;
			}.bind(this),

			traverseUp: function (callback) {
				var transformComponent = this;
				while (callback(transformComponent.entity) !== false && transformComponent.parent) {
					transformComponent = transformComponent.parent;
				}

				return this.entity;
			}.bind(this)
		};
	}

	TransformComponent.type = 'TransformComponent';

	TransformComponent.prototype = Object.create(Component.prototype);
	TransformComponent.prototype.constructor = TransformComponent;

	/**
	 * Set this transform's translation.
	 * @param {Vector | number[] | number...} Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setTranslation = function () {
		this.transform.translation.set(arguments);
		this._dirty = true;
		return this;
	};

	/**
	 * Set this transform's scale.
	 * @param {Vector | number[] | number...} Component values.
	 * @return {TransformComponent} Self for chaining.
	 */
	TransformComponent.prototype.setScale = function () {
		this.transform.scale.set(arguments);
		this._dirty = true;
		return this;
	};

	/**
	 * Add to this transform's translation.
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
	 * Set this transform's rotation around X, Y and Z axis.
	 * The rotation is applied in XYZ order.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
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
	 * Mark the component for updates of world transform
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
	 * Detach a child transform from this component tree
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

		// update the normal matrix
		Matrix4x4.invert(this.transform.matrix, this.transform.normalMatrix);
		Matrix4x4.transpose(this.transform.normalMatrix, this.transform.normalMatrix);

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