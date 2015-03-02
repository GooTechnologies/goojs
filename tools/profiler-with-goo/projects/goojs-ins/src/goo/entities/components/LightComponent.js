define([
    'goo/entities/components/Component',
    'goo/renderer/light/Light'
], function (Component, Light) {
    'use strict';
    __touch(4745);
    function LightComponent(light) {
        this.type = 'LightComponent';
        __touch(4751);
        this.light = light;
        __touch(4752);
        this.hidden = false;
        __touch(4753);
    }
    __touch(4746);
    LightComponent.prototype = Object.create(Component.prototype);
    __touch(4747);
    LightComponent.prototype.updateLight = function (transform) {
        this.light.update(transform);
        __touch(4754);
    };
    __touch(4748);
    LightComponent.applyOnEntity = function (obj, entity) {
        if (obj instanceof Light) {
            var lightComponent = new LightComponent(obj);
            __touch(4755);
            entity.setComponent(lightComponent);
            __touch(4756);
            return true;
            __touch(4757);
        }
    };
    __touch(4749);
    return LightComponent;
    __touch(4750);
});
__touch(4744);