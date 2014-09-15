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
	 * @param {number} [settings.radiusTop=0.5]
	 * @param {number} [settings.radiusBottom=0.5]
	 * @param {number} [settings.height=0.5]
	 * @param {number} [settings.numSegments=10]
	 */
	function CannonCylinderColliderComponent(settings) {
		settings = settings || {};
		this.type = 'CannonCylinderColliderComponent';

		var radiusTop = typeof(settings.radiusTop) === 'number' ? settings.radiusTop : 0.5;
		var radiusBottom = typeof(settings.radiusBottom) === 'number' ? settings.radiusBottom : 0.5;
		var height = typeof(settings.height) === 'number' ? settings.height : 1;
		var numSegments = typeof(settings.numSegments) === 'number' ? settings.numSegments : 10;

		this.cannonShape = new CANNON.Cylinder(
			radiusTop,
			radiusBottom,
			height,
			numSegments
		);
	}
	CannonCylinderColliderComponent.prototype = Object.create(Component.prototype);
	CannonCylinderColliderComponent.constructor = CannonCylinderColliderComponent;

	return CannonCylinderColliderComponent;
});
