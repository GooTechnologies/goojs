define([
    'goo/math/Vector3',
    'goo/renderer/pass/FullscreenPass',
    'goo/renderer/Camera',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/pass/RenderTarget',
    'goo/math/Vector4',
    'goo/renderer/light/PointLight',
    'goo/renderer/light/DirectionalLight',
    'goo/renderer/light/SpotLight'
], function (Vector3, FullscreenPass, Camera, Material, ShaderLib, RenderTarget, Vector4, PointLight, DirectionalLight, SpotLight) {
    'use strict';
    __touch(18833);
    function ShadowHandler() {
        this.depthMaterial = new Material(ShaderLib.lightDepth, 'depthMaterial');
        __touch(18840);
        this.depthMaterial.cullState.cullFace = 'Back';
        __touch(18841);
        this.fullscreenPass = new FullscreenPass();
        __touch(18842);
        this.downsample = Material.createShader(ShaderLib.downsample, 'downsample');
        __touch(18843);
        var sigma = 2;
        __touch(18844);
        this.blurfilter = Material.createShader(ShaderLib.convolution, 'blurfilter');
        __touch(18845);
        var kernelSize = 2 * Math.ceil(sigma * 3) + 1;
        __touch(18846);
        this.blurfilter.defines = {
            KERNEL_SIZE_FLOAT: kernelSize.toFixed(1),
            KERNEL_SIZE_INT: kernelSize.toFixed(0)
        };
        __touch(18847);
        this.blurfilter.uniforms.cKernel = ShaderLib.convolution.buildKernel(sigma);
        __touch(18848);
        this.oldClearColor = new Vector4(0, 0, 0, 0);
        __touch(18849);
        this.shadowClearColor = new Vector4(1, 1, 1, 1);
        __touch(18850);
        this.renderList = [];
        __touch(18851);
        this.shadowList = [];
        __touch(18852);
        this.first = true;
        __touch(18853);
    }
    __touch(18834);
    var tmpVec = new Vector3();
    __touch(18835);
    ShadowHandler.prototype._createShadowData = function (shadowSettings, renderer) {
        var shadowX = shadowSettings.resolution[0];
        __touch(18854);
        var shadowY = shadowSettings.resolution[1];
        __touch(18855);
        var linearFloat = !!renderer.glExtensionTextureFloatLinear;
        __touch(18856);
        if (shadowSettings.shadowData.shadowTarget) {
            renderer._deallocateRenderTarget(shadowSettings.shadowData.shadowTarget);
            __touch(18862);
        }
        shadowSettings.shadowData.shadowTarget = new RenderTarget(shadowX, shadowY, {
            type: 'Float',
            magFilter: 'NearestNeighbor',
            minFilter: 'NearestNeighborNoMipMaps'
        });
        __touch(18857);
        shadowSettings.shadowData.shadowResult = null;
        __touch(18858);
        if (shadowSettings.shadowType === 'VSM') {
            var type = { type: 'Float' };
            __touch(18863);
            if (!linearFloat) {
                type.magFilter = 'NearestNeighbor';
                __touch(18866);
                type.minFilter = 'NearestNeighborNoMipMaps';
                __touch(18867);
            }
            if (shadowSettings.shadowData.shadowTargetDown) {
                renderer._deallocateRenderTarget(shadowSettings.shadowData.shadowTargetDown);
                __touch(18868);
            }
            shadowSettings.shadowData.shadowTargetDown = new RenderTarget(shadowX / 2, shadowY / 2, type);
            __touch(18864);
            if (shadowSettings.shadowData.shadowBlurred) {
                renderer._deallocateRenderTarget(shadowSettings.shadowData.shadowBlurred);
                __touch(18869);
            }
            shadowSettings.shadowData.shadowBlurred = new RenderTarget(shadowX / 2, shadowY / 2, type);
            __touch(18865);
        }
        shadowSettings.shadowRecord.resolution = shadowSettings.shadowRecord.resolution || [];
        __touch(18859);
        shadowSettings.shadowRecord.resolution[0] = shadowX;
        __touch(18860);
        shadowSettings.shadowRecord.shadowType = shadowSettings.shadowType;
        __touch(18861);
    };
    __touch(18836);
    ShadowHandler.prototype._testStatesEqual = function (state1, state2) {
        var keys1 = Object.keys(state1);
        __touch(18870);
        var keys2 = Object.keys(state2);
        __touch(18871);
        if (keys1.length !== keys2.length) {
            return false;
            __touch(18873);
        }
        for (var i = 0; i < keys1.length; i++) {
            var key = keys1[i];
            __touch(18874);
            if (state1[key] !== state2[key]) {
                return false;
                __touch(18875);
            }
        }
        return true;
        __touch(18872);
    };
    __touch(18837);
    ShadowHandler.prototype.checkShadowRendering = function (renderer, partitioner, entities, lights) {
        if (this.first === true) {
            this.first = false;
            __touch(18876);
            return;
            __touch(18877);
        }
        for (var i = 0; i < lights.length; i++) {
            var light = lights[i];
            __touch(18878);
            if (light.shadowCaster || light.lightCookie) {
                var shadowSettings = light.shadowSettings;
                __touch(18879);
                if (!shadowSettings.shadowData) {
                    shadowSettings.shadowData = {};
                    __touch(18884);
                    shadowSettings.shadowRecord = {};
                    __touch(18885);
                    shadowSettings.shadowData.lightCamera = new Camera(55, 1, 1, 1000);
                    __touch(18886);
                }
                var record = shadowSettings.shadowRecord;
                __touch(18880);
                var lightCamera = shadowSettings.shadowData.lightCamera;
                __touch(18881);
                lightCamera.translation.copy(light.translation);
                __touch(18882);
                if (light.direction) {
                    tmpVec.setv(light.translation).addv(light.direction);
                    __touch(18887);
                    lightCamera.lookAt(tmpVec, shadowSettings.upVector);
                    __touch(18888);
                } else {
                    lightCamera.lookAt(Vector3.ZERO, shadowSettings.upVector);
                    __touch(18889);
                }
                if (!shadowSettings.shadowData.shadowTarget || record.angle !== light.angle || !record.resolution || record.resolution[0] !== shadowSettings.resolution[0] || record.resolution[1] !== shadowSettings.resolution[1] || record.near !== shadowSettings.near || record.far !== shadowSettings.far || record.size !== shadowSettings.size) {
                    if (!record.resolution || record.resolution[0] !== shadowSettings.resolution[0] || record.resolution[1] !== shadowSettings.resolution[1]) {
                        this._createShadowData(shadowSettings, renderer);
                        __touch(18898);
                    }
                    if (light instanceof SpotLight) {
                        lightCamera.setFrustumPerspective(light.angle, shadowSettings.resolution[0] / shadowSettings.resolution[1], shadowSettings.near, shadowSettings.far);
                        __touch(18899);
                    } else if (light instanceof PointLight) {
                        lightCamera.setFrustumPerspective(90, shadowSettings.resolution[0] / shadowSettings.resolution[1], shadowSettings.near, shadowSettings.far);
                        __touch(18900);
                    } else {
                        var radius = shadowSettings.size;
                        __touch(18901);
                        lightCamera.setFrustum(shadowSettings.near, shadowSettings.far, -radius, radius, radius, -radius);
                        __touch(18902);
                        lightCamera.projectionMode = Camera.Parallel;
                        __touch(18903);
                    }
                    lightCamera.update();
                    __touch(18890);
                    record.resolution = record.resolution || [];
                    __touch(18891);
                    record.resolution[0] = shadowSettings.resolution[0];
                    __touch(18892);
                    record.resolution[1] = shadowSettings.resolution[1];
                    __touch(18893);
                    record.angle = light.angle;
                    __touch(18894);
                    record.near = shadowSettings.near;
                    __touch(18895);
                    record.far = shadowSettings.far;
                    __touch(18896);
                    record.size = shadowSettings.size;
                    __touch(18897);
                }
                if (shadowSettings.shadowType === 'VSM' && record.shadowType !== shadowSettings.shadowType) {
                    this._createShadowData(shadowSettings, renderer);
                    __touch(18904);
                    record.shadowType = shadowSettings.shadowType;
                    __touch(18905);
                }
                lightCamera.onFrameChange();
                __touch(18883);
                if (light.shadowCaster) {
                    this.depthMaterial.shader.defines.SHADOW_TYPE = shadowSettings.shadowType === 'VSM' ? 2 : 0;
                    __touch(18906);
                    this.depthMaterial.uniforms.cameraScale = 1 / (lightCamera.far - lightCamera.near);
                    __touch(18907);
                    this.oldClearColor.copy(renderer.clearColor);
                    __touch(18908);
                    renderer.setClearColor(this.shadowClearColor.r, this.shadowClearColor.g, this.shadowClearColor.b, this.shadowClearColor.a);
                    __touch(18909);
                    this.shadowList.length = 0;
                    __touch(18910);
                    for (var j = 0; j < entities.length; j++) {
                        var entity = entities[j];
                        __touch(18915);
                        if (entity.meshRendererComponent && entity.meshRendererComponent.castShadows && !entity.isSkybox) {
                            this.shadowList.push(entity);
                            __touch(18916);
                        }
                    }
                    partitioner.process(lightCamera, this.shadowList, this.renderList);
                    __touch(18911);
                    renderer.render(this.renderList, lightCamera, [], shadowSettings.shadowData.shadowTarget, true, this.depthMaterial);
                    __touch(18912);
                    switch (shadowSettings.shadowType) {
                    case 'VSM':
                        this.fullscreenPass.material.shader = this.downsample;
                        this.fullscreenPass.render(renderer, shadowSettings.shadowData.shadowTargetDown, shadowSettings.shadowData.shadowTarget, 0);
                        this.fullscreenPass.material.shader = this.blurfilter;
                        this.fullscreenPass.material.uniforms.uImageIncrement = [
                            2 / shadowSettings.resolution[0],
                            0
                        ];
                        this.fullscreenPass.render(renderer, shadowSettings.shadowData.shadowBlurred, shadowSettings.shadowData.shadowTargetDown, 0);
                        this.fullscreenPass.material.uniforms.uImageIncrement = [
                            0,
                            2 / shadowSettings.resolution[1]
                        ];
                        this.fullscreenPass.render(renderer, shadowSettings.shadowData.shadowTargetDown, shadowSettings.shadowData.shadowBlurred, 0);
                        shadowSettings.shadowData.shadowResult = shadowSettings.shadowData.shadowTargetDown;
                        break;
                    case 'PCF':
                        shadowSettings.shadowData.shadowResult = shadowSettings.shadowData.shadowTarget;
                        break;
                    case 'Basic':
                        shadowSettings.shadowData.shadowResult = shadowSettings.shadowData.shadowTarget;
                        break;
                    default:
                        shadowSettings.shadowData.shadowResult = shadowSettings.shadowData.shadowTarget;
                        break;
                    }
                    __touch(18913);
                    renderer.setClearColor(this.oldClearColor.r, this.oldClearColor.g, this.oldClearColor.b, this.oldClearColor.a);
                    __touch(18914);
                }
            }
        }
    };
    __touch(18838);
    return ShadowHandler;
    __touch(18839);
});
__touch(18832);