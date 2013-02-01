require.config({
    paths: {
        "goo": "src/goo",
        "test": "test"
    },
    waitSeconds: 5
  });
require([
    // Require does not allow us to add dependencies with wildcards...
    'test/math/MathUtils',
    'test/math/Matrix',
    'test/math/Matrix2x2',
    'test/math/Matrix3x3',
    'test/math/Matrix4x4',
    'test/math/Plane',
    'test/math/Quaternion',
    'test/math/Ray',
    'test/math/Transform',
    'test/math/Vector',
    'test/math/Vector2',
    'test/math/Vector3',
    'test/math/Vector4',
    'test/math/Versor',
    'test/noise/Noise',
    'test/shapes/Box',
    'test/shapes/Quad',
    'test/shapes/Sphere',
    'test/shapes/Torus',
    'test/entities/entitiesTest',
    'test/util/URLTools'
],
function(mathTest) {
  window.__testacular__.start();
});
