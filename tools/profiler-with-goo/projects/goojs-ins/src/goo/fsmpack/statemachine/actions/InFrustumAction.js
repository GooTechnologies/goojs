define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/renderer/Camera',
    'goo/renderer/bounds/BoundingSphere'
], function (Action, Camera, BoundingSphere) {
    'use strict';
    __touch(6714);
    function InFrustumAction() {
        Action.apply(this, arguments);
        __touch(6722);
    }
    __touch(6715);
    InFrustumAction.prototype = Object.create(Action.prototype);
    __touch(6716);
    InFrustumAction.prototype.constructor = InFrustumAction;
    __touch(6717);
    InFrustumAction.external = {
        key: 'In Frustum',
        name: 'In View',
        type: 'camera',
        description: 'Performs a transition based on whether the entity is in a camera\'s frustum or not',
        canTransition: true,
        parameters: [
            {
                name: 'Current camera',
                key: 'current',
                type: 'boolean',
                description: 'Check this to always use the current camera',
                'default': true
            },
            {
                name: 'Camera',
                key: 'cameraEntityRef',
                type: 'camera',
                description: 'Other camera; Will be ignored if the previous option is checked',
                'default': null
            },
            {
                name: 'On every frame',
                key: 'everyFrame',
                type: 'boolean',
                description: 'Repeat this action every frame',
                'default': true
            }
        ],
        transitions: [
            {
                key: 'inside',
                name: 'Inside',
                description: 'State to transition to if entity is in the frustum'
            },
            {
                key: 'outside',
                name: 'Outside',
                description: 'State to transition to if entity is outside the frustum'
            }
        ]
    };
    __touch(6718);
    InFrustumAction.prototype._setup = function (fsm) {
        if (!this.current) {
            var world = fsm.getOwnerEntity()._world;
            __touch(6723);
            var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
            __touch(6724);
            this.camera = cameraEntity.cameraComponent.camera;
            __touch(6725);
        }
    };
    __touch(6719);
    InFrustumAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(6726);
        if (this.current) {
            if (entity.isVisible) {
                fsm.send(this.transitions.inside);
                __touch(6727);
            } else {
                fsm.send(this.transitions.outside);
                __touch(6728);
            }
        } else {
            var boundingVolume = entity.meshRendererComponent ? entity.meshRendererComponent.worldBound : new BoundingSphere(entity.transformComponent.worldTransform.translation, 0.001);
            __touch(6729);
            if (this.camera.contains(boundingVolume) === Camera.Outside) {
                fsm.send(this.transitions.outside);
                __touch(6730);
            } else {
                fsm.send(this.transitions.inside);
                __touch(6731);
            }
        }
    };
    __touch(6720);
    return InFrustumAction;
    __touch(6721);
});
__touch(6713);