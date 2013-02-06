define([
	'goo/math/Vector3',
	],
/** @lends Edge */
function (Vector3) {


	function Edge(vec1, vec2) {

		// 16bits integers for the start and end positions

		// REVIEW: Using typed arrays looks like a premature optimization.
		// Is this faster than having members x0, y0, x1, y1?
		// I'd guess it's slower (one additional level of indirection).
		
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
	};



	return Edge;
});