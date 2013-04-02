define([
	],
/** @lends Edge */
function () {

	function Edge(vec1, vec2) {

		// Store the positions in growing y order , y1 > y0.
		// The scanline renderer moves in positive y , origin at top left corner.

		if (vec1.data[1] < vec2.data[1] ) {
			this.x0 = vec1.data[0];
			this.x1 = vec2.data[0];

			this.y0 = vec1.data[1];
			this.y1 = vec2.data[1];

			this.z0 = vec1.data[3];
			this.z1 = vec2.data[3];
		}
		else {
			this.x0 = vec2.data[0];
			this.x1 = vec1.data[0];

			this.y0 = vec2.data[1];
			this.y1 = vec1.data[1];

			this.z0 = vec2.data[3];
			this.z1 = vec1.data[3];
		}
	}

	Edge.prototype.roundOccluderCoordinates = function () {
		this.y0 = Math.round(this.y0);
		this.y1 = Math.round(this.y1);
	};

	Edge.prototype.roundOccludeeCoordinates = function () {
		this.y0 = Math.round(this.y0);
		this.y1 = Math.round(this.y1);
	};

	Edge.prototype.invertZ = function() {
		this.z0 =  1.0 / this.z0;
		this.z1 =  1.0 / this.z1;
	};

	return Edge;
});