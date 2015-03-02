define([
    'goo/math/Vector2',
    'goo/math/Vector3',
    'goo/renderer/MeshData'
], function (Vector2, Vector3, MeshData) {
    'use strict';
    __touch(22563);
    function TangentGenerator() {
    }
    __touch(22564);
    TangentGenerator.addTangentBuffer = function (meshData, uvUnit) {
        uvUnit = uvUnit || 0;
        __touch(22567);
        var vertexBuffer = meshData.getAttributeBuffer(MeshData.POSITION);
        __touch(22568);
        if (!vertexBuffer) {
            return;
            __touch(22587);
        }
        var normalBuffer = meshData.getAttributeBuffer(MeshData.NORMAL);
        __touch(22569);
        if (!normalBuffer) {
            return;
            __touch(22588);
        }
        var textureBuffer = meshData.getAttributeBuffer('TEXCOORD' + uvUnit);
        __touch(22570);
        if (!textureBuffer && uvUnit !== 0) {
            textureBuffer = meshData.getAttributeBuffer(MeshData.TEXCOORD0);
            __touch(22589);
        }
        if (!textureBuffer) {
            return;
            __touch(22590);
        }
        var indexBuffer = meshData.getIndexBuffer();
        __touch(22571);
        if (!indexBuffer) {
            return;
            __touch(22591);
        }
        var vertexCount = meshData.vertexCount;
        __touch(22572);
        var triangleCount = meshData.indexCount / 3;
        __touch(22573);
        var tan1 = [];
        __touch(22574);
        var tan2 = [];
        __touch(22575);
        for (var i = 0; i < vertexCount; i++) {
            tan1[i] = new Vector3();
            __touch(22592);
            tan2[i] = new Vector3();
            __touch(22593);
        }
        function getVector2Array(buf) {
            var arr = [];
            __touch(22594);
            for (var i = 0; i < buf.length; i += 2) {
                arr.push(new Vector2(buf[i + 0], buf[i + 1]));
                __touch(22596);
            }
            return arr;
            __touch(22595);
        }
        __touch(22576);
        function getVector3Array(buf) {
            var arr = [];
            __touch(22597);
            for (var i = 0; i < buf.length; i += 3) {
                arr.push(new Vector3(buf[i + 0], buf[i + 1], buf[i + 2]));
                __touch(22599);
            }
            return arr;
            __touch(22598);
        }
        __touch(22577);
        var vertex = getVector3Array(vertexBuffer);
        __touch(22578);
        var normal = getVector3Array(normalBuffer);
        __touch(22579);
        var texcoord = getVector2Array(textureBuffer);
        __touch(22580);
        for (var a = 0; a < triangleCount; a++) {
            var i1 = indexBuffer[a * 3];
            __touch(22600);
            var i2 = indexBuffer[a * 3 + 1];
            __touch(22601);
            var i3 = indexBuffer[a * 3 + 2];
            __touch(22602);
            var v1 = vertex[i1];
            __touch(22603);
            var v2 = vertex[i2];
            __touch(22604);
            var v3 = vertex[i3];
            __touch(22605);
            var w1 = texcoord[i1];
            __touch(22606);
            var w2 = texcoord[i2];
            __touch(22607);
            var w3 = texcoord[i3];
            __touch(22608);
            var x1 = v2.x - v1.x;
            __touch(22609);
            var x2 = v3.x - v1.x;
            __touch(22610);
            var y1 = v2.y - v1.y;
            __touch(22611);
            var y2 = v3.y - v1.y;
            __touch(22612);
            var z1 = v2.z - v1.z;
            __touch(22613);
            var z2 = v3.z - v1.z;
            __touch(22614);
            var s1 = w2.x - w1.x;
            __touch(22615);
            var s2 = w3.x - w1.x;
            __touch(22616);
            var t1 = w2.y - w1.y;
            __touch(22617);
            var t2 = w3.y - w1.y;
            __touch(22618);
            var r = 1 / (s1 * t2 - s2 * t1);
            __touch(22619);
            if (isFinite(r) === false) {
                continue;
                __touch(22628);
            }
            var sdir = new Vector3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
            __touch(22620);
            var tdir = new Vector3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);
            __touch(22621);
            tan1[i1].add(sdir);
            __touch(22622);
            tan1[i2].add(sdir);
            __touch(22623);
            tan1[i3].add(sdir);
            __touch(22624);
            tan2[i1].add(tdir);
            __touch(22625);
            tan2[i2].add(tdir);
            __touch(22626);
            tan2[i3].add(tdir);
            __touch(22627);
        }
        meshData.attributeMap[MeshData.TANGENT] = MeshData.createAttribute(4, 'Float');
        __touch(22581);
        meshData.rebuildData(meshData.vertexCount, meshData.indexCount, true);
        __touch(22582);
        var tangentBuffer = meshData.getAttributeBuffer(MeshData.TANGENT);
        __touch(22583);
        var calc1 = new Vector3();
        __touch(22584);
        var calc2 = new Vector3();
        __touch(22585);
        for (var a = 0; a < vertexCount; a++) {
            var n = normal[a];
            __touch(22629);
            var t = tan1[a];
            __touch(22630);
            var dot = n.dot(t);
            __touch(22631);
            calc1.copy(t).sub(calc2.copy(n).mul(dot)).normalize();
            __touch(22632);
            tangentBuffer[a * 4 + 0] = calc1.x;
            __touch(22633);
            tangentBuffer[a * 4 + 1] = calc1.y;
            __touch(22634);
            tangentBuffer[a * 4 + 2] = calc1.z;
            __touch(22635);
            dot = calc1.copy(n).cross(t).dot(tan2[a]);
            __touch(22636);
            var w = dot < 0 ? -1 : 1;
            __touch(22637);
            tangentBuffer[a * 4 + 3] = w;
            __touch(22638);
        }
        return tangentBuffer;
        __touch(22586);
    };
    __touch(22565);
    return TangentGenerator;
    __touch(22566);
});
__touch(22562);