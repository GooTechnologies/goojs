define([], function () {
    'use strict';
    __touch(137);
    return function (entity, scale) {
        scale = scale || [
            1,
            1,
            1
        ];
        __touch(139);
        var floatByteSize = 4;
        __touch(140);
        var use32bitIndices = true;
        __touch(141);
        var intByteSize = use32bitIndices ? 4 : 2;
        __touch(142);
        var intType = use32bitIndices ? 'i32' : 'i16';
        __touch(143);
        var meshData = entity.meshDataComponent.meshData;
        __touch(144);
        var vertices = meshData.dataViews.POSITION;
        __touch(145);
        var vertexBuffer = Ammo.allocate(floatByteSize * vertices.length, 'float', Ammo.ALLOC_NORMAL);
        __touch(146);
        for (var i = 0, il = vertices.length; i < il; i++) {
            Ammo.setValue(vertexBuffer + i * floatByteSize, scale[i % 3] * vertices[i], 'float');
            __touch(159);
        }
        var indices = meshData.indexData.data;
        __touch(147);
        var indexBuffer = Ammo.allocate(intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL);
        __touch(148);
        for (var i = 0, il = indices.length; i < il; i++) {
            Ammo.setValue(indexBuffer + i * intByteSize, indices[i], intType);
            __touch(160);
        }
        var iMesh = new Ammo.btIndexedMesh();
        __touch(149);
        iMesh.set_m_numTriangles(meshData.indexCount / 3);
        __touch(150);
        iMesh.set_m_triangleIndexBase(indexBuffer);
        __touch(151);
        iMesh.set_m_triangleIndexStride(intByteSize * 3);
        __touch(152);
        iMesh.set_m_numVertices(meshData.vertexCount);
        __touch(153);
        iMesh.set_m_vertexBase(vertexBuffer);
        __touch(154);
        iMesh.set_m_vertexStride(floatByteSize * 3);
        __touch(155);
        var triangleIndexVertexArray = new Ammo.btTriangleIndexVertexArray();
        __touch(156);
        triangleIndexVertexArray.addIndexedMesh(iMesh, 2);
        __touch(157);
        return new Ammo.btBvhTriangleMeshShape(triangleIndexVertexArray, true, true);
        __touch(158);
    };
    __touch(138);
});
__touch(136);