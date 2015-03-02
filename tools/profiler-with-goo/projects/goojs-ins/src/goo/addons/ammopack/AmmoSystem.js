define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(110);
    function AmmoSystem(settings) {
        System.call(this, 'AmmoSystem', [
            'AmmoComponent',
            'TransformComponent'
        ]);
        __touch(117);
        this.settings = settings || {};
        __touch(118);
        this.fixedTime = 1 / (this.settings.stepFrequency || 60);
        __touch(119);
        this.maxSubSteps = this.settings.maxSubSteps || 5;
        __touch(120);
        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        __touch(121);
        var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        __touch(122);
        var overlappingPairCache = new Ammo.btDbvtBroadphase();
        __touch(123);
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        __touch(124);
        this.ammoWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        __touch(125);
        var gravity = this.settings.gravity;
        __touch(126);
        if (gravity == null) {
            gravity = -9.81;
            __touch(128);
        }
        this.ammoWorld.setGravity(new Ammo.btVector3(0, gravity, 0));
        __touch(127);
    }
    __touch(111);
    AmmoSystem.prototype = Object.create(System.prototype);
    __touch(112);
    AmmoSystem.prototype.inserted = function (entity) {
        if (entity.ammoComponent) {
            entity.ammoComponent.initialize(entity);
            __touch(129);
            this.ammoWorld.addRigidBody(entity.ammoComponent.body);
            __touch(130);
        } else {
            console.log('Warning: missing entity.ammoComponent');
            __touch(131);
        }
    };
    __touch(113);
    AmmoSystem.prototype.deleted = function (entity) {
        if (entity.ammoComponent) {
            this.ammoWorld.removeRigidBody(entity.ammoComponent.body);
            __touch(132);
        }
    };
    __touch(114);
    AmmoSystem.prototype.process = function (entities, tpf) {
        this.ammoWorld.stepSimulation(tpf, this.maxSubSteps, this.fixedTime);
        __touch(133);
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            __touch(134);
            if (e.ammoComponent.mass > 0) {
                e.ammoComponent.copyPhysicalTransformToVisual(e, tpf);
                __touch(135);
            }
        }
    };
    __touch(115);
    return AmmoSystem;
    __touch(116);
});
__touch(109);