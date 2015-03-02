define([
    'goo/entities/components/LightComponent',
    'goo/entities/components/CameraComponent',
    'goo/entities/components/MeshRendererComponent',
    'goo/animationpack/SkeletonPose',
    'goo/renderer/light/PointLight',
    'goo/renderer/light/DirectionalLight',
    'goo/renderer/light/SpotLight',
    'goo/debugpack/shapes/LightDebug',
    'goo/debugpack/shapes/CameraDebug',
    'goo/debugpack/shapes/MeshRendererDebug',
    'goo/debugpack/shapes/SkeletonDebug',
    'goo/renderer/Material',
    'goo/renderer/Util',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/shaders/ShaderBuilder',
    'goo/math/Transform',
    'goo/renderer/Camera',
    'goo/renderer/Renderer'
], function (LightComponent, CameraComponent, MeshRendererComponent, SkeletonPose, PointLight, DirectionalLight, SpotLight, LightDebug, CameraDebug, MeshRendererDebug, SkeletonDebug, Material, Util, ShaderLib, ShaderBuilder, Transform, Camera, Renderer) {
    'use strict';
    __touch(3231);
    var DebugDrawHelper = {};
    __touch(3232);
    var lightDebug = new LightDebug();
    __touch(3233);
    var cameraDebug = new CameraDebug();
    __touch(3234);
    var meshRendererDebug = new MeshRendererDebug();
    __touch(3235);
    var skeletonDebug = new SkeletonDebug();
    __touch(3236);
    DebugDrawHelper.getRenderablesFor = function (component, options) {
        var meshes, material;
        __touch(3246);
        if (component.type === 'LightComponent') {
            meshes = lightDebug.getMesh(component.light, options);
            __touch(3248);
            material = new Material(ShaderLib.simpleColored, 'DebugDrawLightMaterial');
            __touch(3249);
        } else if (component.type === 'CameraComponent') {
            meshes = cameraDebug.getMesh(component.camera, options);
            __touch(3250);
            material = new Material(ShaderLib.simpleLit, 'DebugDrawCameraMaterial');
            __touch(3251);
            material.uniforms.materialAmbient = [
                0.4,
                0.4,
                0.4,
                1
            ];
            __touch(3252);
            material.uniforms.materialDiffuse = [
                0.6,
                0.6,
                0.6,
                1
            ];
            __touch(3253);
            material.uniforms.materialSpecular = [
                0,
                0,
                0,
                1
            ];
            __touch(3254);
        } else if (component.type === 'MeshRendererComponent') {
            meshes = meshRendererDebug.getMesh();
            __touch(3255);
            material = new Material(ShaderLib.simpleColored, 'DebugMeshRendererComponentMaterial');
            __touch(3256);
        } else if (component instanceof SkeletonPose) {
            meshes = skeletonDebug.getMesh(component, options);
            __touch(3257);
            var materials = [
                new Material(ShaderLib.uber, 'SkeletonDebugMaterial'),
                new Material(ShaderLib.uber, 'SkeletonDebugMaterial')
            ];
            __touch(3258);
            var renderables = [];
            __touch(3259);
            var len = materials.length;
            __touch(3260);
            while (len--) {
                var material = materials[len];
                __touch(3263);
                material.depthState = {
                    enabled: false,
                    write: false
                };
                __touch(3264);
                material.renderQueue = 3000;
                __touch(3265);
                material.uniforms.materialDiffuse = [
                    0,
                    0,
                    0,
                    1
                ];
                __touch(3266);
                material.uniforms.materialDiffuse[len] = 0.8;
                __touch(3267);
                material.uniforms.materialAmbient = [
                    0,
                    0,
                    0,
                    1
                ];
                __touch(3268);
                material.uniforms.materialAmbient[len] = 0.5;
                __touch(3269);
                renderables[len] = {
                    meshData: meshes[len],
                    transform: new Transform(),
                    materials: [material],
                    currentPose: component
                };
                __touch(3270);
            }
            __touch(3261);
            return renderables;
            __touch(3262);
        }
        return meshes.map(function (mesh) {
            return {
                meshData: mesh,
                transform: new Transform(),
                materials: [material]
            };
            __touch(3271);
        });
        __touch(3247);
    };
    __touch(3237);
    DebugDrawHelper.update = function (renderables, component, camera) {
        if (component.camera && component.camera.changedProperties) {
            var camera = component.camera;
            __touch(3274);
            if (renderables.length > 1 && (camera.far / camera.near !== renderables[1].farNear || camera.fov !== renderables[1].fov || camera.size !== renderables[1].size || camera.aspect !== renderables[1].aspect || camera.projectionMode !== renderables[1].projectionMode)) {
                renderables[1].meshData = CameraDebug.buildFrustum(camera);
                __touch(3276);
                renderables[1].farNear = camera.far / camera.near;
                __touch(3277);
                renderables[1].fov = camera.fov;
                __touch(3278);
                renderables[1].size = camera.size;
                __touch(3279);
                renderables[1].aspect = camera.aspect;
                __touch(3280);
                renderables[1].projectionMode = camera.projectionMode;
                __touch(3281);
            }
            component.camera.changedProperties = false;
            __touch(3275);
        }
        DebugDrawHelper[component.type].updateMaterial(renderables[0].materials[0], component);
        __touch(3272);
        if (renderables[1]) {
            DebugDrawHelper[component.type].updateMaterial(renderables[1].materials[0], component);
            __touch(3282);
        }
        if (renderables[1]) {
            DebugDrawHelper[component.type].updateTransform(renderables[1].transform, component);
            __touch(3283);
        }
        var mainCamera = Renderer.mainCamera;
        __touch(3273);
        if (mainCamera) {
            var camPosition = mainCamera.translation;
            __touch(3284);
            var scale = renderables[0].transform.translation.distance(camPosition) / 30;
            __touch(3285);
            if (mainCamera.projectionMode === Camera.Parallel) {
                scale = (mainCamera._frustumTop - mainCamera._frustumBottom) / 20;
                __touch(3288);
            }
            renderables[0].transform.scale.setd(scale, scale, scale);
            __touch(3286);
            renderables[0].transform.update();
            __touch(3287);
            if (component.light && component.light instanceof DirectionalLight) {
                if (renderables[1]) {
                    renderables[1].transform.scale.scale(scale);
                    __touch(3289);
                }
                if (renderables[1]) {
                    renderables[1].transform.update();
                    __touch(3290);
                }
            }
        }
    };
    __touch(3238);
    DebugDrawHelper.LightComponent = {};
    __touch(3239);
    DebugDrawHelper.CameraComponent = {};
    __touch(3240);
    DebugDrawHelper.LightComponent.updateMaterial = function (material, component) {
        var light = component.light;
        __touch(3291);
        var color = material.uniforms.color = material.uniforms.color || [];
        __touch(3292);
        color[0] = light.color.data[0];
        __touch(3293);
        color[1] = light.color.data[1];
        __touch(3294);
        color[2] = light.color.data[2];
        __touch(3295);
    };
    __touch(3241);
    DebugDrawHelper.LightComponent.updateTransform = function (transform, component) {
        var light = component.light;
        __touch(3296);
        if (!(light instanceof DirectionalLight)) {
            var range = light.range;
            __touch(3298);
            transform.scale.setd(range, range, range);
            __touch(3299);
            if (light instanceof SpotLight) {
                var angle = light.angle * Math.PI / 180;
                __touch(3300);
                var tan = Math.tan(angle / 2);
                __touch(3301);
                transform.scale.muld(tan, tan, 1);
                __touch(3302);
            }
        }
        transform.update();
        __touch(3297);
    };
    __touch(3242);
    DebugDrawHelper.CameraComponent.updateMaterial = function (material) {
        material.uniforms.color = material.uniforms.color || [
            1,
            1,
            1
        ];
        __touch(3303);
    };
    __touch(3243);
    DebugDrawHelper.CameraComponent.updateTransform = function () {
    };
    __touch(3244);
    return DebugDrawHelper;
    __touch(3245);
});
__touch(3230);