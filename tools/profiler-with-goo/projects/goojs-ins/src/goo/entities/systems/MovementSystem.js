define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(5467);
    function MovementSystem() {
        System.call(this, 'MovementSystem', ['MovementComponent']);
        __touch(5475);
    }
    __touch(5468);
    MovementSystem.prototype = Object.create(System.prototype);
    __touch(5469);
    MovementSystem.prototype.addVelocityToTransform = function (vel, transform, tpf) {
        transform.translation.add_d(vel.data[0] * tpf, vel.data[1] * tpf, vel.data[2] * tpf);
        __touch(5476);
    };
    __touch(5470);
    MovementSystem.prototype.addRotToTransform = function (rotVel, transform, tpf) {
        transform.rotation.rotateX(rotVel.data[0] * tpf);
        __touch(5477);
        transform.rotation.rotateY(rotVel.data[1] * tpf);
        __touch(5478);
        transform.rotation.rotateZ(rotVel.data[2] * tpf);
        __touch(5479);
    };
    __touch(5471);
    MovementSystem.prototype.applyMovementToEntity = function (entity) {
        var tpf = entity._world.tpf;
        __touch(5480);
        var rotVel = entity.movementComponent.getRotationVelocity();
        __touch(5481);
        var velocity = entity.movementComponent.getVelocity();
        __touch(5482);
        var transform = entity.transformComponent.transform;
        __touch(5483);
        this.addVelocityToTransform(velocity, transform, tpf);
        __touch(5484);
        this.addRotToTransform(rotVel, transform, tpf);
        __touch(5485);
        entity.transformComponent.setUpdated();
        __touch(5486);
    };
    __touch(5472);
    MovementSystem.prototype.process = function (entities) {
        var i, movementComponent;
        __touch(5487);
        for (i = 0; i < entities.length; i++) {
            movementComponent = entities[i].movementComponent;
            __touch(5488);
            this.applyMovementToEntity(entities[i]);
            __touch(5489);
        }
    };
    __touch(5473);
    return MovementSystem;
    __touch(5474);
});
__touch(5466);