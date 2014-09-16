define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
) {
	'use strict';

	/**
	 * @class Physics box collider for Cannon.js. To be attached to an entity with a {@link CannonRigidbodyComponent}. Also see the {@link CannonSystem}.<br>
	 * {@linkplain http://code.gooengine.com/latest/visual-test/goo/addons/Cannon/Cannon-vtest.html Working example}
	 * @param {object} [settings]
	 * @param {Vector3} [settings.halfExtents] The half-extents of the box collider.
	 * @extends Component
	 */
	function CannonColliderComponent(settings) {
		this.type = 'CannonColliderComponent';

		settings = settings || {};

		/**
		 * @type {CannonCollider}
		 */
		this.collider = settings.collider || null;

		/**
		 * @type {boolean}
		 */
		this.isTrigger = typeof(settings.isTrigger) !== 'undefined' ? settings.isTrigger : false;
	}

	CannonColliderComponent.prototype = Object.create(Component.prototype);
	CannonColliderComponent.constructor = CannonColliderComponent;

	return CannonColliderComponent;
});
