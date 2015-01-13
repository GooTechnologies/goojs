define([
	'goo/entities/components/Component',
	'goo/physicspack/colliders/Collider'
],
/** @lends */
function (
	Component,
	Collider
) {
	'use strict';

	/**
	 * @class
	 * @param {object} [settings]
	 * @param {Collider} [settings.collider]
	 * @param {boolean} [settings.isTrigger=false]
	 * @extends Component
	 */
	function ColliderComponent(settings) {
		this.type = 'ColliderComponent';
		settings = settings || {};

		this.entity = null;

		this._updated = false;

		/**
		 * @type {Collider}
		 */
		this.collider = settings.collider;

		/**
		 * The world-scaled version of the collider. Use .updateWorldCollider() to update it.
		 * @type {Collider}
		 */
		this.worldCollider = this.collider.clone();

		/**
		 * If the collider is a Trigger, it will not interact with other objects, but it will emit contact events.
		 * @type {boolean}
		 */
		this.isTrigger = settings.isTrigger !== undefined ? settings.isTrigger : false;
	}
	ColliderComponent.prototype = Object.create(Component.prototype);
	ColliderComponent.constructor = ColliderComponent;
	ColliderComponent.type = "ColliderComponent";

	/**
	 * Updates the .worldCollider
	 */
	ColliderComponent.prototype.updateWorldCollider = function () {
		this.collider.transform(this.entity.transformComponent.worldTransform, this.worldCollider);
		this._updated = true;
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

	ColliderComponent.applyOnEntity = function (obj, entity) {
		if (obj instanceof Collider) {
			entity.setComponent(new ColliderComponent({
				collider: obj
			}));
			return true;
		}
	};

	return ColliderComponent;
});
