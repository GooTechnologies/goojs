define([
    'goo/entities/systems/System',
    'goo/renderer/bounds/BoundingBox'
], function (System, BoundingBox) {
    'use strict';
    __touch(5260);
    function BoundingUpdateSystem() {
        System.call(this, 'BoundingUpdateSystem', [
            'TransformComponent',
            'MeshRendererComponent',
            'MeshDataComponent'
        ]);
        __touch(5267);
        this._worldBound = new BoundingBox();
        __touch(5268);
        this._computeWorldBound = null;
        __touch(5269);
    }
    __touch(5261);
    BoundingUpdateSystem.prototype = Object.create(System.prototype);
    __touch(5262);
    BoundingUpdateSystem.prototype.process = function (entities) {
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(5270);
            var meshDataComponent = entity.meshDataComponent;
            __touch(5271);
            var transformComponent = entity.transformComponent;
            __touch(5272);
            var meshRendererComponent = entity.meshRendererComponent;
            __touch(5273);
            if (meshDataComponent.autoCompute) {
                meshDataComponent.computeBoundFromPoints();
                __touch(5274);
                meshRendererComponent.updateBounds(meshDataComponent.modelBound, transformComponent.worldTransform);
                __touch(5275);
            } else if (transformComponent._updated) {
                meshRendererComponent.updateBounds(meshDataComponent.modelBound, transformComponent.worldTransform);
                __touch(5276);
            }
        }
        if (this._computeWorldBound && this._computeWorldBound instanceof Function) {
            if (entities.length === 0) {
                this._computeWorldBound = null;
                __touch(5279);
                return;
                __touch(5280);
            }
            for (var i = 0; i < entities.length; i++) {
                if (!entities[i].particleComponent) {
                    this._worldBound = entities[i].meshRendererComponent.worldBound.clone();
                    __touch(5281);
                    break;
                    __touch(5282);
                }
            }
            for (; i < entities.length; i++) {
                if (!entities[i].particleComponent) {
                    var mrc = entities[i].meshRendererComponent;
                    __touch(5283);
                    this._worldBound = this._worldBound.merge(mrc.worldBound);
                    __touch(5284);
                }
            }
            this._computeWorldBound(this._worldBound);
            __touch(5277);
            this._computeWorldBound = null;
            __touch(5278);
        }
    };
    __touch(5263);
    BoundingUpdateSystem.prototype.getWorldBound = function (callback) {
        this._computeWorldBound = callback;
        __touch(5285);
    };
    __touch(5264);
    BoundingUpdateSystem.prototype.deleted = function (entity) {
        if (entity.meshRendererComponent) {
            entity.meshRendererComponent.worldBound = new BoundingBox();
            __touch(5286);
        }
    };
    __touch(5265);
    return BoundingUpdateSystem;
    __touch(5266);
});
__touch(5259);