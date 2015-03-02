define([
    'goo/renderer/MeshData',
    'goo/geometrypack/PolyLine'
], function (MeshData, PolyLine) {
    'use strict';
    __touch(8094);
    function RegularPolygon(nSegments, radius) {
        this.nSegments = nSegments || 5;
        __touch(8098);
        this.radius = radius || 1;
        __touch(8099);
        var verts = [];
        __touch(8100);
        var ak = Math.PI * 2 / nSegments;
        __touch(8101);
        for (var i = 0, k = 0; i < this.nSegments; i++, k += ak) {
            verts.push(Math.cos(k) * this.radius, Math.sin(k) * this.radius, 0);
            __touch(8104);
        }
        PolyLine.call(this, verts, true);
        __touch(8102);
        this.rebuild();
        __touch(8103);
    }
    __touch(8095);
    RegularPolygon.prototype = Object.create(PolyLine.prototype);
    __touch(8096);
    return RegularPolygon;
    __touch(8097);
});
__touch(8093);