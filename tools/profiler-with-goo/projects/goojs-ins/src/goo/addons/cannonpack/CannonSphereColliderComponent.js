define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(398);
    function CannonSphereColliderComponent(settings) {
        settings = settings || {};
        __touch(403);
        this.type = 'CannonSphereColliderComponent';
        __touch(404);
        this.radius = settings.radius || 0.5;
        __touch(405);
        this.cannonShape = new CANNON.Sphere(this.radius);
        __touch(406);
    }
    __touch(399);
    CannonSphereColliderComponent.prototype = Object.create(Component.prototype);
    __touch(400);
    CannonSphereColliderComponent.constructor = CannonSphereColliderComponent;
    __touch(401);
    return CannonSphereColliderComponent;
    __touch(402);
});
__touch(397);