define([
	'goo/math/Matrix2',
	'goo/util/ObjectUtils'
], function (
	Matrix2,
	ObjectUtils
) {
	'use strict';

	var Matrix2x2 = ObjectUtils.warnOnce(
		'Matrix2x2 has been renamed to Matrix2.',
		function () {
			Matrix2.apply(this, arguments);
		}
	);

	Matrix2x2.prototype = Object.create(Matrix2.prototype);
	Matrix2x2.prototype.constructor = Matrix2x2;
	for (var x in Matrix2) {
		Matrix2x2[x] = Matrix2[x];
	}

	return Matrix2x2;
});
