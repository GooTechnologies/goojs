define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(297);
    function CannonCylinderColliderComponent(settings) {
        settings = settings || {};
        __touch(302);
        this.type = 'CannonCylinderColliderComponent';
        __touch(303);
        var radiusTop = typeof settings.radiusTop === 'number' ? settings.radiusTop : 0.5;
        __touch(304);
        var radiusBottom = typeof settings.radiusBottom === 'number' ? settings.radiusBottom : 0.5;
        __touch(305);
        var height = typeof settings.height === 'number' ? settings.height : 1;
        __touch(306);
        var numSegments = typeof settings.numSegments === 'number' ? settings.numSegments : 10;
        __touch(307);
        this.cannonShape = new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegments);
        __touch(308);
    }
    __touch(298);
    CannonCylinderColliderComponent.prototype = Object.create(Component.prototype);
    __touch(299);
    CannonCylinderColliderComponent.constructor = CannonCylinderColliderComponent;
    __touch(300);
    return CannonCylinderColliderComponent;
    __touch(301);
});
__touch(296);