define([
    'goo/entities/components/Component',
    'goo/debugpack/BoundingVolumeMeshBuilder'
], function (Component, BoundingVolumeMeshBuilder) {
    'use strict';
    __touch(3453);
    function MarkerComponent(hostEntity) {
        this.type = 'MarkerComponent';
        __touch(3457);
        var hostModelBound = hostEntity.meshRendererComponent.worldBound;
        __touch(3458);
        this.meshData = BoundingVolumeMeshBuilder.build(hostModelBound);
        __touch(3459);
    }
    __touch(3454);
    MarkerComponent.prototype = Object.create(Component.prototype);
    __touch(3455);
    return MarkerComponent;
    __touch(3456);
});
__touch(3452);