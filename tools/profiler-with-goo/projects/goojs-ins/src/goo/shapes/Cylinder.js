define([
    'goo/renderer/MeshData',
    'goo/math/Vector3'
], function (MeshData, Vector3) {
    'use strict';
    __touch(20582);
    function Cylinder(radialSamples, radiusTop, radiusBottom, height) {
        if (arguments.length === 1 && arguments[0] instanceof Object) {
            var props = arguments[0];
            __touch(20596);
            radialSamples = props.radialSamples;
            __touch(20597);
            radiusTop = props.radiusTop;
            __touch(20598);
            radiusBottom = props.radiusBottom;
            __touch(20599);
            height = props.height;
            __touch(20600);
        }
        this.radialSamples = radialSamples || 8;
        __touch(20587);
        this.radiusTop = typeof radiusTop === 'undefined' ? 0.5 : radiusTop;
        __touch(20588);
        this.radiusBottom = typeof radiusBottom === 'undefined' ? radiusTop : radiusBottom;
        __touch(20589);
        this.height = typeof height === 'undefined' ? 1 : height;
        __touch(20590);
        this.radius = this.radiusTop;
        __touch(20591);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(20592);
        MeshData.call(this, attributeMap, this.radialSamples * 4 + 2 + 2, this.radialSamples * 3 * 4);
        __touch(20593);
        this.indexModes = ['Triangles'];
        __touch(20594);
        this.rebuild();
        __touch(20595);
    }
    __touch(20583);
    Cylinder.prototype = Object.create(MeshData.prototype);
    __touch(20584);
    Cylinder.prototype.rebuild = function () {
        var verts = [];
        __touch(20601);
        var norms = [];
        __touch(20602);
        var tex = [];
        __touch(20603);
        var indices = [];
        __touch(20604);
        var height = this.height;
        __touch(20605);
        var halfHeight = height / 2;
        __touch(20606);
        var radiusTop = this.radiusTop;
        __touch(20607);
        var radiusBottom = this.radiusBottom;
        __touch(20608);
        var radialSamples = this.radialSamples;
        __touch(20609);
        var ak = Math.PI * 2 / radialSamples;
        __touch(20610);
        var at = 1 / radialSamples;
        __touch(20611);
        var lastIndex = radialSamples * 4 + 2 + 2 - 1;
        __touch(20612);
        var normal = new Vector3();
        __touch(20613);
        var tan = 0;
        __touch(20614);
        if (height) {
            tan = Math.tan((radiusBottom - radiusTop) / height);
            __touch(20627);
        }
        for (var i = 0, k = 0, t = 0; i < radialSamples; i++, k += ak, t += at) {
            var cos = Math.cos(k);
            __touch(20628);
            var sin = Math.sin(k);
            __touch(20629);
            var xTop = cos * radiusTop;
            __touch(20630);
            var yTop = sin * radiusTop;
            __touch(20631);
            var xBottom = cos * radiusBottom;
            __touch(20632);
            var yBottom = sin * radiusBottom;
            __touch(20633);
            verts.push(xTop, yTop, halfHeight, xBottom, yBottom, -halfHeight, xTop, yTop, halfHeight, xBottom, yBottom, -halfHeight);
            __touch(20634);
            normal.setd(cos, sin, tan);
            __touch(20635);
            normal.normalize();
            __touch(20636);
            norms.push(0, 0, 1, 0, 0, -1, normal.x, normal.y, normal.z, normal.x, normal.y, normal.z);
            __touch(20637);
            tex.push(cos / 4 + 0.25, sin / 4 + 0.75, cos / 4 + 0.25, sin / 4 + 0.25, 0.5, t, 1, t);
            __touch(20638);
        }
        verts.push(radiusTop, 0, halfHeight, radiusBottom, 0, -halfHeight);
        __touch(20615);
        norms.push(1, 0, 0, 1, 0, 0);
        __touch(20616);
        tex.push(0.5, 1, 1, 1);
        __touch(20617);
        for (var i = 0; i < radialSamples - 1; i++) {
            indices.push(lastIndex, i * 4 + 0, i * 4 + 4, i * 4 + 1, lastIndex - 1, i * 4 + 5, i * 4 + 4 + 2, i * 4 + 2, i * 4 + 4 + 3, i * 4 + 2, i * 4 + 3, i * 4 + 4 + 3);
            __touch(20639);
        }
        indices.push(lastIndex, i * 4 + 0, 0, i * 4 + 1, lastIndex - 1, 0 + 1, i * 4 + 4, i * 4 + 2, i * 4 + 5, i * 4 + 2, i * 4 + 3, i * 4 + 5);
        __touch(20618);
        verts.push(0, 0, -halfHeight, 0, 0, halfHeight);
        __touch(20619);
        norms.push(0, 0, -0.5, 0, 0, 0.5);
        __touch(20620);
        tex.push(0.25, 0.25, 0.25, 0.75);
        __touch(20621);
        this.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(20622);
        this.getAttributeBuffer(MeshData.NORMAL).set(norms);
        __touch(20623);
        this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
        __touch(20624);
        this.getIndexBuffer().set(indices);
        __touch(20625);
        return this;
        __touch(20626);
    };
    __touch(20585);
    return Cylinder;
    __touch(20586);
});
__touch(20581);