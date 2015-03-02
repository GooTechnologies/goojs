define([
    'goo/entities/components/Component',
    'goo/math/Vector3',
    'goo/renderer/Camera',
    'goo/entities/SystemBus'
], function (Component, Vector3, Camera, SystemBus) {
    'use strict';
    __touch(4676);
    function CameraComponent(camera) {
        this.type = 'CameraComponent';
        __touch(4686);
        this.camera = camera;
        __touch(4687);
        this.leftVec = new Vector3(-1, 0, 0);
        __touch(4688);
        this.upVec = new Vector3(0, 1, 0);
        __touch(4689);
        this.dirVec = new Vector3(0, 0, -1);
        __touch(4690);
    }
    __touch(4677);
    CameraComponent.type = 'CameraComponent';
    __touch(4678);
    CameraComponent.prototype = Object.create(Component.prototype);
    __touch(4679);
    CameraComponent.prototype.constructor = CameraComponent;
    __touch(4680);
    CameraComponent.prototype.api = {
        setAsMainCamera: function () {
            SystemBus.emit('goo.setCurrentCamera', {
                camera: this.cameraComponent.camera,
                entity: this
            });
            __touch(4691);
            return this;
            __touch(4692);
        }
    };
    __touch(4681);
    CameraComponent.prototype.setUpVector = function (axisId) {
        if (axisId === 0) {
            this.leftVec.setd(0, -1, 0);
            __touch(4693);
            this.upVec.setd(1, 0, 0);
            __touch(4694);
            this.dirVec.setd(0, 0, -1);
            __touch(4695);
        } else if (axisId === 2) {
            this.leftVec.setd(-1, 0, 0);
            __touch(4696);
            this.upVec.setd(0, 0, 1);
            __touch(4697);
            this.dirVec.setd(0, -1, 0);
            __touch(4698);
        } else {
            this.leftVec.setd(-1, 0, 0);
            __touch(4699);
            this.upVec.setd(0, 1, 0);
            __touch(4700);
            this.dirVec.setd(0, 0, -1);
            __touch(4701);
        }
    };
    __touch(4682);
    CameraComponent.prototype.updateCamera = function (transform) {
        this.camera._left.setv(this.leftVec);
        __touch(4702);
        transform.rotation.applyPost(this.camera._left);
        __touch(4703);
        this.camera._up.setv(this.upVec);
        __touch(4704);
        transform.rotation.applyPost(this.camera._up);
        __touch(4705);
        this.camera._direction.setv(this.dirVec);
        __touch(4706);
        transform.rotation.applyPost(this.camera._direction);
        __touch(4707);
        transform.matrix.getTranslation(this.camera.translation);
        __touch(4708);
        this.camera.onFrameChange();
        __touch(4709);
    };
    __touch(4683);
    CameraComponent.applyOnEntity = function (obj, entity) {
        if (obj instanceof Camera) {
            var cameraComponent = new CameraComponent(obj);
            __touch(4710);
            entity.setComponent(cameraComponent);
            __touch(4711);
            return true;
            __touch(4712);
        }
    };
    __touch(4684);
    return CameraComponent;
    __touch(4685);
});
__touch(4675);