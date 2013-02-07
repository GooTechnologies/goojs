define([
	'goo/math/Vector3',
	'goo/math/Vector4'
	],
/** @lends Triangle */
function (Vector3, Vector4) {

	/*
	* @class Triangle
	* 
	*/
	function Triangle(v1, v2, v3) {

		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;
	};

	
	Triangle.prototype.toPixelSpace = function(width, height) {

		var v1 = new Vector3(this.v1);
		var v2 = new Vector3(this.v2);
		var v3 = new Vector3(this.v3);

		v1.x *= width;
		v2.x *= width;
		v3.x *= width;

		v1.y *= height;
		v2.y *= height;
		v3.y *= height;

		return new Triangle(v1, v2, v3);
	};

	Triangle.prototype.printVertexData = function() {
		console.log(this.v1.data);
		console.log(this.v2.data);
		console.log(this.v3.data);
	};

	return Triangle;
});