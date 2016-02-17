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
	function AbstractColliderComponent(settings) {
		Component.apply(this);

		settings = settings || {};

		/**
		 * @private
		 * @type {Entity}
		 */
		this.entity = null;

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
	AbstractColliderComponent.prototype = Object.create(Component.prototype);
	AbstractColliderComponent.prototype.constructor = AbstractColliderComponent;

	/**
	 * Get the closest parent (or self) entity that has a RigidBodyComponent. Returns undefined if none was found.
	 * @returns {Entity}
	 */
	AbstractColliderComponent.prototype.getBodyEntity = function () {
		var bodyEntity;
		this.entity.traverseUp(function (parent) {
			if (parent.rigidBodyComponent) {
				bodyEntity = parent;
				return false;
			}
		});
		return bodyEntity;
	};

	/**
	 * Updates the .worldCollider
	 */
	AbstractColliderComponent.prototype.updateWorldCollider = function () {
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
			transformComponent.updateTransform(); // TODO: should not touch this
			transformComponent.updateWorldTransform();
		}

		this.collider.transform(this.entity.transformComponent.worldTransform, this.worldCollider);
	};

	/**
	 * Handles attaching itself to an entity. Should only be called by the engine.
	 * @private
	 * @param entity
	 */
	AbstractColliderComponent.prototype.attached = function (entity) {
		this.entity = entity;
		this.system = entity._world.getSystem('PhysicsSystem');
	};

	/**
	 * Handles detaching itself to an entity. Should only be called by the engine.
	 * @private
	 * @param entity
	 */
	AbstractColliderComponent.prototype.detached = function (/*entity*/) {
		this.entity = null;
	};

	/**
	 * @private
	 * @param  {Object} obj
	 * @param  {Entity} entity
	 * @returns {boolean}
	 */
	AbstractColliderComponent.applyOnEntity = function (obj, entity) {
		if (obj instanceof Collider) {
			entity.setComponent(new AbstractColliderComponent({
				collider: obj
			}));
			return true;
		}
	};

	AbstractColliderComponent.prototype.api = {};

	return AbstractColliderComponent;
});
