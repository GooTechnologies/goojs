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
	 * @class Plane collider. Attach to an entity with a {@link CannonRigidbodyComponent}.<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example}
	 * @param {object} [settings]
	 */
	function CannonPlaneCollider(settings) {
		settings = settings || {};

		CannonCollider.call(this, {
			cannonShape: new CANNON.Plane()
		});
	}
	CannonPlaneCollider.prototype = Object.create(CannonCollider.prototype);
	CannonPlaneCollider.constructor = CannonPlaneCollider;

	return CannonPlaneCollider;
});
