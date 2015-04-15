define([], function () {
	'use strict';

	/**
	 * Checks for collisions against a set of `collidables` and repositions the host object accordingly.
	 * This script uses the PolyK library which is not part of the engine; make sure you add it manually.<br>
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/addons/PolyBoundingScript/PolyBoundingScript-vtest.html Working example
	 * @param {Object[]} collidables An array of `collidables` - objects with a bounding polygon on the XZ-plane, a top and a bottom Y coordinate
	 * @param {number[]} collidables[].poly An array of XZ coordinates representing the bounding polygon of the `collidable`
	 * @param {number} collidables[].bottom The bottom Y coordinate of the collidable
	 * @param {number} collidables[].top The top Y coordinate of the collidable
	 */
	function PolyBoundingScript(collidables) {
		this.collidables = collidables || [];
	}

	/**
	 * Adds a `collidable`
	 * @param {Object} collidable `Collidable` to add
	 * @param {number[]} collidables[].poly An array of XZ coordinates representing the bounding polygon of the `collidable`
	 * @param {number} collidables[].bottom The bottom Y coordinate of the collidable
	 * @param {number} collidables[].top The top Y coordinate of the collidable
	 */
	PolyBoundingScript.prototype.addCollidable = function (collidable) {
		this.collidables.push(collidable);
	};

	/**
	 * Removes all `collidables` that contain the given point (x, y, z)
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 */
	PolyBoundingScript.prototype.removeAllAt = function (x, y, z) {
		this.collidables = this.collidables.filter(function (collidable) {
			if (collidable.bottom <= z && collidable.top >= z) {
				return !window.PolyK.ContainsPoint(collidable.poly, x, y);
			}
		});
	};

	/**
	 * Checks if a point is inside any collidable
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 */
	PolyBoundingScript.prototype.inside = function (x, y, z) {
		for (var i = 0; i < this.collidables.length; i++) {
			var collidable = this.collidables[i];

			if (collidable.bottom <= y && collidable.top >= y) {
				if (window.PolyK.ContainsPoint(collidable.poly, x, z)) {
					return window.PolyK.ClosestEdge(collidable.poly, x, z);
				}
			}
		}
	};

	/**
	 * The standard `run` routine of the script. Checks for collisions and repositions the host entity accordingly.
	 * The entity's coordinates are obtained from the translation of its transformComponent. All collisions are performed against these coordinates only.
	 * @param {Entity} entity
	 */
	PolyBoundingScript.prototype.run = function (entity) {
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;

		for (var i = 0; i < this.collidables.length; i++) {
			var collidable = this.collidables[i];

			if (collidable.bottom <= translation.y && collidable.top >= translation.y) {
				if (window.PolyK.ContainsPoint(collidable.poly, translation.x, translation.z)) {

					var pointOutside = window.PolyK.ClosestEdge(
						collidable.poly,
						translation.x,
						translation.z
					);

					translation.x = pointOutside.point.x;
					translation.z = pointOutside.point.y;
					transformComponent.setUpdated();
					return;
				}
			}
		}
	};

	return PolyBoundingScript;
});