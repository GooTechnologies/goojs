define([
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/addons/cannonpack/CannonCollider'
],
/** @lends */
function (
	Box,
	Vector3,
	CannonCollider
) {
	'use strict';

	/* global CANNON */

	/**
	 * @class Physics box collider for Cannon.js.
	 * @param {object} [settings]
	 * @param {Vector3} [settings.halfExtents] The half-extents of the box collider.
	 * @extends Component
	 */
	function CannonBoxCollider(settings) {
		settings = settings || {};
		var e = settings.halfExtents || new Vector3(0.5, 0.5, 0.5);

		CannonCollider.call(this, {
			cannonShape: new CANNON.Box(new CANNON.Vec3(e.x, e.y, e.z))
		});
	}

	CannonBoxCollider.prototype = Object.create(CannonCollider.prototype);
	CannonBoxCollider.constructor = CannonBoxCollider;

	return CannonBoxCollider;
});
