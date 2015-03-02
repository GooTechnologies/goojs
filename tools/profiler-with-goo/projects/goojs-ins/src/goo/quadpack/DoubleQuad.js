define(['goo/renderer/MeshData'], function (MeshData) {
    'use strict';
    __touch(15270);
    function DoubleQuad(width, height, tileX, tileY) {
        if (arguments.length === 1 && arguments[0] instanceof Object) {
            var props = arguments[0];
            __touch(15283);
            width = props.width;
            __touch(15284);
            height = props.height;
            __touch(15285);
            tileX = props.tileX;
            __touch(15286);
            tileY = props.tileY;
            __touch(15287);
        }
        this.xExtent = width !== undefined ? width * 0.5 : 0.5;
        __touch(15276);
        this.yExtent = height !== undefined ? height * 0.5 : 0.5;
        __touch(15277);
        this.tileX = tileX || 1;
        __touch(15278);
        this.tileY = tileY || 1;
        __touch(15279);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(15280);
        MeshData.call(this, attributeMap, 8, 12);
        __touch(15281);
        this.rebuild();
        __touch(15282);
    }
    __touch(15271);
    DoubleQuad.prototype = Object.create(MeshData.prototype);
    __touch(15272);
    DoubleQuad.prototype.constructor = DoubleQuad;
    __touch(15273);
    DoubleQuad.prototype.rebuild = function () {
        var xExtent = this.xExtent;
        __touch(15288);
        var yExtent = this.yExtent;
        __touch(15289);
        var tileX = this.tileX;
        __touch(15290);
        var tileY = this.tileY;
        __touch(15291);
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
            0,
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
        __touch(15292);
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
            1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1
        ]);
        __touch(15293);
        this.getAttributeBuffer(MeshData.TEXCOORD0).set([
            0,
            0,
            0,
            tileY,
            tileX,
            tileY,
            tileX,
            0,
            0,
            0,
            0,
            tileY,
            tileX,
            tileY,
            tileX,
            0
        ]);
        __touch(15294);
        this.getIndexBuffer().set([
            0,
            3,
            1,
            1,
            3,
            2,
            7,
            4,
            5,
            7,
            5,
            6
        ]);
        __touch(15295);
        return this;
        __touch(15296);
    };
    __touch(15274);
    return DoubleQuad;
    __touch(15275);
});
__touch(15269);