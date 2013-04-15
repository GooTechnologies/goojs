define([
	],
/** @lends Edge */
function () {
    "use strict";

    /**
     *
     * @param {Vector} vec1
     * @param {Vector}vec2
     * @constructor
     */
	function Edge(vec1, vec2) {

		// Store the positions in growing y order , y1 > y0.
		// The scanline renderer moves in positive y , origin at top left corner.
        var v1_y = vec1.data[1];
        var v2_y = vec2.data[1];
		if (v1_y < v2_y ) {
			this.x0 = vec1.data[0];
			this.x1 = vec2.data[0];

			this.y0 = v1_y;
			this.y1 = v2_y;

			this.z0 = vec1.data[2];
			this.z1 = vec2.data[2];
		}
		else {
			this.x0 = vec2.data[0];
			this.x1 = vec1.data[0];

			this.y0 = v2_y;
			this.y1 = v1_y;

			this.z0 = vec2.data[2];
			this.z1 = vec1.data[2];
		}
	}

	// Rounds conservatively , increasing the coverage.
	Edge.prototype.roundOccludeeCoordinates = function () {
		this.y0 = Math.floor(this.y0);
		this.y1 = Math.ceil(this.y1);
	};

	return Edge;
});