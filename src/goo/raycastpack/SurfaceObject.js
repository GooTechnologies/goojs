define([
	'goo/math/Vector3',
	'goo/renderer/bounds/BoundingSphere',
	'goo/math/MathUtils'
],
	/** @lends */
function (Vector3, BoundingSphere, MathUtils) {
		'use strict';

	//SURFACE OBJECT
	function SurfaceObject(rayObject, triangle){
		this.rayObject = rayObject;
		this.triangle = triangle;
		this.boundingSphere = new BoundingSphere();
		//Bounding radius in square(^2)
		this.boundingRadiusSquare = 0;
		this.computeBoundingSphere();
	}

	var tmpVec1 = new Vector3();
	var tmpVec2 = new Vector3();
	var tmpVec3 = new Vector3();
	var tmpVec4 = new Vector3();

	SurfaceObject.prototype.computeBoundingSphere = function(){
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

	SurfaceObject.prototype.intersectsBoundingSphere = function(ray){
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

	SurfaceObject.prototype.intersectsTriangle = function(ray, doPlanar, doBackface, locationStore)
	{
		var edge1 = tmpVec2.setArray(this.triangle[1]).subDirect(this.triangle[0][0],this.triangle[0][1],this.triangle[0][2]);
		var edge2 = tmpVec3.setArray(this.triangle[2]).subDirect(this.triangle[0][0],this.triangle[0][1],this.triangle[0][2]);
		var norm = tmpVec4.setVector(edge1).cross(edge2);

		var dirDotNorm = ray.direction.dotVector(norm);
		var sign;
		if (dirDotNorm > MathUtils.EPSILON) {
			if(!doBackface) return false;

			sign = 1.0;
		} else if (dirDotNorm < -MathUtils.EPSILON) {
			sign = -1.0;
			dirDotNorm = -dirDotNorm;
		} else {
			// ray and triangle are parallel
			return false;
		}

		var diff = tmpVec1.setVector(ray.origin).subDirect(this.triangle[0][0],this.triangle[0][1],this.triangle[0][2]);

		var dirDotDiffxEdge2 = sign * ray.direction.dotVector(Vector3.cross(diff, edge2, edge2));
		var result = false;
		if (dirDotDiffxEdge2 >= 0.0) {
			var dirDotEdge1xDiff = sign * ray.direction.dotVector(edge1.cross(diff));
			if (dirDotEdge1xDiff >= 0.0) {
				if (dirDotDiffxEdge2 + dirDotEdge1xDiff <= dirDotNorm) {
					var diffDotNorm = -sign * diff.dotVector(norm);
					if (diffDotNorm >= 0.0) {
						// ray intersects triangle
						// if locationStore is null, just return true,
						if (!locationStore) {
							return true;
						}
						// else fill in.
						var inv = 1.0 / dirDotNorm;
						var t = diffDotNorm * inv;
						if (!doPlanar) {
							locationStore.setVector(ray.origin).addDirect(ray.direction.x * t, ray.direction.y * t, ray.direction.z * t);
						} else {
							// these weights can be used to determine
							// interpolated values, such as texture coord.
							// eg. texcoord s,t at intersection point:
							// s = w0*s0 + w1*s1 + w2*s2;
							// t = w0*t0 + w1*t1 + w2*t2;
							var w1 = dirDotDiffxEdge2 * inv;
							var w2 = dirDotEdge1xDiff * inv;
							// float w0 = 1.0 - w1 - w2;
							locationStore.setDirect(t, w1, w2);
						}
						result = true;
					}
				}
			}
		}
		return result;
	};

	SurfaceObject.prototype.getNormal = function(store){
		tmpVec1.setDirect(this.triangle[0][0], this.triangle[0][1], this.triangle[0][2]);
		tmpVec2.setDirect(this.triangle[1][0], this.triangle[1][1], this.triangle[1][2]);
		tmpVec3.setDirect(this.triangle[2][0], this.triangle[2][1], this.triangle[2][2]);

		this.rayObject.regularMatrix.applyPostVector(tmpVec1);
		this.rayObject.regularMatrix.applyPostVector(tmpVec2);
		this.rayObject.regularMatrix.applyPostVector(tmpVec3);

		tmpVec3.subVector(tmpVec1);
		tmpVec2.subVector(tmpVec1);

		tmpVec2.cross(tmpVec3);

		tmpVec2.normalize();

		store.setVector(tmpVec2);
		return store;
	};

	SurfaceObject.prototype.reflectVector = function(vector, store){
		this.getNormal(tmpVec1);
		tmpVec1.mul(tmpVec1.dot(vector)*2.0);
		store.setVector(vector);
		store.subVector(tmpVec1);
		return store;
	};

	return SurfaceObject;
});