"use strict";

require(["goo/math/Vector", "goo/math/Vector4"], function(Vector, Vector4) {

	function init() {
		var a = new Vector4(1.0, 1.0, 1.0, 1.0);
		var b = new Vector4(2.0, 2.0, 2.0, 2.0);

		console.log(a.add(b)); // a' is now a + b
		console.log(Vector4.add(a, b)); // new vector of a' + b = a + 2b
		console.log(a); // Should print {3, 3, 3, 3}
		console.log(b); // Should print {2, 2, 2, 2}
		console.log(a.dot()); // Should print 36
	}

	init();
});
