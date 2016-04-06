var Cylinder = require('../../../src/goo/shapes/Cylinder');

describe('Cylinder', function () {
	var a = new Cylinder();

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(8 * 4 + 2 + 2);
		expect(a.indexCount).toEqual(8 * 6 * 2);
	});
});
