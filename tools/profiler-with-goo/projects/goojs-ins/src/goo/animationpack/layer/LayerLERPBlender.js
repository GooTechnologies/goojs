define(['goo/animationpack/blendtree/BinaryLERPSource'], function (BinaryLERPSource) {
    'use strict';
    __touch(3001);
    function LayerLERPBlender() {
        this._blendWeight = null;
        __touch(3005);
        this._layerA = null;
        __touch(3006);
        this._layerB = null;
        __touch(3007);
    }
    __touch(3002);
    LayerLERPBlender.prototype.getBlendedSourceData = function () {
        var sourceAData = this._layerA.getCurrentSourceData();
        __touch(3008);
        var sourceBData = this._layerB._currentState ? this._layerB._currentState.getCurrentSourceData() : null;
        __touch(3009);
        return BinaryLERPSource.combineSourceData(sourceAData, sourceBData, this._blendWeight);
        __touch(3010);
    };
    __touch(3003);
    return LayerLERPBlender;
    __touch(3004);
});
__touch(3000);