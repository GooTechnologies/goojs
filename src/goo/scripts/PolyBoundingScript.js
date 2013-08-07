require.config({
	paths: {
		"goo/lib": "../../../../goojs/lib"
	}
});

define(['goo/lib/polyk'],
	function(PolyK) {

	"use strict";

	function PolyBoundingScript() {
		this.collidables = [];
	}

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

		for (var i in this.collidables) {
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
					return ;
				}
			}
		}
	};

	return PolyBoundingScript;
});