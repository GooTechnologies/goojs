define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(327);
    function CannonPlaneColliderComponent(settings) {
        this.type = 'CannonPlaneColliderComponent';
        __touch(332);
        settings = settings || {};
        __touch(333);
        this.cannonShape = new CANNON.Plane();
        __touch(334);
    }
    __touch(328);
    CannonPlaneColliderComponent.prototype = Object.create(Component.prototype);
    __touch(329);
    CannonPlaneColliderComponent.constructor = CannonPlaneColliderComponent;
    __touch(330);
    return CannonPlaneColliderComponent;
    __touch(331);
});
__touch(326);