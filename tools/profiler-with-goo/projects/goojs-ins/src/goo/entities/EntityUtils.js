define([
    'goo/scripts/Scripts',
    'goo/renderer/bounds/BoundingBox',
    'goo/util/ObjectUtil'
], function (Scripts, BoundingBox, _) {
    'use strict';
    __touch(4051);
    function EntityUtils() {
    }
    __touch(4052);
    function cloneSkeletonPose(skeletonPose, settings) {
        settings.skeletonMap = settings.skeletonMap || {
            originals: [],
            clones: []
        };
        __touch(4062);
        var idx = settings.skeletonMap.originals.indexOf(skeletonPose);
        __touch(4063);
        var clonedSkeletonPose;
        __touch(4064);
        if (idx === -1) {
            clonedSkeletonPose = skeletonPose.clone();
            __touch(4066);
            settings.skeletonMap.originals.push(skeletonPose);
            __touch(4067);
            settings.skeletonMap.clones.push(clonedSkeletonPose);
            __touch(4068);
        } else {
            clonedSkeletonPose = settings.skeletonMap.clones[idx];
            __touch(4069);
        }
        return clonedSkeletonPose;
        __touch(4065);
    }
    __touch(4053);
    function cloneEntity(world, entity, settings) {
        var newEntity = world.createEntity(entity.name);
        __touch(4070);
        for (var i = 0; i < entity._components.length; i++) {
            var component = entity._components[i];
            __touch(4072);
            if (component.type === 'TransformComponent') {
                newEntity.transformComponent.transform.copy(component.transform);
                __touch(4073);
            } else if (component.type === 'MeshDataComponent') {
                var meshDataComponent = new component.constructor(component.meshData);
                __touch(4074);
                meshDataComponent.modelBound = new component.modelBound.constructor();
                __touch(4075);
                if (component.currentPose) {
                    meshDataComponent.currentPose = cloneSkeletonPose(component.currentPose, settings);
                    __touch(4077);
                }
                newEntity.setComponent(meshDataComponent);
                __touch(4076);
            } else if (component.type === 'MeshRendererComponent') {
                var meshRendererComponent = new component.constructor();
                __touch(4078);
                for (var j = 0; j < component.materials.length; j++) {
                    meshRendererComponent.materials.push(component.materials[j]);
                    __touch(4080);
                }
                newEntity.setComponent(meshRendererComponent);
                __touch(4079);
            } else if (component.type === 'AnimationComponent') {
                var clonedAnimationComponent = component.clone();
                __touch(4081);
                clonedAnimationComponent._skeletonPose = cloneSkeletonPose(component._skeletonPose, settings);
                __touch(4082);
                newEntity.setComponent(clonedAnimationComponent);
                __touch(4083);
            } else if (component.type === 'ScriptComponent') {
                var scriptComponent = new component.constructor();
                __touch(4084);
                for (var j = 0; j < component.scripts.length; j++) {
                    var newScript;
                    __touch(4086);
                    var script = component.scripts[j];
                    __touch(4087);
                    var key = script.externals ? script.externals.key || script.externals.name : null;
                    __touch(4088);
                    if (key && Scripts.getScript(key)) {
                        newScript = Scripts.create(key, script.parameters);
                        __touch(4089);
                    } else {
                        newScript = {
                            externals: script.externals,
                            name: (script.name || '') + '_clone',
                            enabled: !!script.enabled
                        };
                        __touch(4090);
                        if (script.parameters) {
                            newScript.parameters = _.deepClone(script.parameters);
                            __touch(4092);
                        }
                        if (script.setup) {
                            newScript.setup = script.setup;
                            __touch(4093);
                        }
                        if (script.update) {
                            newScript.update = script.update;
                            __touch(4094);
                        }
                        if (script.setup) {
                            newScript.cleanup = script.cleanup;
                            __touch(4095);
                        }
                        scriptComponent.scripts.push(newScript);
                        __touch(4091);
                    }
                }
                newEntity.setComponent(scriptComponent);
                __touch(4085);
                if (world.getSystem('ScriptSystem').manualSetup && component.scripts[0].context) {
                    scriptComponent.setup(newEntity);
                    __touch(4096);
                }
            } else {
                newEntity.setComponent(component);
                __touch(4097);
            }
        }
        for (var j = 0; j < entity.transformComponent.children.length; j++) {
            var child = entity.transformComponent.children[j];
            __touch(4098);
            var clonedChild = cloneEntity(world, child.entity, settings);
            __touch(4099);
            newEntity.transformComponent.attachChild(clonedChild.transformComponent);
            __touch(4100);
        }
        if (settings.callback) {
            settings.callback(newEntity);
            __touch(4101);
        }
        return newEntity;
        __touch(4071);
    }
    __touch(4054);
    EntityUtils.clone = function (world, entity, settings) {
        settings = settings || {};
        __touch(4102);
        settings.shareData = settings.shareData || true;
        __touch(4103);
        settings.shareMaterial = settings.shareMaterial || true;
        __touch(4104);
        settings.cloneHierarchy = settings.cloneHierarchy || true;
        __touch(4105);
        return cloneEntity(world, entity, settings);
        __touch(4106);
    };
    __touch(4055);
    EntityUtils.getRoot = function (entity) {
        while (entity.transformComponent.parent) {
            entity = entity.transformComponent.parent.entity;
            __touch(4109);
        }
        __touch(4107);
        return entity;
        __touch(4108);
    };
    __touch(4056);
    EntityUtils.updateWorldTransform = function (transformComponent) {
        transformComponent.updateWorldTransform();
        __touch(4110);
        for (var i = 0; i < transformComponent.children.length; i++) {
            EntityUtils.updateWorldTransform(transformComponent.children[i]);
            __touch(4111);
        }
    };
    __touch(4057);
    EntityUtils.show = function (entity) {
        entity._hidden = false;
        __touch(4112);
        var pointer = entity;
        __touch(4113);
        while (pointer.transformComponent.parent) {
            pointer = pointer.transformComponent.parent.entity;
            __touch(4116);
            if (pointer._hidden) {
                if (entity.meshRendererComponent) {
                    entity.meshRendererComponent.hidden = true;
                    __touch(4118);
                }
                if (entity.lightComponent) {
                    entity.lightComponent.hidden = true;
                    __touch(4119);
                }
                if (entity.htmlComponent) {
                    entity.htmlComponent.hidden = true;
                    __touch(4120);
                }
                return;
                __touch(4117);
            }
        }
        __touch(4114);
        entity.traverse(function (entity) {
            if (entity._hidden) {
                return false;
                __touch(4121);
            }
            if (entity.meshRendererComponent) {
                entity.meshRendererComponent.hidden = entity._hidden;
                __touch(4122);
            }
            if (entity.lightComponent) {
                entity.lightComponent.hidden = entity._hidden;
                __touch(4123);
            }
            if (entity.htmlComponent) {
                entity.htmlComponent.hidden = entity._hidden;
                __touch(4124);
            }
        });
        __touch(4115);
    };
    __touch(4058);
    EntityUtils.hide = function (entity) {
        entity._hidden = true;
        __touch(4125);
        entity.traverse(function (entity) {
            if (entity.meshRendererComponent) {
                entity.meshRendererComponent.hidden = true;
                __touch(4127);
            }
            if (entity.lightComponent) {
                entity.lightComponent.hidden = true;
                __touch(4128);
            }
            if (entity.htmlComponent) {
                entity.htmlComponent.hidden = true;
                __touch(4129);
            }
        });
        __touch(4126);
    };
    __touch(4059);
    EntityUtils.getTotalBoundingBox = function (entity) {
        var mergedWorldBound = new BoundingBox();
        __touch(4130);
        var first = true;
        __touch(4131);
        entity.traverse(function (entity) {
            if (entity.meshRendererComponent) {
                if (first) {
                    var boundingVolume = entity.meshRendererComponent.worldBound;
                    __touch(4134);
                    if (boundingVolume instanceof BoundingBox) {
                        boundingVolume.clone(mergedWorldBound);
                        __touch(4136);
                    } else {
                        mergedWorldBound.center.setv(boundingVolume.center);
                        __touch(4137);
                        mergedWorldBound.xExtent = mergedWorldBound.yExtent = mergedWorldBound.zExtent = boundingVolume.radius;
                        __touch(4138);
                    }
                    first = false;
                    __touch(4135);
                } else {
                    mergedWorldBound.merge(entity.meshRendererComponent.worldBound);
                    __touch(4139);
                }
            }
        });
        __touch(4132);
        if (first) {
            var translation = entity.transformComponent.worldTransform.translation;
            __touch(4140);
            mergedWorldBound = new BoundingBox(translation.clone(), 0.001, 0.001, 0.001);
            __touch(4141);
        }
        return mergedWorldBound;
        __touch(4133);
    };
    __touch(4060);
    return EntityUtils;
    __touch(4061);
});
__touch(4050);