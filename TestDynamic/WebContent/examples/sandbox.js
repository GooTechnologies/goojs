require({
    baseUrl: "./",
    paths: {
        goo: "../goo",
    }
});
require(['goo/math/Vector3', 'goo/util/Handy'], function(Vector3, Handy) {
	"use strict";

	function init() {
		var obj = {};

		Handy.defineProperty(obj, 'test', new Vector3(), function(val) {
			console.log('set: ' + val);
		});
		Handy.defineProperty(obj, 'test2', 5.0, function(val) {
			console.log('set: ' + val);
		});
		console.log('test: ' + obj.test);
		console.log('test2: ' + obj.test2);

		obj.test.x = 20.0;
		obj.test2 = 10.0;

		console.log('test: ' + obj.test);
		console.log('test2: ' + obj.test2);
	}

	init();
});
