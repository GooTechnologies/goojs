define(['goo/renderer/MeshData'], function (MeshData) {
    'use strict';
    __touch(20641);
    function Disk(nSegments, radius, pointiness) {
        if (arguments.length === 1 && arguments[0] instanceof Object) {
            var props = arguments[0];
            __touch(20653);
            nSegments = props.nSegments;
            __touch(20654);
            radius = props.radius;
            __touch(20655);
            pointiness = props.pointiness;
            __touch(20656);
        }
        this.nSegments = nSegments || 8;
        __touch(20646);
        this.radius = radius || 1;
        __touch(20647);
        this.pointiness = pointiness || 0;
        __touch(20648);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(20649);
        MeshData.call(this, attributeMap, this.nSegments + 1, this.nSegments * 3);
        __touch(20650);
        this.indexModes = ['Triangles'];
        __touch(20651);
        this.rebuild();
        __touch(20652);
    }
    __touch(20642);
    Disk.prototype = Object.create(MeshData.prototype);
    __touch(20643);
    Disk.prototype.rebuild = function () {
        var verts = [];
        __touch(20657);
        var norms = [];
        __touch(20658);
        var tex = [];
        __touch(20659);
        var indices = [];
        __touch(20660);
        var slope = Math.atan2(this.radius, this.pointiness);
        __touch(20661);
        var angleIncrement = Math.PI * 2 / this.nSegments;
        __touch(20662);
        for (var i = 0, angle = 0; i < this.nSegments; i++, angle += angleIncrement) {
            verts.push(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius, 0);
            __touch(20671);
            norms.push(Math.cos(angle) * Math.cos(slope), Math.sin(angle) * Math.cos(slope), Math.sin(slope));
            __touch(20672);
            tex.push(Math.cos(angle) * 0.5 + 0.5, Math.sin(angle) * 0.5 + 0.5);
            __touch(20673);
            indices.push(this.nSegments, i, (i + 1) % this.nSegments);
            __touch(20674);
        }
        verts.push(0, 0, this.pointiness);
        __touch(20663);
        norms.push(0, 0, 1);
        __touch(20664);
        tex.push(0.5, 0.5);
        __touch(20665);
        this.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(20666);
        this.getAttributeBuffer(MeshData.NORMAL).set(norms);
        __touch(20667);
        this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
        __touch(20668);
        this.getIndexBuffer().set(indices);
        __touch(20669);
        return this;
        __touch(20670);
    };
    __touch(20644);
    return Disk;
    __touch(20645);
});
__touch(20640);