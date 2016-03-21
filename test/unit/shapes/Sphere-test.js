var Sphere = require('src/goo/shapes/Sphere');

describe('Sphere', function () {
	var a = new Sphere(8, 4);

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(37);
		expect(a.indexCount).toEqual(168);
	});
});
