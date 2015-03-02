define([
    'goo/entities/Entity',
    'goo/math/Transform'
], function (Entity, Transform) {
    'use strict';
    __touch(16221);
    function RenderInfo() {
        this.reset();
        __touch(16226);
    }
    __touch(16222);
    RenderInfo.prototype.reset = function () {
        this.lights = null;
        __touch(16227);
        this.materials = null;
        __touch(16228);
        this.meshData = null;
        __touch(16229);
        this.camera = null;
        __touch(16230);
        this.mainCamera = null;
        __touch(16231);
        this.lights = null;
        __touch(16232);
        this.shadowHandler = null;
        __touch(16233);
        this.renderer = null;
        __touch(16234);
        this.material = null;
        __touch(16235);
        this.transform = null;
        __touch(16236);
        this.currentPose = null;
        __touch(16237);
    };
    __touch(16223);
    RenderInfo.prototype.fill = function (renderable) {
        if (renderable instanceof Entity) {
            this.meshData = renderable.meshDataComponent.meshData;
            __touch(16239);
            this.materials = renderable.meshRendererComponent.materials;
            __touch(16240);
            this.transform = renderable.particleComponent ? Transform.IDENTITY : renderable.transformComponent.worldTransform;
            __touch(16241);
            if (renderable.meshDataComponent.currentPose) {
                this.currentPose = renderable.meshDataComponent.currentPose;
                __touch(16242);
            } else {
                this.currentPose = null;
                __touch(16243);
            }
        } else {
            this.meshData = renderable.meshData;
            __touch(16244);
            this.materials = renderable.materials;
            __touch(16245);
            this.transform = renderable.transform;
            __touch(16246);
            if (renderable.currentPose) {
                this.currentPose = renderable.currentPose;
                __touch(16247);
            } else {
                this.currentPose = null;
                __touch(16248);
            }
        }
        this.renderable = renderable;
        __touch(16238);
    };
    __touch(16224);
    return RenderInfo;
    __touch(16225);
});
__touch(16220);