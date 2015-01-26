define([
    'goo/addons/raycastpack/OctreeNode',
    'goo/math/Vector3'
], function (
    OctreeNode,
    Vector3
) {
    'use strict';

    describe('OctreeNode', function () {
        var octreeNode;
        var octreeOwner = {
            maxDepth:3
        };

        beforeEach(function () {
            var boundMin = new Vector3(-1, -1, -1);
            var boundMax = new Vector3(1, 1, 1);
            octreeNode = new OctreeNode(octreeOwner, boundMin, boundMax, 3);
        });

        it('OctreeNode intersects its own bounding volume', function () {
            var intersects = octreeNode.intersectsBoundingBox(octreeNode.boundMin, octreeNode.boundMax)
            expect(intersects).toBe(true);
        });

    });
});
