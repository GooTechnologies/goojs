define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class Sphere collider for the {@link CannonSystem}.<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example}
	 * @param {object} [settings]
	 * @param {number} [settings.radius=0.5]
	 */
	function CannonSphereColliderComponent(settings) {
		settings = settings || {};
		this.type = 'CannonSphereColliderComponent';
		this.radius = settings.radius || 0.5;
		this.cannonShape = new CANNON.Sphere(this.radius);
	}
	CannonSphereColliderComponent.prototype = Object.create(Component.prototype);
	CannonSphereColliderComponent.constructor = CannonSphereColliderComponent;

	return CannonSphereColliderComponent;
});
