define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/entities/SystemBus',
    'goo/renderer/Renderer'
], function (Action, SystemBus, Renderer) {
    'use strict';
    __touch(7430);
    function SwitchCameraAction() {
        Action.apply(this, arguments);
        __touch(7439);
        this._camera = null;
        __touch(7440);
    }
    __touch(7431);
    SwitchCameraAction.prototype = Object.create(Action.prototype);
    __touch(7432);
    SwitchCameraAction.prototype.constructor = SwitchCameraAction;
    __touch(7433);
    SwitchCameraAction.external = {
        name: 'Switch Camera',
        type: 'camera',
        description: 'Switches to a selected camera',
        parameters: [{
                name: 'Camera',
                key: 'cameraEntityRef',
                type: 'camera',
                description: 'Camera to switch to',
                'default': null
            }],
        transitions: []
    };
    __touch(7434);
    SwitchCameraAction.prototype.ready = function () {
        this._camera = Renderer.mainCamera;
        __touch(7441);
    };
    __touch(7435);
    SwitchCameraAction.prototype._run = function (fsm) {
        var world = fsm.getOwnerEntity()._world;
        __touch(7442);
        var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
        __touch(7443);
        if (cameraEntity && cameraEntity.cameraComponent) {
            SystemBus.emit('goo.setCurrentCamera', {
                camera: cameraEntity.cameraComponent.camera,
                entity: cameraEntity
            });
            __touch(7444);
        }
    };
    __touch(7436);
    SwitchCameraAction.prototype.cleanup = function () {
    };
    __touch(7437);
    return SwitchCameraAction;
    __touch(7438);
});
__touch(7429);