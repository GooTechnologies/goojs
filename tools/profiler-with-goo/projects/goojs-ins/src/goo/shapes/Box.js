define(['goo/renderer/MeshData'], function (MeshData) {
    'use strict';
    __touch(20472);
    function Box(width, height, length, tileX, tileY, textureMode) {
        if (arguments.length === 1 && arguments[0] instanceof Object) {
            var props = arguments[0];
            __touch(20487);
            width = props.width;
            __touch(20488);
            height = props.height;
            __touch(20489);
            length = props.length;
            __touch(20490);
            tileX = props.tileX;
            __touch(20491);
            tileY = props.tileY;
            __touch(20492);
            textureMode = props.textureMode;
            __touch(20493);
        }
        this.xExtent = width !== undefined ? width * 0.5 : 0.5;
        __touch(20478);
        this.yExtent = height !== undefined ? height * 0.5 : 0.5;
        __touch(20479);
        this.zExtent = length !== undefined ? length * 0.5 : 0.5;
        __touch(20480);
        this.tileX = tileX || 1;
        __touch(20481);
        this.tileY = tileY || 1;
        __touch(20482);
        if (typeof textureMode === 'string') {
            textureMode = Box.TextureModes[textureMode];
            __touch(20494);
        }
        this.textureMode = textureMode !== undefined ? textureMode : Box.TextureModes.Uniform;
        __touch(20483);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(20484);
        MeshData.call(this, attributeMap, 24, 36);
        __touch(20485);
        this.rebuild();
        __touch(20486);
    }
    __touch(20473);
    Box.prototype = Object.create(MeshData.prototype);
    __touch(20474);
    Box.prototype.rebuild = function () {
        var xExtent = this.xExtent;
        __touch(20495);
        var yExtent = this.yExtent;
        __touch(20496);
        var zExtent = this.zExtent;
        __touch(20497);
        var tileX = this.tileX;
        __touch(20498);
        var tileY = this.tileY;
        __touch(20499);
        var verts = [
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
            xExtent,
            -yExtent,
            zExtent,
            -xExtent,
            -yExtent,
            zExtent,
            xExtent,
            yExtent,
            zExtent,
            -xExtent,
            yExtent,
            zExtent
        ];
        __touch(20500);
        var vertices = [];
        __touch(20501);
        function fillV(fillIndices) {
            for (var i = 0; i < fillIndices.length; i++) {
                var index = fillIndices[i] * 3;
                __touch(20514);
                vertices.push(verts[index]);
                __touch(20515);
                vertices.push(verts[index + 1]);
                __touch(20516);
                vertices.push(verts[index + 2]);
                __touch(20517);
            }
        }
        __touch(20502);
        fillV([
            0,
            1,
            2,
            3,
            1,
            4,
            6,
            2,
            4,
            5,
            7,
            6,
            5,
            0,
            3,
            7,
            2,
            6,
            7,
            3,
            0,
            5,
            4,
            1
        ]);
        __touch(20503);
        this.getAttributeBuffer(MeshData.POSITION).set(vertices);
        __touch(20504);
        var norms = [
            0,
            0,
            -1,
            1,
            0,
            0,
            0,
            0,
            1,
            -1,
            0,
            0,
            0,
            1,
            0,
            0,
            -1,
            0
        ];
        __touch(20505);
        var normals = [];
        __touch(20506);
        function fillN() {
            for (var i = 0; i < norms.length / 3; i++) {
                for (var j = 0; j < 4; j++) {
                    var index = i * 3;
                    __touch(20518);
                    normals.push(norms[index]);
                    __touch(20519);
                    normals.push(norms[index + 1]);
                    __touch(20520);
                    normals.push(norms[index + 2]);
                    __touch(20521);
                }
            }
        }
        __touch(20507);
        fillN();
        __touch(20508);
        this.getAttributeBuffer(MeshData.NORMAL).set(normals);
        __touch(20509);
        var tex = [];
        __touch(20510);
        if (this.textureMode === Box.TextureModes.Uniform) {
            for (var i = 0; i < 6; i++) {
                tex.push(tileX);
                __touch(20522);
                tex.push(0);
                __touch(20523);
                tex.push(0);
                __touch(20524);
                tex.push(0);
                __touch(20525);
                tex.push(0);
                __touch(20526);
                tex.push(tileY);
                __touch(20527);
                tex.push(tileX);
                __touch(20528);
                tex.push(tileY);
                __touch(20529);
            }
        } else {
            tex.push(4 / 4, 1 / 3, 3 / 4, 1 / 3, 3 / 4, 2 / 3, 4 / 4, 2 / 3);
            __touch(20530);
            tex.push(3 / 4, 1 / 3, 2 / 4, 1 / 3, 2 / 4, 2 / 3, 3 / 4, 2 / 3);
            __touch(20531);
            tex.push(2 / 4, 1 / 3, 1 / 4, 1 / 3, 1 / 4, 2 / 3, 2 / 4, 2 / 3);
            __touch(20532);
            tex.push(1 / 4, 1 / 3, 0 / 4, 1 / 3, 0 / 4, 2 / 3, 1 / 4, 2 / 3);
            __touch(20533);
            tex.push(2 / 4, 3 / 3, 2 / 4, 2 / 3, 1 / 4, 2 / 3, 1 / 4, 3 / 3);
            __touch(20534);
            tex.push(1 / 4, 0 / 3, 1 / 4, 1 / 3, 2 / 4, 1 / 3, 2 / 4, 0 / 3);
            __touch(20535);
        }
        this.getAttributeBuffer(MeshData.TEXCOORD0).set(tex);
        __touch(20511);
        this.getIndexBuffer().set([
            2,
            1,
            0,
            3,
            2,
            0,
            6,
            5,
            4,
            7,
            6,
            4,
            10,
            9,
            8,
            11,
            10,
            8,
            14,
            13,
            12,
            15,
            14,
            12,
            18,
            17,
            16,
            19,
            18,
            16,
            22,
            21,
            20,
            23,
            22,
            20
        ]);
        __touch(20512);
        return this;
        __touch(20513);
    };
    __touch(20475);
    Box.TextureModes = {
        Uniform: 'Uniform',
        Unfolded: 'Unfolded'
    };
    __touch(20476);
    return Box;
    __touch(20477);
});
__touch(20471);