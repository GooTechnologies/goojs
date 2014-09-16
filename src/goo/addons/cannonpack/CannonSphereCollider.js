define([
	'goo/addons/cannonpack/CannonCollider'
],
/** @lends */
function (
	CannonCollider
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class Sphere collider for the {@link CannonSystem}.<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example}
	 * @param {object} [settings]
	 * @param {number} [settings.radius=0.5]
	 */
	function CannonSphereCollider(settings) {
		settings = settings || {};

		var radius = settings.radius || 0.5;

		CannonCollider.call(this, {
			cannonShape: new CANNON.Sphere(radius)
		});
	}
	CannonSphereCollider.prototype = Object.create(CannonCollider.prototype);
	CannonSphereCollider.constructor = CannonSphereCollider;

	return CannonSphereCollider;
});
