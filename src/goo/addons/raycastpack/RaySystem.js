define([
	'goo/entities/systems/System',
	'goo/math/Vector3',
	'goo/math/Ray',
	'goo/addons/raycastpack/RayObject',
	'goo/addons/raycastpack/HitResult'
],

function (System, Vector3, Ray, RayObject, HitResult) {
	'use strict';

	//RAY SYSTEM
	function RaySystem() {
		System.call(this, 'RaySystem', []);

		this.rayObjects = [];
		this.worldRayFromTo = new Vector3();
		this.worldRay = new Ray();
		this.triangleRay = new Ray();

		this.result = new HitResult();
		this.bestResult = new HitResult();

		this.intersectedRayObjects = [];
		this.intersectedNodes = [];
		this.hitTriangleIndexes = [];

		//statistics
		this.rayCastsPerFrame = 0;
	}

	RaySystem.prototype = Object.create(System.prototype);
	RaySystem.prototype.constructor = RaySystem;

	//Assumes and requires the entity to have geometry
	RaySystem.prototype.addEntity = function(entity, octreeDepth) {
		if(!this.containsEntity(entity))
		{
			var rayObject = new RayObject(entity, octreeDepth);
			//push to the rayObjects array
			this.rayObjects.push(rayObject);
		}
	};

	RaySystem.prototype.containsEntity = function(entity) {
		for(var i=0; i<this.rayObjects.length; i++)
		{
			var rayObject = this.rayObjects[i];
			if(rayObject.entity.id === entity.id)
			{
				return true;
			}
		}
		return false;
	};
	
	RaySystem.prototype._castBegin = function(lineStart, lineEnd) {
		this.worldRayFromTo.setVector(lineEnd).subVector(lineStart);
		this.worldRay.constructFromTo(lineStart, lineEnd);

		//empty intersectedRayObjects array
		this.intersectedRayObjects.length = 0;

		//increase statics on how many rays we've casted
		this.rayCastsPerFrame++;
	};

	RaySystem.prototype._castHit = function(/*result*/) {
	};
	
	RaySystem.prototype._castEnd = function(/*hit*/) {
	};

	RaySystem.prototype.rayCastSurfaceObject = function(surfaceObject, doBackfaces) {
		//bounding sphere of triangle check
		if(!surfaceObject.boundingSphereIntersects(this.triangleRay))
		{
			return false;
		}
		this.result.hit = surfaceObject.triangleIntersects(this.triangleRay, doBackfaces, this.result.localHitLocation, this.result.vertexWeights);
		if(this.result.hit)
		{
			//check if the hit is within the rays reach
			if(this.triangleRay.origin.distanceSquared(this.result.localHitLocation) > this.triangleRay.lengthSquared)
			{
				this.result.hit = false;
				return false;
			}

			this.result.surfaceObject = surfaceObject;

			return true;
		}
		return false;
	};


	RaySystem.prototype.hitTriangleIndexBefore = function(triangleIndex) {
		if(this.hitTriangleIndexes.indexOf(triangleIndex) === -1) {
			this.hitTriangleIndexes.push(triangleIndex);
			return false;
		}
		return true;
	};

	//raycast against all RayObject's unsorted and run hitCallback for each of the hits
	//hitCallback contains one parameter "hitResult" and returns true to continue iterating hits
	RaySystem.prototype.castCallback = function(lineStart, lineEnd, doBackfaces, hitCallback) {
		
		//call the cast start
		this._castBegin(lineStart, lineEnd);

		this.bestResult.hit = false;

		for(var i=0; i<this.rayObjects.length; i++)
		{
			var rayObject = this.rayObjects[i];
			var entity = rayObject.entity;
			var worldBounds = entity.meshRendererComponent.worldBound;

			rayObject.distanceToRay = this.worldRay.intersectsAABox(worldBounds.min, worldBounds.max);
			if(rayObject.distanceToRay && rayObject.distanceToRay <= this.worldRay.length)
			{
				this.intersectedRayObjects.push(rayObject);
			}
		}

		for(var i=0; i<this.intersectedRayObjects.length; i++)
		{
			var rayObject = this.intersectedRayObjects[i];

			//reset ray
			this.triangleRay.origin.setVector(this.worldRay.origin);
			this.triangleRay.direction.setVector(this.worldRayFromTo);

			rayObject.inverseMatrix.applyPostPoint(this.triangleRay.origin);
			rayObject.inverseMatrix.applyPostVector(this.triangleRay.direction);
			//normalize the from-to direction
			this.triangleRay.normalizeFromToDirection();

			//empty intersectedNodes list
			this.intersectedNodes.length = 0;
			//empty hitTriangleIndexes list
			this.hitTriangleIndexes.length = 0;
			//THIS IS OPEN FOR OPTIMIZATION, DO TRIANGLE LEVEL CHECKS INSIDE THE OCTREE RAYSTEP
			//raycast against octree and fill the intersectedNodes list with hit nodes
			rayObject.octree.rayStep(this.triangleRay, this.intersectedNodes, true);
			for(var j=0; j<this.intersectedNodes.length; j++)
			{
				var node = this.intersectedNodes[j];

				for(var k=0; k<node.data.length; k++)
				{
					//get surfaceObject from the node data array
					var surfaceObject = node.data[k];
					if(!this.hitTriangleIndexBefore(surfaceObject.triangleIndex))
					{
						if (this.rayCastSurfaceObject(surfaceObject, doBackfaces))
						{
							//run the callback and feed it the current hit result
							if (this.result.hit)
							{
								this.bestResult.copyFrom(this.result);

								//run the callback with the hitResult as parameter
								if (!hitCallback(this.bestResult))
								{
									this._castEnd(false);
									return this.bestResult;
								}
								else
								{
									this._castHit(this.bestResult);
								}
							}
						}
					}
				}
			}
		}
		this._castEnd(this.bestResult.hit);

		return this.bestResult;
	};
	
	//
	RaySystem.prototype.closestHitCompare = function() {
		if(this.result.hit)
		{
			var worldHitLocation = this.result.getWorldHitLocation();

			var distanceToHit = this.worldRay.origin.distanceSquared(worldHitLocation);
			if(distanceToHit < this.bestDistance || this.bestDistance === -1)
			{
				this.bestDistance = distanceToHit;
				this.bestResult.copyFrom(this.result);
			}
		}
	};
	
	RaySystem.prototype.distanceSortRayObjects = function(a, b) {
		return a.distanceToRay - b.distanceToRay;
	};

	
	//cast towards all entitys and return the closest hit result
	RaySystem.prototype.castClosest = function(lineStart, lineEnd, doBackfaces) {
		
		//call the cast start
		this._castBegin(lineStart, lineEnd);
		
		this.bestResult.hit = false;
		this.bestDistance = -1;

		for(var i=0; i<this.rayObjects.length; i++)
		{
			var rayObject = this.rayObjects[i];
			var entity = rayObject.entity;
			var worldBounds = entity.meshRendererComponent.worldBound;

			rayObject.distanceToRay = this.worldRay.intersectsAABox(worldBounds.min, worldBounds.max);
			if(rayObject.distanceToRay && rayObject.distanceToRay <= this.worldRay.length)
			{
				this.intersectedRayObjects.push(rayObject);
			}
		}

		//no need for distance sorting since we still have to check each and every hit bounding rectangle
		//this.intersectedRayObjects.sort(this.distanceSortRayObjects);

		for(var i=0; i<this.intersectedRayObjects.length; i++)
		{
			var rayObject = this.intersectedRayObjects[i];

			//reset ray
			this.triangleRay.origin.setVector(this.worldRay.origin);
			this.triangleRay.direction.setVector(this.worldRayFromTo);

			rayObject.inverseMatrix.applyPostPoint(this.triangleRay.origin);
			rayObject.inverseMatrix.applyPostVector(this.triangleRay.direction);
			//normalize the from-to direction
			this.triangleRay.normalizeFromToDirection();

			//empty intersectedNodes list
			this.intersectedNodes.length = 0;
			//empty hitTriangleIndexes list
			this.hitTriangleIndexes.length = 0;

			//THIS IS OPEN FOR OPTIMIZATION, DO TRIANGLE LEVEL CHECKS INSIDE THE OCTREE RAYSTEP
			//raycast against octree and fill intersectedNodes list with hit nodes
			rayObject.octree.rayStep(this.triangleRay, this.intersectedNodes, true);
			for(var j=0; j<this.intersectedNodes.length; j++)
			{
				var node = this.intersectedNodes[j];

				for(var k=0; k<node.data.length; k++)
				{
					//get surfaceObject from the node data array
					var surfaceObject = node.data[k];
					if(!this.hitTriangleIndexBefore(surfaceObject.triangleIndex))
					{
						if(this.rayCastSurfaceObject(surfaceObject, doBackfaces))
						{
							//compare for a new best hit
							this.closestHitCompare();
						}
					}
				}
			}
		}

		this._castEnd(this.bestResult.hit);

		if(this.bestResult.hit)
		{
			this._castHit(this.bestResult);
		}

		return this.bestResult;
	};


	RaySystem.prototype.castOcclude = function(lineStart, lineEnd, doBackfaces) {
		
		//call the cast start
		this._castBegin(lineStart, lineEnd);

		for(var i=0; i<this.rayObjects.length; i++)
		{
			var rayObject = this.rayObjects[i];
			var entity = rayObject.entity;
			var worldBounds = entity.meshRendererComponent.worldBound;
			
			rayObject.distanceToRay = this.worldRay.intersectsAABox(worldBounds.min, worldBounds.max);
			
			if(rayObject.distanceToRay && rayObject.distanceToRay <= this.worldRay.length)
			{
				this.intersectedRayObjects.push(rayObject);
			}
		}

		for(var i=0; i<this.intersectedRayObjects.length; i++)
		{
			var rayObject = this.intersectedRayObjects[i];

			//reset ray
			this.triangleRay.origin.setVector(this.worldRay.origin);
			this.triangleRay.direction.setVector(this.worldRayFromTo);

			rayObject.inverseMatrix.applyPostPoint(this.triangleRay.origin);
			rayObject.inverseMatrix.applyPostVector(this.triangleRay.direction);
			//normalize the from-to direction
			this.triangleRay.normalizeFromToDirection();

			//empty intersectedNodes list
			this.intersectedNodes.length = 0;

			//THIS IS OPEN FOR OPTIMIZATION, DO TRIANGLE LEVEL CHECKS INSIDE THE OCTREE RAYSTEP
			//raycast against octree and fill the intersectedNodes list with hit nodes
			rayObject.octree.rayStep(this.triangleRay, this.intersectedNodes, true);
			for(var j=0; j<this.intersectedNodes.length; j++)
			{
				var node = this.intersectedNodes[j];

				for(var k=0; k<node.data.length; k++)
				{
					//get surfaceObject from the node data array
					var surfaceObject = node.data[k];

					//We hit a triangle return true
					if(this.rayCastSurfaceObject(surfaceObject, doBackfaces))
					{
						this._castEnd(true);
						//this._castHit(this.result);
						return true;
					}
				}
			}
		}
		
		this._castEnd(false);
		
		return false;
	};


	RaySystem.prototype.updateRayObjects = function() {
		for(var i=0; i<this.rayObjects.length; i++)
		{
			var rayObject = this.rayObjects[i];
			rayObject.update();
		}
	};


	RaySystem.prototype.process = function() {
		if(this.rayCastsPerFrame !== 0)
		{
			this.rayCastsPerFrame = 0;
		}
		this.updateRayObjects();
	};
	
	return RaySystem;
});