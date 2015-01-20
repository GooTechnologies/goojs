define([
        'goo/math/Vector3'
    ],
    /** @lends */

function (Vector3) {
    'use strict';

    //HIT RESULT
    function HitResult() {
        this.hit = false;
        this.localHitLocation = new Vector3();
        this.vertexWeights = [];
        this.surfaceObject;
    }

    HitResult.prototype.copyFrom = function (hitResult) {
        this.hit = hitResult.hit;
        this.localHitLocation = hitResult.localHitLocation;
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

    return HitResult;
});