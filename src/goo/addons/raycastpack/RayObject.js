define([
	'goo/math/Vector3',
	'goo/math/Matrix4x4',
	'goo/addons/raycastpack/Octree',
	'goo/addons/raycastpack/SurfaceObject',
	'goo/renderer/MeshData'
],

function (
Vector3,
Matrix4x4,
Octree,
SurfaceObject,
MeshData
) {
	'use strict';

	//RAY OBJECT
	function RayObject(entity, octreeDepth) {
		this.entity = entity;

		this.distanceToRay = -1;

		this.inverseMatrix = new Matrix4x4();
		this.regularMatrix = this.entity.transformComponent.worldTransform.matrix;

		//update the local bounds
		var meshBounds = this.updateBoundingVolumeBounds(this.entity.meshDataComponent.modelBound);

		this.octree = new Octree(this, meshBounds.min, meshBounds.max, octreeDepth);

		this.initialize();
	}

	var tmpVec1 = new Vector3();

	RayObject.prototype.updateBoundingVolumeBounds = function(boundingVolume) {
		//Update volume bounds
		var halfExtent = tmpVec1;
		halfExtent.setDirect(boundingVolume.xExtent, boundingVolume.yExtent, boundingVolume.zExtent);

		boundingVolume.min.setVector(boundingVolume.center);
		boundingVolume.min.subVector(halfExtent);

		boundingVolume.max.setVector(boundingVolume.center);
		boundingVolume.max.addVector(halfExtent);

		return boundingVolume;
	};

	RayObject.prototype.update = function() {
		//update the world bounds
		this.updateBoundingVolumeBounds(this.entity.meshRendererComponent.worldBound);
		this.updateInverse();

	};

	RayObject.prototype.updateInverse = function() {
		Matrix4x4.invert(this.regularMatrix, this.inverseMatrix);
	};


	var getVertexIndexByTriangleIndex = function(indices, triIndex, pointIndex) {
		return indices[triIndex + pointIndex]*3;
	};

	RayObject.prototype.loadTriangleData = function() {

		var meshData = this.entity.meshDataComponent.meshData;

		var vertices = meshData.getAttributeBuffer(MeshData.POSITION);

		var indices = meshData.getIndexBuffer();
		var nTriangles = indices.length / 3;

		for(var i=0; i<nTriangles; i++)
		{
			var triangleIndex = i*3;

			//an array containing an array of positions.
			var triangle = [];

			for(var k=0; k<3; k++)
			{
				triangle[k] = [];

				var vertexIndex = getVertexIndexByTriangleIndex(indices, triangleIndex, k);

				//get X Y Z
				triangle[k][0] = vertices[vertexIndex];
				triangle[k][1] = vertices[vertexIndex+1];
				triangle[k][2] = vertices[vertexIndex+2];
			}

			var surfaceObject = new SurfaceObject(this, triangle, triangleIndex);
			this.octree.pushObject(surfaceObject, surfaceObject.boundingSphere.min, surfaceObject.boundingSphere.max);
		}
	};

	RayObject.prototype.initialize = function() {
		this.updateInverse();

		//load triangle data and push to octree
		this.loadTriangleData();

		//remove useless octree nodes
		this.octree.optimize();
	};
	
	return RayObject;
});
