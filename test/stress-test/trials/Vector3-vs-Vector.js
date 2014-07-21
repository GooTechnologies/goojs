define([
	'goo/math/Vector',
	'goo/math/Vector3'
], function (
	Vector,
	Vector3
) {
	'use strict';

	responseTime('Vector.invert', 1000, function () {
		var vector = new Vector(3);
		for (var i = 0; i < 10000; i++) {
			vector.invert();
		}
	});

	responseTime('Vector3.invert', 1000, function () {
		var vector3 = new Vector3();
		for (var i = 0; i < 10000; i++) {
			vector3.invert();
		}
	});
});