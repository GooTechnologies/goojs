define([
    'goo/math/Quaternion',
    'goo/math/Vector3'
], function (Quaternion, Vector3) {
    'use strict';
    __touch(2585);
    function TransformData(source) {
        this._rotation = new Quaternion().copy(source ? source._rotation : Quaternion.IDENTITY);
        __touch(2591);
        this._scale = new Vector3().copy(source ? source._scale : Vector3.ONE);
        __touch(2592);
        this._translation = new Vector3().copy(source ? source._translation : Vector3.ZERO);
        __touch(2593);
    }
    __touch(2586);
    TransformData.prototype.applyTo = function (transform) {
        transform.setIdentity();
        __touch(2594);
        transform.rotation.copyQuaternion(this._rotation);
        __touch(2595);
        transform.scale.setv(this._scale);
        __touch(2596);
        transform.translation.setv(this._translation);
        __touch(2597);
        transform.update();
        __touch(2598);
    };
    __touch(2587);
    TransformData.prototype.set = function (source) {
        this._rotation.copy(source._rotation);
        __touch(2599);
        this._scale.copy(source._scale);
        __touch(2600);
        this._translation.copy(source._translation);
        __touch(2601);
    };
    __touch(2588);
    TransformData.prototype.blend = function (blendTo, blendWeight, store) {
        var tData = store ? store : new TransformData();
        __touch(2602);
        tData._translation.setv(this._translation).lerp(blendTo._translation, blendWeight);
        __touch(2603);
        tData._scale.setv(this._scale).lerp(blendTo._scale, blendWeight);
        __touch(2604);
        Quaternion.slerp(this._rotation, blendTo._rotation, blendWeight, tData._rotation);
        __touch(2605);
        return tData;
        __touch(2606);
    };
    __touch(2589);
    return TransformData;
    __touch(2590);
});
__touch(2584);