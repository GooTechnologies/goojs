define([
    'goo/entities/systems/System',
    'goo/renderer/bounds/BoundingBox',
    'goo/renderer/bounds/BoundingSphere',
    'goo/math/Quaternion',
    'goo/math/Transform',
    'goo/math/Vector3',
    'goo/util/ObjectUtil'
], function (System, BoundingBox, BoundingSphere, Quaternion, Transform, Vector3, _) {
    'use strict';
    __touch(408);
    function CannonSystem(settings) {
        System.call(this, 'CannonSystem', [
            'CannonRigidbodyComponent',
            'TransformComponent'
        ]);
        __touch(419);
        settings = settings || {};
        __touch(420);
        _.defaults(settings, {
            gravity: new Vector3(0, -10, 0),
            stepFrequency: 60,
            broadphase: 'naive'
        });
        __touch(421);
        this.priority = 1;
        __touch(422);
        var world = this.world = new CANNON.World();
        __touch(423);
        world.gravity.x = settings.gravity.x;
        __touch(424);
        world.gravity.y = settings.gravity.y;
        __touch(425);
        world.gravity.z = settings.gravity.z;
        __touch(426);
        this.setBroadphaseAlgorithm(settings.broadphase);
        __touch(427);
        this.stepFrequency = settings.stepFrequency;
        __touch(428);
        this.maxSubSteps = settings.maxSubSteps || 0;
        __touch(429);
    }
    __touch(409);
    var tmpQuat = new Quaternion();
    __touch(410);
    CannonSystem.prototype = Object.create(System.prototype);
    __touch(411);
    CannonSystem.prototype.reset = function () {
        for (var i = 0; i < this._activeEntities.length; i++) {
            var entity = this._activeEntities[i];
            __touch(430);
            if (entity.cannonRigidbodyComponent.added) {
                var body = entity.cannonRigidbodyComponent.body;
                __touch(431);
                var p = entity.transformComponent.worldTransform.translation;
                __touch(432);
                var q = new Quaternion();
                __touch(433);
                q.fromRotationMatrix(entity.transformComponent.worldTransform.rotation);
                __touch(434);
                body.position.set(p.x, p.y, p.z);
                __touch(435);
                body.quaternion.set(q.x, q.y, q.z, q.w);
                __touch(436);
                body.velocity.set(0, 0, 0);
                __touch(437);
                body.angularVelocity.set(0, 0, 0);
                __touch(438);
            }
        }
    };
    __touch(412);
    CannonSystem.prototype.inserted = function (entity) {
        var rbComponent = entity.cannonRigidbodyComponent;
        __touch(439);
        rbComponent.body = null;
        __touch(440);
    };
    __touch(413);
    CannonSystem.prototype.deleted = function (entity) {
        var rbComponent = entity.cannonRigidbodyComponent;
        __touch(441);
        if (rbComponent && rbComponent.body) {
            this.world.remove(rbComponent.body);
            __touch(442);
            rbComponent.body = null;
            __touch(443);
        }
    };
    __touch(414);
    var tmpVec = new Vector3();
    __touch(415);
    CannonSystem.prototype.process = function (entities) {
        var world = this.world;
        __touch(444);
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(447);
            var rbComponent = entity.cannonRigidbodyComponent;
            __touch(448);
            if (rbComponent && rbComponent.added) {
                continue;
                __touch(460);
            }
            var transformComponent = entity.transformComponent;
            __touch(449);
            var body = new CANNON.Body({ mass: rbComponent.mass });
            __touch(450);
            rbComponent.body = body;
            __touch(451);
            rbComponent.addShapesToBody(entity);
            __touch(452);
            if (!body.shapes.length) {
                entity.clearComponent('CannonRigidbodyComponent');
                __touch(461);
                continue;
                __touch(462);
            }
            if (!rbComponent._initialPosition) {
                entity.setPosition(transformComponent.transform.translation);
                __touch(463);
            } else {
                entity.setPosition(rbComponent._initialPosition);
                __touch(464);
            }
            entity.setVelocity(rbComponent._initialVelocity);
            __touch(453);
            var q = tmpQuat;
            __touch(454);
            q.fromRotationMatrix(transformComponent.transform.rotation);
            __touch(455);
            body.quaternion.set(q.x, q.y, q.z, q.w);
            __touch(456);
            world.add(body);
            __touch(457);
            var c = entity.cannonDistanceJointComponent;
            __touch(458);
            if (c) {
                world.addConstraint(c.createConstraint(entity));
                __touch(465);
            }
            rbComponent.added = true;
            __touch(459);
        }
        var fixedTimeStep = 1 / this.stepFrequency;
        __touch(445);
        var maxSubSteps = this.maxSubSteps;
        __touch(446);
        if (maxSubSteps) {
            var now = performance.now() / 1000;
            __touch(466);
            if (!this._lastTime) {
                this._lastTime = now;
                __touch(470);
            }
            var dt = now - this._lastTime;
            __touch(467);
            this._lastTime = now;
            __touch(468);
            world.step(fixedTimeStep, dt, maxSubSteps);
            __touch(469);
        } else {
            world.step(fixedTimeStep);
            __touch(471);
        }
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(472);
            var cannonComponent = entity.cannonRigidbodyComponent;
            __touch(473);
            if (!cannonComponent) {
                continue;
                __touch(483);
            }
            cannonComponent.body.computeAABB();
            __touch(474);
            var cannonQuat = cannonComponent.body.quaternion;
            __touch(475);
            var position = cannonComponent.body.position;
            __touch(476);
            cannonQuat.vmult(cannonComponent.centerOfMassOffset, tmpVec);
            __touch(477);
            position.vadd(tmpVec, tmpVec);
            __touch(478);
            entity.transformComponent.setTranslation(tmpVec.x, tmpVec.y, tmpVec.z);
            __touch(479);
            tmpQuat.set(cannonQuat.x, cannonQuat.y, cannonQuat.z, cannonQuat.w);
            __touch(480);
            entity.transformComponent.transform.rotation.copyQuaternion(tmpQuat);
            __touch(481);
            entity.transformComponent.setUpdated();
            __touch(482);
        }
    };
    __touch(416);
    CannonSystem.prototype.setBroadphaseAlgorithm = function (algorithm) {
        var world = this.world;
        __touch(484);
        switch (algorithm) {
        case 'naive':
            world.broadphase = new CANNON.NaiveBroadphase();
            break;
        case 'sap':
            world.broadphase = new CANNON.SAPBroadphase(world);
            break;
        default:
            throw new Error('Broadphase not supported: ' + algorithm);
        }
        __touch(485);
    };
    __touch(417);
    return CannonSystem;
    __touch(418);
});
__touch(407);