define([
	'goo/math/Vector3'
],
function (
	Vector3
) {
	'use strict';

	/**
	 *
	 */
	function ContactPoint(settings) {
		settings = settings || {};

		/**
		 * Normal of the contact point.
		 * @type {Vector3}
		 */
		this.normal = new Vector3();

		/**
		 * The point of contact.
		 * @type {Vector3}
		 */
		this.point = new Vector3();

		/**
		 * The first collider entity in contact at the point.
		 * @type {Entity}
		 */
		this.entity = null;

		/**
		 * The other collider entity in contact at the point.
		 * @type {Entity}
		 */
		this.otherEntity = null;
	}

	ContactPoint.prototype.reset = function () {
		this.entity = this.otherEntity = null;
	};

	return ContactPoint;
});