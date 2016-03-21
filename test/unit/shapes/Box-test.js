var Box = require('src/goo/shapes/Box');

describe('Box', function () {
	var a = new Box();

	it('Number of vertices and indices', function () {
		expect(a.vertexCount).toEqual(24);
		expect(a.indexCount).toEqual(36);
	});
});
