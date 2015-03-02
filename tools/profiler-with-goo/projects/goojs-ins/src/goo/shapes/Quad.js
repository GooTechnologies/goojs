define(['goo/renderer/MeshData'], function (MeshData) {
    'use strict';
    __touch(20714);
    function Quad(width, height, tileX, tileY) {
        if (arguments.length === 1 && arguments[0] instanceof Object) {
            var props = arguments[0];
            __touch(20727);
            width = props.width;
            __touch(20728);
            height = props.height;
            __touch(20729);
            tileX = props.tileX;
            __touch(20730);
            tileY = props.tileY;
            __touch(20731);
        }
        this.xExtent = width !== undefined ? width * 0.5 : 0.5;
        __touch(20720);
        this.yExtent = height !== undefined ? height * 0.5 : 0.5;
        __touch(20721);
        this.tileX = tileX || 1;
        __touch(20722);
        this.tileY = tileY || 1;
        __touch(20723);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(20724);
        MeshData.call(this, attributeMap, 4, 6);
        __touch(20725);
        this.rebuild();
        __touch(20726);
    }
    __touch(20715);
    Quad.prototype = Object.create(MeshData.prototype);
    __touch(20716);
    Quad.prototype.constructor = Quad;
    __touch(20717);
    Quad.prototype.rebuild = function () {
        var xExtent = this.xExtent;
        __touch(20732);
        var yExtent = this.yExtent;
        __touch(20733);
        var tileX = this.tileX;
        __touch(20734);
        var tileY = this.tileY;
        __touch(20735);
        this.getAttributeBuffer(MeshData.POSITION).set([
            -xExtent,
            -yExtent,
            0,
            -xExtent,
            yExtent,
            0,
            xExtent,
            yExtent,
            0,
            xExtent,
            -yExtent,
            0
        ]);
        __touch(20736);
        this.getAttributeBuffer(MeshData.NORMAL).set([
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1
        ]);
        __touch(20737);
        this.getAttributeBuffer(MeshData.TEXCOORD0).set([
            0,
            0,
            0,
            tileY,
            tileX,
            tileY,
            tileX,
            0
        ]);
        __touch(20738);
        this.getIndexBuffer().set([
            0,
            3,
            1,
            1,
            3,
            2
        ]);
        __touch(20739);
        return this;
        __touch(20740);
    };
    __touch(20718);
    return Quad;
    __touch(20719);
});
__touch(20713);