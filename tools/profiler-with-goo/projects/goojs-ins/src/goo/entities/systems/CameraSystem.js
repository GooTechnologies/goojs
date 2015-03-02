define([
    'goo/entities/systems/System',
    'goo/entities/SystemBus',
    'goo/renderer/Renderer'
], function (System, SystemBus, Renderer) {
    'use strict';
    __touch(5338);
    function CameraSystem() {
        System.call(this, 'CameraSystem', [
            'TransformComponent',
            'CameraComponent'
        ]);
        __touch(5347);
        this.mainCamera = null;
        __touch(5348);
    }
    __touch(5339);
    CameraSystem.prototype = Object.create(System.prototype);
    __touch(5340);
    CameraSystem.prototype.constructor = CameraSystem;
    __touch(5341);
    CameraSystem.prototype.findMainCamera = function () {
        if (this._activeEntities.length) {
            var firstEntity = this._activeEntities[0];
            __touch(5349);
            SystemBus.emit('goo.setCurrentCamera', {
                camera: firstEntity.cameraComponent.camera,
                entity: firstEntity
            });
            __touch(5350);
        }
    };
    __touch(5342);
    CameraSystem.prototype.inserted = function (entity) {
        if (!Renderer.mainCamera) {
            SystemBus.emit('goo.setCurrentCamera', {
                camera: entity.cameraComponent.camera,
                entity: entity
            });
            __touch(5351);
        }
    };
    __touch(5343);
    CameraSystem.prototype.deleted = function () {
    };
    __touch(5344);
    CameraSystem.prototype.process = function () {
        for (var i = 0; i < this._activeEntities.length; i++) {
            var entity = this._activeEntities[i];
            __touch(5352);
            var transformComponent = entity.transformComponent;
            __touch(5353);
            var cameraComponent = entity.cameraComponent;
            __touch(5354);
            if (transformComponent._updated) {
                cameraComponent.updateCamera(transformComponent.worldTransform);
                __touch(5355);
            }
        }
    };
    __touch(5345);
    return CameraSystem;
    __touch(5346);
});
__touch(5337);