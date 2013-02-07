define([
	'goo/math/Vector3',
	],
/** @lends Edge */
function (Vector3) {


	function Edge(vec1, vec2) {


		/*

		// 16bits integers for the start and end positions
		
		this._buffer = new ArrayBuffer(8);  // 4 * Uint16Array.BYTES_PER_ELEMENT; 
		this.x = new Uint16Array(this._buffer, 0, 2);
		this.y = new Uint16Array(this._buffer, 4, 2);

		// Store the positions in growing y order
		if (vec1.y < vec2.y ) {
			
			this.x[0] = vec1.x;
			this.x[1] = vec2.x;

			this.y[0] = vec1.y;
			this.y[1] = vec2.y;
		}
		else {

			this.x[0] = vec2.x;
			this.x[1] = vec1.x;

			this.y[0] = vec2.y;
			this.y[1] = vec1.y;
		}

		*/

		// Store the positions in growing y order
		// Have to round the values to integers here... nearest pixel value in the screen space.
		if (vec1.y < vec2.y ) {
			
			this.x0 = Math.round(vec1.x);
			this.x1 = Math.round(vec2.x);

			this.y0 = Math.round(vec1.y);
			this.y1 = Math.round(vec2.y);
		}
		else {

			this.x0 = Math.round(vec2.x);
			this.x1 = Math.round(vec1.x);

			this.y0 = Math.round(vec2.y);
			this.y1 = Math.round(vec1.y);
		}

	};

	Edge.prototype.roundValues = function() {
		this.x0 = Math.round(this.x0);
		this.x1 = Math.round(this.x1);
		this.y0 = Math.round(this.y0);
		this.y1 = Math.round(this.y1);
	};

	return Edge;
});