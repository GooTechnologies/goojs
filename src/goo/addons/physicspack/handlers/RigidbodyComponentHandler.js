define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/physicspack/components/RigidbodyComponent',
	'goo/renderer/bounds/BoundingBox',
	'goo/util/ShapeCreatorMemoized',
	'goo/util/rsvp',
	'goo/util/ObjectUtil',
	'goo/math/Vector3'
], function (
	ComponentHandler,
	RigidbodyComponent,
	BoundingBox,
	ShapeCreatorMemoized,
	RSVP,
	_,
	Vector3
) {
	'use strict';

	/**
	 * For handling loading of rigid body components
	 * @extends ComponentHandler
	 * @hidden
	 */
	function RigidbodyComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'RigidbodyComponent';
	}

	RigidbodyComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	RigidbodyComponentHandler.prototype.constructor = RigidbodyComponentHandler;
	ComponentHandler._registerClass('rigidBody', RigidbodyComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {object} config
	 * @returns {object}
	 * @private
	 */
	RigidbodyComponentHandler.prototype._prepare = function (config) {
		return _.defaults(config, {
			mass: 1,
			isKinematic: false,
			velocity: [0, 0, 0],
			angularVelocity: [0, 0, 0],
			linearDrag: 0,
			angularDrag: 0
		});
	};

	/**
	 * Create a rigid body component.
	 * @returns {RigidbodyComponent} the created component object
	 * @private
	 */
	RigidbodyComponentHandler.prototype._create = function () {
		return new RigidbodyComponent();
	};

	/**
	 * Removes the rigid body component
	 * @param {string} ref
	 */
	RigidbodyComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('RigidbodyComponent');
	};

	/**
	 * Update engine rigid body component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	RigidbodyComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			component.mass = config.mass;
			component.isKinematic = config.isKinematic;
			component.setVelocity(new Vector3(config.velocity));
			component.setAngularVelocity(new Vector3(config.angularVelocity));
			component.linearDamping = config.linearDrag;
			component.angularDamping = config.angularDrag;

			component._dirty = true;
			component._initialized = false;

			return component;
		});
	};

	return RigidbodyComponentHandler;
});
