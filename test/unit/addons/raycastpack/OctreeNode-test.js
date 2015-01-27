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

        });

        it('OctreeNode intersects its own bounding volume', function () {

            var boundMin = new Vector3(-1, -1, -1);
            var boundMax = new Vector3(1, 1, 1);
            octreeNode = new OctreeNode(octreeOwner, boundMin, boundMax, 3);

            var intersects = octreeNode.intersectsBoundingBox(octreeNode.boundMin, octreeNode.boundMax);
            expect(intersects).toBe(true);
        });

        it('Contains leaf node when depth is max depth', function () {

            var boundMin = new Vector3(-1, -1, -1);
            var boundMax = new Vector3(1, 1, 1);
            octreeNode = new OctreeNode(octreeOwner, boundMin, boundMax, octreeOwner.maxDepth);

            expect(octreeNode.isLeaf).toBe(true);
        });

        it('Contains children node when depth is less than max depth', function () {

            var boundMin = new Vector3(-1, -1, -1);
            var boundMax = new Vector3(1, 1, 1);
            octreeNode = new OctreeNode(octreeOwner, boundMin, boundMax, octreeOwner.maxDepth-1);

            expect(typeof(octreeNode.children.length)).toBe('number');
        });

    });
});
