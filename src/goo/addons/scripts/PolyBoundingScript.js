define([],
	function() {

	"use strict";

	var window;
	var PolyK = window?window.PolyK:self.PolyK;


	/**
	 * @class Checks for collisions against a set of `collidables` and repositions the host object accordingly.
	 * This script uses the PolyK library which is not part of the engine; make sure you add it manually.
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
	PolyBoundingScript.prototype.addCollidable = function(collidable) {
		this.collidables.push(collidable);
	};

	/**
	 * Removes all `collidables` that contain the given point (x, y, z)
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 */
	PolyBoundingScript.prototype.removeAllAt = function(x, y, z) {
		this.collidables = this.collidables.filter(function(collidable) {
			if(collidable.bottom <= z && collidable.top >= z) {
				return !PolyK.ContainsPoint(collidable.poly, x, y);
			}
		});
	};

	/**
	 * The standard `run` routine of the script. Checks for collisions and repositions the host entity accordingly.
	 * The entity's coordinates are obtained from the translation of its transformComponent. All collisions are performed against these coordinates only.
	 * @param {Entity} entity
	 */
	PolyBoundingScript.prototype.run = function(entity) {
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;

		for (var i = 0; i < this.collidables.length; i++) {
			var collidable = this.collidables[i];

			if(collidable.bottom <= translation.data[1] && collidable.top >= translation.data[1]) {
				if(PolyK.ContainsPoint(collidable.poly, translation.data[0], translation.data[2])) {

					var pointOutside = PolyK.ClosestEdge(
						collidable.poly,
						translation.data[0],
						translation.data[2]
					);

					translation.data[0] = pointOutside.point.x;
					translation.data[2] = pointOutside.point.y;
					transformComponent.setUpdated();
					return;
				}
			}
		}
	};

	return PolyBoundingScript;
});