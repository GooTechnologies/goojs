define(['goo/entities/components/Component'], function (Component) {
    'use strict';
    __touch(12974);
    function OccluderComponent(meshData) {
        this.type = 'OccluderComponent';
        __touch(12978);
        this.meshData = meshData;
        __touch(12979);
    }
    __touch(12975);
    OccluderComponent.prototype = Object.create(Component.prototype);
    __touch(12976);
    return OccluderComponent;
    __touch(12977);
});
__touch(12973);