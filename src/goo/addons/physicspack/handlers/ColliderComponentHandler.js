define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/physicspack/components/ColliderComponent',
	'goo/renderer/bounds/BoundingBox',
	'goo/util/ShapeCreatorMemoized',
	'goo/util/rsvp',
	'goo/util/ObjectUtil',
	'goo/addons/physicspack/colliders/SphereCollider'
], function (
	ComponentHandler,
	ColliderComponent,
	BoundingBox,
	ShapeCreatorMemoized,
	RSVP,
	_,
	SphereCollider
) {
	'use strict';

	/**
	 * For handling loading of collider components
	 * @extends ComponentHandler
	 * @hidden
	 */
	function ColliderComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'ColliderComponent';
	}

	ColliderComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ColliderComponentHandler.prototype.constructor = ColliderComponentHandler;
	ComponentHandler._registerClass('collider', ColliderComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	ColliderComponentHandler.prototype._prepare = function (config) {
		return _.defaults(config, {
		});
	};

	/**
	 * Create collider component.
	 * @returns {ColliderComponent} the created component object
	 * @private
	 */
	ColliderComponentHandler.prototype._create = function () {
		return new ColliderComponent();
	};

	/**
	 * Removes the collider component
	 * @param {string} ref
	 */
	ColliderComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('ColliderComponent');
	};

	/**
	 * Update engine collider component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	ColliderComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			if (config.collider) {
				// TODO: support all collider types
				component.collider = new SphereCollider({ radius: config.radius });
				component._dirty = true;
				return component;
			} else {
				console.warn('ColliderComponent config does not contain a collider spec!');
			}
		});
	};

	return ColliderComponentHandler;
});
