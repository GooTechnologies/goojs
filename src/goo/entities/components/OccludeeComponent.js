define([
    'goo/entities/components/Component',
    'goo/renderer/bounds/BoundingBox',
    'goo/renderer/bounds/BoundingSphere'
],
    /** @lends */
        function (Component, BoundingBox, BoundingSphere) {
        "use strict";

        /**
         *
         * @param meshData
         * @param useBoundingBox
         * @constructor
         */
        function OccludeeComponent(meshData, useBoundingBox) {
            this.type = 'OccludeeComponent';

            if (useBoundingBox === true){
                this.modelBound = new BoundingBox();
            } else {
                this.modelBound = new BoundingSphere();
            }

            var verts = meshData.getAttributeBuffer('POSITION');
            if (verts !== undefined) {
                this.modelBound.computeFromPoints(verts);
            }
        }

        OccludeeComponent.prototype = Object.create(Component.prototype);

        return OccludeeComponent;
    });