define([
    'goo/entities/components/Component',
    'goo/renderer/bounds/BoundingSphere'
],
    /** @lends */
        function (Component, BoundingSphere) {
        "use strict";


        function OccludeeComponent(meshData) {
            this.type = 'OccludeeComponent';

            this.modelBound = new BoundingSphere();

            var verts = meshData.getAttributeBuffer('POSITION');
            if (verts !== undefined) {
                this.modelBound.computeFromPoints(verts);
            }
        }

        OccludeeComponent.prototype = Object.create(Component.prototype);

        return OccludeeComponent;
    });