define([
	'goo/entities/components/Component',
	'goo/addons/physicspack/colliders/Collider'
],
function (
	Component,
	Collider
) {
	'use strict';

	/**
	 * Adds a physics collider to the entity. If the entity or any of its ancestors have a {RigidBodyComponent}, the collider is added to the physics world.
	 * @param {Object} [settings]
	 * @param {Collider} [settings.collider]
	 * @param {boolean} [settings.isTrigger=false]
	 * @extends Component
	 */
	function ColliderComponent(settings) {
		Component.apply(this);

		this.type = 'ColliderComponent';
		settings = settings || {};

		/**
		 * @private
		 * @type {Entity|null}
		 */
		this.entity = null;

		/**
		 * Is true if the collider was updated during the last process call in the ColliderSystem.
		 * @private
		 * @type {boolean}
		 */
		this._updated = false;

		/**
		 * Set to true if you edited any properties of the .collider.
		 * @type {boolean}
		 */
		this._dirty = true;

		/**
		 * @type {Collider}
		 */
		this.collider = settings.collider || null;

		/**
		 * The world-scaled version of the collider. Use .updateWorldCollider() to update it.
		 * @type {Collider}
		 */
		this.worldCollider = this.collider ? this.collider.clone() : null;

		/**
		 * If the collider is a Trigger, it does not interact with other objects, but it does emit contact events.
		 * @type {boolean}
		 */
		this.isTrigger = settings.isTrigger !== undefined ? settings.isTrigger : false;

		/**
		 * The entity with a rigid body component that instantiated the collider, or null if it wasn't instantiated.
		 * @type {Entity}
		 */
		this.bodyEntity = null;

		/**
		 * The collider material.
		 * @type {PhysicsMaterial}
		 */
		this.material = settings.material !== undefined ? settings.material : null;
	}
	ColliderComponent.prototype = Object.create(Component.prototype);
	ColliderComponent.prototype.constructor = ColliderComponent;
	ColliderComponent.type = "ColliderComponent";

	/**
	 * Updates the .worldCollider
	 */
	ColliderComponent.prototype.updateWorldCollider = function (updateTransformBranch) {
		var doUpdate = false;
		if (updateTransformBranch) {
			// Update the world transform of the entity
			// Get the root and update on the walk down
			var updateEntities = [];
			this.entity.traverseUp(function (entity) {
				updateEntities.unshift(entity);
			});
			var len = updateEntities.length;
			for (var i = 0; i !== len; i++) {
				var entity = updateEntities[i];
				var transformComponent = entity.transformComponent;
				if (transformComponent._dirty || doUpdate) {
					transformComponent.updateTransform();
					transformComponent.updateWorldTransform();
					doUpdate = true;
				}
			}
		}

		if (doUpdate || this._dirty) {
			this.collider.transform(this.entity.transformComponent.worldTransform, this.worldCollider);
			this._updated = true;
		}
	};

	/**
	 * Handles attaching itself to an entity. Should only be called by the engine.
	 * @private
	 * @param entity
	 */
	ColliderComponent.prototype.attached = function (entity) {
		this.entity = entity;
	};

	/**
	 * Handles detaching itself to an entity. Should only be called by the engine.
	 * @private
	 * @param entity
	 */
	ColliderComponent.prototype.detached = function (/*entity*/) {
		this.entity = null;
	};

	/**
	 * Marks the component as dirty.
	 */
	ColliderComponent.prototype.setToDirty = function () {
		this._dirty = true;
	};

	/**
	 * Marks the component as dirty.
	 */
	ColliderComponent.prototype.setToClean = function () {
		this._dirty = false;
	};

	/**
	 * Gets whether the component needs to be updated.
	 *
	 * @return {boolean}
	 */
	ColliderComponent.prototype.isDirty = function () {
		return this._dirty;
	};

	/**
	 * @private
	 * @param  {Object} obj
	 * @param  {Entity} entity
	 * @returns {boolean}
	 */
	ColliderComponent.applyOnEntity = function (obj, entity) {
		if (obj instanceof Collider) {
			entity.setComponent(new ColliderComponent({
				collider: obj
			}));
			return true;
		}
	};

	ColliderComponent.prototype.api = {};

	return ColliderComponent;
});
