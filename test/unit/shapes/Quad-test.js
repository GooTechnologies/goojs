define([
	'goo/shapes/Quad'
], function (
	Quad
) {
	'use strict';

	describe('Quad', function () {
		var a = new Quad();

		it('Number of vertices and indices', function () {
			expect(a.vertexCount).toEqual(4);
			expect(a.indexCount).toEqual(6);
		});
	});
});
