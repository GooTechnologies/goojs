define([
        'goo/math/Vector3'
    ],

function (Vector3) {
    'use strict';

    //HIT RESULT
    function HitResult() {
        this.hit = false;
        this.localHitLocation = new Vector3();
        this.vertexWeights = [];
        this.surfaceObject = null;
    }

    HitResult.prototype.copyFrom = function (hitResult) {
        this.hit = hitResult.hit;
        this.localHitLocation.setVector(hitResult.localHitLocation);
        this.vertexWeights = hitResult.vertexWeights;
        this.surfaceObject = hitResult.surfaceObject;
    };

    //calculates a world space hit location and puts it in the locationStore
    HitResult.prototype.getWorldHitLocation = function (locationStore) {
        locationStore.setVector(this.localHitLocation);

        //transform to world coordinates
        this.surfaceObject.rayObject.regularMatrix.applyPostPoint(locationStore);
        return locationStore;
    };

    //not necessary I think, since surfaceObject contains all of these functions but we might want to make wrappers for them like this
    /*
    //returns a world space normal of the hit triangle
    HitResult.prototype.getWorldHitLocation = function (normalStore) {
        return this.surfaceObject.getNormal(normalStore);
    };
    */

    return HitResult;
});