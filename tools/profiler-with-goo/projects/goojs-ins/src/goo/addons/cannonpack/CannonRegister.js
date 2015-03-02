define([
    'goo/scripts/Scripts',
    'goo/addons/cannonpack/CannonBoxColliderComponent',
    'goo/addons/cannonpack/CannonDistanceJointComponent',
    'goo/addons/cannonpack/CannonPlaneColliderComponent',
    'goo/addons/cannonpack/CannonTerrainColliderComponent',
    'goo/addons/cannonpack/CannonRigidbodyComponent',
    'goo/addons/cannonpack/CannonSphereColliderComponent',
    'goo/addons/cannonpack/CannonCylinderColliderComponent',
    'goo/addons/cannonpack/CannonSystem'
], function (Scripts) {
    'use strict';
    __touch(336);
    var defines = [
        'goo/scripts/Scripts',
        'goo/addons/cannonpack/CannonBoxColliderComponent',
        'goo/addons/cannonpack/CannonDistanceJointComponent',
        'goo/addons/cannonpack/CannonPlaneColliderComponent',
        'goo/addons/cannonpack/CannonTerrainColliderComponent',
        'goo/addons/cannonpack/CannonRigidbodyComponent',
        'goo/addons/cannonpack/CannonSphereColliderComponent',
        'goo/addons/cannonpack/CannonCylinderColliderComponent',
        'goo/addons/cannonpack/CannonSystem'
    ];
    __touch(337);
    for (var i = 1; i < defines.length; i++) {
        var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
        __touch(338);
        Scripts.addClass(name, arguments[i]);
        __touch(339);
    }
});
__touch(335);