define([
    'goo/entities/components/Component',
    'goo/util/ObjectUtil'
], function (Component, _) {
    'use strict';
    __touch(310);
    function CannonDistanceJointComponent(settings) {
        settings = settings || {};
        __touch(316);
        this.type = 'CannonDistanceJointComponent';
        __touch(317);
        _.defaults(settings, {
            distance: 1,
            connectedBody: null
        });
        __touch(318);
        this.distance = settings.distance;
        __touch(319);
        this.connectedBody = settings.connectedBody;
        __touch(320);
        this.cannonConstraint = null;
        __touch(321);
    }
    __touch(311);
    CannonDistanceJointComponent.prototype = Object.create(Component.prototype);
    __touch(312);
    CannonDistanceJointComponent.constructor = CannonDistanceJointComponent;
    __touch(313);
    CannonDistanceJointComponent.prototype.createConstraint = function (entity) {
        var bodyA = entity.cannonRigidbodyComponent.body;
        __touch(322);
        var bodyB = this.connectedBody.body;
        __touch(323);
        this.cannonConstraint = new CANNON.DistanceConstraint(bodyA, bodyB, this.distance);
        __touch(324);
        return this.cannonConstraint;
        __touch(325);
    };
    __touch(314);
    return CannonDistanceJointComponent;
    __touch(315);
});
__touch(309);