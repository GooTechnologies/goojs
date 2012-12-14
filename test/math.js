require({
    paths: {
        goo: '../src/goo',
    }
});
require([
	'math/MathUtils.js',
	'math/Matrix.js',
	'math/Matrix2x2.js',
	'math/Matrix3x3.js',
	'math/Matrix4x4.js',
	'math/Quaternion.js',
	'math/Transform.js',
	'math/Vector.js',
	'math/Vector2.js',
	'math/Vector3.js',
	'math/Vector4.js'
],
function() {
  'use strict';
   var env = jasmine.getEnv();

   env.addReporter(new jasmine.HtmlReporter());
   env.execute();
});
