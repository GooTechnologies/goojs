define(['goo/renderer/MeshData'], function (MeshData) {
    'use strict';
    __touch(20742);
    function SimpleBox(width, height, length) {
        this.xExtent = width !== undefined ? width * 0.5 : 0.5;
        __touch(20747);
        this.yExtent = height !== undefined ? height * 0.5 : 0.5;
        __touch(20748);
        this.zExtent = length !== undefined ? length * 0.5 : 0.5;
        __touch(20749);
        var attributeMap = MeshData.defaultMap([MeshData.POSITION]);
        __touch(20750);
        MeshData.call(this, attributeMap, 8, 36);
        __touch(20751);
        this.rebuild();
        __touch(20752);
    }
    __touch(20743);
    SimpleBox.prototype = Object.create(MeshData.prototype);
    __touch(20744);
    SimpleBox.prototype.rebuild = function () {
        var xExtent = this.xExtent;
        __touch(20753);
        var yExtent = this.yExtent;
        __touch(20754);
        var zExtent = this.zExtent;
        __touch(20755);
        this.getAttributeBuffer(MeshData.POSITION).set([
            -xExtent,
            -yExtent,
            -zExtent,
            xExtent,
            -yExtent,
            -zExtent,
            xExtent,
            yExtent,
            -zExtent,
            -xExtent,
            yExtent,
            -zExtent,
            -xExtent,
            -yExtent,
            zExtent,
            xExtent,
            -yExtent,
            zExtent,
            xExtent,
            yExtent,
            zExtent,
            -xExtent,
            yExtent,
            zExtent
        ]);
        __touch(20756);
        this.getIndexBuffer().set([
            0,
            1,
            2,
            2,
            3,
            0,
            7,
            6,
            5,
            5,
            4,
            7,
            0,
            3,
            7,
            7,
            4,
            0,
            1,
            2,
            6,
            6,
            5,
            1,
            3,
            2,
            6,
            6,
            7,
            3,
            0,
            1,
            5,
            5,
            4,
            0
        ]);
        __touch(20757);
        return this;
        __touch(20758);
    };
    __touch(20745);
    return SimpleBox;
    __touch(20746);
});
__touch(20741);