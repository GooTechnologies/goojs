define([
    'goo/entities/components/Component',
    'goo/shapes/Box',
    'goo/math/Vector3'
], function (Component, Box, Vector3) {
    'use strict';
    __touch(286);
    function CannonBoxColliderComponent(settings) {
        this.type = 'CannonBoxColliderComponent';
        __touch(291);
        settings = settings || {};
        __touch(292);
        var e = this.halfExtents = settings.halfExtents || new Vector3(0.5, 0.5, 0.5);
        __touch(293);
        this.cannonShape = new CANNON.Box(new CANNON.Vec3(e.x, e.y, e.z));
        __touch(294);
        this.isTrigger = typeof settings.isTrigger !== 'undefined' ? settings.isTrigger : false;
        __touch(295);
    }
    __touch(287);
    CannonBoxColliderComponent.prototype = Object.create(Component.prototype);
    __touch(288);
    CannonBoxColliderComponent.constructor = CannonBoxColliderComponent;
    __touch(289);
    return CannonBoxColliderComponent;
    __touch(290);
});
__touch(285);