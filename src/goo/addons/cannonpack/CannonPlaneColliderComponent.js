define([
	'goo/entities/components/Component'
], function (
	Component
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class Plane collider. Attach to an entity with a {@link CannonRigidbodyComponent}.<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example}
	 * @param {object} [settings]
	 */
	function CannonPlaneColliderComponent(settings) {
		Component.apply(this, arguments);

		this.type = "CannonPlaneColliderComponent";

		settings = settings || {};

		// Create shape
		this.cannonShape = new CANNON.Plane();
	}
	CannonPlaneColliderComponent.prototype = Object.create(Component.prototype);
	CannonPlaneColliderComponent.constructor = CannonPlaneColliderComponent;

	return CannonPlaneColliderComponent;
});
