define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(5537);
    function PickingSystem(settings) {
        System.call(this, 'PickingSystem', [
            'MeshRendererComponent',
            'TransformComponent'
        ]);
        __touch(5545);
        this.passive = true;
        __touch(5546);
        this.pickRay = null;
        __touch(5547);
        this.onPick = null;
        __touch(5548);
        settings = settings || {};
        __touch(5549);
        this.setPickLogic(settings.pickLogic || null);
        __touch(5550);
    }
    __touch(5538);
    PickingSystem.prototype = Object.create(System.prototype);
    __touch(5539);
    PickingSystem.prototype.setPickLogic = function (pickLogic) {
        this.pickLogic = pickLogic;
        __touch(5551);
        if (pickLogic) {
            if (this.interests.indexOf('MeshDataComponent') === -1) {
                this.interests.push('MeshDataComponent');
                __touch(5552);
            }
        }
    };
    __touch(5540);
    PickingSystem.prototype.inserted = function (entity) {
        if (entity.meshRendererComponent.isPickable && this.pickLogic) {
            this.pickLogic.added(entity);
            __touch(5553);
        }
    };
    __touch(5541);
    PickingSystem.prototype.deleted = function (entity) {
        if (this.pickLogic) {
            this.pickLogic.removed(entity);
            __touch(5554);
        }
    };
    __touch(5542);
    PickingSystem.prototype.process = function (entities) {
        if (!this.pickRay || !this.onPick) {
            return;
            __touch(5558);
        }
        var pickList = [];
        __touch(5555);
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(5559);
            var meshRendererComponent = entity.meshRendererComponent;
            __touch(5560);
            if (!meshRendererComponent.isPickable) {
                continue;
                __touch(5561);
            }
            if (this.pickLogic) {
                if (!this.pickLogic.isConstructed(entity)) {
                    this.pickLogic.added(entity);
                    __touch(5563);
                }
                var result = this.pickLogic.getPickResult(this.pickRay, entity);
                __touch(5562);
                if (result && result.distances && result.distances.length) {
                    pickList.push({
                        'entity': entity,
                        'intersection': result
                    });
                    __touch(5564);
                }
            } else if (meshRendererComponent.worldBound) {
                var result = meshRendererComponent.worldBound.intersectsRayWhere(this.pickRay);
                __touch(5565);
                if (result && result.distances.length) {
                    pickList.push({
                        'entity': entity,
                        'intersection': result
                    });
                    __touch(5566);
                }
            }
        }
        pickList.sort(function (a, b) {
            return a.intersection.distances[0] - b.intersection.distances[0];
            __touch(5567);
        });
        __touch(5556);
        this.onPick(pickList);
        __touch(5557);
    };
    __touch(5543);
    return PickingSystem;
    __touch(5544);
});
__touch(5536);