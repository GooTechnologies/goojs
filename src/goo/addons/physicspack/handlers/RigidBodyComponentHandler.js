define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/physicspack/components/RigidBodyComponent',
	'goo/renderer/bounds/BoundingBox',
	'goo/util/ShapeCreatorMemoized',
	'goo/util/ObjectUtils',
	'goo/math/Vector3'
], function (
	ComponentHandler,
	RigidBodyComponent,
	BoundingBox,
	ShapeCreatorMemoized,
	_,
	Vector3
) {
	'use strict';

	/**
	 * For handling loading of rigid body components
	 * @extends ComponentHandler
	 * @hidden
	 */
	function RigidBodyComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'RigidBodyComponent';
	}

	RigidBodyComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	RigidBodyComponentHandler.prototype.constructor = RigidBodyComponentHandler;
	ComponentHandler._registerClass('rigidBody', RigidBodyComponentHandler);

	/**
	 * Prepare component. Set defaults on config here.
	 * @param {Object} config
	 * @returns {Object}
	 * @private
	 */
	RigidBodyComponentHandler.prototype._prepare = function (config) {
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
	 * @returns {RigidBodyComponent} the created component object
	 * @private
	 */
	RigidBodyComponentHandler.prototype._create = function () {
		return new RigidBodyComponent();
	};

	/**
	 * Removes the rigid body component
	 * @param {string} ref
	 */
	RigidBodyComponentHandler.prototype._remove = function (entity) {
		entity.clearComponent('RigidBodyComponent');
	};

	/**
	 * Update engine rigid body component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	RigidBodyComponentHandler.prototype.update = function (entity, config, options) {
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
			if (!component) { return; }

			component.mass = config.mass;
			component.isKinematic = config.isKinematic;
			component.setVelocity(new Vector3(config.velocity));
			component.setAngularVelocity(new Vector3(config.angularVelocity));
			component.linearDamping = config.linearDrag;
			component.angularDamping = config.angularDrag;

			return component;
		});
	};

	return RigidBodyComponentHandler;
});
