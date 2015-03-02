define([
    'goo/fsmpack/statemachine/actions/Action',
    'goo/entities/components/PortalComponent',
    'goo/entities/systems/PortalSystem',
    'goo/math/Vector3',
    'goo/entities/components/CameraComponent',
    'goo/renderer/Camera',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib'
], function (Action, PortalComponent, PortalSystem, Vector3, CameraComponent, Camera, Material, ShaderLib) {
    'use strict';
    __touch(7224);
    function SetRenderTargetAction() {
        Action.apply(this, arguments);
        __touch(7233);
    }
    __touch(7225);
    SetRenderTargetAction.prototype = Object.create(Action.prototype);
    __touch(7226);
    SetRenderTargetAction.prototype.constructor = SetRenderTargetAction;
    __touch(7227);
    SetRenderTargetAction.external = {
        name: 'Set Render Target',
        type: 'texture',
        description: 'Renders what a camera sees on the current entity\'s texture',
        parameters: [{
                name: 'Camera',
                key: 'cameraEntityRef',
                type: 'camera',
                description: 'Camera to use as source',
                'default': null
            }],
        transitions: []
    };
    __touch(7228);
    SetRenderTargetAction.prototype.ready = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7234);
        var world = entity._world;
        __touch(7235);
        if (!world.getSystem('PortalSystem')) {
            var renderSystem = world.getSystem('RenderSystem');
            __touch(7236);
            var renderer = world.gooRunner.renderer;
            __touch(7237);
            world.setSystem(new PortalSystem(renderer, renderSystem));
            __touch(7238);
        }
    };
    __touch(7229);
    SetRenderTargetAction.prototype._run = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7239);
        var world = entity._world;
        __touch(7240);
        var cameraEntity = world.entityManager.getEntityById(this.cameraEntityRef);
        __touch(7241);
        if (!cameraEntity || !cameraEntity.cameraComponent || !cameraEntity.cameraComponent.camera) {
            return;
            __touch(7248);
        }
        var camera = cameraEntity.cameraComponent.camera;
        __touch(7242);
        var portalMaterial = new Material(ShaderLib.textured);
        __touch(7243);
        if (!entity.meshRendererComponent) {
            return;
            __touch(7249);
        }
        this.oldMaterials = entity.meshRendererComponent.materials;
        __touch(7244);
        entity.meshRendererComponent.materials = [portalMaterial];
        __touch(7245);
        var portalComponent = new PortalComponent(camera, 500, { preciseRecursion: true });
        __touch(7246);
        entity.setComponent(portalComponent);
        __touch(7247);
    };
    __touch(7230);
    SetRenderTargetAction.prototype.cleanup = function (fsm) {
        var entity = fsm.getOwnerEntity();
        __touch(7250);
        if (this.oldMaterials) {
            entity.meshRendererComponent.materials = this.oldMaterials;
            __touch(7253);
        }
        this.oldMaterials = null;
        __touch(7251);
        entity.clearComponent('portalComponent');
        __touch(7252);
    };
    __touch(7231);
    return SetRenderTargetAction;
    __touch(7232);
});
__touch(7223);