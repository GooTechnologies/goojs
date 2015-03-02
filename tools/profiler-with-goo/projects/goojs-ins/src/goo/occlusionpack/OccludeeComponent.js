define([
    'goo/entities/components/Component',
    'goo/renderer/bounds/BoundingBox',
    'goo/renderer/bounds/BoundingSphere'
], function (Component, BoundingBox, BoundingSphere) {
    'use strict';
    __touch(12959);
    function OccludeeComponent(meshData, useBoundingBox) {
        this.type = 'OccludeeComponent';
        __touch(12963);
        if (useBoundingBox === true) {
            this.modelBound = new BoundingBox();
            __touch(12966);
        } else {
            this.modelBound = new BoundingSphere();
            __touch(12967);
        }
        var verts = meshData.getAttributeBuffer('POSITION');
        __touch(12964);
        if (verts !== undefined) {
            this.modelBound.computeFromPoints(verts);
            __touch(12968);
        }
        this.positionArray = new Float32Array(4 * 8);
        __touch(12965);
        if (useBoundingBox === true) {
            var x = this.modelBound.xExtent;
            __touch(12969);
            var y = this.modelBound.yExtent;
            __touch(12970);
            var z = this.modelBound.zExtent;
            __touch(12971);
            this.positionArray.set([
                -x,
                y,
                -z,
                1,
                -x,
                y,
                z,
                1,
                x,
                y,
                z,
                1,
                x,
                y,
                -z,
                1,
                -x,
                -y,
                -z,
                1,
                -x,
                -y,
                z,
                1,
                x,
                -y,
                z,
                1,
                x,
                -y,
                -z,
                1
            ]);
            __touch(12972);
        }
    }
    __touch(12960);
    OccludeeComponent.prototype = Object.create(Component.prototype);
    __touch(12961);
    return OccludeeComponent;
    __touch(12962);
});
__touch(12958);