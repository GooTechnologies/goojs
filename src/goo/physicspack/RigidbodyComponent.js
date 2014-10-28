define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
) {
	'use strict';

	/**
	 * @class
	 * @extends Component
	 */
	function RigidbodyComponent(settings) {
		Component.call(this);
		settings = settings || {};
		this.type = 'RigidbodyComponent';
		this.rigidbody = null; // Will be set by the PhysicsSystem
	}

	RigidbodyComponent.prototype = Object.create(Component.prototype);
	RigidbodyComponent.constructor = RigidbodyComponent;

	return RigidbodyComponent;
});
