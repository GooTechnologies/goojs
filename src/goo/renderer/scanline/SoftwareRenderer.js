// REVIEW: This file has become very big (>2500 lines). Hard to get an overview. Extract functionality into  modules!
// Suggestion: Move bounding box related functions to its own module
// (maybe two modules: bounding sphere and bounding box).

// REVIEW: Run JSHint on this file. It has several warnings.

// REVIEW: Remove unused code, and request re-review. It's too much to review now!

define([
	'goo/renderer/Camera',
	'goo/renderer/scanline/Triangle',
	'goo/math/Vector2',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/math/Matrix4x4',
	'goo/renderer/scanline/Edge',
	'goo/renderer/bounds/BoundingSphere',
	'goo/renderer/bounds/BoundingBox'
	],
	/** @lends SoftwareRenderer */

	function (Camera, Triangle, Vector2, Vector3, Vector4, Matrix4x4, Edge, BoundingSphere, BoundingBox) {
	    "use strict";

        // Cohen-Sutherland area constants.
        // (Clipping method for the bounding box)
        /*jshint bitwise: false */
        var INSIDE = 0x0;	// 0000
        var LEFT = 0x1;	// 0001
        var RIGHT = 0x2;	// 0010
        var BELOW = 0x4;	// 0100
        var ABOVE = 0x8;	// 1000
        /*jshint bitwise: true */

	/**
	*	@class A software renderer able to render triangles to a depth buffer (w-buffer). Occlusion culling is also performed in this class.
	*	@constructor
	*	@param {{width:Number, height:Number, camera:Camera}} parameters A JSON object which has to contain width, height and the camera object to be used.
	*/
	function SoftwareRenderer (parameters) {
		parameters = parameters || {};

		this.width = parameters.width;
		this.height = parameters.height;

		this._clipY = this.height - 1;
		this._clipX = this.width - 1;

		this.camera = parameters.camera;

		// Pre-allocate memory for the edges.
		this._edges = new Array(3);

		var numOfPixels = this.width * this.height;

		var colorBytes = numOfPixels * 4 * Uint8Array.BYTES_PER_ELEMENT;
		var depthBytes = numOfPixels * Float32Array.BYTES_PER_ELEMENT;

		this._frameBuffer = new ArrayBuffer(colorBytes + depthBytes * 2);

		// The color data is used for debugging purposes.
		this._colorData = new Uint8Array(this._frameBuffer, 0, numOfPixels * 4);
		this._depthData = new Float32Array(this._frameBuffer, colorBytes, numOfPixels);
		// Buffer for clearing.
		this._depthClear = new Float32Array(this._frameBuffer, colorBytes + depthBytes, numOfPixels);

		for (var i = 0; i < numOfPixels; i++) {
			this._depthClear[i] = 0.0;
		}

		this._boundingBoxEdgeIndices = this._generateBoundingBoxEdgeIndices();
		this._boundingBoxTriangleIndices = new Uint8Array(12 * 3);

		var triIndices = [
							0,3,4,
							3,7,4,
							0,4,5,
							0,5,1,
							2,1,5,
							2,5,6,
							3,2,6,
							3,6,7,
							0,1,2,
							0,2,3,
							5,4,6,
							7,6,4
						];

		this._boundingBoxTriangleIndices.set(triIndices, 0);

		this.testTriangles = [
			new Triangle(new Vector3(0.2, 0.1, 1.0), new Vector3(0.1, 0.4, 1.0), new Vector3(0.3, 0.3, 1.0)),
			new Triangle(new Vector3(0.5, 0.1, 1.0), new Vector3(0.4, 0.3, 1.0), new Vector3(0.6, 0.4, 1.0)),
			new Triangle(new Vector3(0.8, 0.1, 1.0), new Vector3(0.7, 0.4, 1.0), new Vector3(0.9, 0.4, 1.0)),
			new Triangle(new Vector3(0.1, 0.5, 1.0), new Vector3(0.1, 0.9, 1.0), new Vector3(0.3, 0.7, 1.0)),
			new Triangle(new Vector3(0.15, 0.5, 1.0), new Vector3(0.5, 0.55, 1.0), new Vector3(0.86, 0.5, 1.0)),
			new Triangle(new Vector3(0.7, 0.7, 1.0), new Vector3(0.9, 0.5, 1.0), new Vector3(0.9, 0.9, 1.0))
		];
	}

	SoftwareRenderer.prototype._generateBoundingBoxEdgeIndices = function () {
		var edgeArray = new Array(12);

		edgeArray[0] = [0, 1];
		edgeArray[1] = [1, 2];
		edgeArray[2] = [2, 3];
		edgeArray[3] = [3, 0];
		edgeArray[4] = [4, 5];
		edgeArray[5] = [5, 6];
		edgeArray[6] = [6, 7];
		edgeArray[7] = [7, 0];
		edgeArray[8] = [0, 4];
		edgeArray[9] = [1, 5];
		edgeArray[10] = [2, 6];
		edgeArray[11] = [3, 7];

		return edgeArray;
	};

	/**
	*	Clears the depth data.
	*/
	SoftwareRenderer.prototype._clearDepthData = function () {

		this._depthData.set(this._depthClear);
	};

	/**
	*	Renders z-buffer (w-buffer) from the given renderList of entities with OccluderComponents.
	*
	*	@param {Array.<Entity>} renderList The array of entities with attached OccluderComponents.
	*/
	SoftwareRenderer.prototype.render = function (renderList) {

		this._clearDepthData();

		var cameraViewMatrix = this.camera.getViewMatrix();
		var cameraProjectionMatrix = this.camera.getProjectionMatrix();

		// Iterates over the view frustum culled entities and draws them one entity at a time.
		for ( var i = 0; i < renderList.length; i++) {
			var triangles = this._createTrianglesForEntity(renderList[i], cameraViewMatrix, cameraProjectionMatrix);

			for (var t = 0; t < triangles.length; t++) {
				this._renderTriangle(triangles[t]);
			}
		}
	};

	/**
     * Performs occlusion culling for the given array of Entities. A new array is returned with the visibile Entities.
	*	@param {Array.<Entity>} renderList The array of entities which are possible occludees.
     *  @returns {Array.<Entity>} visibleEntities The array of entities which are visible after occlusion culling has been applied.
	*/
	SoftwareRenderer.prototype.performOcclusionCulling = function (renderList) {

		var cameraViewMatrix = this.camera.getViewMatrix();
		var cameraProjectionMatrix = this.camera.getProjectionMatrix();
		var cameraViewProjectionMatrix = Matrix4x4.combine(cameraProjectionMatrix, cameraViewMatrix);
		var cameraNearZInWorld = -this.camera.near;
        var visibleEntities = [];

		for (var i = 0; i < renderList.length; i++) {
			var entity = renderList[i];
			if (entity.meshRendererComponent.cullMode !== 'NeverOcclusionCull') {

				var cull;

				if (entity.meshDataComponent.modelBound instanceof BoundingSphere) {
					// The bounding sphere occlusion culling have some different methods to test occlusion.
                    // Those are determined in the below method.
					cull = this._boundingSphereOcclusionCulling(entity, cameraViewMatrix, cameraProjectionMatrix, cameraNearZInWorld);
				} else if (entity.meshDataComponent.modelBound instanceof BoundingBox) {
					cull = this._boundingBoxOcclusionCulling(entity, cameraViewProjectionMatrix);
					//cull = this._renderedBoundingBoxOcclusionTest(entity, cameraViewProjectionMatrix);
				}

				if (!cull) {
                    visibleEntities.push(entity);
				}
			} else {
                visibleEntities.push(entity);
            }
		}

        return visibleEntities;
	};

	/**
	*	Generates a array of homogeneous vertices for a entity's bounding box.
	*	// TODO : These vertices should probably be saved as a typed array for each object which
	*	need to have occludee possibilities.
	*
	*
	*	@return {Array.<Vector4>} vertex array
	*/
	SoftwareRenderer.prototype._generateBoundingBoxVertices = function (entity) {
		var boundingBox = entity.meshDataComponent.modelBound;

		// Create the 8 vertices which create the bounding box.
		var x = boundingBox.xExtent;
		var y = boundingBox.yExtent;
		var z = boundingBox.zExtent;

		var v1 = new Vector4(-x, y, -z, 1.0);
		var v2 = new Vector4(-x, y, z, 1.0);
		var v3 = new Vector4(x, y, z, 1.0);
		var v4 = new Vector4(x, y, -z, 1.0);

		var v5 = new Vector4(-x, -y, -z, 1.0);
		var v6 = new Vector4(-x, -y, z, 1.0);
		var v7 = new Vector4(x, -y, z, 1.0);
		var v8 = new Vector4(x, -y, -z, 1.0);

		return [v1, v2, v3, v4, v5, v6, v7, v8];
	};

        /**
         * Creates an array of triangles and transforms them to projection space. Null is returned if any of the vertices
         * cut the near plane.
         * @param entity
         * @param cameraViewProjectionMatrix
         * @returns {Array.<Triangle>} triangles or null if early exit is found.
         * @private
         */
	SoftwareRenderer.prototype._createProjectedTrianglesForBoundingBox = function (entity, cameraViewProjectionMatrix) {

		var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;

		// Combine the entity world transform and camera view matrix, since nothing is calculated between these spaces
		var combinedMatrix = Matrix4x4.combine(cameraViewProjectionMatrix, entityWorldTransformMatrix);

		var vertices = this._generateBoundingBoxVertices(entity);
		// Projection transform + homogeneous divide for every vertex.
		// Early exit on near plane clip.
		for (var j = 0; j < vertices.length; j++) {
			var v = vertices[j];

			combinedMatrix.applyPost(v);

			if (v.data[3] < this.camera.near) {
				// Near plane clipped.
				//console.log("Early exit on near plane clipped.");
				return null;
			}

			var div = 1.0 / v.data[3];
			v.data[0] *= div;
			v.data[1] *= div;
		}

		var triangles = [];
		// Create triangles.
		for (var i = 0; i < this._boundingBoxTriangleIndices.length; i++) {

			var v1 = new Vector4();
			var v2 = new Vector4();
			var v3 = new Vector4();

			v1.data.set(vertices[this._boundingBoxTriangleIndices[i]].data);
			i++;
			v2.data.set(vertices[this._boundingBoxTriangleIndices[i]].data);
			i++;
			v3.data.set(vertices[this._boundingBoxTriangleIndices[i]].data);

			var projectedVertices = [v1, v2, v3];

			if (this._isBackFacingProjected(v1, v2, v3)) {
				continue;
			}

			this._transformToScreenSpace(projectedVertices);

			triangles.push(new Triangle(projectedVertices[0], projectedVertices[1], projectedVertices[2]));
		}

		return triangles;
	};

	/**
	*	@return {Boolean} occluded or not occluded.
	*/
	SoftwareRenderer.prototype._renderedBoundingBoxOcclusionTest = function (entity, cameraViewProjectionMatrix) {

		var triangles = this._createProjectedTrianglesForBoundingBox(entity, cameraViewProjectionMatrix);

		// Triangles will be false on near plane clip.
		// Considering this case to be visible.
		if (triangles === null) {
			return false;
		}

        var triCount = triangles.length;
		for (var t = 0; t < triCount; t++) {
			if (!this._isRenderedTriangleOccluded(triangles[t])){
				return false;
			}
		}

		return true;
	};

	SoftwareRenderer.prototype._boundingBoxOcclusionCulling = function (entity, cameraViewProjectionMatrix) {

		var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;

		var combinedMatrix = Matrix4x4.combine(cameraViewProjectionMatrix, entityWorldTransformMatrix);

		var vertices = this._generateBoundingBoxVertices(entity);

		// TODO: Combine the transforms to pixel space.
		// Projection transform + homogeneous divide
		for (var i = 0; i < vertices.length; i++) {
			var v = vertices[i];

			combinedMatrix.applyPost(v);

			if (v.w < this.camera.near) {
				// Near plane clipped.
				console.log("Early exit on near plane clipped.");
				return false;
			}

			var div = 1.0 / v.w;
			v.x *= div;
			v.y *= div;

			// For interpolating in screen space, in the clipping method.
			v.w = 1.0 / v.w;
		}

		this._transformToScreenSpace(vertices);

        // The array contains the min and max x- and y-coordinates as well as the min depth.
        // order : [minX, maxX, minY, maxY, minDepth]
        var minmaxArray = this._cohenSutherlandClipBox(vertices, minmaxArray);

		// Round values from the clipping conservatively to integer pixel coordinates.
		/*jshint bitwise: false */
		minmaxArray[0] = Math.floor(minmaxArray[0]) |0;
		minmaxArray[1] = Math.ceil(minmaxArray[1]) |0;
		minmaxArray[2] = Math.floor(minmaxArray[2]) |0;
		minmaxArray[3] = Math.ceil(minmaxArray[3]) |0;
		/*jshint bitwise: true */

		return this._isBoundingBoxScanlineOccluded(minmaxArray);
	};

	/**
	*	Clips the bounding box's screen space transformed vertices and outputs the minimum and maximum x- and y-coordinates as well as the minimum depth.
	*	This is a implementation of the Cohen-Sutherland clipping algorithm. The x- and y-coordinates are only valid for comparing as min or max coordinate
	*	if the coordinate is inside the clipping window. The depth is always taken into consideration, which will be overly conservative at some cases, but without doing this,
	*	it will be non-conservative in some cases.
	*
	*	@param {Array.<Vector>} vertices Array of screen space transformed vertices.
	*	@returns {Array.<Number>} minmaxArray Array to which the minimum and maximum values are written.
	*/
	SoftwareRenderer.prototype._cohenSutherlandClipBox = function (vertices) {
		/*
		*	http://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland
		*	https://www.cs.drexel.edu/~david/Classes/CS430/Lectures/L-03_XPM_2DTransformations.6.pdf
		*	http://www.cse.buffalo.edu/faculty/walters/cs480/NewLect9.pdf
		*	https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Bitwise_Operators
		*/

		// REVIEW: The use of minmaxArray is not easy to read.
		// Create local variables minX, maxX, minY, maxY, minDepth instead,
		// so you can use e.g. maxX instead of minmaxArray[1].
		// And return the array instead of getting it as an argument.
        var minX, maxX, minY, maxY, minDepth;
        minX = Infinity;
        maxX = -Infinity;
        minY = Infinity;
        maxY = -Infinity;
        // NOTE: The depth is inversed at this point, (1 / w), the minimum depth is the largest.
        minDepth = -Infinity;


		/*jshint bitwise: false */
		var outCodes = new Array(8);
		for (var i = 0; i < 8; i++) {
			var vert = vertices[i];
			var code = this._calculateOutCode(vert);
			outCodes[i] = code;
			if (code === INSIDE) {
				// this vertex is inside the screen and shall be used to find minimum and maximum values.

                // Check min depth (Inverted)
                minDepth = Math.max(minDepth, vert.data[3]);

				// Minimum and maximum X
                var xValue = vert.data[0];
                minX = Math.min(minX, xValue);
                maxX = Math.max(maxX, xValue);

                // Minimum and maximum Y
                var yValue = vert.data[1];
                minY = Math.min(minY, yValue);
                maxY = Math.max(maxY, yValue);
			}
		}

		var tempVec = new Vector2(0,0);
		// Go through the edges of the bounding box to clip them if needed.
		for (var edgeIndex = 0; edgeIndex < 12; edgeIndex++) {

			var edgePair = this._boundingBoxEdgeIndices[edgeIndex];
			var vIndex1 = edgePair[0];
			var vIndex2 = edgePair[1];

			var v1 = vertices[vIndex1];
			var outcode1 = outCodes[vIndex1];
			var v2 = vertices[vIndex2];
			var outcode2 = outCodes[vIndex2];

			while (true) {
				/*
				// Initial check if the edge lies inside...
				// Will only be true if both the codes are 0000. 
				// 0000 | 0000 => 0000 , !0 => true
				// 0011 | 0000 => 0011, !0011 => false
				if (!(outcode1 | outcode2)) {
					//console.log("Entirely inside");
					break;
				}
				// ...or outside
				// will only be non-zero when the two endcodes are in
				// the aligned vertical or horizontal areas outside the clipping window.
				if (outcode1 & outcode2) {
					//console.log("Entirely outside");
					break;
				}
				*/

				// Combined the cases since nothing special is done depending if the lines are
				// entirely inside or outside.
				if (!(outcode1 | outcode2) || outcode1 & outcode2) {
					break;
				}

				// Pick the code which is outside. (not 0). This point is outside the clipping window.
				var outsideCode = outcode1 ? outcode1 : outcode2;
				// ratio for interpolating depth and translating to the intersection coordinate.
				var ratio;
				// nextCode is the intersection coordinate's outcode.
				var nextCode;

				// Checking for match in bitorder, starting with ABOVE == 1000, then BELOW == 0100,
				// 0010 and 0001.
				if (outsideCode & ABOVE) {
					ratio = ((this._clipY - v1.data[1]) / (v2.data[1] - v1.data[1]));
					tempVec.data[0] = v1.data[0] + (v2.data[0] - v1.data[0]) * ratio;
					tempVec.data[1] = this._clipY;

					// Only check for minmax x and y if the new coordinate is inside.
                    // [minX, maxX, minY, maxY, minDepth];
					nextCode = this._calculateOutCode(tempVec);
					if (nextCode === INSIDE) {
						maxY = this._clipY;
                        // Minmax X
                        var xValue = tempVec.data[0];
                        minX = Math.min(minX, xValue);
                        maxX = Math.max(maxX, xValue);
					}
				} else if (outsideCode & BELOW) {
					ratio = (-v1.data[1] / (v2.data[1] - v1.data[1]));
					tempVec.data[0] = v1.data[0] + (v2.data[0] - v1.data[0]) * ratio;
					tempVec.data[1] = 0;

					// Only check for minmax x and y if the new coordinate is inside.
					nextCode = this._calculateOutCode(tempVec);
					if (nextCode === INSIDE) {
						minY = 0;
						// Minmax X
                        var xValue = tempVec.data[0];
                        minX = Math.min(minX, xValue);
                        maxX = Math.max(maxX, xValue);
					}
				} else if (outsideCode & RIGHT) {
					ratio = ((this._clipX - v1.data[0]) / (v2.data[0] - v1.data[0]));
					tempVec.data[1] = v1.data[1] + (v2.data[1] - v1.data[1]) * ratio;
					tempVec.data[0] = this._clipX;

					nextCode = this._calculateOutCode(tempVec);
					if (nextCode === INSIDE) {
						maxX = this._clipX;
                        // Minimum and maximum Y
                        var yValue = tempVec.data[1];
                        minY = Math.min(minY, yValue);
                        maxY = Math.max(maxY, yValue);
					}
				} else if (outsideCode & LEFT) {
					ratio = (-v1.data[0] / (v2.data[0] - v1.data[0]));
					tempVec.data[1] = v1.data[1] + (v2.data[1] - v1.data[1]) * ratio;
					tempVec.data[0] = 0;

					nextCode = this._calculateOutCode(tempVec);
					if (nextCode === INSIDE) {
						minX = 0;
                        // Minimum and maximum Y
                        var yValue = tempVec.data[1];
                        minY = Math.min(minY, yValue);
                        maxY = Math.max(maxY, yValue);
					}
				}

				// Calculate outcode for the new position, overwrite the code which was outside.
				var depth;
				if (outsideCode === outcode1) {
					outcode1 = nextCode;
					// Interpolate the depth.
					depth = (1.0 - ratio) * v1.data[3] + ratio * v2.data[3];
				} else {
					outcode2 = nextCode;
					depth = (1.0 - ratio) * v2.data[3] + ratio * v1.data[3];
				}

                // Check min depth (Inverted)
                minDepth = Math.max(minDepth, depth);
			}
		}
		/*jshint bitwise: true */

        return  [minX, maxX, minY, maxY, minDepth];
	};

	/**
	*	Calculates outcode for a coordinate in screen pixel space used by the Coher-Sutherland clipping algorithm.
	*	The number returned is possibly a combination of the five different bit-coded areas used in the clipping algorithm.
    *   @param {Vector} coordinate
	*	@return {Number} outcode A possible combination of 0000, 0001, 0010, 0100 and 1000. 
	*/
	SoftwareRenderer.prototype._calculateOutCode = function (coordinate) {

		// Regard the coordinate as being inside the clip window initially.
		var outcode = INSIDE;
		/*jshint bitwise: false */
		if (coordinate.data[0] < 0) {
			outcode |= LEFT;
		} else if (coordinate.data[0] > this._clipX) {
			outcode |= RIGHT;
		}

		if (coordinate.data[1] < 0) {
			outcode |= BELOW;
		} else if (coordinate.data[1] > this._clipY) {
			outcode |= ABOVE;
		}
		/* jshint bitwise: true */
		return outcode;
	};

	/**
	*	Creates a screen space axis aligned box from the min and max values.
	*	The depth buffer is checked for each pixel the box covers against the nearest depth of the Bounding Box.
	*	@return {Boolean} occluded or not occluded.
	*/
	SoftwareRenderer.prototype._isBoundingBoxScanlineOccluded = function (minmaxArray) {
		// Run the scanline test for each row [maxY, minY] , [minX, maxX]
		for (var scanline = minmaxArray[3]; scanline >= minmaxArray[2]; scanline--) {
			var sampleCoordinate = scanline * this.width + minmaxArray[0];
			for (var x = minmaxArray[0]; x <= minmaxArray[1]; x++) {
				this._colorData.set([0,0,255], sampleCoordinate * 4); // create some blue ( DEBUGGING ).
				if (this._depthData[sampleCoordinate] < minmaxArray[4]) {
					return false;
				}
				sampleCoordinate++;
			}
		}

		return true;
	};

        /**
         * Return true if the object is occluded.
         * @param entity
         * @param cameraViewMatrix
         * @param cameraProjectionMatrix
         * @param cameraNearZInWorld
         * @returns {Boolean} occluded or not occluded
         * @private
         */
	SoftwareRenderer.prototype._boundingSphereOcclusionCulling = function (entity, cameraViewMatrix, cameraProjectionMatrix, cameraNearZInWorld) {

		var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
		var combinedMatrix = Matrix4x4.combine(cameraViewMatrix, entityWorldTransformMatrix);

		var boundingSphere = entity.meshDataComponent.modelBound;
		var origin = new Vector4(0, 0, 0, 1);
		combinedMatrix.applyPost(origin);

		var scale = entity.transformComponent.transform.scale;
		// REVIEW: Don't call private method (_maxAxis).
		// Create a maxAxis function in Vector and call it from here instead.
		// Also remove BoundingSphere._maxAxis and use Vector.maxAxis instead.
		var radius = scale.maxAxis() * boundingSphere.radius;

		/*
		Compensate for perspective distortion of the sphere.
		http://article.gmane.org/gmane.games.devel.algorithms/21697/
		http://www.gamasutra.com/view/feature/2942/the_mechanics_of_robust_stencil_.php?page=6
		http://www.nickdarnell.com/2010/06/hierarchical-z-buffer-occlusion-culling/
		Bounds.w == radius.
		float fRadius = CameraSphereDistance * tan(asin(Bounds.w / CameraSphereDistance));
		*/
		var cameraToSphereDistance = Math.sqrt(origin.x * origin.x + origin.y * origin.y + origin.z * origin.z);

		// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/asin
		// The asin method returns a numeric value between -pi/2 and pi/2 radians for x between -1 and 1. If the value of number is outside this range, it returns NaN.
		if (cameraToSphereDistance <= radius ) {
			return false;
		}
		// REVIEW: Reusing the radius variable here, but with another value (what is it?).
		// Use a separate variable for this new value, giving it a name that explains what it is.
		radius = cameraToSphereDistance * Math.tan(Math.asin(radius / cameraToSphereDistance));

		// The coordinate which is closest to the near plane should be at one radius step closer to the camera.
		var nearCoord = new Vector4(origin.x, origin.y, origin.z + radius, origin.w);

		if (nearCoord.z > cameraNearZInWorld) {
			// The bounding sphere intersects the near plane, assuming to have to draw the entity by default.
			return false;
		}

		var leftCoord = new Vector4(origin.x - radius, origin.y, origin.z, 1.0);
		var rightCoord = new Vector4(origin.x + radius, origin.y, origin.z, 1.0);
		var topCoord = new Vector4(origin.x, origin.y + radius, origin.z, 1.0);
		var bottomCoord = new Vector4(origin.x , origin.y - radius, origin.z, 1.0);

		var vertices = [nearCoord, leftCoord, rightCoord, topCoord, bottomCoord];

		// TODO : Create a combined matrix of the projection and screenspace
		this._projectionTransform(vertices, cameraProjectionMatrix);
		this._transformToScreenSpace(vertices);

		// Some conservative rounding of the coordinates to integer pixel coordinates.
		leftCoord.x = Math.floor(leftCoord.x);
		leftCoord.y = Math.round(leftCoord.y);

		rightCoord.x = Math.ceil(rightCoord.x);
		rightCoord.y = Math.round(rightCoord.y);

		topCoord.x = Math.round(topCoord.x);
		topCoord.y = Math.ceil(topCoord.y);

		bottomCoord.x = Math.round(bottomCoord.x);
		bottomCoord.y = Math.floor(bottomCoord.y);

		nearCoord.x = Math.round(nearCoord.x);
		nearCoord.y = Math.round(nearCoord.y);


		var green = [0, 255, 0];
        /*
        var red = [255, 0, 0];
		var blue = [0, 0, 255];
		var yellow = [255, 255, 0];
		var pink = [255, 0, 255];
		var cyan = [0, 190, 190];
		*/

		var nearestDepth = 1.0 / nearCoord.w;

		// Executes the occluded test in the order they are put, exits the case upon any false value.
		// TODO: Test for best order of early tests.
		/*
		this._isOccluded(topCoord, yellow, nearestDepth);
		this._isOccluded(leftCoord, blue, nearestDepth);
		this._isOccluded(rightCoord, green, nearestDepth);
		this._isOccluded(bottomCoord, yellow, nearestDepth);
		this._isOccluded(nearCoord, red, nearestDepth);
		*/

		/*
		return (this._isOccluded(topCoord, yellow, nearestDepth)
			&& this._isOccluded(leftCoord, blue, nearestDepth)
			&& this._isOccluded(rightCoord, green, nearestDepth)
			&& this._isOccluded(bottomCoord, yellow, nearestDepth)
			&& this._isOccluded(nearCoord, red, nearestDepth)
			&& this._isPythagorasCircleScanlineOccluded(topCoord, bottomCoord, rightCoord, leftCoord, nearestDepth, pink));
		*/

		//return this._isPythagorasCircleScanlineOccluded(topCoord, bottomCoord, rightCoord, leftCoord, nearestDepth, pink);
		return this._isSSAABBScanlineOccluded(leftCoord, rightCoord, topCoord, bottomCoord, green, nearestDepth);
	};

	/**
	*	Creates a screen space axis aligned bounding box from the bounding sphere's
	*	coordinates and performs scanline tests against the depthbuffer with the given nearest depth.
	*
	*	@return {Boolean} occluded or not occluded.
	*/
	SoftwareRenderer.prototype._isSSAABBScanlineOccluded = function (leftCoordinate, rightCoordinate, topCoordinate, bottomCoordinate, color, nearestDepth) {

		var leftX = leftCoordinate.x;
		var rightX = rightCoordinate.x;

		var firstScanline = topCoordinate.y;
		var lastScanline = bottomCoordinate.y;

		// Round the values to create a conservative check.
		leftX = Math.floor(leftX);
		rightX = Math.ceil(rightX);
		firstScanline = Math.ceil(firstScanline);
		lastScanline = Math.floor(lastScanline);

		if (leftX < 0) {
			leftX = 0;
		}

		if (rightX > this._clipX) {
			rightX = this._clipX;
		}

		if (firstScanline > this._clipY) {
			firstScanline = this._clipY;
		}

		if (lastScanline < 0) {
			lastScanline = 0;
		}

		// Scanline check the interval [firstScanline, lastScanline].
		// Iterating downwards!
		for (var y = firstScanline; y >= lastScanline; y--) {
			var sampleCoord = y * this.width + leftX;
			// Check interval [leftX, rightX].
			for (var x = leftX; x <= rightX; x++) {
				// Debug, add color where scanline samples are taken.
				this._colorData.set(color, sampleCoord * 4);

				if(this._depthData[sampleCoord] < nearestDepth) {
					// Early exit if the sample is visible.
					return false;
				}
				sampleCoord++;
			}
		}

		return true;
	};

        /**
         * Apprixmates the sphere to a circle using pythagoras.
         * @param topCoordinate
         * @param bottomCoordinate
         * @param rightCoordinate
         * @param leftCoordinate
         * @param nearestDepth
         * @param color
         * @returns {boolean} occluded or not occluded
         * @private
         */
	SoftwareRenderer.prototype._isPythagorasCircleScanlineOccluded = function(topCoordinate, bottomCoordinate, rightCoordinate, leftCoordinate, nearestDepth, color) {
		// Saving the number of rows minus one row. This is the value of use when calculating the tIncrements.
		var topRows = topCoordinate.y - rightCoordinate.y;
		var botRows = rightCoordinate.y - bottomCoordinate.y;

		var radius = rightCoordinate.x - topCoordinate.x;
		var r2 = radius * radius;
		var ratio = this.width / this.height;

		// skip the top , since that will be the top coordinate , which has already been checked. Start at the next one.
		// y is the current scanline.
		var y = topCoordinate.y - 1;

		// TODO : The cases after the two first ones might not happen often enough to be of value. Tune these in the end.
		if ((topRows <= 1 && botRows <= 1) || topCoordinate.y <= 0 || bottomCoordinate.y >= this._clipY) {
			// Early exit when the number of rows are 1 or less than one, there is no height in the circle at this point.
			// This misses the middle line, might be too non-conservative !

			// DEBUGGGING Set the pixels to cyan so i know this is where it finished sampling.
			var cyan = [0, 255, 255];
			var sampleCoord;
			if (this._isCoordinateInsideScreen(topCoordinate)) {
				sampleCoord = topCoordinate.y * this.width + topCoordinate.x;
				this._colorData.set(cyan, sampleCoord * 4);
			}

			if (this._isCoordinateInsideScreen(bottomCoordinate)) {
				sampleCoord = bottomCoordinate.y * this.width + bottomCoordinate.x;
				this._colorData.set(cyan, sampleCoord * 4);
			}
			if (this._isCoordinateInsideScreen(leftCoordinate)) {
				sampleCoord = leftCoordinate.y * this.width + leftCoordinate.x;
				this._colorData.set(cyan, sampleCoord * 4);
			}
			if (this._isCoordinateInsideScreen(rightCoordinate)) {
				sampleCoord = rightCoordinate.y * this.width + rightCoordinate.x;
				this._colorData.set(cyan, sampleCoord * 4);
			}

			return true;
		}

		// Vertical clip.
		var yH = 1;
		if (rightCoordinate.y >= this._clipY) {

			// The entire upper part of the circle is above the screen if this is true.
			// Set y to clipY , the next step shall be the middle of the circle.
			topRows = 0;
			y = this._clipY;

		} else {

			// If the top (start) coordinate is above the screen, step down to the right y coordinate (this._clipY),
			// remove the number of rows to interpolate on, update the interpolation value t.
			var topDiff = y - this._clipY;
			if (topDiff > 0) {
				topRows -= topDiff;
				yH += topDiff;
				y = this._clipY;
			}

			// Remove one row for each row that the right y-coordinate is below or equals to -2.
			// This because lines are checked up until rightcoordinate - 1.
			var rightUnder = - (rightCoordinate.y + 1);
			if (rightUnder > 0) {
				topRows -= rightUnder;
			}
		}

		// Interpolate x-coordinates with t in the range [tIncrement, 1.0 - tIncrement]
		// Removes the last iteration.
		topRows -= 1;
		for (var i = 0; i < topRows; i++) {

			var b = radius - ratio * yH;
			var x = Math.sqrt(r2 - b * b);
			var rightX = Math.ceil(topCoordinate.x + x);
			var leftX = Math.floor(topCoordinate.x - x);

			// Horizontal clipping
			if (leftX < 0) {
				leftX = 0;
			}

			if (rightX > this._clipX) {
				rightX = this._clipX;
			}

			var sampleCoord = y * this.width + leftX;

			for(var xindex = leftX; xindex <= rightX; xindex++) {

				this._colorData.set(color, sampleCoord * 4);
				if(this._depthData[sampleCoord] < nearestDepth) {
					// Early exit if the sample is visible.
					return false;
				}

				sampleCoord++;
			}
			y--;
			yH++;
		}

		if (y < 0) {
			// Hurray! Outside screen, it's hidden.
			// This will happen when the right y-coordinate is below 0 from the start.
			return true;
		}

		if(topRows >= -1 && rightCoordinate.y <= this._clipY) {
			// Check the middle scanline , the pixels in between the left and right coordinates.
			var leftX = leftCoordinate.x + 1;
			if (leftX < 0) {
				leftX = 0;
			}
			var rightX = rightCoordinate.x - 1;
			if (rightX > this._clipX) {
				rightX = this._clipX;
			}
			var midCoord = y * this.width + leftX;
			for (var i = leftX; i <= rightX; i++) {

				this._colorData.set(color, midCoord * 4);

				if (this._depthData[midCoord] < nearestDepth) {
					return false;
				}
				midCoord++;
			}
			// Move down to the next scanline.
			y--;
		}

		// The Bottom of the "circle"
		yH = botRows - 1;
		var topDiff = rightCoordinate.y - y - 1;
		if (topDiff > 0) {
			botRows -= topDiff;
			yH -= topDiff;
		}
		// Remove one row for each row that the right y-coordinate is below or equals to -2.
		var botDiff = - (bottomCoordinate.y + 1);
		if (botDiff > 0) {
			botRows -= botDiff;
		}

		// Interpolate x-coordinates with t in the range [tIncrement, 1.0 - tIncrement].
		// Remove the last iteration.
		botRows -= 1;
		radius = rightCoordinate.x - bottomCoordinate.x;
		for (var i = 0; i < botRows; i++) {

			var b = radius - ratio * yH;
			var x = Math.sqrt(r2 - b * b);
			var rightX = Math.ceil(topCoordinate.x + x);
			var leftX = Math.floor(topCoordinate.x - x);

			// Horizontal clipping
			if (leftX < 0) {
				leftX = 0;
			}
			if (rightX > this._clipX) {
				rightX = this._clipX;
			}

			var sampleCoord = y * this.width + leftX;
			for(var xindex = leftX; xindex <= rightX; xindex++) {
				// Debug, add color where scanline samples are taken.
				this._colorData.set(color, sampleCoord * 4);

				if(this._depthData[sampleCoord] < nearestDepth) {
					// Early exit if the sample is visible.
					return false;
				}
				sampleCoord++;
			}
			y--;
			yH--;
		}

		return true;
	};

	/**
	*	Check each scanline value of the bounding sphere, early exit upon finding a visible pixel. Uses bezier curve approximation of the bounding sphere.
	*	Returns true if the object is occluded.
	*
	*	@return {Boolean} occluded or not occluded
	*/
	SoftwareRenderer.prototype._isBezierScanlineOccluded = function (topCoordinate, bottomCoordinate, rightCoordinate, leftCoordinate, nearestDepth, color) {
		// REVIEW: Function not used - remove!

		// Saving the number of rows minus one row. This is the value of use when calculating the tIncrements.
		var topRows = topCoordinate.y - rightCoordinate.y;
		var botRows = rightCoordinate.y - bottomCoordinate.y;

		// skip the top , since that will be the top coordinate , which has already been checked. Start at the next one.
		// y is the current scanline.
		var y = topCoordinate.y - 1;

		// TODO : The cases after the two first ones might not happen often enough to be of value. Tune these in the end.
		if ((topRows <= 1 && botRows <= 1) || topCoordinate.y <= 0 || bottomCoordinate.y >= this._clipY) {
			// Early exit when the number of rows are 1 or less than one, there is no height in the circle at this point.
			// This misses the middle line, might be too non-conservative !

			// DEBUGGGING Set the pixels to cyan so i know this is where it finished sampling.
			var cyan = [0, 255, 255];
			var sampleCoord;
			if (this._isCoordinateInsideScreen(topCoordinate)) {
				sampleCoord = topCoordinate.y * this.width + topCoordinate.x;
				this._colorData.set(cyan, sampleCoord * 4);
			}

			if (this._isCoordinateInsideScreen(bottomCoordinate)) {
				sampleCoord = bottomCoordinate.y * this.width + bottomCoordinate.x;
				this._colorData.set(cyan, sampleCoord * 4);
			}
			if (this._isCoordinateInsideScreen(leftCoordinate)) {
				sampleCoord = leftCoordinate.y * this.width + leftCoordinate.x;
				this._colorData.set(cyan, sampleCoord * 4);
			}
			if (this._isCoordinateInsideScreen(rightCoordinate)) {
				sampleCoord = rightCoordinate.y * this.width + rightCoordinate.x;
				this._colorData.set(cyan, sampleCoord * 4);
			}
			return true;
		}

		var tIncrement = 1.0 / (topRows);
		var t = tIncrement;

		// Vertical clip.
		if (rightCoordinate.y >= this._clipY) {

			// The entire upper part of the circle is above the screen if this is true.
			// Set y to clipY , the next step shall be the middle of the circle.
			topRows = 0;
			y = this._clipY;

		} else {
			// If the top (start) coordinate is above the screen, step down to the right y coordinate (this._clipY),
			// remove the number of rows to interpolate on, update the interpolation value t.
			var topDiff = y - this._clipY;
			if (topDiff > 0) {
				topRows -= topDiff;
				t += topDiff * tIncrement;
				y = this._clipY;
			}

			// Remove one row for each row that the right y-coordinate is below or equals to -2.
			// This because lines are checked up until rightcoordinate - 1.
			var rightUnder = - (rightCoordinate.y + 1);
			if (rightUnder > 0) {
				topRows -= rightUnder;
			}
		}

		// Interpolate x-coordinates with t in the range [tIncrement, 1.0 - tIncrement]
		// Removes the last iteration.
		topRows -= 1;
		for (var i = 0; i < topRows; i++) {

			var t1 = (1.0 - t);
			// Bezier curve approximated bounds, simplified due to the corner x-coordinate is the same as the last one

			//var rightX = t1 * t1 * topCoordinate.x + 2 * t1 * t * rightCoordinate.x + t * t * rightCoordinate.x;
			// var x = t1 * t1 * topCoordinate.x + (2.0 * t - t * t) * rightCoordinate.x;
			var rightX = t1 * t1 * topCoordinate.x + (2.0 - t) * t * rightCoordinate.x;
			rightX = Math.ceil(rightX);
			var leftX = topCoordinate.x - (rightX - topCoordinate.x);

			// Horizontal clipping
			if (leftX < 0) {
				leftX = 0;
			}

			if (rightX > this._clipX) {
				rightX = this._clipX;
			}

			var sampleCoord = y * this.width + leftX;
			for(var xindex = leftX; xindex <= rightX; xindex++) {
				this._colorData.set(color, sampleCoord * 4);
				if(this._depthData[sampleCoord] < nearestDepth) {
					// Early exit if the sample is visible.
					return false;
				}
				sampleCoord++;
			}

			t += tIncrement;
			y--;
		}

		if (y < 0) {
			// Hurray! Outside screen, it's hidden.
			// This will happen when the right y-coordinate is below 0 from the start.
			return true;
		}

		if(topRows >= -1 && rightCoordinate.y <= this._clipY) {
			// Check the middle scanline , the pixels in between the left and right coordinates.
			var leftX = leftCoordinate.x + 1;
			if (leftX < 0) {
				leftX = 0;
			}
			var rightX = rightCoordinate.x - 1;
			if (rightX > this._clipX) {
				rightX = this._clipX;
			}
			var midCoord = y * this.width + leftX;
			for (var i = leftX; i <= rightX; i++) {

				this._colorData.set(color, midCoord * 4);

				if (this._depthData[midCoord] < nearestDepth) {
					return false;
				}
				midCoord++;
			}
			// Move down to the next scanline.
			y--;
		}

		// The Bottom of the "circle"
		tIncrement = 1.0 / (botRows);
		t = tIncrement;
		var topDiff = rightCoordinate.y - y - 1;
		if (topDiff > 0) {
			botRows -= topDiff;
			t += topDiff * tIncrement;
		}

		// Remove one row for each row that the right y-coordinate is below or equals to -2.
		var botDiff = - (bottomCoordinate.y + 1);
		if (botDiff > 0) {
			botRows -= botDiff;
		}

		// Interpolate x-coordinates with t in the range [tIncrement, 1.0 - tIncrement].
		// Remove the last iteration.
		botRows -= 1;
		for (var i = 0; i < botRows; i++) {

			var t1 = (1.0 - t);

			// This time , the first two points of the bezier interpolation are the same, simplified the algebra.
			var rightX = ((t1 + 2.0 * t) * t1) * rightCoordinate.x + t * t * bottomCoordinate.x;
			rightX = Math.ceil(rightX);
			var leftX = bottomCoordinate.x - (rightX - bottomCoordinate.x);

			// Horizontal clipping
			if (leftX < 0) {
				leftX = 0;
			}
			if (rightX > this._clipX) {
				rightX = this._clipX;
			}

			var sampleCoord = y * this.width + leftX;

			for(var xindex = leftX; xindex <= rightX; xindex++) {

				// Debug, add color where scanline samples are taken.
				this._colorData.set(color, sampleCoord * 4);

				if(this._depthData[sampleCoord] < nearestDepth) {
					// Early exit if the sample is visible.
					return false;
				}

				sampleCoord++;
			}

			t += tIncrement;
			y--;
		}

		return true;
	};

	/**
	*	Check occlusion on a given coordinate.
	*	If the coordinate is inside the screen pixel space, the given depth value is compared,
	*	otherwise the coordinate is assumed to be occluded.
	*
	*	@param {Vector} coordinate The coordinate to look-up
	*	@return {Boolean} true or false, occluded or not occluded.
    * @param nearestDepth
    * @param color
	*/
	SoftwareRenderer.prototype._isOccluded = function (coordinate, color, nearestDepth) {

		if (this._isCoordinateInsideScreen(coordinate)) {

			var coordIndex = coordinate.y * this.width + coordinate.x;

			// Add color to the color daata (DEBUGGING PURPOSE)
			this._colorData.set(color, coordIndex * 4);

			// the sample contains 1/w depth. if the corresponding depth in the nearCoordinate is behind the sample, the entity is occluded.
			return nearestDepth < this._depthData[coordIndex];
		}
		// Assume that the object is occluded when the coordinate is outside the screen.
		// The scanline test will have to clip to the correct pixel for look-up.
		return true;
	};

	/**
	*	Returns true if the coordinate is inside the screen pixel space. Otherwise it returns false.
	*
	*	@param {Vector} coordinate
	*	@return {Boolean} true/false
	*/
	SoftwareRenderer.prototype._isCoordinateInsideScreen = function (coordinate) {
		return coordinate.data[0] >= 0 && coordinate.data[0] <= this._clipX && coordinate.data[1] <= this._clipY && coordinate.data[1] >= 0;
	};


	/**
	*	Creates an array of the visible {Triangle} for the entity
	*	@param {Entity} entity, the entity from which to create triangles.
	*	@return {Array.<Triangle>} triangle array
     * @param cameraProjectionMatrix
    * @param cameraViewMatrix
	*/
	SoftwareRenderer.prototype._createTrianglesForEntity = function (entity, cameraViewMatrix, cameraProjectionMatrix) {

		var originalPositions = entity.occluderComponent.meshData.dataViews.POSITION;
		var vertIndexArray = entity.occluderComponent.meshData.indexData.data;

		// Allocate the triangle array for the maximum case,
		// where all the triangles are visible.
		// This will raise a need for checking for undefined during the rendering of the triangles.
		var triangles = [];

		var entitityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
		var cameraNearZInWorld = -this.camera.near;

		// Combine the entity world transform and camera view matrix, since nothing is calculated between these spaces
		var combinedMatrix = Matrix4x4.combine(cameraViewMatrix, entitityWorldTransformMatrix);

		var posArray = new Float32Array(originalPositions.length);
		var tempVertex = Vector4.UNIT_W;
		// Transform vertices to camera view space beforehand to not transform several times on a vertex. ( up to three times ).
		// The homogeneous coordinate,w , will not be altered during this transformation. And remains 1.0.
		for (var i = 0; i < posArray.length; i++) {
			tempVertex.seta([originalPositions[i], originalPositions[i + 1], originalPositions[i + 2], 1.0]);
			combinedMatrix.applyPost(tempVertex);
			posArray.set([tempVertex.data[0], tempVertex.data[1], tempVertex.data[2]], i);
			i += 2;
		}

		for (var vertIndex = 0; vertIndex < vertIndexArray.length; vertIndex++ ) {

			var posIndex = vertIndexArray[vertIndex] * 3;
			var v1 = new Vector4(posArray[posIndex], posArray[posIndex + 1], posArray[posIndex + 2], 1.0);

			posIndex = vertIndexArray[++vertIndex] * 3;
			var v2 = new Vector4(posArray[posIndex], posArray[posIndex + 1], posArray[posIndex + 2], 1.0);

			posIndex = vertIndexArray[++vertIndex] * 3;
			var v3 = new Vector4(posArray[posIndex], posArray[posIndex + 1], posArray[posIndex + 2], 1.0);

			var vertices = [v1, v2, v3];

			if (this._isBackFacingCameraViewSpace(v1, v2, v3)) {
				continue; // Skip loop to the next three vertices.
			}

			// Clip triangle to the near plane.

			// Outside indices are the vertices which are outside the view frustum,
			// that is closer than the near plane in this case.
			// The inside indices are the ones on the inside.
			var outsideIndices = [];
			var insideIndices = [];

			this._categorizeVertices(outsideIndices, insideIndices, vertices, cameraNearZInWorld);

			switch (outsideIndices.length) {
				case 0:
					// All vertices are on the inside. Continue as usual.
					break;
				case 3:
					// All of the vertices are on the outside, skip to the next three vertices.
					// TODO : Refactor to remove continue statement. acoording to Javascript : The Good Parts.
					continue;
                case 1:
					// Update the one vertex to its new position on the near plane and add a new vertex
					// on the other intersection with the plane.

					// TODO: Small optimization, the origin.z + near calculation in intersectionratio()
					// 		 can be performed once here instead of twice.

					var origin = vertices[outsideIndices[0]];
					var target = vertices[insideIndices[0]];
					var ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

					var newV1 = [
						origin.data[0] + ratio * (target.data[0] - origin.data[0]),
						origin.data[1] + ratio * (target.data[1] - origin.data[1]),
						origin.data[2] + ratio * (target.data[2] - origin.data[2])
					];

					target = vertices[insideIndices[1]];
					ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

					var newV2 = new Vector4(
						origin.data[0] + ratio * (target.data[0] - origin.data[0]),
						origin.data[1] + ratio * (target.data[1] - origin.data[1]),
						origin.data[2] + ratio * (target.data[2] - origin.data[2]),
						1.0
					);
                    // Set the new data for the origin vertex.
					vertices[outsideIndices[0]].data[0] = newV1[0];
					vertices[outsideIndices[0]].data[1] = newV1[1];
					vertices[outsideIndices[0]].data[2] = newV1[2];

					vertices.push(newV2);

					break;
				case 2:
					// Update the two outside vertices to their new positions on the near plane.
					// First vertex update
					var origin = vertices[outsideIndices[0]];
					var target = vertices[insideIndices[0]];

					var ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

					origin.data[0] += ratio * (target.data[0] - origin.data[0]);
					origin.data[1] += ratio * (target.data[1] - origin.data[1]);
					origin.data[2] += ratio * (target.data[2] - origin.data[2]);


					// Second vertex update
					origin = vertices[outsideIndices[1]];
					ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

					origin.data[0] += ratio * (target.data[0] - origin.data[0]);
					origin.data[1] += ratio * (target.data[1] - origin.data[1]);
					origin.data[2] += ratio * (target.data[2] - origin.data[2]);

					break;
			}

			// TODO : Combine projection + screen space transformations.
			this._projectionTransform(vertices, cameraProjectionMatrix);

			/* 
			if (this._isBackFacingProjected(v1, v2, v3)) {
				// TODO : Refactor to remove continue statement. according to Javascript : The Good Parts.
				continue; // Skip loop to the next three vertices.
			}
			*/

			this._transformToScreenSpace(vertices);

			this._createTriangles(vertices, outsideIndices, insideIndices, triangles);
		}

		return triangles;
	};

	/**
	*	Transforms the vertices with the given projection transform matrix and then performs the homogeneous division.
	*
	*	@param {Array.<Vector4>} vertices The vertex array
	*	@param {Matrix4x4} matrix The projection transformation matrix
	*/
	SoftwareRenderer.prototype._projectionTransform = function (vertices, matrix) {

		for (var i = 0; i < vertices.length; i++) {
			var v = vertices[i];

			matrix.applyPost(v);

			var div = 1.0 / v.w;
			v.x *= div;
			v.y *= div;
		}
	};

	/**
	*	Adds new triangle(s) to the triangle array. If the triangle has been clipped , the triangles are created from the vertex array in combination with the
	*	outsideIndices and insideIndices.
	*
	*	@param {Array.<Vector4>} vertices vertex array
	*	@param {Array.<Number>} outsideIndices
	*	@param {Array.<Number>} insideIndices
	*	@param {Array.<Triangle>} triangles the array to hold the created triangles.
	*/
	SoftwareRenderer.prototype._createTriangles = function (vertices, outsideIndices, insideIndices, triangles) {

		if (vertices.length === 4) {
			// The vertex array has a length 4 only if one of the vertices were outside the near plane.
			// The "extra vertex" is at position 3 in the array.

			// The order of the triangle is not relevant here anymore since
			// the backface culling check is made already.
			triangles.push(new Triangle(vertices[outsideIndices[0]], vertices[insideIndices[0]], vertices[3]));
			triangles.push(new Triangle(vertices[3], vertices[insideIndices[0]], vertices[insideIndices[1]]));

		} else {
			triangles.push(new Triangle(vertices[0], vertices[1], vertices[2]));
		}
	};

	/**
	*	Categorizes the vertices into outside and inside (of the view frustum).
	*	A vertex is categorized as being on the inside of the view frustum if it is located on the near plane.
	*	The outside- and insideIndices arrays are populated with the index to the vertex in question.
	*	@param {Array.<Number>} outsideIndices
	*	@param {Array.<Number>} insideIndices
	*	@param {Array.<Number>} vertices
	*	@param {Number} cameraNearPlane the camera near plane in world coordinates.
	*/
	SoftwareRenderer.prototype._categorizeVertices = function (outsideIndices, insideIndices, vertices, cameraNear) {

		for ( var i = 0; i < 3; i++ ) {
			// The vertex shall be categorized as an inside vertex if it is on the near plane.
			if (vertices[i].z <= cameraNear) {
				insideIndices.push(i);
			} else {
				outsideIndices.push(i);
			}
		}
	};

	/**
	*	Calculates the intersection ratio between the vector, created from the parameters origin and target, with the camera's near plane.
	*
	*	The ratio is defined as the amount (%), of the vector from origin to target, where the vector's intersection
	*	with the near plane happens.
	*
	*	Due to this intersection being performed in camera space, the ratio calculation can be simplified to
	*	only account for the z-coordinates.
	*
	*	@param {Vector3} origin
	*	@param {Vector3} target
	*	@param {Number} near The near plane.
	*/
	SoftwareRenderer.prototype._calculateIntersectionRatio = function (origin, target, near) {

		// Using a tip from Joel:
		// The intersection ratio can be calculated using the respective lenghts of the
		// endpoints (origin and target) to the near plane.
		// http://www.joelek.se/uploads/files/thesis.pdf, pages 28-31.

		// The camera's near plane component is the translation of the near plane,
		// therefore 'a' is calculated as origin.z + near
		// var a = origin.z + near;
		// var b = -near - target.z;
		// var ratio = a/(a+b);

		// Simplified the ratio to :
		return (origin.data[2] + near) / (origin.data[2] - target.data[2]);

	};

	/**
	*	Transforms the vertices' x and y coordinates into pixel coordinates of the screen.
	*	// TODO : This function should not be used in prod, rather combine the projection transform and this one.
	*	@param {Array.<Vector4>} vertices the vertices to be transformed.
	*/
	SoftwareRenderer.prototype._transformToScreenSpace = function (vertices) {

		for (var i = 0; i < vertices.length; i++) {

			var vertex = vertices[i];

			// These calculations assume that the camera's viewPortRight and viewPortTop are 1,
			// while the viewPortLeft and viewPortBottom are 0.
			// The x and y coordinates can still be outside the screen space here, but those will be clipped during rasterizing.
			// Transform to zerobasd interval of pixels instead of [0, width] which will be one pixel too much.
			// (Assuming the vertex values range from [-1, 1] when projected.)
			vertex.data[0] = (vertex.data[0] + 1.0) * (this._clipX / 2);
			vertex.data[1] = (vertex.data[1] + 1.0) * (this._clipY / 2);

			// http://www.altdevblogaday.com/2012/04/29/software-rasterizer-part-2/
			// The w-coordinate is the z-view at this point. Ranging from [0, cameraFar<].
			// During rendering, 1/w is used and saved as depth (float32). Values further than the far plane will render correctly.
		}
	};

	/**
	*	Determines if a triangle is backfacing in camera view space.
	*
	*	@param {Vector4} v1 Vertex #1
	*	@param {Vector4} v3 Vertex #2
	*	@param {Vector4} v3 Vertex #3
	*	@return {Boolean} true or false
	*/
	SoftwareRenderer.prototype._isBackFacingCameraViewSpace = function (v1, v2, v3) {

		// Calculate the dot product between the triangle's face normal and the camera's eye direction
		// to find out if the face is facing away or not.

		// Create edges for calculating the normal.
		var e1 = [v2.data[0] - v1.data[0] , v2.data[1] - v1.data[1], v2.data[2] - v1.data[2]];
		var e2 = [v3.data[0] - v1.data[0], v3.data[1] - v1.data[1], v3.data[2] - v1.data[2]];

		// Doing the cross as well as dot product here since the built-in methods in Vector3 seems to do much error checking.
		var faceNormal = new Array(3);
		faceNormal[0] = e2[2] * e1[1] - e2[1] * e1[2];
		faceNormal[1] = e2[0] * e1[2] - e2[2] * e1[0];
		faceNormal[2] = e2[1] * e1[0] - e2[0] * e1[1];

		// Picking the first vertex as the point on the triangle to evaulate the dot product on.
		//var viewVector = [v1.x, v1.y, v1.z];

		// No need to normalize the vectors due to only being
		// interested in the sign of the dot product.

		/*
		// Normalize faceNormal and view vector
		var viewLength = Math.sqrt(viewVector[0] * viewVector[0] + viewVector[1] * viewVector[1] + viewVector[2] * viewVector[2]);
		var faceLength = Math.sqrt(faceNormal[0] * faceNormal[0] + faceNormal[1] * faceNormal[1] + faceNormal[2] * faceNormal[2]);

		for (var i = 0; i < 3; i++) {
			viewVector[i] /= viewLength;
			faceNormal[i] /= faceLength;
		}
		*/

		var dot = faceNormal[0] * v1.data[0] + faceNormal[1] * v1.data[1] + faceNormal[2] * v1.data[2];
		return dot > 0.0;
	};

	/**
	*	Returns true if the (CCW) triangle created by the vertices v1, v2 and v3 is facing backwards.
	*	Otherwise false is returned. This method is for checking projected vertices.
	*
	*	@param {Vector4} v1 Vertex #1
	*	@param {Vector4} v2 Vertex #2
	*	@param {Vector4} v3 Vertex #3
	*	@return {Boolean} true or false
	*/
	SoftwareRenderer.prototype._isBackFacingProjected = function (v1, v2, v3) {

		// Optimized away edge allocation , only need x and y of the edges.
		var e1X = v2.data[0] - v1.data[0];
		var e1Y = v2.data[1] - v1.data[1];

		var e2X = v3.data[0] - v1.data[0];
		var e2Y = v3.data[1] - v1.data[1];

		var faceNormalZ = e2Y * e1X - e2X * e1Y;

		// The cameras eye direction will always be [0,0,-1] at this stage
		// (the vertices are transformed into the camera's view projection space,
		// thus the dot product can be simplified to only do multiplications on the z component.

		// var dotProduct = -faceNormal.z; // -1.0 * faceNormal.z;

        // The face is facing backwards if the dotproduct is positive.
		// Invert the comparison to remove the negation of facenormalZ.
		return faceNormalZ < 0.0;
	};

	SoftwareRenderer.prototype._renderTestTriangles = function () {

		for ( var i = 0; i < this.testTriangles.length; i++) {
			this._renderTriangle(this.testTriangles[i].toPixelSpace(this.width, this.height));
		}
	};

	/**
	*	Creates the new edges from the triangle. The returned value will be false if the triangle is outside view,
	*	otherwise the returned value is an array with the indices.
	*	@return {Array.<Number>} edgeIndexArray [longEdge, shortedge1, shortedge2, longEdgeIsOnTheRightSide]
	*/
	SoftwareRenderer.prototype._createEdgesForTriangle = function (triangle) {
		this._edges = [
			new Edge(triangle.v1, triangle.v2),
			new Edge(triangle.v2, triangle.v3),
			new Edge(triangle.v3, triangle.v1)
		];

		var maxHeight = 0;
		var longEdge = 0;

		// Find edge with the greatest height in the Y axis, this is the long edge.
		for(var i = 0; i < 3; i++) {
			var height = this._edges[i].y1 - this._edges[i].y0;
			if(height > maxHeight) {
				maxHeight = height;
				longEdge = i;
			}
		}

		// "Next, we get the indices of the shorter edges, using the modulo operator to make sure that we stay within the bounds of the array:"
		var shortEdge1 = (longEdge + 1) % 3;
		var shortEdge2 = (longEdge + 2) % 3;

		return [longEdge, shortEdge1, shortEdge2];
	};

	/**
	*	Returns an array containing if the trianlges long edge is on the right or left and if the triangle is leaning inwards or outwards,
	*	seen from left to right.
	*	@returns {Array.<Boolean>} [right/left, inwards/outwards] (true/false)
	*/
	SoftwareRenderer.prototype._calculateOrientationData = function (edgeData, shortEdge, longEdge) {

		// REVIEW: The edgeData objects are difficult to understand. Create a normal object
		// with named members instead of an array with magic indices.
		// This applies to all functions that use edgeData.

		// TODO : remove temporary variables , to minimize garbage collection?
		// REVIEW: Au contraire, creating a local variable for data from an array may give better performance,
		// as the compiler is likely to be better at optimizing local variables as it can assume no aliasing.
		// And temporary *variables* are not a problem. Variables are not garbage collected.
		// It is *values* (e.g. objects, numbers, arrays) that are garbage collected.
		// But if you follow my advice above, you could use edgeData.longEdgeXincrement etc. which is pretty readable.
		var longEdgeXincrement = edgeData[6];
		var shortEdgeXincrement = edgeData[7];

		var leftX = edgeData[3];
		var rightX = edgeData[2];

		// If the edges start at the same position (floating point comparison),
		// The edges will most probably contain an integer index to the vertex array in future optimizations.
		// the long edge can be determined by examining the slope sign.
		// Otherwise, just check which one is larger.

		// A triangle is leaning inwards, if the long edge's stop vertex is further away than the vertex to compare with of the short edge.
		// The depth values have been inverted, so the comparison has to be inverted as well.
		if (leftX === rightX) {
			// The short edge is the upper one. The long and short edges originate from the same vertex.
			return [longEdgeXincrement > shortEdgeXincrement, longEdge.z1 < shortEdge.z1];
		} else {
			// The short edge is the bottom one.
			return [rightX > leftX, longEdge.z1 < shortEdge.z0];
		}
	};

	/**
	*	Returns true if the triangle is occluded.
	*/
	SoftwareRenderer.prototype._isRenderedTriangleOccluded = function (triangle) {

		// returns [longEdge, shortEdge1, shortEdge2], or false on invisible triangle.
		var edgeIndices = this._createEdgesForTriangle(triangle);

		var longEdge = this._edges[edgeIndices[0]];
		var s1 = edgeIndices[1];
		var s2 = edgeIndices[2];

		// Vertical culling
		if (this._verticalLongEdgeCull(longEdge)) {
			// Triangle is outside the view, skipping rendering it;
			return true;
		}

        for (var i = 0; i < 3; i++) {
			// TODO : Move all rounding of values to the scanline loop to be performed per line.
			this._edges[i].roundOccludeeCoordinates();
			// TODO : Move the inversion of z.... to the best place. Has to be done before the creation of the edge data.
			this._edges[i].invertZ();
        }

        var shortEdge = this._edges[s1];
		var edgeData = this._edgePreRenderProcess(longEdge, shortEdge);

		// Find out the orientation of the triangle. 
		// That is, if the long edge is on the right or the left side.
		var orientationData = null;
		if (edgeData) {
			orientationData = this._calculateOrientationData(edgeData, shortEdge, longEdge);

			// Horizontal culling
			if (this._horizontalLongEdgeCull(longEdge, orientationData)) {
				return true;
			}

			// Draw first portion of the triangle
			if(!this._isEdgeOccluded(edgeData, orientationData)){
				return false;
			}
		}
		shortEdge = this._edges[s2];
		edgeData = this._edgePreRenderProcess(longEdge, shortEdge);
		if (edgeData) {
			// If the orientation hasn't been created, do so.
			if (orientationData === null) {
				orientationData = this._calculateOrientationData(edgeData, shortEdge, longEdge);
				// Horizontal culling
				if (this._horizontalLongEdgeCull(longEdge, orientationData)) {
					return true;
				}
			}
			// Draw second portion of the triangle.
			if(!this._isEdgeOccluded(edgeData, orientationData)){
				return false;
			}
		}

		return true;
	};

	/**
	*	Takes a triangle with coordinates in pixel space, and draws it.
	*	@param {Triangle} triangle the triangle to draw.
	*/
	SoftwareRenderer.prototype._renderTriangle = function (triangle) {

		// Original idea of triangle rasterization is taken from here : http://joshbeam.com/articles/triangle_rasterization/
		// The method is improved by using vertical coherence for each of the scanlines.

		var edgeIndices = this._createEdgesForTriangle(triangle);

		var longEdge = this._edges[edgeIndices[0]];
		var s1 = edgeIndices[1];
		var s2 = edgeIndices[2];

		// Vertical culling
		if (this._verticalLongEdgeCull(longEdge)) {
			// Triangle is outside the view, skipping rendering it;
			return;
		}

        for (var i = 0; i < 3; i++) {
			// TODO : Move all rounding of values to the scanline loop to be performed per line.
			this._edges[i].roundOccluderCoordinates();
			// TODO : Move the inversion of z.... to the best place. Has to be done before the creation of the edge data.
			this._edges[i].invertZ();
        }

        var shortEdge = this._edges[s1];
		var edgeData = this._edgePreRenderProcess(longEdge, shortEdge);

		// Find out the orientation of the triangle. 
		// That is, if the long edge is on the right or the left side.
		var orientationData = null;
		if (edgeData) {
			orientationData = this._calculateOrientationData(edgeData, shortEdge, longEdge);

			// Horizontal culling
			if (this._horizontalLongEdgeCull(longEdge, orientationData)) {
				return;
			}

			// Draw first portion of the triangle
			this._drawEdges(edgeData, orientationData);
		}

		shortEdge = this._edges[s2];
		edgeData = this._edgePreRenderProcess(longEdge, shortEdge);
		if (edgeData) {
			// If the orientation hasn't been created, do so.
			if (orientationData === null) {
				orientationData = this._calculateOrientationData(edgeData, shortEdge, longEdge);
				// Horizontal culling
				if (this._horizontalLongEdgeCull(longEdge, orientationData)) {
					return;
				}
			}
			// Draw second portion of the triangle.
			this._drawEdges(edgeData, orientationData);
		}
	};

	/**
	*	Returns true if the triangle should be culled, if not, it returns false.
	*/
	SoftwareRenderer.prototype._verticalLongEdgeCull = function (longEdge) {
		return longEdge.y1 < 0 || longEdge.y0 > this._clipY;
	};

	/**
	*	Returns true if the triangle should be culled, if not, it returns false.
	*	@param {Edge} long edge
	*	@param {Array.<Boolean>} the first value of thee array is orientation
	*/
	SoftwareRenderer.prototype._horizontalLongEdgeCull = function (longEdge, orientationData) {
		if (orientationData[0]) {
			return longEdge.x1 < 0 && longEdge.x0 < 0;
		} else {
			return longEdge.x1 > this._clipX && longEdge.x0 > this._clipX;
		}
	};

	SoftwareRenderer.prototype._isEdgeOccluded = function(edgeData, orientationData) {

		// Copypasted from _drawEdges.
		var startLine = edgeData[0];
		var stopLine = edgeData[1];

		// Checking if the triangle's long edge is on the right or the left side.
		if (orientationData[0]) {
			if (orientationData[1]) { //INWARDS TRIANGLE
				for (var y = startLine; y <= stopLine; y++) {

					var realLeftX = edgeData[3];
					var realRightX = edgeData[2];
					// Conservative rounding (will cause overdraw on connecting triangles)
					var leftX = Math.floor(realLeftX);
					var rightX = Math.ceil(realRightX);

					var leftZ = edgeData[5];
					var rightZ = edgeData[4];

					// Extrapolate the new depth for the new conservative x-coordinates.
					// this is needed to not create a non-conservative depth over the new larger span.
					// TODO : Would be good to get the if case removed. This is needed at the moment because
					// division by zero occurs in the creation of the slope variable.
					var dif = rightX - leftX;
					if (dif > 1) {
						var slope = (rightZ - leftZ) / (realRightX - realLeftX);
						rightZ = leftZ + (rightX - realLeftX) * slope;
						leftZ = leftZ + (leftX - realLeftX) * slope;
						// The z value being interpolated after this can become negative from the extrapolation.
						// Using math.max to set the value to zero if it is negative.
						rightZ = Math.max(0.0, rightZ);
						leftZ = Math.max(0.0, leftZ);
					}

					// To find the minimum depth of an occludee , the left edge of the rightmost pixel is the min depth.
					// The leftZ is the absolute min depthx
					var t = 0.5 / (dif + 1); // Using the larger span.
					rightZ = (1.0 - t) * rightZ + t * leftZ;


					if (!this._isScanlineOccluded(leftX, rightX, y, leftZ, rightZ)) {
						return false;
					}

					this._updateEdgeDataToNextLine(edgeData);
				}
			} else { // OUTWARDS TRIANGLE
				for (var y = startLine; y <= stopLine; y++) {

					var realLeftX = edgeData[3];
					var realRightX = edgeData[2];
					// Conservative rounding (will cause overdraw on connecting triangles)
					var leftX = Math.floor(realLeftX);
					var rightX = Math.ceil(realRightX);

					var leftZ = edgeData[5];
					var rightZ = edgeData[4];

					// Extrapolate the new depth for the new conservative x-coordinates.
					// this is needed to not create a non-conservative depth over the new larger span.
					// TODO : Would be good to get the if case removed. This is needed at the moment because
					// division by zero occurs in the creation of the slope variable.
					var dif = rightX - leftX;
					if (dif > 1) {
						var slope = (rightZ - leftZ) / (realRightX - realLeftX);
						rightZ = leftZ + (rightX - realLeftX) * slope;
						leftZ = leftZ + (leftX - realLeftX) * slope;
						leftZ = Math.max(0.0, leftZ);
						rightZ = Math.max(0.0, rightZ);
					}

					var t = 0.5 / (dif + 1); // Using the larger span.
					leftZ = (1.0 - t) * leftZ + t * rightZ;

					if (!this._isScanlineOccluded(leftX, rightX, y, leftZ, rightZ)) {
						return false;
					}

					this._updateEdgeDataToNextLine(edgeData);
				}
			}
		} else { // LEFT ORIENTED
			if (orientationData[1]) { //INWARDS TRIANGLE
				for (var y = startLine; y <= stopLine; y++) {

					var realLeftX = edgeData[2];
					var realRightX = edgeData[3];
					// Conservative rounding (will cause overdraw on connecting triangles)
					var leftX = Math.floor(realLeftX);
					var rightX = Math.ceil(realRightX);

					var leftZ = edgeData[4];
					var rightZ = edgeData[5];

					// Extrapolate the new depth for the new conservative x-coordinates.
					// this is needed to not create a non-conservative depth over the new larger span.
					// TODO : Would be good to get the if case removed. This is needed at the moment because
					// division by zero occurs in the creation of the slope variable.
					var dif = rightX - leftX;
					if (dif > 1) {
						var slope = (rightZ - leftZ) / (realRightX - realLeftX);
						rightZ = leftZ + (rightX - realLeftX) * slope;
						leftZ = leftZ + (leftX - realLeftX) * slope;
						rightZ = Math.max(0.0, rightZ);
						leftZ = Math.max(0.0, leftZ);
					}

					// To find the minimum depth of an occludee , the left edge of the rightmost pixel is the min depth.
					// The leftZ is the absolute min depth
					var t = 0.5 / (dif + 1); // Using the larger span.
					rightZ = (1.0 - t) * rightZ + t * leftZ;

					if (!this._isScanlineOccluded(leftX, rightX, y, leftZ, rightZ)) {
						return false;
					}

					this._updateEdgeDataToNextLine(edgeData);
				}
			} else { // OUTWARDS TRIANGLE
				for (var y = startLine; y <= stopLine; y++) {

					var realLeftX = edgeData[2];
					var realRightX = edgeData[3];
					// Conservative rounding (will cause overdraw on connecting triangles)
					var leftX = Math.floor(realLeftX);
					var rightX = Math.ceil(realRightX);

					var leftZ = edgeData[4];
					var rightZ = edgeData[5];

					// Extrapolate the new depth for the new conservative x-coordinates.
					// this is needed to not create a non-conservative depth over the new larger span.
					// TODO : Would be good to get the if case removed. This is needed at the moment because
					// division by zero occurs in the creation of the slope variable.
					var dif = rightX - leftX;
					if (dif > 1) {
						var slope = (rightZ - leftZ) / (realRightX - realLeftX);
						rightZ = leftZ + (rightX - realLeftX) * slope;
						leftZ = leftZ + (leftX - realLeftX) * slope;
						rightZ = Math.max(0.0, rightZ);
						leftZ = Math.max(0.0, leftZ);
					}

					// To find the minimum depth of an occludee , the left edge of the rightmost pixel is the min depth.
					// The leftZ is the absolute min depth
					var t = 0.5 / (dif + 1); // Using the larger span.
					leftZ = (1.0 - t) * leftZ + t * rightZ;

					if (!this._isScanlineOccluded(leftX, rightX, y, leftZ, rightZ)) {
						return false;
					}

					this._updateEdgeDataToNextLine(edgeData);
				}
			}
		}

		return true;
	};

	/**
	*	Render the pixels between the long and the short edge of the triangle.
	*	@param {Array.<Number>} edge data array
	*	@param {Array.<Boolean>} [rightOriented, inwardsTriangle]
	*/
	SoftwareRenderer.prototype._drawEdges = function (edgeData, orientationData) {

		// [startLine, stopLine, longX, shortX, longZ, shortZ, longEdgeXincrement, shortEdgeXincrement, longEdgeZincrement, shortEdgeZincrement]

		// The start and stop lines are already rounded y-coordinates.
		var startLine = edgeData[0];
		var stopLine = edgeData[1];

		// Leaning inwards means that the triangle is going inwards from left to right.

		// Compensate for fractional offset + conservative depth.
		// When drawing occluders , as is beeing done here.
		// the minimum value that the pixel can have is the one which should be rendered.
		// this minimum value ís on the left or the right side of the pixel, depending on which
		// way the triangle is leaning.

		// In the case of leaning inwards, the leftmost pixel has the max depth on it's right edge.
		// for the rightmost pixel, it is consequently on it's left side.

		// For for the outwards triangle case, the calculations on the leftmost pixel are made for the right and vice versa.

		// when rendering the occluders, the maxim

		// Checking if the triangle's long edge is on the right or the left side.
		if (orientationData[0]) { // LONG EDGE ON THE RIGHT SIDE
			if (orientationData[1]) { // INWARDS TRIANGLE
				for (var y = startLine; y <= stopLine; y++) {

					var realLeftX = edgeData[3];
					var realRightX = edgeData[2];

					var leftZ = edgeData[5];
					var rightZ = edgeData[4];
					// Conservative rounding , when drawing occluders, make area smaller.
					var leftX = Math.ceil(realLeftX);
					var rightX = Math.floor(realRightX);

					// Compensate for the fractional offset on the leftmost pixel.
					// Regarding the rightZ to be the actual maximum depth.
					var offset = leftX - realLeftX;
					var spanLength = realRightX - realLeftX;
					var t = offset / spanLength;
					// Linearly interpolate new leftZ
					leftZ = (1.0 - t) * leftZ + t * rightZ;

					// Conservative depth, max depth on the edge of the pixel.
					// Add 0.5 to go to the edge of the pixel.
					spanLength = (rightX - leftX + 1);
					var t = (0.5) / spanLength;
					// Linearly interpolate new leftZ
					leftZ = (1.0 - t) * leftZ + t * rightZ;

					// Draw the span of pixels.
					this._fillPixels(leftX, rightX, y, leftZ, rightZ);

					this._updateEdgeDataToNextLine(edgeData);
				}
			} else { // OUTWARDS TRIANGLE
				for (var y = startLine; y <= stopLine; y++) {

					var realLeftX = edgeData[3];
					var realRightX = edgeData[2];

					var leftZ = edgeData[5];
					var rightZ = edgeData[4];
					// Conservative rounding , when drawing occluders, make area smaller.
					var leftX = Math.ceil(realLeftX);
					var rightX = Math.floor(realRightX);

					// Compensate fractional offset.
					var offset = realRightX - rightX;
					var spanLength = realRightX - realLeftX;
					var t = offset / spanLength;
					rightZ = (1.0 - t) * rightZ + t * leftZ;

					// Add 0.5 to go to the edge of the pixel.
					spanLength = rightX - leftX + 1;
					var t = 0.5 / spanLength;
					rightZ = (1.0 - t) * rightZ + t * leftZ;

					// Draw the span of pixels.
					this._fillPixels(leftX, rightX, y, leftZ, rightZ);

					this._updateEdgeDataToNextLine(edgeData);
				}
			}
		} else { // LONG EDGE IS ON THE LEFT SIDE
			if (orientationData[1]) { // INWARDS TRIANGLE
				for (var y = startLine; y <= stopLine; y++) {

					var realLeftX = edgeData[2];
					var realRightX = edgeData[3];

					var leftZ = edgeData[4];
					var rightZ = edgeData[5];

					// Conservative rounding , when drawing occluders, make area smaller.
					var leftX = Math.ceil(realLeftX);
					var rightX = Math.floor(realRightX);

					// Compensate for the fractional offset on the leftmost pixel.
					// Regarding the rightZ to be the actual maximum depth.
					var offset = leftX - realLeftX;
					var spanLength = realRightX - realLeftX;
					var t = offset / spanLength;
					// Linearly interpolate new leftZ
					leftZ = (1.0 - t) * leftZ + t * rightZ;

					// Conservative depth, max depth on the edge of the pixel.
					// Add 0.5 to go to the edge of the pixel.
					spanLength = (rightX - leftX + 1);
					var t = (0.5) / spanLength;
					// Linearly interpolate new leftZ
					leftZ = (1.0 - t) * leftZ + t * rightZ;

					// Draw the span of pixels.
					this._fillPixels(leftX, rightX, y, leftZ, rightZ);

					this._updateEdgeDataToNextLine(edgeData);
				}
			} else { // OUTWARDS TRIANGLE
				for (var y = startLine; y <= stopLine; y++) {

					var realLeftX = edgeData[2];
					var realRightX = edgeData[3];

					var leftZ = edgeData[4];
					var rightZ = edgeData[5];

					// Conservative rounding , when drawing occluders, make area smaller.
					var leftX = Math.ceil(realLeftX);
					var rightX = Math.floor(realRightX);

					// Compensate fractional offset.
					var offset = realRightX - rightX;
					var spanLength = realRightX - realLeftX;
					var t = offset / spanLength;
					rightZ = (1.0 - t) * rightZ + t * leftZ;

					// Add 0.5 to go to the edge of the pixel.
					spanLength = rightX - leftX + 1;
					var t = 0.5 / spanLength;
					rightZ = (1.0 - t) * rightZ + t * leftZ;

					// Draw the span of pixels.
					this._fillPixels(leftX, rightX, y, leftZ, rightZ);

					this._updateEdgeDataToNextLine(edgeData);
				}
			}
		}
	};

	/**
	* // TODO : Look up if it would be faster to store the increments as local variables in the 
	*			scanline rendering loop. This to not have to access the array if that would cause 
	*			unneccessary reads and maybe cashe misses?
	*/
	SoftwareRenderer.prototype._updateEdgeDataToNextLine = function (edgeData) {
		edgeData[2] += edgeData[6];
		edgeData[3] += edgeData[7];
		edgeData[4] += edgeData[8];
		edgeData[5] += edgeData[9];
	};

	/**
	*	@return {Array.<Number>} [startLine, stopLine, longX, shortX, longZ, shortZ, longEdgeXincrement, shortEdgeXincrement, longEdgeZincrement, shortEdgeZincrement]
	*/
	SoftwareRenderer.prototype._edgePreRenderProcess = function (longEdge, shortEdge) {

		// TODO: Move a lot of these calculations and variables into the Edge class,
		// do the calculations once for the long edge instead of twices as it is done now.

		// Early exit when the short edge doesnt have any height (y-axis).
		// -The edges' coordinates are stored as uint8, so compare with a SMI (SMall Integer, 31-bit signed integer) and not Double.

		var shortEdgeDeltaY = (shortEdge.y1 - shortEdge.y0);
		if(shortEdgeDeltaY <= 0) {
			return; // Nothing to draw here.
		}

		var longEdgeDeltaY = (longEdge.y1 - longEdge.y0);

		// Checking the long edge will probably be unneccessary, since if the short edge has no height, then the long edge most defenetly hasnt either?
		// Shouldn't be possible for the long edge to be of height 0 if any of the short edges has height.

		var longEdgeDeltaX = longEdge.x1 - longEdge.x0;
		var shortEdgeDeltaX = shortEdge.x1 - shortEdge.x0;

		var longStartZ = longEdge.z0;
		var shortStartZ = shortEdge.z0;
		var longEdgeDeltaZ = longEdge.z1 - longStartZ;
		var shortEdgeDeltaZ = shortEdge.z1 - shortStartZ;

		// Vertical coherence :
		// The x-coordinates' increment for each step in y is constant,
		// so the increments are pre-calculated and added to the coordinates
		// each scanline.

		// The scanline on which we start rendering on might be in the middle of the long edge,
		// the starting x-coordinate is therefore calculated.
		var longStartCoeff = (shortEdge.y0 - longEdge.y0) / longEdgeDeltaY;
		var longX = longEdge.x0 + longEdgeDeltaX * longStartCoeff;
		var longZ = longStartZ + longEdgeDeltaZ * longStartCoeff;
		var longEdgeXincrement = longEdgeDeltaX / longEdgeDeltaY;
		var longEdgeZincrement = longEdgeDeltaZ / longEdgeDeltaY;


		var shortX = shortEdge.x0;
		var shortZ = shortStartZ;
		var shortEdgeXincrement = shortEdgeDeltaX / shortEdgeDeltaY;
		var shortEdgeZincrement = shortEdgeDeltaZ / shortEdgeDeltaY;

		var startLine = shortEdge.y0;
		var stopLine = shortEdge.y1;

		// Vertical clipping
		// TODO : Implement a cohen sutherland image space clipper for the horizontal and vertical clipping.
		if (startLine < 0) {
			// If the starting line is above the screen space,
			// the starting x-coordinates has to be advanced to
			// the proper value.
			// And the starting line is then assigned to 0.
			longX += -startLine * longEdgeXincrement;
			shortX += -startLine * shortEdgeXincrement;
			longZ += -startLine * longEdgeZincrement;
			shortZ += -startLine * shortEdgeZincrement;
			startLine = 0;
		}

		if (stopLine > this._clipY ) {
			stopLine = this._clipY;
		}

		return [startLine, stopLine, longX, shortX, longZ, shortZ, longEdgeXincrement, shortEdgeXincrement, longEdgeZincrement, shortEdgeZincrement];
	};

	SoftwareRenderer.prototype._isScanlineOccluded = function (leftX, rightX, y, leftZ, rightZ) {

		// 99% COPY PASTE FROM _fillPixels()! 

		if (rightX < 0 || leftX > this._clipX || rightX < leftX) {
			return true; // Nothing to draw here. it is occluded
		}

		if (leftZ < 0 || leftZ > 1.0000001) {
			console.error("leftZ : ", leftZ);
		}

		if (rightZ < 0 || rightZ > 1.0000001) {
			console.error("rightZ : ", rightZ);
		}

		// Horizontal clipping
		var t;
		// If the triangle's scanline is clipped, the bounding z-values have to be interpolated
		// to the new startpoints.
		if (leftX < 0) {
			t = -leftX / (rightX - leftX + 1);
			leftZ = (1.0 - t) * leftZ + t * rightZ;
			leftX = 0;
		}

		var diff = rightX - this._clipX + 1;
		if (diff > 0) {
			t = diff / (rightX - leftX + 1);
			rightZ = (1.0 - t) * rightZ + t * leftZ;
			rightX = this._clipX;
		}

		var index = y * this.width + leftX;
		var depth = leftZ;
		var depthIncrement = (rightZ - leftZ) / (rightX - leftX);
		// Fill all pixels in the interval [leftX, rightX].
		for (var i = leftX; i <= rightX; i++) {

			// TODO : Remove this debugg add of color in prod....
			this._colorData.set([Math.min(depth * 255 + 50, 255), 0, 0], index * 4);

			// Check if the value is closer than the stored one. z-test.
			if (depth > this._depthData[index]) {
				// Not occluded
				return false;
			}

			index++;
			depth += depthIncrement;
		}
		// Occluded
		return true;
	};

	/**
	*	Writes the span of pixels to the depthData. The pixels written are
	*	the closed interval of [leftX, rightX] on the y-coordinte y.
	*
	*/
	SoftwareRenderer.prototype._fillPixels = function (leftX, rightX, y, leftZ, rightZ) {

		if (rightX < 0 || leftX > this._clipX || rightX < leftX) {
			return false; // Nothing to draw here.
		}

		if (leftZ < 0 || leftZ > 1.0000001) {
			console.error("leftz : ", leftZ);
		}

		if (rightZ < 0 || rightZ > 1.0000001) {
			console.error("rightZ : ", rightZ);
		}

		// Horizontal clipping
		// TODO : Implement a clippping method to clip hoorizontally earlier in the pipeline.
		var t;
		// If the triangle's scanline is clipped, the bounding z-values have to be interpolated
		// to the new startpoints.
		if (leftX < 0) {
			t = -leftX / (rightX - leftX + 1);
			leftZ = (1.0 - t) * leftZ + t * rightZ;
			leftX = 0;
		}

		// TODO : Revise the span of pixels here... if the +1 is needed for the correct width..
		// as it is a closed interval from left to right it is probably needed. Maybe do the addition to the parameter before
		// and then render the open interval [leftx, rightx[.
		// But then the depthIncrement would have to use a - 1 in that interval.
		var diff = rightX - this._clipX + 1;
		if (diff > 0) {
			t = diff / (rightX - leftX + 1);
			rightZ = (1.0 - t) * rightZ + t * leftZ;
			rightX = this._clipX;
		}

		var index = y * this.width + leftX;
		// Starting depth is leftZ , the depth is then incremented for each pixel.
		// The last depth to be drawn should be equal to rightZ.
		var depth = leftZ;
		var depthIncrement = (rightZ - leftZ) / (rightX - leftX);
		// Fill all pixels in the interval [leftX, rightX].
		for (var i = leftX; i <= rightX; i++) {

			// Check if the value is closer than the stored one. z-test.
			if (depth > this._depthData[index]) {
				this._depthData[index] = depth;  // Store 1/w values in range [1/far, 1/near].
			}

			index++;
			depth += depthIncrement;
		}

		/*
		var lastDepth = depth - depthIncrement;
		if ( Math.abs(lastDepth - rightZ) >= 0.0000000001 && rightX - leftX >= 0) {
			console.error("Wrong depth interpolation!");
			console.log("lastdepth", lastDepth);
			console.log("rightZ", rightZ);
			console.log("depthIncrement", depthIncrement);
		}
		*/
	};

	/**
	*	Maps the data in the depth buffer to gray scale values in the color buffer.
	*/
	SoftwareRenderer.prototype.copyDepthToColor = function () {

		var colorIndex = 0;

		for(var i = 0; i < this._depthData.length; i++) {

			// Convert the float value of depth into 8bit.
			var depth = this._depthData[i] * 255;
			this._colorData[colorIndex] = depth;
			this._colorData[++colorIndex] = depth;
			this._colorData[++colorIndex] = depth;
			this._colorData[++colorIndex] = 255;
			colorIndex++;
		}
	};


	/**
	*	Returns the array of RGBA color data.
	*	@return {Uint8Array} RGBA Color data.
	*/
	SoftwareRenderer.prototype.getColorData = function () {
		return this._colorData;
	};

	/**
	*	Returns the array of depth data.
	*	@return {Float32Array} Depth data.
	*/
	SoftwareRenderer.prototype.getDepthData = function () {

		return this._depthData;
	};


	SoftwareRenderer.prototype.calculateDifference = function (webGLColorData, clearColor) {
		// REVIEW: Don't use for..in to iterate over an array.
		// Use "var i = 0; i < ..length" style instead.
		// See for example the section "for..in should not be used to iterate over an Array where index order is important"
		// at https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Statements/for...in
		// Douglas Crockford probably has something about this too.
		for (var i in this._depthData) {
			var depthvalue = this._depthData[i];

			var colorIndex = 4 * i;
			var R = webGLColorData[colorIndex];
			var G = webGLColorData[colorIndex + 1];
			var B = webGLColorData[colorIndex + 2];
			var A = webGLColorData[colorIndex + 3];
			// Make a red pixel if there is depth where there is no color in any channel except for the clear color value for that channel. (There is difference at this location)
			if (depthvalue > 0.0 && !(R > clearColor[0] * 256 || G > clearColor[1] * 256 || B > clearColor[2] * 256 || A > clearColor[3] * 256)) {
				this._colorData[colorIndex] = 255;
				this._colorData[colorIndex + 1] = 0;
				this._colorData[colorIndex + 2] = 0;
				this._colorData[colorIndex + 3] = 255;
			}
		}
	};

	return SoftwareRenderer;
});