define([
    'goo/entities/systems/System',
    'goo/entities/SystemBus',
    'goo/util/StringUtil'
], function (System, SystemBus, StringUtil) {
    'use strict';
    __touch(5963);
    function ProximitySystem() {
        System.call(this, 'ProximitySystem', ['ProximityComponent']);
        __touch(5973);
        this.collections = {
            Red: {
                name: 'Red',
                collection: []
            },
            Blue: {
                name: 'Blue',
                collection: []
            },
            Green: {
                name: 'Green',
                collection: []
            },
            Yellow: {
                name: 'Yellow',
                collection: []
            }
        };
        __touch(5974);
    }
    __touch(5964);
    ProximitySystem.prototype = Object.create(System.prototype);
    __touch(5965);
    ProximitySystem.prototype._collides = function (first, second) {
        for (var i = 0; i < first.collection.length; i++) {
            var firstElement = first.collection[i];
            __touch(5975);
            for (var j = 0; j < second.collection.length; j++) {
                var secondElement = second.collection[j];
                __touch(5976);
                if (firstElement.meshRendererComponent.worldBound.intersects(secondElement.meshRendererComponent.worldBound)) {
                    SystemBus.send('collides.' + first.name + '.' + second.name);
                    __touch(5977);
                }
            }
        }
    };
    __touch(5966);
    function formatTag(tag) {
        return StringUtil.capitalize(tag);
        __touch(5978);
    }
    __touch(5967);
    ProximitySystem.prototype.getFor = function (tag) {
        tag = formatTag(tag);
        __touch(5979);
        if (this.collections[tag]) {
            return this.collections[tag].collection;
            __touch(5980);
        } else {
            return [];
            __touch(5981);
        }
    };
    __touch(5968);
    ProximitySystem.prototype.add = function (entity, tag) {
        tag = formatTag(tag);
        __touch(5982);
        if (!this.collections[tag]) {
            this.collections[tag] = {
                name: tag,
                collection: []
            };
            __touch(5984);
        }
        this.collections[tag].collection.push(entity);
        __touch(5983);
    };
    __touch(5969);
    ProximitySystem.prototype.remove = function (entity, tag) {
        tag = formatTag(tag);
        __touch(5985);
        var collection = this.collections[tag].collection;
        __touch(5986);
        var index = collection.indexOf(entity);
        __touch(5987);
        collection.splice(index, 1);
        __touch(5988);
    };
    __touch(5970);
    ProximitySystem.prototype.process = function () {
    };
    __touch(5971);
    return ProximitySystem;
    __touch(5972);
});
__touch(5962);