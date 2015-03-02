define([
    'goo/math/Vector3',
    'goo/renderer/light/Light'
], function (Vector3, Light) {
    'use strict';
    __touch(18378);
    function SpotLight(color) {
        Light.call(this, color);
        __touch(18384);
        this.direction = new Vector3();
        __touch(18385);
        this.range = 1000;
        __touch(18386);
        this.angle = 45;
        __touch(18387);
        this.penumbra = null;
        __touch(18388);
        this.exponent = 16;
        __touch(18389);
    }
    __touch(18379);
    SpotLight.prototype = Object.create(Light.prototype);
    __touch(18380);
    SpotLight.prototype.constructor = SpotLight;
    __touch(18381);
    SpotLight.prototype.update = function (transform) {
        transform.matrix.getTranslation(this.translation);
        __touch(18390);
        this.direction.setd(0, 0, -1);
        __touch(18391);
        transform.matrix.applyPostVector(this.direction);
        __touch(18392);
    };
    __touch(18382);
    return SpotLight;
    __touch(18383);
});
__touch(18377);