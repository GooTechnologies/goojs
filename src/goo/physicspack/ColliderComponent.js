define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
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
		 * @type {Collider}
		 */
		this.worldCollider = this.collider.clone();

		/**
		 * @type {boolean}
		 */
		this.isTrigger = settings.isTrigger !== undefined ? settings.isTrigger : false;
	}
	ColliderComponent.prototype = Object.create(Component.prototype);
	ColliderComponent.constructor = ColliderComponent;

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

	return ColliderComponent;
});
