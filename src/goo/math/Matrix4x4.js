var Matrix4 = require('./Matrix4');
var ObjectUtils = require('../util/ObjectUtils');



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

	module.exports = Matrix4x4;
