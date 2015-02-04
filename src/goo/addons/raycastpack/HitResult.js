define([
        'goo/math/Vector3'
    ],

function (Vector3) {
    'use strict';

    //HIT RESULT
    function HitResult() {
        this.hit = false;
        this.localHitLocation = new Vector3();
        this._worldHitLocation = new Vector3();
        this._worldHitLocationSet = false;
        this.vertexWeights = [];
        this.surfaceObject = null;
    }

    HitResult.prototype.copyFrom = function (hitResult) {
        this.hit = hitResult.hit;
        this.localHitLocation.setVector(hitResult.localHitLocation);
        this._worldHitLocation.setVector(hitResult._worldHitLocation);
        this._worldHitLocationSet = hitResult._worldHitLocationSet;
        this.vertexWeights[0] = hitResult.vertexWeights[0];
        this.vertexWeights[1] = hitResult.vertexWeights[1];
        this.vertexWeights[2] = hitResult.vertexWeights[2];
        this.surfaceObject = hitResult.surfaceObject;
    };

    //calculates a world space hit location and puts it in the locationStore
    HitResult.prototype.getWorldHitLocation = function () {
        ////only calculate worldHitLocation if its not set before
        //if (!this._worldHitLocationSet)
        //{
            this._worldHitLocation.setVector(this.localHitLocation);

            //transform to world coordinates
            this.surfaceObject.rayObject.regularMatrix.applyPostPoint(this._worldHitLocation);
            this._worldHitLocationSet = true;
        //}

        return this._worldHitLocation;
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