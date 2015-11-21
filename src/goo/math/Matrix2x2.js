var Matrix2 = require('./Matrix2');
var ObjectUtils = require('../util/ObjectUtils');

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

	module.exports = Matrix2x2;
