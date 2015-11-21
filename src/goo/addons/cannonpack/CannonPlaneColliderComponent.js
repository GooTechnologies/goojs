var Component = require('../../entities/components/Component');

	'use strict';

	/* global CANNON */

	/**
	 * Plane collider. Attach to an entity with a {@link CannonRigidbodyComponent}.
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example
	 * @param {Object} [settings]
	 */
	function CannonPlaneColliderComponent(settings) {
		Component.apply(this, arguments);

		this.type = 'CannonPlaneColliderComponent';

		settings = settings || {};

		// Create shape
		this.cannonShape = new CANNON.Plane();
	}

	CannonPlaneColliderComponent.prototype = Object.create(Component.prototype);
	CannonPlaneColliderComponent.constructor = CannonPlaneColliderComponent;

	module.exports = CannonPlaneColliderComponent;
