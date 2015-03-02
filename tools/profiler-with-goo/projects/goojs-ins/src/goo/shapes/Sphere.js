define([
    'goo/renderer/MeshData',
    'goo/math/Vector3',
    'goo/math/MathUtils'
], function (MeshData, Vector3, MathUtils) {
    'use strict';
    __touch(20760);
    function Sphere(zSamples, radialSamples, radius, textureMode) {
        if (arguments.length === 1 && arguments[0] instanceof Object) {
            var props = arguments[0];
            __touch(20780);
            zSamples = props.zSamples;
            __touch(20781);
            radialSamples = props.radialSamples;
            __touch(20782);
            radius = props.radius;
            __touch(20783);
            textureMode = props.textureMode;
            __touch(20784);
        }
        this.zSamples = (zSamples !== undefined ? zSamples : 8) + 1;
        __touch(20767);
        this.radialSamples = radialSamples !== undefined ? radialSamples : 8;
        __touch(20768);
        this.radius = radius !== undefined ? radius : 0.5;
        __touch(20769);
        if (typeof textureMode === 'string') {
            textureMode = Sphere.TextureModes[textureMode];
            __touch(20785);
        }
        this.textureMode = textureMode !== undefined ? textureMode : Sphere.TextureModes.Polar;
        __touch(20770);
        this.viewInside = false;
        __touch(20771);
        var attributeMap = MeshData.defaultMap([
            MeshData.POSITION,
            MeshData.NORMAL,
            MeshData.TEXCOORD0
        ]);
        __touch(20772);
        var samples = this.textureMode === Sphere.TextureModes.Chromeball ? this.zSamples + 1 : this.zSamples;
        __touch(20773);
        this._useSharedPoleVertices = this.textureMode !== Sphere.TextureModes.Projected && this.textureMode !== Sphere.TextureModes.Linear;
        __touch(20774);
        var sharedVerts = this._useSharedPoleVertices ? 2 : 0;
        __touch(20775);
        var verts = (samples - sharedVerts) * (this.radialSamples + 1) + sharedVerts;
        __touch(20776);
        var tris = 6 * (samples - 2) * this.radialSamples;
        __touch(20777);
        MeshData.call(this, attributeMap, verts, tris);
        __touch(20778);
        this.rebuild();
        __touch(20779);
    }
    __touch(20761);
    Sphere.prototype = Object.create(MeshData.prototype);
    __touch(20762);
    Sphere.prototype.rebuild = function () {
        var vbuf = this.getAttributeBuffer(MeshData.POSITION);
        __touch(20786);
        var norms = this.getAttributeBuffer(MeshData.NORMAL);
        __touch(20787);
        var texs = this.getAttributeBuffer(MeshData.TEXCOORD0);
        __touch(20788);
        var indices = this.getIndexBuffer();
        __touch(20789);
        var fInvRS = 1 / this.radialSamples;
        __touch(20790);
        var fZFactor = 2 / (this.zSamples - 1);
        __touch(20791);
        var afSin = [];
        __touch(20792);
        var afCos = [];
        __touch(20793);
        for (var iR = 0; iR < this.radialSamples; iR++) {
            var fAngle = MathUtils.TWO_PI * fInvRS * iR;
            __touch(20807);
            afCos[iR] = Math.cos(fAngle);
            __touch(20808);
            afSin[iR] = Math.sin(fAngle);
            __touch(20809);
        }
        afSin[this.radialSamples] = afSin[0];
        __touch(20794);
        afCos[this.radialSamples] = afCos[0];
        __touch(20795);
        var zBegin = 0;
        __touch(20796);
        var zEnd = this.zSamples;
        __touch(20797);
        if (this._useSharedPoleVertices) {
            zBegin = 1;
            __touch(20810);
            zEnd = this.zSamples - 1;
            __touch(20811);
        }
        var i = 0;
        __touch(20798);
        var tempVa = new Vector3();
        __touch(20799);
        var tempVb = new Vector3();
        __touch(20800);
        var tempVc = new Vector3();
        __touch(20801);
        for (var iZ = zBegin; iZ < zEnd; iZ++) {
            var fAFraction = MathUtils.HALF_PI * (-1 + fZFactor * iZ);
            __touch(20812);
            var fZFraction = Math.sin(fAFraction);
            __touch(20813);
            var fZ = this.radius * fZFraction;
            __touch(20814);
            var kSliceCenter = tempVb.set(0, 0, 0);
            __touch(20815);
            kSliceCenter.z += fZ;
            __touch(20816);
            var fSliceRadius = Math.sqrt(Math.abs(this.radius * this.radius - fZ * fZ));
            __touch(20817);
            var kNormal;
            __touch(20818);
            var iSave = i;
            __touch(20819);
            for (var iR = 0; iR < this.radialSamples; iR++) {
                var fRadialFraction = iR * fInvRS;
                __touch(20823);
                var kRadial = tempVc.set(afCos[iR], afSin[iR], 0);
                __touch(20824);
                Vector3.mul(kRadial, fSliceRadius, tempVa);
                __touch(20825);
                vbuf[i * 3 + 0] = kSliceCenter.x + tempVa.x;
                __touch(20826);
                vbuf[i * 3 + 1] = kSliceCenter.y + tempVa.y;
                __touch(20827);
                vbuf[i * 3 + 2] = kSliceCenter.z + tempVa.z;
                __touch(20828);
                kNormal = tempVa.set(vbuf[i * 3 + 0], vbuf[i * 3 + 1], vbuf[i * 3 + 2]);
                __touch(20829);
                kNormal.normalize();
                __touch(20830);
                if (!this.viewInside) {
                    norms[i * 3 + 0] = kNormal.x;
                    __touch(20833);
                    norms[i * 3 + 1] = kNormal.y;
                    __touch(20834);
                    norms[i * 3 + 2] = kNormal.z;
                    __touch(20835);
                } else {
                    norms[i * 3 + 0] = -kNormal.x;
                    __touch(20836);
                    norms[i * 3 + 1] = -kNormal.y;
                    __touch(20837);
                    norms[i * 3 + 2] = -kNormal.z;
                    __touch(20838);
                }
                var uOffset = 0;
                __touch(20831);
                if (!this._useSharedPoleVertices && (iZ === zBegin || iZ === zEnd - 1)) {
                    uOffset = 0.5 * fInvRS;
                    __touch(20839);
                }
                if (this.textureMode === Sphere.TextureModes.Linear) {
                    texs[i * 2 + 0] = fRadialFraction + uOffset;
                    __touch(20840);
                    texs[i * 2 + 1] = 0.5 * (fZFraction + 1);
                    __touch(20841);
                } else if (this.textureMode === Sphere.TextureModes.Projected) {
                    texs[i * 2 + 0] = fRadialFraction + uOffset;
                    __touch(20842);
                    texs[i * 2 + 1] = (MathUtils.HALF_PI + Math.asin(fZFraction)) / Math.PI;
                    __touch(20843);
                } else if (this.textureMode === Sphere.TextureModes.Polar) {
                    var r = (MathUtils.HALF_PI - Math.abs(fAFraction)) / Math.PI;
                    __touch(20844);
                    var u = r * afCos[iR] + 0.5;
                    __touch(20845);
                    var v = r * afSin[iR] + 0.5;
                    __touch(20846);
                    texs[i * 2 + 0] = u;
                    __touch(20847);
                    texs[i * 2 + 1] = v;
                    __touch(20848);
                } else if (this.textureMode === Sphere.TextureModes.Chromeball) {
                    var r = Math.sin((MathUtils.HALF_PI + fAFraction) / 2);
                    __touch(20849);
                    r /= 2;
                    __touch(20850);
                    var u = r * afCos[iR] + 0.5;
                    __touch(20851);
                    var v = r * afSin[iR] + 0.5;
                    __touch(20852);
                    texs[i * 2 + 0] = u;
                    __touch(20853);
                    texs[i * 2 + 1] = v;
                    __touch(20854);
                }
                i++;
                __touch(20832);
            }
            copyInternal(vbuf, iSave, i);
            __touch(20820);
            copyInternal(norms, iSave, i);
            __touch(20821);
            if (this.textureMode === Sphere.TextureModes.Linear) {
                texs[i * 2 + 0] = 1;
                __touch(20855);
                texs[i * 2 + 1] = 0.5 * (fZFraction + 1);
                __touch(20856);
            } else if (this.textureMode === Sphere.TextureModes.Projected) {
                texs[i * 2 + 0] = 1;
                __touch(20857);
                texs[i * 2 + 1] = (MathUtils.HALF_PI + Math.asin(fZFraction)) / Math.PI;
                __touch(20858);
            } else if (this.textureMode === Sphere.TextureModes.Polar) {
                var r = (MathUtils.HALF_PI - Math.abs(fAFraction)) / Math.PI;
                __touch(20859);
                texs[i * 2 + 0] = r + 0.5;
                __touch(20860);
                texs[i * 2 + 1] = 0.5;
                __touch(20861);
            } else if (this.textureMode === Sphere.TextureModes.Chromeball) {
                var r = Math.sin((MathUtils.HALF_PI + fAFraction) / 2);
                __touch(20862);
                r /= 2;
                __touch(20863);
                texs[i * 2 + 0] = r + 0.5;
                __touch(20864);
                texs[i * 2 + 1] = 0.5;
                __touch(20865);
            }
            i++;
            __touch(20822);
        }
        if (this.textureMode === Sphere.TextureModes.Chromeball) {
            var epsilonAngle = MathUtils.HALF_PI - 0.001;
            __touch(20866);
            var z = this.radius * Math.sin(epsilonAngle);
            __touch(20867);
            var sliceR = Math.sqrt(Math.abs(this.radius * this.radius - z * z));
            __touch(20868);
            var iSave = i;
            __touch(20869);
            for (var iR = 0; iR < this.radialSamples; iR++) {
                vbuf[i * 3 + 0] = sliceR * afCos[iR];
                __touch(20877);
                vbuf[i * 3 + 1] = sliceR * afSin[iR];
                __touch(20878);
                vbuf[i * 3 + 2] = z;
                __touch(20879);
                var kNormal = tempVa.set(vbuf[i * 3 + 0], vbuf[i * 3 + 1], vbuf[i * 3 + 2]);
                __touch(20880);
                kNormal.normalize();
                __touch(20881);
                if (!this.viewInside) {
                    norms[i * 3 + 0] = kNormal.x;
                    __touch(20889);
                    norms[i * 3 + 1] = kNormal.y;
                    __touch(20890);
                    norms[i * 3 + 2] = kNormal.z;
                    __touch(20891);
                } else {
                    norms[i * 3 + 0] = -kNormal.x;
                    __touch(20892);
                    norms[i * 3 + 1] = -kNormal.y;
                    __touch(20893);
                    norms[i * 3 + 2] = -kNormal.z;
                    __touch(20894);
                }
                var r = Math.sin((MathUtils.HALF_PI + epsilonAngle) / 2);
                __touch(20882);
                r /= 2;
                __touch(20883);
                var u = r * afCos[iR] + 0.5;
                __touch(20884);
                var v = r * afSin[iR] + 0.5;
                __touch(20885);
                texs[i * 2 + 0] = u;
                __touch(20886);
                texs[i * 2 + 1] = v;
                __touch(20887);
                i++;
                __touch(20888);
            }
            copyInternal(vbuf, iSave, i);
            __touch(20870);
            copyInternal(norms, iSave, i);
            __touch(20871);
            var r = Math.sin((MathUtils.HALF_PI + epsilonAngle) / 2);
            __touch(20872);
            r /= 2;
            __touch(20873);
            texs[i * 2 + 0] = r + 0.5;
            __touch(20874);
            texs[i * 2 + 1] = 0.5;
            __touch(20875);
            i++;
            __touch(20876);
        }
        if (this._useSharedPoleVertices) {
            vbuf[i * 3 + 0] = 0;
            __touch(20895);
            vbuf[i * 3 + 1] = 0;
            __touch(20896);
            vbuf[i * 3 + 2] = -this.radius;
            __touch(20897);
            if (!this.viewInside) {
                norms[i * 3 + 0] = 0;
                __touch(20902);
                norms[i * 3 + 1] = 0;
                __touch(20903);
                norms[i * 3 + 2] = -1;
                __touch(20904);
            } else {
                norms[i * 3 + 0] = 0;
                __touch(20905);
                norms[i * 3 + 1] = 0;
                __touch(20906);
                norms[i * 3 + 2] = 1;
                __touch(20907);
            }
            if (this.textureMode === Sphere.TextureModes.Polar || this.textureMode === Sphere.TextureModes.Chromeball) {
                texs[i * 2 + 0] = 0.5;
                __touch(20908);
                texs[i * 2 + 1] = 0.5;
                __touch(20909);
            } else {
                texs[i * 2 + 0] = 0.5;
                __touch(20910);
                texs[i * 2 + 1] = 0;
                __touch(20911);
            }
            i++;
            __touch(20898);
            vbuf[i * 3 + 0] = 0;
            __touch(20899);
            vbuf[i * 3 + 1] = 0;
            __touch(20900);
            vbuf[i * 3 + 2] = this.radius;
            __touch(20901);
            if (!this.viewInside) {
                norms[i * 3 + 0] = 0;
                __touch(20912);
                norms[i * 3 + 1] = 0;
                __touch(20913);
                norms[i * 3 + 2] = 1;
                __touch(20914);
            } else {
                norms[i * 3 + 0] = 0;
                __touch(20915);
                norms[i * 3 + 1] = 0;
                __touch(20916);
                norms[i * 3 + 2] = -1;
                __touch(20917);
            }
            if (this.textureMode === Sphere.TextureModes.Polar) {
                texs[i * 2 + 0] = 0.5;
                __touch(20918);
                texs[i * 2 + 1] = 0.5;
                __touch(20919);
            } else if (this.textureMode === Sphere.TextureModes.Chromeball) {
                texs[i * 2 + 0] = 1;
                __touch(20920);
                texs[i * 2 + 1] = -0.5;
                __touch(20921);
            } else {
                texs[i * 2 + 0] = 0.5;
                __touch(20922);
                texs[i * 2 + 1] = 1;
                __touch(20923);
            }
        }
        var index = 0;
        __touch(20802);
        var samples = this.textureMode === Sphere.TextureModes.Chromeball ? this.zSamples + 1 : this.zSamples;
        __touch(20803);
        var iZStart = 0;
        __touch(20804);
        if (!this._useSharedPoleVertices) {
            iZStart = this.radialSamples + 1;
            __touch(20924);
        }
        for (var iZ = 0; iZ < samples - 3; iZ++) {
            var i0 = iZStart;
            __touch(20925);
            var i1 = i0 + 1;
            __touch(20926);
            iZStart += this.radialSamples + 1;
            __touch(20927);
            var i2 = iZStart;
            __touch(20928);
            var i3 = i2 + 1;
            __touch(20929);
            for (var i = 0; i < this.radialSamples; i++) {
                if (!this.viewInside) {
                    indices[index++] = i0++;
                    __touch(20930);
                    indices[index++] = i1;
                    __touch(20931);
                    indices[index++] = i2;
                    __touch(20932);
                    indices[index++] = i1++;
                    __touch(20933);
                    indices[index++] = i3++;
                    __touch(20934);
                    indices[index++] = i2++;
                    __touch(20935);
                } else {
                    indices[index++] = i0++;
                    __touch(20936);
                    indices[index++] = i2;
                    __touch(20937);
                    indices[index++] = i1;
                    __touch(20938);
                    indices[index++] = i1++;
                    __touch(20939);
                    indices[index++] = i2++;
                    __touch(20940);
                    indices[index++] = i3++;
                    __touch(20941);
                }
            }
        }
        for (var i = 0; i < this.radialSamples; i++) {
            var i0, i1, i2;
            __touch(20942);
            if (!this._useSharedPoleVertices) {
                i0 = i;
                __touch(20943);
                i1 = i + this.radialSamples + 2;
                __touch(20944);
                i2 = i + this.radialSamples + 1;
                __touch(20945);
            } else {
                i0 = i;
                __touch(20946);
                i1 = this.vertexCount - 2;
                __touch(20947);
                i2 = i + 1;
                __touch(20948);
            }
            if (!this.viewInside) {
                indices[index++] = i0;
                __touch(20949);
                indices[index++] = i1;
                __touch(20950);
                indices[index++] = i2;
                __touch(20951);
            } else {
                indices[index++] = i0;
                __touch(20952);
                indices[index++] = i2;
                __touch(20953);
                indices[index++] = i1;
                __touch(20954);
            }
        }
        var iOffset = (zEnd - zBegin - 1) * (this.radialSamples + 1);
        __touch(20805);
        for (var i = 0; i < this.radialSamples; i++) {
            var i0, i1, i2;
            __touch(20955);
            if (!this._useSharedPoleVertices) {
                i0 = i + iOffset - this.radialSamples - 1;
                __touch(20956);
                i1 = i + iOffset - this.radialSamples;
                __touch(20957);
                i2 = i + iOffset;
                __touch(20958);
            } else {
                i0 = i + iOffset;
                __touch(20959);
                i1 = i + 1 + iOffset;
                __touch(20960);
                i2 = this.vertexCount - 1;
                __touch(20961);
            }
            if (!this.viewInside) {
                indices[index++] = i0;
                __touch(20962);
                indices[index++] = i1;
                __touch(20963);
                indices[index++] = i2;
                __touch(20964);
            } else {
                indices[index++] = i0;
                __touch(20965);
                indices[index++] = i2;
                __touch(20966);
                indices[index++] = i1;
                __touch(20967);
            }
        }
        return this;
        __touch(20806);
    };
    __touch(20763);
    function copyInternal(buf, from, to) {
        buf[to * 3 + 0] = buf[from * 3 + 0];
        __touch(20968);
        buf[to * 3 + 1] = buf[from * 3 + 1];
        __touch(20969);
        buf[to * 3 + 2] = buf[from * 3 + 2];
        __touch(20970);
    }
    __touch(20764);
    Sphere.TextureModes = {
        Linear: 'Linear',
        Projected: 'Projected',
        Polar: 'Polar',
        Chromeball: 'Chromeball'
    };
    __touch(20765);
    return Sphere;
    __touch(20766);
});
__touch(20759);