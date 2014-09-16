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
	 * @param {number} [settings.radiusTop=0.5]
	 * @param {number} [settings.radiusBottom=0.5]
	 * @param {number} [settings.height=0.5]
	 * @param {number} [settings.numSegments=10]
	 */
	function CannonCylinderCollider(settings) {
		settings = settings || {};

		var radiusTop = typeof(settings.radiusTop) === 'number' ? settings.radiusTop : 0.5;
		var radiusBottom = typeof(settings.radiusBottom) === 'number' ? settings.radiusBottom : 0.5;
		var height = typeof(settings.height) === 'number' ? settings.height : 1;
		var numSegments = typeof(settings.numSegments) === 'number' ? settings.numSegments : 10;

		CannonCollider.call(this, {
			cannonShape: new CANNON.Cylinder(
				radiusTop,
				radiusBottom,
				height,
				numSegments
			)
		});
	}
	CannonCylinderCollider.prototype = Object.create(CannonCollider.prototype);
	CannonCylinderCollider.constructor = CannonCylinderCollider;

	return CannonCylinderCollider;
});
