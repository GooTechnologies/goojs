define([
    'goo/addons/raycastpack/OctreeNode',
    'goo/math/Ray',
    'goo/math/Vector3'
], function (
    OctreeNode,
    Ray,
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

        it('OctreeNode intersects bounding volume inside of itself', function () {

            var boundMin = new Vector3(-1, -1, -1);
            var boundMax = new Vector3(1, 1, 1);
            octreeNode = new OctreeNode(octreeOwner, boundMin, boundMax, 3);

            boundMin.setDirect(-0.5, -0.5, -0.5);
            boundMax.setDirect(0.5, 0.5, 0.5);

            var intersects = octreeNode.intersectsBoundingBox(boundMin, boundMax);
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

        it('Ray intersects octreeNode', function () {

            var rayOrigin = new Vector3(0,-2,0);
            var rayDirection = new Vector3(0,1,0);
            var rayLength = 10;
            //hard coded inverse direction
            var inverseRayDirection = new Vector3(Number.MAX_SAFE_INTEGER,1,Number.MAX_SAFE_INTEGER);

            var ray = new Ray(rayOrigin, rayDirection);

            var tmpBoundMin = new Vector3(-1, -1, -1);
            var tmpBoundMax = new Vector3(1, 1, 1);
            octreeNode = new OctreeNode(octreeOwner, tmpBoundMin, tmpBoundMax, 1);
            octreeNode.optimize();

            var objectDataString = "random data";

            //define a test object
            var CustomObject = function(){this.data = objectDataString;};

            //create a new object of our definition
            var randomObject = new CustomObject();

            //bound for the object to push
            var randomObjectMin = tmpBoundMin.setDirect(0.4,0.4,0.4);
            var randomObjectMax = tmpBoundMax.setDirect(1.2,1.2,1.2);

            octreeNode.pushObject(randomObject, randomObjectMin, randomObjectMax);
            octreeNode.optimize();

            var hitNodes = [];

            //ray step into the octree
            octreeNode.rayStep(ray, inverseRayDirection, rayLength, hitNodes, true);

            //find the hit data node
            var hitDataNode;
            for(var i=0;i<hitNodes.length;i++)
            {
                if(hitNodes[i].data.length !== 0)
                {
                    hitDataNode = hitNodes[i];
                    break;
                }
            }

            expect(hitDataNode.data[0].data).toBe(objectDataString);
        });

    });
});
