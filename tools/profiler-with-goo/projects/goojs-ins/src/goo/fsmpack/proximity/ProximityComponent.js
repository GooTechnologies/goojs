define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(5943);
    function ProximityComponent(tag) {
        this.type = 'ProximityComponent';
        __touch(5950);
        Object.defineProperty(this, 'tag', {
            value: tag || 'red',
            writable: false
        });
        __touch(5951);
    }
    __touch(5944);
    ProximityComponent.prototype = Object.create(Component.prototype);
    __touch(5945);
    ProximityComponent.prototype.constructor = ProximityComponent;
    __touch(5946);
    ProximityComponent.prototype.attached = function (entity) {
        var world = entity._world;
        __touch(5952);
        if (!world) {
            return;
            __touch(5955);
        }
        var proximitySystem = world.getSystem('ProximitySystem');
        __touch(5953);
        if (!proximitySystem) {
            return;
            __touch(5956);
        }
        proximitySystem.add(entity, this.tag);
        __touch(5954);
    };
    __touch(5947);
    ProximityComponent.prototype.detached = function (entity) {
        var world = entity._world;
        __touch(5957);
        if (!world) {
            return;
            __touch(5960);
        }
        var proximitySystem = world.getSystem('ProximitySystem');
        __touch(5958);
        if (!proximitySystem) {
            return;
            __touch(5961);
        }
        proximitySystem.remove(entity, this.tag);
        __touch(5959);
    };
    __touch(5948);
    return ProximityComponent;
    __touch(5949);
});
__touch(5942);