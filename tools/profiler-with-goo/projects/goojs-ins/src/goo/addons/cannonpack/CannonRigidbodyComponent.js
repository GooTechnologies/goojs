define([
    'goo/entities/components/Component',
    'goo/math/Quaternion',
    'goo/math/Vector3',
    'goo/math/Transform',
    'goo/shapes/Box',
    'goo/shapes/Sphere',
    'goo/shapes/Quad',
    'goo/util/ObjectUtil'
], function (Component, Quaternion, Vector3, Transform, Box, Sphere, Quad, _) {
    'use strict';
    __touch(341);
    function CannonRigidbodyComponent(settings) {
        settings = settings || {};
        __touch(354);
        this.type = 'CannonRigidbodyComponent';
        __touch(355);
        _.defaults(settings, {
            mass: 1,
            velocity: new Vector3()
        });
        __touch(356);
        this.mass = settings.mass;
        __touch(357);
        this._initialPosition = null;
        __touch(358);
        this._initialVelocity = new Vector3();
        __touch(359);
        this._initialVelocity.setv(settings.velocity);
        __touch(360);
        this.body = null;
        __touch(361);
        this.centerOfMassOffset = new Vector3();
        __touch(362);
    }
    __touch(342);
    CannonRigidbodyComponent.prototype = Object.create(Component.prototype);
    __touch(343);
    CannonRigidbodyComponent.constructor = CannonRigidbodyComponent;
    __touch(344);
    CannonRigidbodyComponent.prototype.api = {
        setForce: function (force) {
            CannonRigidbodyComponent.prototype.setForce.call(this.cannonRigidbodyComponent, force);
            __touch(363);
        },
        setVelocity: function (velocity) {
            CannonRigidbodyComponent.prototype.setVelocity.call(this.cannonRigidbodyComponent, velocity);
            __touch(364);
        },
        setPosition: function (pos) {
            CannonRigidbodyComponent.prototype.setPosition.call(this.cannonRigidbodyComponent, pos);
            __touch(365);
        },
        setAngularVelocity: function (angularVelocity) {
            CannonRigidbodyComponent.prototype.setAngularVelocity.call(this.cannonRigidbodyComponent, angularVelocity);
            __touch(366);
        }
    };
    __touch(345);
    var tmpQuat = new Quaternion();
    __touch(346);
    CannonRigidbodyComponent.prototype.setForce = function (force) {
        this.body.force.set(force.x, force.y, force.z);
        __touch(367);
    };
    __touch(347);
    CannonRigidbodyComponent.prototype.setVelocity = function (velocity) {
        this.body.velocity.set(velocity.x, velocity.y, velocity.z);
        __touch(368);
    };
    __touch(348);
    CannonRigidbodyComponent.prototype.setPosition = function (pos) {
        if (this.body) {
            this.body.position.set(pos.x, pos.y, pos.z);
            __touch(369);
        } else {
            this._initialPosition = new Vector3(pos);
            __touch(370);
        }
    };
    __touch(349);
    CannonRigidbodyComponent.prototype.setAngularVelocity = function (angularVelocity) {
        this.body.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
        __touch(371);
    };
    __touch(350);
    CannonRigidbodyComponent.getCollider = function (entity) {
        return entity.cannonBoxColliderComponent || entity.cannonPlaneColliderComponent || entity.cannonSphereColliderComponent || entity.cannonTerrainColliderComponent || entity.cannonCylinderColliderComponent || null;
        __touch(372);
    };
    __touch(351);
    CannonRigidbodyComponent.prototype.addShapesToBody = function (entity) {
        var body = entity.cannonRigidbodyComponent.body;
        __touch(373);
        var collider = CannonRigidbodyComponent.getCollider(entity);
        __touch(374);
        if (!collider) {
            var bodyTransform = entity.transformComponent.worldTransform;
            __touch(375);
            var invBodyTransform = new Transform();
            __touch(376);
            invBodyTransform.copy(bodyTransform);
            __touch(377);
            invBodyTransform.invert(invBodyTransform);
            __touch(378);
            var gooTrans = new Transform();
            __touch(379);
            var cmOffset = this.centerOfMassOffset;
            __touch(380);
            entity.traverse(function (childEntity) {
                var collider = CannonRigidbodyComponent.getCollider(childEntity);
                __touch(382);
                if (collider) {
                    gooTrans.copy(childEntity.transformComponent.worldTransform);
                    __touch(383);
                    var gooTrans2 = new Transform();
                    __touch(384);
                    Transform.combine(invBodyTransform, gooTrans, gooTrans2);
                    __touch(385);
                    gooTrans2.update();
                    __touch(386);
                    var trans = gooTrans2.translation;
                    __touch(387);
                    var rot = gooTrans2.rotation;
                    __touch(388);
                    var offset = new CANNON.Vec3(trans.x, trans.y, trans.z);
                    __touch(389);
                    var q = tmpQuat;
                    __touch(390);
                    q.fromRotationMatrix(rot);
                    __touch(391);
                    var orientation = new CANNON.Quaternion(q.x, q.y, q.z, q.w);
                    __touch(392);
                    offset.vadd(cmOffset, offset);
                    __touch(393);
                    if (collider.isTrigger) {
                        collider.cannonShape.collisionResponse = false;
                        __touch(395);
                    }
                    body.addShape(collider.cannonShape, offset, orientation);
                    __touch(394);
                }
            });
            __touch(381);
        } else {
            body.addShape(collider.cannonShape);
            __touch(396);
        }
    };
    __touch(352);
    return CannonRigidbodyComponent;
    __touch(353);
});
__touch(340);