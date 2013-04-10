define([
	'goo/math/Vector3'
	],
/** @lends */

function (Vector3) {

	/*
	*	Class for holding three vertices {Vector3} or {Vector4} which make up a triangle.
	*	Triangles are used in the SoftwareRenderer.
	*	@class Triangle
	*	@param {Vector} v1, v2, v3 The vertices which form the triangle.
	*/
	function Triangle(v1, v2, v3) {

		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;
	}

	/*
	*	Only used for the test triangles in {SoftwareRenderer}
	*/
	Triangle.prototype.toPixelSpace = function(width, height) {

		var v1 = new Vector3(this.v1);
		var v2 = new Vector3(this.v2);
		var v3 = new Vector3(this.v3);

		v1.data[0] *= width;
		v2.data[0] *= width;
		v3.data[0] *= width;

		v1.data[1] *= height;
		v2.data[1] *= height;
		v3.data[1] *= height;

		return new Triangle(v1, v2, v3);
	};

	Triangle.prototype.printVertexData = function() {
		console.log(this.v1.data);
		console.log(this.v2.data);
		console.log(this.v3.data);
	};

	return Triangle;
});