define([
    'goo/renderer/bounds/BoundingBox',
    'goo/entities/components/Component',
    'goo/renderer/MeshData'
], function (BoundingBox, Component, MeshData) {
    'use strict';
    __touch(4759);
    function MeshDataComponent(meshData) {
        this.type = 'MeshDataComponent';
        __touch(4768);
        this.meshData = meshData;
        __touch(4769);
        this.modelBound = new BoundingBox();
        __touch(4770);
        this.autoCompute = true;
        __touch(4771);
        this.currentPose = null;
        __touch(4772);
    }
    __touch(4760);
    MeshDataComponent.type = 'MeshDataComponent';
    __touch(4761);
    MeshDataComponent.prototype = Object.create(Component.prototype);
    __touch(4762);
    MeshDataComponent.prototype.constructor = MeshDataComponent;
    __touch(4763);
    MeshDataComponent.prototype.setModelBound = function (modelBound, autoCompute) {
        this.modelBound = modelBound;
        __touch(4773);
        this.autoCompute = autoCompute;
        __touch(4774);
    };
    __touch(4764);
    MeshDataComponent.prototype.computeBoundFromPoints = function () {
        if (this.autoCompute && this.modelBound !== null && this.meshData) {
            var verts = this.meshData.getAttributeBuffer('POSITION');
            __touch(4775);
            if (verts !== undefined) {
                this.modelBound.computeFromPoints(verts);
                __touch(4776);
                this.autoCompute = false;
                __touch(4777);
            }
        }
    };
    __touch(4765);
    MeshDataComponent.applyOnEntity = function (obj, entity) {
        if (obj instanceof MeshData) {
            var meshDataComponent = new MeshDataComponent(obj);
            __touch(4778);
            entity.setComponent(meshDataComponent);
            __touch(4779);
            return true;
            __touch(4780);
        }
    };
    __touch(4766);
    return MeshDataComponent;
    __touch(4767);
});
__touch(4758);