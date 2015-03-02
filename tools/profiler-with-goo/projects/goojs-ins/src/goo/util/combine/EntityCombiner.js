define([
    'goo/entities/EntityUtils',
    'goo/entities/Entity',
    'goo/util/MeshBuilder',
    'goo/math/Transform',
    'goo/math/Vector3',
    'goo/renderer/bounds/BoundingBox',
    'goo/renderer/bounds/BoundingSphere'
], function (EntityUtils, Entity, MeshBuilder, Transform, Vector3, BoundingBox, BoundingSphere) {
    'use strict';
    __touch(22677);
    function EntityCombiner(gooWorld, gridCount, removeOldData, keepEntities) {
        this.world = gooWorld;
        __touch(22686);
        this.gridCount = gridCount || 1;
        __touch(22687);
        this.gridSize = 1;
        __touch(22688);
        this.removeOldData = removeOldData !== undefined ? removeOldData : true;
        __touch(22689);
        this.keepEntities = keepEntities !== undefined ? keepEntities : false;
        __touch(22690);
    }
    __touch(22678);
    EntityCombiner.prototype.combine = function () {
        this.world.processEntityChanges();
        __touch(22691);
        this.world.getSystem('TransformSystem')._process();
        __touch(22692);
        this.world.getSystem('BoundingUpdateSystem')._process();
        __touch(22693);
        var topEntities = this.world.entityManager.getTopEntities();
        __touch(22694);
        if (this.gridSize > 1) {
            this.gridSize = this._calculateBounds(topEntities) / this.gridCount;
            __touch(22696);
        }
        this._combineList(topEntities);
        __touch(22695);
    };
    __touch(22679);
    EntityCombiner.prototype._combineList = function (entities) {
        var root = entities;
        __touch(22697);
        if (entities instanceof Entity === false) {
            root = this.world.createEntity('root');
            __touch(22701);
            root.addToWorld();
            __touch(22702);
            for (var i = 0; i < entities.length; i++) {
                root.attachChild(entities[i]);
                __touch(22703);
            }
        }
        var baseSubs = new Map();
        __touch(22698);
        this._buildSubs(root, baseSubs);
        __touch(22699);
        var keys = baseSubs.getKeys();
        __touch(22700);
        for (var i = 0; i < keys.length; i++) {
            var entity = keys[i];
            __touch(22704);
            var combineList = baseSubs.get(entity);
            __touch(22705);
            this._combine(entity, combineList);
            __touch(22706);
        }
    };
    __touch(22680);
    EntityCombiner.prototype._buildSubs = function (entity, baseSubs, subs) {
        if (entity._hidden || entity.skip || entity.animationComponent || entity.particleComponent) {
            return;
            __touch(22707);
        }
        if (!subs || entity.static === false) {
            subs = [];
            __touch(22708);
            baseSubs.put(entity, subs);
            __touch(22709);
        }
        if (entity.meshDataComponent && entity.meshRendererComponent && entity.meshRendererComponent.worldBound) {
            subs.push(entity);
            __touch(22710);
        }
        for (var i = 0; i < entity.transformComponent.children.length; i++) {
            var child = entity.transformComponent.children[i];
            __touch(22711);
            this._buildSubs(child.entity, baseSubs, subs);
            __touch(22712);
        }
    };
    __touch(22681);
    EntityCombiner.prototype._combine = function (root, combineList) {
        var rootTransform = root.transformComponent.worldTransform;
        __touch(22713);
        var invertTransform = new Transform();
        __touch(22714);
        var calcTransform = new Transform();
        __touch(22715);
        rootTransform.invert(invertTransform);
        __touch(22716);
        var entities = new Map();
        __touch(22717);
        for (var i = 0; i < combineList.length; i++) {
            var entity = combineList[i];
            __touch(22719);
            var key = entity.meshRendererComponent.materials[0];
            __touch(22720);
            var attributeMap = entity.meshDataComponent.meshData.attributeMap;
            __touch(22721);
            var key2 = Object.keys(attributeMap);
            __touch(22722);
            key2.sort();
            __touch(22723);
            key2 = key2.join('_');
            __touch(22724);
            if (this.gridSize > 1) {
                var xBucket = entity.meshRendererComponent.worldBound.center.x / this.gridSize;
                __touch(22728);
                var zBucket = entity.meshRendererComponent.worldBound.center.z / this.gridSize;
                __touch(22729);
                key2 = key2 + '_' + Math.round(xBucket) + '_' + Math.round(zBucket);
                __touch(22730);
            }
            var set = entities.get(key);
            __touch(22725);
            if (!set) {
                set = new Map();
                __touch(22731);
                entities.put(key, set);
                __touch(22732);
            }
            var set2 = set.get(key2);
            __touch(22726);
            if (!set2) {
                set2 = [];
                __touch(22733);
                set.put(key2, set2);
                __touch(22734);
            }
            set2.push(entity);
            __touch(22727);
        }
        var sets = entities.getKeys();
        __touch(22718);
        for (var i = 0; i < sets.length; i++) {
            var material = sets[i];
            __touch(22735);
            var entities2 = entities.get(material);
            __touch(22736);
            var sets2 = entities2.getKeys();
            __touch(22737);
            for (var j = 0; j < sets2.length; j++) {
                var toCombine = entities2.get(sets2[j]);
                __touch(22738);
                if (toCombine.length === 1) {
                    continue;
                    __touch(22742);
                }
                var meshBuilder = new MeshBuilder();
                __touch(22739);
                for (var k = 0; k < toCombine.length; k++) {
                    var entity = toCombine[k];
                    __touch(22743);
                    if (root !== entity) {
                        calcTransform.multiply(invertTransform, entity.transformComponent.worldTransform);
                        __touch(22745);
                    } else {
                        calcTransform.setIdentity();
                        __touch(22746);
                    }
                    meshBuilder.addMeshData(entity.meshDataComponent.meshData, calcTransform);
                    __touch(22744);
                    if (this.removeOldData) {
                        entity.clearComponent('meshDataComponent');
                        __touch(22747);
                        entity.clearComponent('meshRendererComponent');
                        __touch(22748);
                        if (!this.keepEntities && entity._components.length === 1 && entity.transformComponent.children.length === 0) {
                            entity.removeFromWorld();
                            __touch(22749);
                        }
                    } else {
                        entity.skip = true;
                        __touch(22750);
                        entity._hidden = true;
                        __touch(22751);
                    }
                }
                var meshDatas = meshBuilder.build();
                __touch(22740);
                for (var key in meshDatas) {
                    var entity = this.world.createEntity(meshDatas[key], material);
                    __touch(22752);
                    entity.addToWorld();
                    __touch(22753);
                    root.attachChild(entity);
                    __touch(22754);
                }
                __touch(22741);
            }
        }
    };
    __touch(22682);
    EntityCombiner.prototype._calculateBounds = function (entities) {
        var first = true;
        __touch(22755);
        var wb = new BoundingBox();
        __touch(22756);
        for (var i = 0; i < entities.length; i++) {
            var rootEntity = entities[i];
            __touch(22758);
            rootEntity.traverse(function (entity) {
                if (entity.meshRendererComponent && !entity.particleComponent) {
                    if (first) {
                        var bound = entity.meshRendererComponent.worldBound;
                        __touch(22760);
                        if (bound instanceof BoundingBox) {
                            bound.clone(wb);
                            __touch(22762);
                        } else if (bound instanceof BoundingSphere) {
                            wb.center.setv(bound.center);
                            __touch(22763);
                            wb.xExtent = wb.yExtent = wb.zExtent = bound.radius;
                            __touch(22764);
                        } else {
                            wb.center.setv(Vector3.ZERO);
                            __touch(22765);
                            wb.xExtent = wb.yExtent = wb.zExtent = 10;
                            __touch(22766);
                        }
                        first = false;
                        __touch(22761);
                    } else {
                        wb.merge(entity.meshRendererComponent.worldBound);
                        __touch(22767);
                    }
                }
            });
            __touch(22759);
        }
        return Math.max(wb.xExtent, wb.zExtent) * 2;
        __touch(22757);
    };
    __touch(22683);
    function Map() {
        var keys = [], values = [];
        __touch(22768);
        return {
            put: function (key, value) {
                var index = keys.indexOf(key);
                __touch(22770);
                if (index === -1) {
                    keys.push(key);
                    __touch(22771);
                    values.push(value);
                    __touch(22772);
                } else {
                    values[index] = value;
                    __touch(22773);
                }
            },
            get: function (key) {
                return values[keys.indexOf(key)];
                __touch(22774);
            },
            getKeys: function () {
                return keys;
                __touch(22775);
            },
            getValues: function () {
                return values;
                __touch(22776);
            }
        };
        __touch(22769);
    }
    __touch(22684);
    return EntityCombiner;
    __touch(22685);
});
__touch(22676);