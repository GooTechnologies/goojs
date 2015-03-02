define([
    'goo/entities/systems/System',
    'goo/entities/SystemBus',
    'goo/renderer/SimplePartitioner',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/Util',
    'goo/debugpack/DebugDrawHelper'
], function (System, SystemBus, SimplePartitioner, Material, ShaderLib, Util, DebugDrawHelper) {
    'use strict';
    __touch(3725);
    function DebugRenderSystem() {
        System.call(this, 'DebugRenderSystem', ['TransformComponent']);
        __touch(3734);
        this._renderablesTree = {};
        __touch(3735);
        this.renderList = [];
        __touch(3736);
        this.preRenderers = [];
        __touch(3737);
        this.composers = [];
        __touch(3738);
        this.doRender = {
            CameraComponent: false,
            LightComponent: false,
            MeshRendererComponent: false,
            SkeletonPose: false
        };
        __touch(3739);
        this.inserted();
        __touch(3740);
        this._interestComponents = [
            'CameraComponent',
            'LightComponent'
        ];
        __touch(3741);
        this.camera = null;
        __touch(3742);
        this.lights = [];
        __touch(3743);
        this.currentTpf = 0;
        __touch(3744);
        this.scale = 20;
        __touch(3745);
        var that = this;
        __touch(3746);
        SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
            that.camera = newCam.camera;
            __touch(3752);
        });
        __touch(3747);
        SystemBus.addListener('goo.setLights', function (lights) {
            that.lights = lights;
            __touch(3753);
        });
        __touch(3748);
        this.selectionRenderable = DebugDrawHelper.getRenderablesFor({ type: 'MeshRendererComponent' });
        __touch(3749);
        this.selectionActive = false;
        __touch(3750);
        this.oldSelectionActive = false;
        __touch(3751);
    }
    __touch(3726);
    DebugRenderSystem.prototype = Object.create(System.prototype);
    __touch(3727);
    DebugRenderSystem.prototype.inserted = function () {
    };
    __touch(3728);
    DebugRenderSystem.prototype.deleted = function (entity) {
        delete this._renderablesTree[entity.id];
        __touch(3754);
    };
    __touch(3729);
    DebugRenderSystem.prototype.process = function (entities, tpf) {
        var count = this.renderList.length = 0;
        __touch(3755);
        var renderables;
        __touch(3756);
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(3759);
            for (var j = 0, max = this._interestComponents.length; j < max; j++) {
                var componentName = this._interestComponents[j];
                __touch(3760);
                if (!entity._hidden && entity.hasComponent(componentName)) {
                    var component = entity.getComponent(componentName);
                    __touch(3761);
                    var options = { full: this.doRender[componentName] || entity.getComponent(componentName).forceDebug };
                    __touch(3762);
                    var tree = this._renderablesTree[entity.id] = this._renderablesTree[entity.id] || {};
                    __touch(3763);
                    if (tree[componentName] && (tree[componentName].length === 2 && options.full || tree[componentName].length === 1 && !options.full)) {
                        renderables = tree[componentName];
                        __touch(3767);
                    } else {
                        renderables = DebugDrawHelper.getRenderablesFor(component, options);
                        __touch(3768);
                        renderables.forEach(function (renderable) {
                            renderable.id = entity.id;
                            __touch(3771);
                            renderable._index = entity._index;
                            __touch(3772);
                        });
                        __touch(3769);
                        tree[componentName] = renderables;
                        __touch(3770);
                    }
                    renderables.forEach(function (renderable) {
                        renderable.transform.translation.setv(entity.transformComponent.worldTransform.translation);
                        __touch(3773);
                        renderable.transform.rotation.copy(entity.transformComponent.worldTransform.rotation);
                        __touch(3774);
                        renderable.transform.scale.setd(1, 1, 1);
                        __touch(3775);
                        renderable.transform.update();
                        __touch(3776);
                    });
                    __touch(3764);
                    DebugDrawHelper.update(renderables, component, this.camera);
                    __touch(3765);
                    renderables.forEach(function (renderable) {
                        this.renderList[count++] = renderable;
                        __touch(3777);
                    }.bind(this));
                    __touch(3766);
                }
            }
            if (this.doRender.SkeletonPose && entity.meshDataComponent && entity.meshDataComponent.currentPose) {
                var pose = entity.meshDataComponent.currentPose;
                __touch(3778);
                var tree = this._renderablesTree[entity.id] = this._renderablesTree[entity.id] || {};
                __touch(3779);
                if (tree.skeleton) {
                    renderables = tree.skeleton;
                    __touch(3781);
                } else {
                    renderables = DebugDrawHelper.getRenderablesFor(pose);
                    __touch(3782);
                    renderables.forEach(function (renderable) {
                        renderable.id = entity.id;
                        __touch(3785);
                    });
                    __touch(3783);
                    tree.skeleton = renderables;
                    __touch(3784);
                }
                renderables.forEach(function (renderable) {
                    renderable.transform.copy(entity.transformComponent.worldTransform);
                    __touch(3786);
                    this.renderList[count++] = renderable;
                    __touch(3787);
                }.bind(this));
                __touch(3780);
            }
        }
        if (this.selectionActive) {
            this.renderList[count++] = this.selectionRenderable[0];
            __touch(3788);
        }
        this.renderList.length = count;
        __touch(3757);
        this.currentTpf = tpf;
        __touch(3758);
    };
    __touch(3730);
    DebugRenderSystem.prototype.render = function (renderer) {
        renderer.checkResize(this.camera);
        __touch(3789);
        if (this.camera) {
            renderer.render(this.renderList, this.camera, this.lights, null, false);
            __touch(3790);
        }
    };
    __touch(3731);
    DebugRenderSystem.prototype.renderToPick = function (renderer, skipUpdateBuffer) {
        renderer.renderToPick(this.renderList, this.camera, false, skipUpdateBuffer);
        __touch(3791);
    };
    __touch(3732);
    return DebugRenderSystem;
    __touch(3733);
});
__touch(3724);