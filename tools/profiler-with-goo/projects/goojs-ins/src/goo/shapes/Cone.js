define(['goo/renderer/MeshData'], function (MeshData) {
    'use strict';
    __touch(20537);
    function Cone(radialSamples, radius, height) {
        if (arguments.length === 1 && arguments[0] instanceof Object) {
            var props = arguments[0];
            __touch(20549);
            radialSamples = props.radialSamples;
            __touch(20550);
            radius = props.radius;
            __touch(20551);
            height = props.height;
            __touch(20552);
        }
        this.radialSamples = radialSamples || 8;
        __touch(20542);
        this.radius = radius || 1;
        __touch(20543);
        this.height = typeof height === 'undefined' ? 2 : height;
        __touch(20544);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(20545);
        MeshData.call(this, attributeMap, this.radialSamples * 3 + this.radialSamples + 1, this.radialSamples * 3 * 2);
        __touch(20546);
        this.indexModes = ['Triangles'];
        __touch(20547);
        this.rebuild();
        __touch(20548);
    }
    __touch(20538);
    Cone.prototype = Object.create(MeshData.prototype);
    __touch(20539);
    Cone.prototype.rebuild = function () {
        var verts = [];
        __touch(20553);
        var norms = [];
        __touch(20554);
        var tex = [];
        __touch(20555);
        var indices = [];
        __touch(20556);
        var slope = Math.atan2(this.radius, this.height);
        __touch(20557);
        var ak = Math.PI * 2 / this.radialSamples;
        __touch(20558);
        var at = 1 / this.radialSamples;
        __touch(20559);
        for (var i = 0, k = 0, t = 0; i < this.radialSamples; i++, k += ak, t += at) {
            verts.push(0, 0, this.height, Math.cos(k) * this.radius, Math.sin(k) * this.radius, 0, Math.cos(k + ak) * this.radius, Math.sin(k + ak) * this.radius, 0);
            __touch(20573);
            norms.push(0, 0, 1, Math.cos(k) * Math.cos(slope), Math.sin(k) * Math.cos(slope), Math.sin(slope), Math.cos(k + ak) * Math.cos(slope), Math.sin(k + ak) * Math.cos(slope), Math.sin(slope));
            __touch(20574);
            tex.push(t + at / 2, 1, t, 0.5, t + at, 0.5);
            __touch(20575);
            indices.push(i * 3 + 0, i * 3 + 1, i * 3 + 2);
            __touch(20576);
        }
        var baseCenterIndex = i * 3 + 0;
        __touch(20560);
        verts.push(0, 0, 0);
        __touch(20561);
        norms.push(0, 0, -1);
        __touch(20562);
        tex.push(0.25, 0.25);
        __touch(20563);
        for (var i = 1, k = 0; i <= this.radialSamples - 1; i++, k += ak) {
            verts.push(Math.cos(k) * this.radius, Math.sin(k) * this.radius, 0);
            __touch(20577);
            norms.push(0, 0, -1);
            __touch(20578);
            tex.push(Math.cos(k) * 0.25 + 0.25, Math.sin(k) * 0.25 + 0.25);
            __touch(20579);
            indices.push(baseCenterIndex + i, baseCenterIndex, baseCenterIndex + i + 1);
            __touch(20580);
        }
        verts.push(Math.cos(k) * this.radius, Math.sin(k) * this.radius, 0);
        __touch(20564);
        norms.push(0, 0, -1);
        __touch(20565);
        tex.push(Math.cos(k) * 0.25 + 0.25, Math.sin(k) * 0.25 + 0.25);
        __touch(20566);
        indices.push(baseCenterIndex + this.radialSamples, baseCenterIndex, baseCenterIndex + 1);
        __touch(20567);
        this.getAttributeBuffer(MeshData.POSITION).set(verts);
        __touch(20568);
        this.getAttributeBuffer(MeshData.NORMAL).set(norms);
        __touch(20569);
        this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
        __touch(20570);
        this.getIndexBuffer().set(indices);
        __touch(20571);
        return this;
        __touch(20572);
    };
    __touch(20540);
    return Cone;
    __touch(20541);
});
__touch(20536);