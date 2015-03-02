define([
    'goo/math/Vector3',
    'goo/renderer/light/Light'
], function (Vector3, Light) {
    'use strict';
    __touch(18337);
    function DirectionalLight(color) {
        Light.call(this, color);
        __touch(18343);
        this.direction = new Vector3();
        __touch(18344);
    }
    __touch(18338);
    DirectionalLight.prototype = Object.create(Light.prototype);
    __touch(18339);
    DirectionalLight.prototype.constructor = DirectionalLight;
    __touch(18340);
    DirectionalLight.prototype.update = function (transform) {
        transform.matrix.getTranslation(this.translation);
        __touch(18345);
        this.direction.setd(0, 0, -1);
        __touch(18346);
        transform.matrix.applyPostVector(this.direction);
        __touch(18347);
    };
    __touch(18341);
    return DirectionalLight;
    __touch(18342);
});
__touch(18336);