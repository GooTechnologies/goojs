define( [], function () {
	'use strict';
	/*global Ammo */

	// TODO: instead of using this scale parameter, "simply" scale the vertices with the real entity transform
	return function (entity, scale) {
		scale = scale || [1, 1, 1];
		var floatByteSize = 4;
		var use32bitIndices = true;
		var intByteSize = use32bitIndices ? 4 : 2;
		var intType = use32bitIndices ? "i32" : "i16";

		var meshData = entity.meshDataComponent.meshData;

		var vertices = meshData.dataViews.POSITION;
		var vertexBuffer = Ammo.allocate( floatByteSize * vertices.length, "float", Ammo.ALLOC_NORMAL );
		for ( var i = 0, il = vertices.length; i < il; i ++ ) {
			Ammo.setValue( vertexBuffer + i * floatByteSize, scale[i % 3] * vertices[ i ], 'float' );
		}

		var indices = meshData.indexData.data;
		var indexBuffer = Ammo.allocate( intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL );
		for ( var i = 0, il = indices.length; i < il; i ++ ) {
			Ammo.setValue( indexBuffer + i * intByteSize, indices[ i ], intType );
		}

		var iMesh = new Ammo.btIndexedMesh();
		iMesh.set_m_numTriangles( meshData.indexCount / 3 );
		iMesh.set_m_triangleIndexBase( indexBuffer );
		iMesh.set_m_triangleIndexStride( intByteSize * 3 );

		iMesh.set_m_numVertices( meshData.vertexCount );
		iMesh.set_m_vertexBase( vertexBuffer );
		iMesh.set_m_vertexStride( floatByteSize * 3 );

		var triangleIndexVertexArray = new Ammo.btTriangleIndexVertexArray();
		triangleIndexVertexArray.addIndexedMesh( iMesh, 2); // indexedMesh, indexType = PHY_INTEGER = 2 seems optional

		// bvh = Bounding Volume Hierarchy
		return new Ammo.btBvhTriangleMeshShape( triangleIndexVertexArray, true, true ); // btStridingMeshInterface, useQuantizedAabbCompression, buildBvh
	};

});