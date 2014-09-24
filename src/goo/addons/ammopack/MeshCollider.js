define([
	'goo/addons/ammopack/Collider'
],
/** @lends */
function (
	Collider
) {
	'use strict';

	/**
	 * @class
	 * @param {object} settings
	 * @todo Implement me!
	 */
	function MeshCollider(settings) {
	}
	MeshCollider.prototype = Object.create(Collider.prototype);
	MeshCollider.constructor = MeshCollider;

	return MeshCollider;
});
