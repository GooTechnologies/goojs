define([
	'goo/physicspack/colliders/Collider'
],
/** @lends */
function (
	Collider
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class Plane collider. Attach to an entity with a {@link CannonRigidbodyComponent}.<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example}
	 * @param {object} [settings]
	 */
	function PlaneCollider(settings) {
		settings = settings || {};

		Collider.call(this, {
			cannonShape: new CANNON.Plane()
		});
	}
	PlaneCollider.prototype = Object.create(Collider.prototype);
	PlaneCollider.constructor = PlaneCollider;

	return PlaneCollider;
});
