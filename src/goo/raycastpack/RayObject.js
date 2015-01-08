define([
	'goo/math/Vector3',
	'goo/math/Matrix4x4',
	'goo/raycastpack/Octree',
	'goo/raycastpack/SurfaceObject',
	'goo/renderer/MeshData'
],
	/** @lends */
		function (
		Vector3,
		Matrix4x4,
		Octree,
		SurfaceObject,
		MeshData
		) {
		'use strict';

	//RAY OBJECT
	function RayObject(raySystem, entity, octreeDepth){
		this.raySystem = raySystem;
		this.entity = entity;

		this.distanceToRay = -1;

		this.inverseMatrix = new Matrix4x4();
		this.regularMatrix = this.entity.transformComponent.worldTransform.matrix;

		var bounds = this.updateMeshDataBounds();

		this.octree = new Octree(this, bounds.min, bounds.max, octreeDepth);

		this.initialize();

		//push itself to RaySystem
		this.raySystem.rayObjects.push(this);
	}

	var tmpVec1 = new Vector3();

	RayObject.prototype.updateMeshDataBounds = function(){
		//Update MeshData bounds
		var bounds = this.entity.meshDataComponent.modelBound;

		halfExtent = tmpVec1;
		halfExtent.setDirect(bounds.xExtent, bounds.yExtent, bounds.zExtent);

		bounds.min.setVector(bounds.center);
		bounds.min.subVector(halfExtent);

		bounds.max.setVector(bounds.center);
		bounds.max.addVector(halfExtent);

		return bounds;
	};
	
	RayObject.prototype.updateWorldBounds = function(){
		//Update MeshRenderer bounds
		var worldBounds = this.entity.meshRendererComponent.worldBound;
		var halfExtent = tmpVec1;
		halfExtent.setDirect(worldBounds.xExtent, worldBounds.yExtent, worldBounds.zExtent);

		worldBounds.min.setVector(worldBounds.center);
		worldBounds.min.subVector(halfExtent);

		worldBounds.max.setVector(worldBounds.center);
		worldBounds.max.addVector(halfExtent);	
	};

	RayObject.prototype.update = function(){
		this.updateWorldBounds();
		this.updateInverse();

	};

	RayObject.prototype.updateInverse = function(){
		Matrix4x4.invert(this.regularMatrix, this.inverseMatrix);
	};

	RayObject.prototype.loadTriangleData = function(){
		var meshData = this.entity.meshDataComponent.meshData;

		var vertices = meshData.getAttributeBuffer(MeshData.POSITION);

		var indices = meshData.getIndexBuffer();
		var nTriangles = indices.length / 3;

		for(var i=0; i<nTriangles; i++)
		{
			var triangleIndexes = [indices[i*3], indices[i*3+1], indices[i*3+2]];

			//an array containing an array of positions.
			var triangle = [];

			for(k=0; k<3; k++)
			{
				triangle[k] = [];

				triangle[k][0] = vertices[triangleIndexes[k]*3];
				triangle[k][1] = vertices[triangleIndexes[k]*3+1];
				triangle[k][2] = vertices[triangleIndexes[k]*3+2];
			}

			var surfaceObject = new SurfaceObject(this, triangle);
			this.octree.pushObject(surfaceObject, surfaceObject.boundingSphere.min, surfaceObject.boundingSphere.max);
		}
	};

	RayObject.prototype.initialize = function(){
		this.updateInverse();

		//load triangle data and push to octree
		this.loadTriangleData();

		//remove useless octree nodes
		this.octree.optimize();
	};
	
	return RayObject;
}):
