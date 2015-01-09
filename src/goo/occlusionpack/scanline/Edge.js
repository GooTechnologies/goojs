define([
	],
/** @lends */
function () {
	'use strict';

	/**
	 * @constructor
	 */
	function Edge() {

		this.x0 = 0.0;
		this.x1 = 0.0;

		this.y0 = 0.0;
		this.y1 = 0.0;

		this.z0 = 0.0;
		this.z1 = 0.0;

		this.dx = 0.0;
		this.dy = 0.0;
		this.dz = 0.0;
		this.xIncrement = 0.0;
		this.zIncrement = 0.0;
		this.betweenFaces = false;
	}

	Edge.prototype.setData = function (vec1, vec2) {
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

		// Reset the between faces to false.
		this.betweenFaces = false;
	};

	Edge.prototype.computeDerivedData = function () {

		var dx = this.x1 - this.x0;
		var dy = this.y1 - this.y0;
		var dz = this.z1 - this.z0;

		this.dy = dy;
		this.dx = dx;
		this.dz = dz;

		this.xIncrement = dx / dy;
		this.zIncrement = dz / dy;
	};

	Edge.prototype.roundOccludeeCoordinates = function () {

		// TODO : This conservative rounding wont work.... something messes it up now after moving the edgedata computations
		// into the class....
		/*
		this.y0 = Math.floor(this.y0);
		this.y1 = Math.ceil(this.y1);
		*/

		this.y0 = Math.round(this.y0);
		this.y1 = Math.round(this.y1);
	};

	return Edge;
});