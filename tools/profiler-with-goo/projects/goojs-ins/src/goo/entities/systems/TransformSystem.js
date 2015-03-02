define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(5835);
    var numUpdates;
    __touch(5836);
    function TransformSystem() {
        System.call(this, 'TransformSystem', ['TransformComponent']);
        __touch(5842);
        this.numUpdates = 0;
        __touch(5843);
    }
    __touch(5837);
    TransformSystem.prototype = Object.create(System.prototype);
    __touch(5838);
    TransformSystem.prototype.process = function (entities) {
        numUpdates = 0;
        __touch(5844);
        var i, transformComponent;
        __touch(5845);
        for (i = 0; i < entities.length; i++) {
            transformComponent = entities[i].transformComponent;
            __touch(5847);
            transformComponent._updated = false;
            __touch(5848);
            if (transformComponent._dirty) {
                transformComponent.updateTransform();
                __touch(5849);
            }
        }
        for (i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(5850);
            transformComponent = entity.transformComponent;
            __touch(5851);
            if (transformComponent.parent === null) {
                entity.traverse(traverseFunc);
                __touch(5852);
            }
        }
        this.numUpdates = numUpdates;
        __touch(5846);
    };
    __touch(5839);
    function traverseFunc(entity) {
        if (entity.transformComponent._dirty) {
            entity.transformComponent.updateWorldTransform();
            __touch(5853);
            numUpdates++;
            __touch(5854);
            var children = entity.transformComponent.children;
            __touch(5855);
            for (var j = 0; j < children.length; j++) {
                children[j]._dirty = true;
                __touch(5856);
            }
        }
    }
    __touch(5840);
    return TransformSystem;
    __touch(5841);
});
__touch(5834);