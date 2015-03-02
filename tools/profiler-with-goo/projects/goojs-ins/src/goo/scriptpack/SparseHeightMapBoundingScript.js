define([], function () {
    'use strict';
    __touch(20092);
    function SparseHeightMapBoundingScript(elevationData) {
        this.elevationData = elevationData;
        __touch(20097);
    }
    __touch(20093);
    SparseHeightMapBoundingScript.prototype.getClosest = function (x, z) {
        var minDist = Number.MAX_VALUE;
        __touch(20098);
        var minIndex = -1;
        __touch(20099);
        for (var i = 0; i < this.elevationData.length; i += 3) {
            var dist = Math.pow(this.elevationData[i + 0] - x, 2) + Math.pow(this.elevationData[i + 2] - z, 2);
            __touch(20101);
            if (dist < minDist) {
                minDist = dist;
                __touch(20102);
                minIndex = i;
                __touch(20103);
            }
        }
        return this.elevationData[minIndex + 1];
        __touch(20100);
    };
    __touch(20094);
    SparseHeightMapBoundingScript.prototype.run = function (entity) {
        var translation = entity.transformComponent.transform.translation;
        __touch(20104);
        var closest = this.getClosest(translation.data[0], translation.data[2]);
        __touch(20105);
        var diff = translation.data[1] - closest;
        __touch(20106);
        translation.data[1] -= diff * 0.1;
        __touch(20107);
    };
    __touch(20095);
    return SparseHeightMapBoundingScript;
    __touch(20096);
});
__touch(20091);