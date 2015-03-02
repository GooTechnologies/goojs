define(['goo/math/Vector3'], function (Vector3) {
    'use strict';
    __touch(18349);
    function Light(color) {
        this.translation = new Vector3();
        __touch(18353);
        this.color = color || new Vector3(1, 1, 1);
        __touch(18354);
        this.intensity = 1;
        __touch(18355);
        this.specularIntensity = 1;
        __touch(18356);
        this.shadowCaster = false;
        __touch(18357);
        this.lightCookie = null;
        __touch(18358);
        this.shadowSettings = {
            size: 100,
            near: 1,
            far: 1000,
            resolution: [
                512,
                512
            ],
            upVector: Vector3.UNIT_Y,
            darkness: 1,
            shadowType: 'VSM'
        };
        __touch(18359);
        this.changedProperties = false;
        __touch(18360);
        this.changedColor = false;
        __touch(18361);
    }
    __touch(18350);
    Light.prototype.destroy = function (renderer) {
        var shadowSettings = this.shadowSettings;
        __touch(18362);
        if (shadowSettings.shadowData) {
            if (shadowSettings.shadowData.shadowTarget) {
                shadowSettings.shadowData.shadowTarget.destroy(renderer.context);
                __touch(18364);
            }
            if (shadowSettings.shadowData.shadowTargetDown) {
                shadowSettings.shadowData.shadowTargetDown.destroy(renderer.context);
                __touch(18365);
            }
            if (shadowSettings.shadowData.shadowBlurred) {
                shadowSettings.shadowData.shadowBlurred.destroy(renderer.context);
                __touch(18366);
            }
        }
        delete shadowSettings.shadowData;
        __touch(18363);
    };
    __touch(18351);
    return Light;
    __touch(18352);
});
__touch(18348);