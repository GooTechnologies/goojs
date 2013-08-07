define(['goo/util/PolyK'],
	function(PolyK) {

	"use strict";

	// REVIEW: Document!
	function PolyBoundingScript() {
		this.collidables = [];
	}

	// REVIEW: As far as I can tell a `collidable` has `top`, `bottom` and `poly` attributes, but document that.
	PolyBoundingScript.prototype.addCollidable = function(collidable) {
		this.collidables.push(collidable);
	};

	PolyBoundingScript.prototype.removeAllAt = function(x, y, z) {
		this.collidables = this.collidables.filter(function(collidable) {
			if(collidable.bottom <= z && collidable.top >= z) {
				return !PolyK.ContainsPoint(collidable.poly, x, y);
			}
		});
	};

	PolyBoundingScript.prototype.run = function(entity) {
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;

		// REVIEW: For array iteration, use for(var i = 0; i < this.collidables.length; ++i) instead.
		// Otherwise we may iterate over non-integer keys and other junk (non-own attributes).
		for (var i in this.collidables) {
			var collidable = this.collidables[i];

			// REVIEW: This looks like it assumes that the translation coordinates are inside the object,
			// which may not always be true. Should we document it or change the assumption to use the
			// object's actual bounds?
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