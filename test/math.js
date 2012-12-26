require({ paths: { goo: '../src/goo' } });
require([
	'math/MathUtils',
	'math/Matrix',
	'math/Matrix2x2',
	'math/Matrix3x3',
	'math/Matrix4x4',
	'math/Plane',
	'math/Quaternion',
	'math/Ray',
	'math/Transform',
	'math/Vector',
	'math/Vector2',
	'math/Vector3',
	'math/Vector4',
	'math/Versor'
], function() {
  'use strict';

   var env = jasmine.getEnv();

   env.addReporter(new jasmine.HtmlReporter());
   env.execute();
});
