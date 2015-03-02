define(['goo/renderer/Camera'], function (Camera) {
    'use strict';
    __touch(17650);
    function SimplePartitioner() {
    }
    __touch(17651);
    SimplePartitioner.prototype.added = function () {
    };
    __touch(17652);
    SimplePartitioner.prototype.removed = function () {
    };
    __touch(17653);
    SimplePartitioner.prototype.process = function (camera, entities, renderList) {
        var index = 0;
        __touch(17656);
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(17658);
            if (entity.skip || entity.meshRendererComponent.hidden) {
                continue;
                __touch(17659);
            }
            if (entity.meshRendererComponent.cullMode === 'Never') {
                renderList[index++] = entity;
                __touch(17660);
                entity.isVisible = true;
                __touch(17661);
            } else {
                var bounds = entity.meshRendererComponent.worldBound;
                __touch(17662);
                var result = camera.contains(bounds);
                __touch(17663);
                if (result !== Camera.Outside) {
                    renderList[index++] = entity;
                    __touch(17664);
                    entity.isVisible = true;
                    __touch(17665);
                } else {
                    entity.isVisible = false;
                    __touch(17666);
                }
            }
        }
        renderList.length = index;
        __touch(17657);
    };
    __touch(17654);
    return SimplePartitioner;
    __touch(17655);
});
__touch(17649);