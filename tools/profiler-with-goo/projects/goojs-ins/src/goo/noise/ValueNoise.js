define(['goo/noise/Noise'], function (Noise) {
    'use strict';
    __touch(12870);
    function ValueNoise() {
        Noise.call(this);
        __touch(12879);
    }
    __touch(12871);
    ValueNoise.prototype = Object.create(Noise.prototype);
    __touch(12872);
    ValueNoise.sources = [
        0 / 15,
        1 / 15,
        2 / 15,
        3 / 15,
        4 / 15,
        5 / 15,
        6 / 15,
        7 / 15,
        8 / 15,
        9 / 15,
        10 / 15,
        11 / 15,
        12 / 15,
        13 / 15,
        14 / 15,
        15 / 15
    ];
    __touch(12873);
    ValueNoise.evaluate1d = function (px, scale) {
        var x = Noise.split(px / scale);
        __touch(12880);
        var i0000 = Noise.shifter[x.i0 & 255] & 15;
        __touch(12881);
        var i0001 = Noise.shifter[x.i1 & 255] & 15;
        __touch(12882);
        var result = 0;
        __touch(12883);
        result += x.f0 * ValueNoise.sources[i0000];
        __touch(12884);
        result += x.f1 * ValueNoise.sources[i0001];
        __touch(12885);
        return result;
        __touch(12886);
    };
    __touch(12874);
    ValueNoise.evaluate2d = function (px, py, scale) {
        var x = Noise.split(px / scale);
        __touch(12887);
        var y = Noise.split(py / scale);
        __touch(12888);
        var i0000 = Noise.shifter[Noise.shifter[y.i0 & 255] + x.i0 & 255] & 15;
        __touch(12889);
        var i0001 = Noise.shifter[Noise.shifter[y.i0 & 255] + x.i1 & 255] & 15;
        __touch(12890);
        var i0010 = Noise.shifter[Noise.shifter[y.i1 & 255] + x.i0 & 255] & 15;
        __touch(12891);
        var i0011 = Noise.shifter[Noise.shifter[y.i1 & 255] + x.i1 & 255] & 15;
        __touch(12892);
        var result = 0;
        __touch(12893);
        result += y.f0 * x.f0 * ValueNoise.sources[i0000];
        __touch(12894);
        result += y.f0 * x.f1 * ValueNoise.sources[i0001];
        __touch(12895);
        result += y.f1 * x.f0 * ValueNoise.sources[i0010];
        __touch(12896);
        result += y.f1 * x.f1 * ValueNoise.sources[i0011];
        __touch(12897);
        return result;
        __touch(12898);
    };
    __touch(12875);
    ValueNoise.evaluate3d = function (px, py, pz, scale) {
        var x = Noise.split(px / scale);
        __touch(12899);
        var y = Noise.split(py / scale);
        __touch(12900);
        var z = Noise.split(pz / scale);
        __touch(12901);
        var i0000 = Noise.shifter[Noise.shifter[Noise.shifter[z.i0 & 255] + y.i0 & 255] + x.i0 & 255] & 15;
        __touch(12902);
        var i0001 = Noise.shifter[Noise.shifter[Noise.shifter[z.i0 & 255] + y.i0 & 255] + x.i1 & 255] & 15;
        __touch(12903);
        var i0010 = Noise.shifter[Noise.shifter[Noise.shifter[z.i0 & 255] + y.i1 & 255] + x.i0 & 255] & 15;
        __touch(12904);
        var i0011 = Noise.shifter[Noise.shifter[Noise.shifter[z.i0 & 255] + y.i1 & 255] + x.i1 & 255] & 15;
        __touch(12905);
        var i0100 = Noise.shifter[Noise.shifter[Noise.shifter[z.i1 & 255] + y.i0 & 255] + x.i0 & 255] & 15;
        __touch(12906);
        var i0101 = Noise.shifter[Noise.shifter[Noise.shifter[z.i1 & 255] + y.i0 & 255] + x.i1 & 255] & 15;
        __touch(12907);
        var i0110 = Noise.shifter[Noise.shifter[Noise.shifter[z.i1 & 255] + y.i1 & 255] + x.i0 & 255] & 15;
        __touch(12908);
        var i0111 = Noise.shifter[Noise.shifter[Noise.shifter[z.i1 & 255] + y.i1 & 255] + x.i1 & 255] & 15;
        __touch(12909);
        var result = 0;
        __touch(12910);
        result += z.f0 * y.f0 * x.f0 * ValueNoise.sources[i0000];
        __touch(12911);
        result += z.f0 * y.f0 * x.f1 * ValueNoise.sources[i0001];
        __touch(12912);
        result += z.f0 * y.f1 * x.f0 * ValueNoise.sources[i0010];
        __touch(12913);
        result += z.f0 * y.f1 * x.f1 * ValueNoise.sources[i0011];
        __touch(12914);
        result += z.f1 * y.f0 * x.f0 * ValueNoise.sources[i0100];
        __touch(12915);
        result += z.f1 * y.f0 * x.f1 * ValueNoise.sources[i0101];
        __touch(12916);
        result += z.f1 * y.f1 * x.f0 * ValueNoise.sources[i0110];
        __touch(12917);
        result += z.f1 * y.f1 * x.f1 * ValueNoise.sources[i0111];
        __touch(12918);
        return result;
        __touch(12919);
    };
    __touch(12876);
    ValueNoise.evaluate4d = function (px, py, pz, pw, scale) {
        var x = Noise.split(px / scale);
        __touch(12920);
        var y = Noise.split(py / scale);
        __touch(12921);
        var z = Noise.split(pz / scale);
        __touch(12922);
        var w = Noise.split(pw / scale);
        __touch(12923);
        var i0000 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 255] + z.i0 & 255] + y.i0 & 255] + x.i0 & 255] & 15;
        __touch(12924);
        var i0001 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 255] + z.i0 & 255] + y.i0 & 255] + x.i1 & 255] & 15;
        __touch(12925);
        var i0010 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 255] + z.i0 & 255] + y.i1 & 255] + x.i0 & 255] & 15;
        __touch(12926);
        var i0011 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 255] + z.i0 & 255] + y.i1 & 255] + x.i1 & 255] & 15;
        __touch(12927);
        var i0100 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 255] + z.i1 & 255] + y.i0 & 255] + x.i0 & 255] & 15;
        __touch(12928);
        var i0101 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 255] + z.i1 & 255] + y.i0 & 255] + x.i1 & 255] & 15;
        __touch(12929);
        var i0110 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 255] + z.i1 & 255] + y.i1 & 255] + x.i0 & 255] & 15;
        __touch(12930);
        var i0111 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i0 & 255] + z.i1 & 255] + y.i1 & 255] + x.i1 & 255] & 15;
        __touch(12931);
        var i1000 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 255] + z.i0 & 255] + y.i0 & 255] + x.i0 & 255] & 15;
        __touch(12932);
        var i1001 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 255] + z.i0 & 255] + y.i0 & 255] + x.i1 & 255] & 15;
        __touch(12933);
        var i1010 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 255] + z.i0 & 255] + y.i1 & 255] + x.i0 & 255] & 15;
        __touch(12934);
        var i1011 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 255] + z.i0 & 255] + y.i1 & 255] + x.i1 & 255] & 15;
        __touch(12935);
        var i1100 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 255] + z.i1 & 255] + y.i0 & 255] + x.i0 & 255] & 15;
        __touch(12936);
        var i1101 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 255] + z.i1 & 255] + y.i0 & 255] + x.i1 & 255] & 15;
        __touch(12937);
        var i1110 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 255] + z.i1 & 255] + y.i1 & 255] + x.i0 & 255] & 15;
        __touch(12938);
        var i1111 = Noise.shifter[Noise.shifter[Noise.shifter[Noise.shifter[w.i1 & 255] + z.i1 & 255] + y.i1 & 255] + x.i1 & 255] & 15;
        __touch(12939);
        var result = 0;
        __touch(12940);
        result += w.f0 * z.f0 * y.f0 * x.f0 * ValueNoise.sources[i0000];
        __touch(12941);
        result += w.f0 * z.f0 * y.f0 * x.f1 * ValueNoise.sources[i0001];
        __touch(12942);
        result += w.f0 * z.f0 * y.f1 * x.f0 * ValueNoise.sources[i0010];
        __touch(12943);
        result += w.f0 * z.f0 * y.f1 * x.f1 * ValueNoise.sources[i0011];
        __touch(12944);
        result += w.f0 * z.f1 * y.f0 * x.f0 * ValueNoise.sources[i0100];
        __touch(12945);
        result += w.f0 * z.f1 * y.f0 * x.f1 * ValueNoise.sources[i0101];
        __touch(12946);
        result += w.f0 * z.f1 * y.f1 * x.f0 * ValueNoise.sources[i0110];
        __touch(12947);
        result += w.f0 * z.f1 * y.f1 * x.f1 * ValueNoise.sources[i0111];
        __touch(12948);
        result += w.f1 * z.f0 * y.f0 * x.f0 * ValueNoise.sources[i1000];
        __touch(12949);
        result += w.f1 * z.f0 * y.f0 * x.f1 * ValueNoise.sources[i1001];
        __touch(12950);
        result += w.f1 * z.f0 * y.f1 * x.f0 * ValueNoise.sources[i1010];
        __touch(12951);
        result += w.f1 * z.f0 * y.f1 * x.f1 * ValueNoise.sources[i1011];
        __touch(12952);
        result += w.f1 * z.f1 * y.f0 * x.f0 * ValueNoise.sources[i1100];
        __touch(12953);
        result += w.f1 * z.f1 * y.f0 * x.f1 * ValueNoise.sources[i1101];
        __touch(12954);
        result += w.f1 * z.f1 * y.f1 * x.f0 * ValueNoise.sources[i1110];
        __touch(12955);
        result += w.f1 * z.f1 * y.f1 * x.f1 * ValueNoise.sources[i1111];
        __touch(12956);
        return result;
        __touch(12957);
    };
    __touch(12877);
    return ValueNoise;
    __touch(12878);
});
__touch(12869);