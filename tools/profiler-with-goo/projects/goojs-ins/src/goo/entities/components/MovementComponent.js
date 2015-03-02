define([
    'goo/math/Vector3',
    'goo/entities/components/Component'
], function (Vector3, Component) {
    'use strict';
    __touch(4826);
    function MovementComponent() {
        this.type = 'MovementComponent';
        __touch(4836);
        this.velocity = new Vector3();
        __touch(4837);
        this.rotationVelocity = new Vector3();
        __touch(4838);
    }
    __touch(4827);
    MovementComponent.prototype = Object.create(Component.prototype);
    __touch(4828);
    MovementComponent.prototype.addVelocity = function (vec3) {
        this.velocity.add(vec3);
        __touch(4839);
    };
    __touch(4829);
    MovementComponent.prototype.setVelocity = function (vec3) {
        this.velocity.set(vec3);
        __touch(4840);
    };
    __touch(4830);
    MovementComponent.prototype.getVelocity = function () {
        return this.velocity;
        __touch(4841);
    };
    __touch(4831);
    MovementComponent.prototype.addRotationVelocity = function (vec3) {
        this.rotationVelocity.add(vec3);
        __touch(4842);
    };
    __touch(4832);
    MovementComponent.prototype.setRotationVelocity = function (vec3) {
        this.rotationVelocity.set(vec3);
        __touch(4843);
    };
    __touch(4833);
    MovementComponent.prototype.getRotationVelocity = function () {
        return this.rotationVelocity;
        __touch(4844);
    };
    __touch(4834);
    return MovementComponent;
    __touch(4835);
});
__touch(4825);