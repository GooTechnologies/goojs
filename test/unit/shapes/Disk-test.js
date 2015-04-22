define([
	'goo/shapes/Disk'
], function (
	Disk
) {
	'use strict';

	describe('Disk', function () {
		var a = new Disk(8, 1);

		it('Number of vertices and indices', function () {
			expect(a.vertexCount).toEqual(9);
			expect(a.indexCount).toEqual(8*3);
		});
	});
});
