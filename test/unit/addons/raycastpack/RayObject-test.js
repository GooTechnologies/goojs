define([
    'goo/addons/raycastpack/RayObject'
], function (
    RayObject
) {
    'use strict';

    describe('RayObject', function () {
        var world;
        var rayObject;
        var testEntity;

        beforeEach(function () {
            rayObject = Object.create(RayObject);
        });

        it('finds a RayObject entity', function () {

            expect(rayObject.entity).toBe(undefined);
        });

    });
});
