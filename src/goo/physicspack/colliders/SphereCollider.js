define([
	'goo/physicspack/colliders/Collider'
],
function (
	Collider
) {
	'use strict';

	/**
	 * @param {object} [settings]
	 * @param {number} [settings.radius=0.5]
	 * @extends Collider
	 */
	function SphereCollider(settings) {
		settings = settings || {};

		/**
		 * @type {number}
		 */
		this.radius = settings.radius !== undefined ? settings.radius : 0.5;

		Collider.call(this);
	}
	SphereCollider.prototype = Object.create(Collider.prototype);
	SphereCollider.prototype.constructor = SphereCollider;

	/**
	 * @private
	 * @param {Transform} transform
	 * @param {Collider} targetCollider
	 */
	SphereCollider.prototype.transform = function (transform, targetCollider) {
		var s = transform.scale.data;
		targetCollider.radius = this.radius * Math.max(
			Math.abs(s[0]),
			Math.abs(s[1]),
			Math.abs(s[2])
		);
	};

	/**
	 * @return {SphereCollider}
	 */
	SphereCollider.prototype.clone = function () {
		return new SphereCollider({
			radius: this.radius
		});
	};

	return SphereCollider;
});
