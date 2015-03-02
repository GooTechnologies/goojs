define(['goo/renderer/light/Light'], function (Light) {
    'use strict';
    __touch(18368);
    function PointLight(color) {
        Light.call(this, color);
        __touch(18374);
        this.range = 1000;
        __touch(18375);
    }
    __touch(18369);
    PointLight.prototype = Object.create(Light.prototype);
    __touch(18370);
    PointLight.prototype.constructor = PointLight;
    __touch(18371);
    PointLight.prototype.update = function (transform) {
        transform.matrix.getTranslation(this.translation);
        __touch(18376);
    };
    __touch(18372);
    return PointLight;
    __touch(18373);
});
__touch(18367);