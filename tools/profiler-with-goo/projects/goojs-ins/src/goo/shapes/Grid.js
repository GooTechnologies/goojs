define(['goo/renderer/MeshData'], function (MeshData) {
    'use strict';
    __touch(20676);
    function Grid(xSegments, ySegments, width, height) {
        if (arguments.length === 1 && arguments[0] instanceof Object) {
            var props = arguments[0];
            __touch(20691);
            xSegments = props.xSegments;
            __touch(20692);
            ySegments = props.ySegments;
            __touch(20693);
            width = props.width;
            __touch(20694);
            height = props.height;
            __touch(20695);
        }
        this.xSegments = xSegments || 10;
        __touch(20681);
        this.ySegments = ySegments || 10;
        __touch(20682);
        this.width = width || 1;
        __touch(20683);
        this.height = height || 1;
        __touch(20684);
        var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
        __touch(20685);
        var vertsCount = 4 + (this.xSegments - 1) * 2 + (this.ySegments - 1) * 2;
        __touch(20686);
        var idcsCount = 8 + (this.xSegments - 1) * 2 + (this.ySegments - 1) * 2;
        __touch(20687);
        MeshData.call(this, attributeMap, vertsCount, idcsCount);
        __touch(20688);
        this.indexModes[0] = 'Lines';
        __touch(20689);
        this.rebuild();
        __touch(20690);
    }
    __touch(20677);
    Grid.prototype = Object.create(MeshData.prototype);
    __touch(20678);
    Grid.prototype.rebuild = function () {
        var xExtent = this.width / 2;
        __touch(20696);
        var yExtent = this.height / 2;
        __touch(20697);
        var verts = [];
        __touch(20698);
        var indices = [];
        __touch(20699);
        verts.push(-xExtent, -yExtent, 0, -xExtent, yExtent, 0, xExtent, yExtent, 0, xExtent, -yExtent, 0);
        __touch(20700);
        indices.push(0, 1, 1, 2, 2, 3, 3, 0);
        __touch(20701);
        var xPos;
        __touch(20702);
        var step = this.width / this.xSegments;
        __touch(20703);
        for (var i = 1; i < this.xSegments; i++) {
            xPos = i * step - xExtent;
            __touch(20708);
            verts.push(xPos, -yExtent, 0, xPos, yExtent, 0);
            __touch(20709);
        }
        var yPos;
        __touch(20704);
        step = this.height / this.ySegments;
        __touch(20705);
        for (var i = 1; i < this.ySegments; i++) {
            yPos = i * step - yExtent;
            __touch(20710);
            verts.push(-xExtent, yPos, 0, xExtent, yPos, 0);
            __touch(20711);
        }
        for (var i = indices.length / 2; i < verts.length / 3; i += 2) {
            indices.push(i, i + 1);
            __touch(20712);
        }
        this.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(20706);
        this.getIndexBuffer().set(indices);
        __touch(20707);
    };
    __touch(20679);
    return Grid;
    __touch(20680);
});
__touch(20675);