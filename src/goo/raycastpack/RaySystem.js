define([
	'goo/math/Vector3',
	'goo/math/Ray',
	'goo/raycastpack/RayObject'
],
	/** @lends */
		function (Vector3, Ray, RayObject) {
		'use strict';

	//HIT DATA
	function HitResult(){
		this.hit = false;
		this.location = new Vector3();
		this.surfaceObject;
	}

	//RAY SYSTEM
	function RaySystem(){
		System.call(this, 'RaySystem', []);

		this.rayObjects = [];
		this.ray = new Ray();
		this.inverseDir = new Vector3();
		this.rayLength = 0;
		this.rayLengthSquare = 0;

		this.oldRayOrigin = new Vector3();
		this.oldRayDirection = new Vector3();

		this.result = new HitResult();
		this.bestResult = new HitResult();

		this.intersectedRayObjects = [];
		this.intersectedNodes = [];
	}

	RaySystem.prototype = Object.create(System.prototype);
	RaySystem.prototype.constructor = RaySystem;

	//Assumes and requires the entity to have geometry
	RaySystem.prototype.addEntity = function(entity, octreeDepth){
		if(!this.containsEntity(entity))
		{
			var rayObject = new RayObject(this, entity, octreeDepth);
			this.rayObjects.push(rayObject);
		}
	};

	RaySystem.prototype.containsEntity = function(entity){
		for(var i=0; i<this.rayObjects.length; i++)
		{
			var rayObject = this.rayObjects[i];
			if(rayObject.entity === entity)
			{
				return true;
			}
		}
		return false;
	};

	RaySystem.prototype.rayCastSurfaceObject = function(surfaceObject, doBackfaces, breakOnHit){
		//bounding sphere of triangle check
		if(!surfaceObject.intersectsBoundingSphere(this.ray)) return false;

		this.result.hit = surfaceObject.intersectsTriangle(this.ray, false, doBackfaces, this.result.location);

		if(this.result.hit)
		{
			//check if the hit is within the rays reach
			if(this.ray.origin.distanceSquared(this.result.location) > this.rayLengthSquare)
			{
				this.result.hit = false;
				return false;
			}
			if(breakOnHit) return true;

			this.result.surfaceObject = surfaceObject;

			//transform to world coordinates
			surfaceObject.rayObject.regularMatrix.applyPostPoint(this.result.location);
		}
		return false;
	};
	
	RaySystem.prototype._castBegin = function(lineStart, lineEnd)
	{
		this.ray.origin.setVector(lineStart);

		//get direction vector from start to end
		this.ray.direction.setVector(lineEnd);
		this.ray.direction.subVector(lineStart);
		
		//save old ray values
		this.oldRayOrigin.setVector(this.ray.origin);
		this.oldRayDirection.setVector(this.ray.direction);
		
		//normalizes and puts length of vector into rayLength
		this.ray.normalizeDirection();
		this.rayLength = this.ray.length;
		
		//calculates the inverse direction
		this.inverseDir.setVector(Vector3.ONE);
		this.inverseDir.div(this.ray.direction);

		//empty intersectedRayObjects array
		this.intersectedRayObjects.length = 0;
	};
	
	RaySystem.prototype._castEnd = function(hit)
	{
	};

	//raycast against all RayObject's unsorted and run hitCallback for each of the hits
	//hitCallback contains one parameter "hitResult" and returns true to continue iterating hits
	RaySystem.prototype.castCallback = function(lineStart, lineEnd, doBackfaces, hitCallback){
		
		//call the cast start
		this._castBegin(lineStart, lineEnd);
		
		this.bestResult.hit = false;

		for(var i=0; i<this.rayObjects.length; i++)
		{
			var rayObject = this.rayObjects[i];
			var entity = rayObject.entity;
			var worldBounds = entity.meshRendererComponent.worldBound;

			rayObject.distanceToRay =  this.ray.intersectsAABox(worldBounds.min, worldBounds.max, this.inverseDir);
			if(rayObject.distanceToRay && rayObject.distanceToRay <= this.rayLength)
			{
				this.intersectedRayObjects.push(rayObject);
			}
		}

		for(var i=0; i<this.intersectedRayObjects.length; i++)
		{
			//reset ray
			this.ray.origin.setVector(this.oldRayOrigin);
			this.ray.direction.setVector(this.oldRayDirection);
			
			var rayObject = this.intersectedRayObjects[i];

			rayObject.inverseMatrix.applyPostPoint(this.ray.origin);
			rayObject.inverseMatrix.applyPostVector(this.ray.direction);

			this.ray.normalizeDirection();
			this.rayLength = this.ray.length;
			this.rayLengthSquare = this.rayLength*this.rayLength;

			this.inverseDir.setVector(Vector3.ONE);
			this.inverseDir.div(this.ray.direction);

			//empty intersectedNodes list
			this.intersectedNodes.length = 0;

			//THIS IS OPEN FOR OPTIMIZATION, DO TRIANGLE LEVEL CHECKS INSIDE THE OCTREE RAYSTEP
			//raycast against octree and fill the intersectedNodes list with hit nodes
			rayObject.octree.rayStep(this.ray, this.inverseDir, this.rayLength, this.intersectedNodes, true);
			for(var j=0; j<this.intersectedNodes.length; j++)
			{
				var node = this.intersectedNodes[j];

				for(var k=0; k<node.data.length; k++)
				{
					//get surfaceObject from the node data array
					var surfaceObject = node.data[k];
					this.rayCastSurfaceObject(surfaceObject, doBackfaces, false);
					
					//run the callback and feed it the current hit result
					if(this.result.hit)
					{
						this.bestResult.hit = true;
						this.bestResult.location.setVector(this.result.location);
						this.bestResult.surfaceObject = this.result.surfaceObject;
						
						if(!hitCallback(this.result))
						{
							return this.bestResult;
						}
					}
				}
			}
		}
		
		this._castEnd(this.bestResult.hit);
		
		return this.bestResult;
	};
	
	//
	RaySystem.prototype.closestHitCompare = function()
	{
		if(this.result.hit)
		{
			var traceDistance = this.oldRayOrigin.distanceSquared(this.result.location);
			if(traceDistance < this.bestDistance || this.bestDistance == -1)
			{
				this.bestDistance = traceDistance;
				this.bestResult.hit = true;
				this.bestResult.location.setVector(this.result.location);
				this.bestResult.surfaceObject = this.result.surfaceObject;
			}
		}
	};
	
	RaySystem.prototype.sortIntersectedRayObjects = function(a, b)
	{
		return a.distanceToRay - b.distanceToRay;
	};

	
	//cast towards all entitys and return the closest hit result
	RaySystem.prototype.castClosest = function(lineStart, lineEnd, doBackfaces){
		
		//call the cast start
		this._castBegin(lineStart, lineEnd);
		
		this.bestResult.hit = false;
		this.bestDistance = -1;

		for(var i=0; i<this.rayObjects.length; i++)
		{
			var rayObject = this.rayObjects[i];
			var entity = rayObject.entity;
			var worldBounds = entity.meshRendererComponent.worldBound;

			rayObject.distanceToRay =  this.ray.intersectsAABox(worldBounds.min, worldBounds.max, this.inverseDir);
			if(rayObject.distanceToRay && rayObject.distanceToRay <= this.rayLength)
			{
				this.intersectedRayObjects.push(rayObject);
			}
		}

		this.intersectedRayObjects.sort(this.sortIntersectedRayObjects);

		for(var i=0; i<this.intersectedRayObjects.length; i++)
		{
			//reset ray
			this.ray.origin.setVector(this.oldRayOrigin);
			this.ray.direction.setVector(this.oldRayDirection);
			
			var rayObject = this.intersectedRayObjects[i];

			rayObject.inverseMatrix.applyPostPoint(this.ray.origin);
			rayObject.inverseMatrix.applyPostVector(this.ray.direction);

			this.ray.normalizeDirection();
			this.rayLength = this.ray.length;
			this.rayLengthSquare = this.rayLength*this.rayLength;

			this.inverseDir.setVector(Vector3.ONE);
			this.inverseDir.div(this.ray.direction);

			//empty intersectedNodes list
			this.intersectedNodes.length = 0;

			//THIS IS OPEN FOR OPTIMIZATION, DO TRIANGLE LEVEL CHECKS INSIDE THE OCTREE RAYSTEP
			//raycast against octree and fill intersectedNodes list with hit nodes
			rayObject.octree.rayStep(this.ray, this.inverseDir, this.rayLength, this.intersectedNodes, true);
			for(var j=0; j<this.intersectedNodes.length; j++)
			{
				var node = this.intersectedNodes[j];

				for(var k=0; k<node.data.length; k++)
				{
					//get surfaceObject from the node data array
					var surfaceObject = node.data[k];
					this.rayCastSurfaceObject(surfaceObject, doBackfaces, false);
					
					//compare for a new best hit
					this.closestHitCompare();
				}
			}
		}
		
		this._castEnd(this.bestResult.hit);
		
		return this.bestResult;
	};
	
	RaySystem.prototype.castOcclude = function(lineStart, lineEnd, doBackfaces){
		
		//call the cast start
		this._castBegin(lineStart, lineEnd);

		for(var i=0; i<this.rayObjects.length; i++)
		{
			var rayObject = this.rayObjects[i];
			var entity = rayObject.entity;
			var worldBounds = entity.meshRendererComponent.worldBound;
			
			rayObject.distanceToRay = this.ray.intersectsAABox(worldBounds.min, worldBounds.max, this.inverseDir);
			
			if(rayObject.distanceToRay && rayObject.distanceToRay <= this.rayLength)
			{
				this.intersectedRayObjects.push(rayObject);
			}
		}

		for(var i=0; i<this.intersectedRayObjects.length; i++)
		{
			//reset ray
			this.ray.origin.setVector(this.oldRayOrigin);
			this.ray.direction.setVector(this.oldRayDirection);
			
			var rayObject = this.intersectedRayObjects[i];

			rayObject.inverseMatrix.applyPostPoint(this.ray.origin);
			rayObject.inverseMatrix.applyPostVector(this.ray.direction);

			this.ray.normalizeDirection();
			this.rayLength = this.ray.length;
			this.rayLengthSquare = this.rayLength*this.rayLength;

			this.inverseDir.setVector(Vector3.ONE);
			this.inverseDir.div(this.ray.direction);

			//empty intersectedNodes list
			this.intersectedNodes.length = 0;

			//THIS IS OPEN FOR OPTIMIZATION, DO TRIANGLE LEVEL CHECKS INSIDE THE OCTREE RAYSTEP
			//raycast against octree and fill the intersectedNodes list with hit nodes
			rayObject.octree.rayStep(this.ray, this.inverseDir, this.rayLength, this.intersectedNodes, true);
			for(var j=0; j<this.intersectedNodes.length; j++)
			{
				var node = this.intersectedNodes[j];

				for(var k=0; k<node.data.length; k++)
				{
					//get surfaceObject from the node data array
					var surfaceObject = node.data[k];

					//We hit a triangle return true
					if(this.rayCastSurfaceObject(surfaceObject, doBackfaces, true)) return true;
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
		this.updateRayObjects();
	};
	
	return RaySystem;
});