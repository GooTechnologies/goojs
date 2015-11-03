define([
	'goo/math/Matrix4',
	'goo/util/ObjectUtils'
], function (
	Matrix4,
	ObjectUtils
) {
	'use strict';

	var Matrix4x4 = ObjectUtils.warnOnce(
		'Matrix4x4 has been renamed to Matrix4.',
		function () {
			Matrix4.apply(this, arguments);
		}
	);

	Matrix4x4.prototype = Object.create(Matrix4.prototype);
	Matrix4x4.prototype.constructor = Matrix4x4;
	for (var x in Matrix4) {
		Matrix4x4[x] = Matrix4[x];
	}

	return Matrix4x4;
});
