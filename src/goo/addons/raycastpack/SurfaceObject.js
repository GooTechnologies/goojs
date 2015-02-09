define([
	'goo/math/Vector3',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/MathUtils'
],

function (Vector3, BoundingSphere, MathUtils) {
		'use strict';

	//SURFACE OBJECT
	function SurfaceObject(rayObject, triangle, triangleIndex){
		this.rayObject = rayObject;
		this.triangle = triangle;
		this.triangleIndex = triangleIndex;
		this.boundingSphere = new BoundingSphere();

		//cache variables below
		this.edge1 = new Vector3();
		this.edge2 = new Vector3();
		this.edge1CrossEdge2 = new Vector3();
		this.localNormal = new Vector3();
		this.boundingRadiusSquare = 0;

		this.updateCache();
	}

	var tmpVec1 = new Vector3();
	var tmpVec2 = new Vector3();
	var tmpVec3 = new Vector3();
	var tmpVec4 = new Vector3();
	
	SurfaceObject.prototype.computeBoundingSphere = function() {
		this.boundingRadiusSquare = 0;

		//loop over all triangle points and define min and max values
		for(var i=0; i<3; i++)
		{
			var x = this.triangle[i][0];
			var y = this.triangle[i][1];
			var z = this.triangle[i][2];

			this.boundingSphere.min.x = x < this.boundingSphere.min.x ? x : this.boundingSphere.min.x;
			this.boundingSphere.min.y = y < this.boundingSphere.min.y ? y : this.boundingSphere.min.y;
			this.boundingSphere.min.z = z < this.boundingSphere.min.z ? z : this.boundingSphere.min.z;

			this.boundingSphere.max.x = x > this.boundingSphere.max.x ? x : this.boundingSphere.max.x;
			this.boundingSphere.max.y = y > this.boundingSphere.max.y ? y : this.boundingSphere.max.y;
			this.boundingSphere.max.z = z > this.boundingSphere.max.z ? z : this.boundingSphere.max.z;
		}

		this.boundingSphere.center.setVector(this.boundingSphere.max);
		this.boundingSphere.center.addVector(this.boundingSphere.min);
		this.boundingSphere.center.mul(0.5);

		//calculate squared distances of the triangle points
		for(var i=0; i<3; i++)
		{
			var x = this.triangle[i][0] - this.boundingSphere.center.x;
			var y = this.triangle[i][1] - this.boundingSphere.center.y;
			var z = this.triangle[i][2] - this.boundingSphere.center.z;

			var distanceSquare = x*x + y*y + z*z;

			if(distanceSquare >= this.boundingRadiusSquare) this.boundingRadiusSquare = distanceSquare;
		}
		this.boundingSphere.radius = Math.sqrt(this.boundingRadiusSquare);
	};
	
	SurfaceObject.prototype.updateCache = function() {
		this.computeBoundingSphere();
		
		//calculate edges 1 and 2 of the triangle
		this.edge1.setArray(this.triangle[1]).subDirect(this.triangle[0][0],this.triangle[0][1],this.triangle[0][2]);
		this.edge2.setArray(this.triangle[2]).subDirect(this.triangle[0][0],this.triangle[0][1],this.triangle[0][2]);

		//calculate cross
		this.edge1CrossEdge2.setVector(this.edge1).cross(this.edge2);

		//normalize the cross which gives a unit-normal
		this.localNormal.setVector(this.edge1CrossEdge2);
		this.localNormal.normalize();
	};

	SurfaceObject.prototype.boundingSphereIntersects = function(ray) {
		var diff = tmpVec1.setVector(ray.origin).subVector(this.boundingSphere.center);
		var a = diff.dotVector(diff) - this.boundingRadiusSquare;
		if (a <= 0) {
			// in sphere
			return true;
		}

		// outside sphere
		var b = ray.direction.dotVector(diff);

		return b * b >= a;
	};

	SurfaceObject.prototype.triangleIntersects = function(ray, doBackface, locationStore, vertexWeights) {
		var dirDotNorm = ray.direction.dotVector(this.edge1CrossEdge2);
		var sign;
		if (dirDotNorm > MathUtils.EPSILON) {
			if(!doBackface) {
				return false;
			}

			sign = 1.0;
		} else if (dirDotNorm < -MathUtils.EPSILON) {
			sign = -1.0;
			dirDotNorm = -dirDotNorm;
		} else {
			// ray and triangle are parallel
			return false;
		}

		var diff = tmpVec1.setVector(ray.origin).subDirect(this.triangle[0][0],this.triangle[0][1],this.triangle[0][2]);

		var diffEdge2Cross = tmpVec2.setVector(diff).cross(this.edge2);
		var edge1DiffCross = tmpVec3.setVector(this.edge1).cross(diff);

		var dirDotDiffxEdge2 = sign * ray.direction.dotVector(diffEdge2Cross);
		var result = false;
		if (dirDotDiffxEdge2 >= 0.0) {
			var dirDotEdge1xDiff =sign * ray.direction.dotVector(edge1DiffCross);
			if (dirDotEdge1xDiff >= 0.0) {
				if (dirDotDiffxEdge2 + dirDotEdge1xDiff <= dirDotNorm) {
					var diffDotNorm = -sign * diff.dotVector(this.edge1CrossEdge2);
					if (diffDotNorm >= 0.0) {
						// ray intersects triangle

						var inv = 1.0 / dirDotNorm;
						var t = diffDotNorm * inv;

						if(vertexWeights) {
							//calculate the vertex weights
							vertexWeights[1] = dirDotDiffxEdge2*inv;
							vertexWeights[2] = dirDotEdge1xDiff*inv;
							vertexWeights[0] = 1-vertexWeights[1]-vertexWeights[2];
						}

						if (locationStore) {
							locationStore.setVector(ray.direction).mul(t).addVector(ray.origin);
						}
						result = true;
					}
				}
			}
		}
		return result;
	};

	SurfaceObject.prototype.isFacingLocalRay = function(ray) {
		return ray.direction.dotVector(this.localNormal) < 0;
	};
	
	//return a non unit normal vector
	SurfaceObject.prototype.getLocalNormal = function(store) {
		store.setVector(this.localNormal);
		return store;
	};

	//return a unit world vector
	SurfaceObject.prototype.getNormal = function(store) {
		//get local normal
		this.getLocalNormal(store);
		//transform local normal to worldspace
		this.rayObject.regularMatrix.applyPostVector(store);
		store.normalize();
		return store;
	};

	SurfaceObject.prototype.reflectVector = function(vector, store) {
		this.getNormal(tmpVec1);
		this.tmpVec1.mul(this.tmpVec1.dot(vector)*2.0);
		store.setVector(vector);
		store.subVector(tmpVec1);
		return store;
	};


	return SurfaceObject;
});