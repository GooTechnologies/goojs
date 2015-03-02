define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/entities/components/CameraComponent',
    'goo/renderer/Camera',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil'
], function (ComponentHandler, CameraComponent, Camera, RSVP, pu, _) {
    'use strict';
    __touch(8698);
    function CameraComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(8707);
        this._type = 'CameraComponent';
        __touch(8708);
    }
    __touch(8699);
    CameraComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(8700);
    ComponentHandler._registerClass('camera', CameraComponentHandler);
    __touch(8701);
    CameraComponentHandler.prototype.constructor = CameraComponentHandler;
    __touch(8702);
    CameraComponentHandler.prototype._prepare = function (config) {
        _.defaults(config, {
            near: 1,
            far: 10000,
            projectionMode: 'Perspective',
            aspect: 1,
            lockedRatio: false
        });
        __touch(8709);
        if (config.projectionMode === 'Perspective' && config.fov === undefined) {
            config.fov = 45;
            __touch(8710);
        }
        if (config.projectionMode === 'Parallel' && config.size === undefined) {
            config.size = 100;
            __touch(8711);
        }
        if (config.projectionMode !== 'Perspective' && config.projectionMode !== 'Parallel') {
            config.projectionMode = 'Perspective';
            __touch(8712);
        }
    };
    __touch(8703);
    CameraComponentHandler.prototype._create = function () {
        var camera = new Camera(45, 1, 1, 1000);
        __touch(8713);
        var component = new CameraComponent(camera);
        __touch(8714);
        return component;
        __touch(8715);
    };
    __touch(8704);
    CameraComponentHandler.prototype.update = function (entity, config, options) {
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(8720);
            }
            component.camera.setProjectionMode(Camera[config.projectionMode]);
            __touch(8717);
            component.camera.lockedRatio = false;
            __touch(8718);
            if (config.projectionMode === 'Perspective') {
                component.camera.setFrustumPerspective(config.fov, null, config.near, config.far);
                __touch(8721);
            } else {
                var size = config.size;
                __touch(8722);
                component.camera.setFrustum(config.near, config.far, -size, size, size, -size, null);
                __touch(8723);
                component.camera.size = size;
                __touch(8724);
            }
            return component;
            __touch(8719);
        });
        __touch(8716);
    };
    __touch(8705);
    return CameraComponentHandler;
    __touch(8706);
});
__touch(8697);