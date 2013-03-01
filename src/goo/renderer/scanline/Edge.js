define([
	'goo/math/Vector3'
	],
/** @lends Edge */
function (Vector3) {

	function Edge(vec1, vec2) {

		// Store the positions in growing y order , y1 > y0.
		// The scanline renderer moves in positive y , origin at top left corner.
		if (vec1.y < vec2.y ) {
			
			this.x0 = Math.round(vec1.x);
			this.x1 = Math.round(vec2.x);

			this.y0 = vec1.y;
			this.y1 = vec2.y;

			this.z0 = vec1.z;
			this.z1 = vec2.z;
		}
		else {

			this.x0 = Math.round(vec2.x);
			this.x1 = Math.round(vec1.x);

			this.y0 = vec2.y;
			this.y1 = vec1.y;

			this.z0 = vec2.z;
			this.z1 = vec1.z;
		}

		this._roundConservative();
	}

	// TODO: Remove the rounding of values out of here.. Add conservative check on the x-coordinates the point this is done as well.
	Edge.prototype._roundConservative = function () {
		
		this.y0 = Math.ceil(this.y0);
		this.y1 = Math.ceil(this.y1);
	};

	Edge.prototype.invertZ = function() {

		this.z0 =  1.0 / this.z0;
		this.z1 =  1.0 / this.z1;
	};

	return Edge;
});