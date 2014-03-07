define([
	'goo/entities/components/Component'
], function(
	Component
){
	function AmmoMeshColliderComponent(entity){
		this.type = "AmmoColliderComponent";
		this.ammoShape = createTriangleMeshShape(entity);
	};
	AmmoMeshColliderComponent.prototype = Object.create(Component.prototype);
	AmmoMeshColliderComponent.constructor = AmmoMeshColliderComponent;

	function createTriangleMeshShape(entity) {

		var mesh = entity.getComponent("meshDataComponent");
		if(null == mesh){console.error("Entity requires a meshDataComponent.");return;}

		var meshData = mesh.meshData;
		var vertices = meshData.dataViews.POSITION;
		var indices = meshData.indexData.data;
		var numTriangles = meshData.indexCount / 3;
		var numVertices = meshData.vertexCount;

		var triangleMesh = new Ammo.btTriangleIndexVertexArray();

		var indexType = PHY_INTEGER;
		var mesh = new Ammo.btIndexedMesh();

		var floatByteSize = 4;
		var vertexBuffer = Ammo.allocate( floatByteSize * vertices.length, "float", Ammo.ALLOC_NORMAL );

		var scale = 1;

		for ( var i = 0, il = vertices.length; i < il; i ++ ) {

			Ammo.setValue( vertexBuffer + i * floatByteSize, scale * vertices[ i ], 'float' );

		}
		var use32bitIndices = true;
		var intByteSize = use32bitIndices ? 4 : 2;
		var intType = use32bitIndices ? "i32" : "i16";


		var indexBuffer = Ammo.allocate( intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL );

		for ( var i = 0, il = indices.length; i < il; i ++ ) {

			Ammo.setValue( indexBuffer + i * intByteSize, indices[ i ], intType );

		}


		var indexStride = intByteSize * 3;
		var vertexStride = floatByteSize * 3;

		mesh.set_m_numTriangles( numTriangles );
		mesh.set_m_triangleIndexBase( indexBuffer );
		mesh.set_m_triangleIndexStride( indexStride );

		mesh.set_m_numVertices( numVertices );
		mesh.set_m_vertexBase( vertexBuffer );
		mesh.set_m_vertexStride( vertexStride );

		triangleMesh.addIndexedMesh( mesh, indexType );

		var useQuantizedAabbCompression = true;
		var buildBvh = true;

		var shape = new Ammo.btBvhTriangleMeshShape( triangleMesh, useQuantizedAabbCompression, buildBvh );

		return shape;
	}

	return AmmoMeshColliderComponent;
});
