define([
    'goo/renderer/MeshData',
    'goo/math/Vector3',
    'goo/math/MathUtils'
], function (MeshData, Vector3, MathUtils) {
    'use strict';
    __touch(21017);
    function Torus(circleSamples, radialSamples, tubeRadius, centerRadius) {
        if (arguments.length === 1 && arguments[0] instanceof Object) {
            var props = arguments[0];
            __touch(21034);
            circleSamples = props.circleSamples;
            __touch(21035);
            radialSamples = props.radialSamples;
            __touch(21036);
            tubeRadius = props.tubeRadius;
            __touch(21037);
            centerRadius = props.centerRadius;
            __touch(21038);
        }
        this._circleSamples = circleSamples !== undefined ? circleSamples : 8;
        __touch(21024);
        this._radialSamples = radialSamples !== undefined ? radialSamples : 8;
        __touch(21025);
        this._tubeRadius = tubeRadius !== undefined ? tubeRadius : 1;
        __touch(21026);
        this._centerRadius = centerRadius !== undefined ? centerRadius : 2;
        __touch(21027);
        this.viewInside = false;
        __touch(21028);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(21029);
        var vertices = (this._circleSamples + 1) * (this._radialSamples + 1);
        __touch(21030);
        var indices = 6 * this._circleSamples * this._radialSamples;
        __touch(21031);
        MeshData.call(this, attributeMap, vertices, indices);
        __touch(21032);
        this.rebuild();
        __touch(21033);
    }
    __touch(21018);
    Torus.prototype = Object.create(MeshData.prototype);
    __touch(21019);
    Torus.prototype.rebuild = function () {
        var vbuf = this.getAttributeBuffer(MeshData.POSITION);
        __touch(21039);
        var norms = this.getAttributeBuffer(MeshData.NORMAL);
        __touch(21040);
        var texs = this.getAttributeBuffer(MeshData.TEXCOORD0);
        __touch(21041);
        var indices = this.getIndexBuffer();
        __touch(21042);
        var inverseCircleSamples = 1 / this._circleSamples;
        __touch(21043);
        var inverseRadialSamples = 1 / this._radialSamples;
        __touch(21044);
        var i = 0;
        __touch(21045);
        var radialAxis = new Vector3(), torusMiddle = new Vector3(), tempNormal = new Vector3();
        __touch(21046);
        for (var circleCount = 0; circleCount < this._circleSamples; circleCount++) {
            var circleFraction = circleCount * inverseCircleSamples;
            __touch(21050);
            var theta = MathUtils.TWO_PI * circleFraction;
            __touch(21051);
            var cosTheta = Math.cos(theta);
            __touch(21052);
            var sinTheta = Math.sin(theta);
            __touch(21053);
            radialAxis.set(cosTheta, sinTheta, 0);
            __touch(21054);
            Vector3.mul(radialAxis, this._centerRadius, torusMiddle);
            __touch(21055);
            var iSave = i;
            __touch(21056);
            for (var radialCount = 0; radialCount < this._radialSamples; radialCount++) {
                var radialFraction = radialCount * inverseRadialSamples;
                __touch(21062);
                var phi = MathUtils.TWO_PI * radialFraction;
                __touch(21063);
                var cosPhi = Math.cos(phi);
                __touch(21064);
                var sinPhi = Math.sin(phi);
                __touch(21065);
                tempNormal.copy(radialAxis).mul(cosPhi);
                __touch(21066);
                tempNormal.z = tempNormal.z + sinPhi;
                __touch(21067);
                tempNormal.normalize();
                __touch(21068);
                if (!this.viewInside) {
                    norms[i * 3 + 0] = tempNormal.x;
                    __touch(21076);
                    norms[i * 3 + 1] = tempNormal.y;
                    __touch(21077);
                    norms[i * 3 + 2] = tempNormal.z;
                    __touch(21078);
                } else {
                    norms[i * 3 + 0] = -tempNormal.x;
                    __touch(21079);
                    norms[i * 3 + 1] = -tempNormal.y;
                    __touch(21080);
                    norms[i * 3 + 2] = -tempNormal.z;
                    __touch(21081);
                }
                tempNormal.mul(this._tubeRadius).add(torusMiddle);
                __touch(21069);
                vbuf[i * 3 + 0] = tempNormal.x;
                __touch(21070);
                vbuf[i * 3 + 1] = tempNormal.y;
                __touch(21071);
                vbuf[i * 3 + 2] = tempNormal.z;
                __touch(21072);
                texs[i * 2 + 0] = radialFraction;
                __touch(21073);
                texs[i * 2 + 1] = circleFraction;
                __touch(21074);
                i++;
                __touch(21075);
            }
            copyInternal(vbuf, iSave, i);
            __touch(21057);
            copyInternal(norms, iSave, i);
            __touch(21058);
            texs[i * 2 + 0] = 1;
            __touch(21059);
            texs[i * 2 + 1] = circleFraction;
            __touch(21060);
            i++;
            __touch(21061);
        }
        for (var iR = 0; iR <= this._radialSamples; iR++, i++) {
            copyInternal(vbuf, iR, i);
            __touch(21082);
            copyInternal(norms, iR, i);
            __touch(21083);
            copyInternal2(texs, iR, i);
            __touch(21084);
            texs[i * 2 + 1] = 1;
            __touch(21085);
        }
        var index = 0;
        __touch(21047);
        var connectionStart = 0;
        __touch(21048);
        for (var circleCount = 0; circleCount < this._circleSamples; circleCount++) {
            var i0 = connectionStart;
            __touch(21086);
            var i1 = i0 + 1;
            __touch(21087);
            connectionStart += this._radialSamples + 1;
            __touch(21088);
            var i2 = connectionStart;
            __touch(21089);
            var i3 = i2 + 1;
            __touch(21090);
            for (i = 0; i < this._radialSamples; i++) {
                if (!this.viewInside) {
                    indices[index++] = i0++;
                    __touch(21091);
                    indices[index++] = i2;
                    __touch(21092);
                    indices[index++] = i1;
                    __touch(21093);
                    indices[index++] = i1++;
                    __touch(21094);
                    indices[index++] = i2++;
                    __touch(21095);
                    indices[index++] = i3++;
                    __touch(21096);
                } else {
                    indices[index++] = i0++;
                    __touch(21097);
                    indices[index++] = i1;
                    __touch(21098);
                    indices[index++] = i2;
                    __touch(21099);
                    indices[index++] = i1++;
                    __touch(21100);
                    indices[index++] = i3++;
                    __touch(21101);
                    indices[index++] = i2++;
                    __touch(21102);
                }
            }
        }
        return this;
        __touch(21049);
    };
    __touch(21020);
    function copyInternal(buf, from, to) {
        buf[to * 3 + 0] = buf[from * 3 + 0];
        __touch(21103);
        buf[to * 3 + 1] = buf[from * 3 + 1];
        __touch(21104);
        buf[to * 3 + 2] = buf[from * 3 + 2];
        __touch(21105);
    }
    __touch(21021);
    function copyInternal2(buf, from, to) {
        buf[to * 2 + 0] = buf[from * 2 + 0];
        __touch(21106);
        buf[to * 2 + 1] = buf[from * 2 + 1];
        __touch(21107);
    }
    __touch(21022);
    return Torus;
    __touch(21023);
});
__touch(21016);