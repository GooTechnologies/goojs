define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/renderer/bounds/BoundingBox',
	'goo/util/ShapeCreatorMemoized',
	'goo/util/rsvp',
	'goo/util/ObjectUtil',
	'goo/addons/physicspack/colliders/SphereCollider',
	'goo/math/Vector3'
], function (
	ComponentHandler,
	RigidbodyComponent,
	BoundingBox,
	ShapeCreatorMemoized,
	RSVP,
	_,
	SphereCollider,
	Vector3
) {
	'use strict';

	/**
	 * For handling loading of collider components
	 * @extends ComponentHandler
	 * @hidden
	 */
	function RigidbodyComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'RigidbodyComponent';
	}

	RigidbodyComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	RigidbodyComponentHandler.prototype.constructor = RigidbodyComponentHandler;
	ComponentHandler._registerClass('rigidbody', RigidbodyComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	RigidbodyComponentHandler.prototype._prepare = function (config) {
		return _.defaults(config, {
		});
	};

	/**
	 * Create collider component.
	 * @returns {RigidbodyComponent} the created component object
	 * @private
	 */
	RigidbodyComponentHandler.prototype._create = function () {
		return new RigidbodyComponent();
	};

	/**
	 * Removes the rigidbody component
	 * @param {string} ref
	 */
	RigidbodyComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('RigidbodyComponent');
	};

	/**
	 * Update engine rigidbody component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	RigidbodyComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			component._dirty = true;
			component._initialized = false;
			component.isKinematic = config.isKinematic;
			component.mass = config.mass;
			component.setVelocity(new Vector3(options.velocity));
			component.setAngularVelocity(new Vector3(options.angularVelocity));

			return component;
		});
	};

	return RigidbodyComponentHandler;
});
