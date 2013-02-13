define([
	'goo/renderer/Camera',
	'goo/renderer/scanline/Triangle',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/math/Ray',
	'goo/math/Plane',
	'goo/math/Matrix4x4',
	'goo/renderer/scanline/Edge'
	],
	/** @lends SoftwareRenderer */

	function (Camera, Triangle, Vector3, Vector4, Ray, Plane, Matrix4x4, Edge) {
	"use strict";

	/*
	*	@class A software renderer which renders, triangles only(!), using a scanline algorithm.
	*	@constructor
	* 	@param parameters, A JSON object which has to contain width, height and the camera object to be used.
	*/
	function SoftwareRenderer(parameters) {
		parameters = parameters || {};

		this.width = parameters.width;
		this.height = parameters.height;

		this._clipX = this.width - 1;
		this._clipY = this.height - 1;

		this.numOfPixels = this.width * this.height;

		this.camera = parameters.camera;

		// Store the edges for a triangle 
		this.edges = new Array(3);

		var colorBytes = this.numOfPixels * 4 * Uint8Array.BYTES_PER_ELEMENT;
		var depthBytes = this.numOfPixels * Uint8Array.BYTES_PER_ELEMENT;

		this._frameBuffer = new ArrayBuffer(colorBytes + depthBytes * 2);

		// The color data is used for debugging purposes.
		this._colorData = new Uint8Array(this._frameBuffer, 0, this.numOfPixels * 4);
		this._depthData = new Uint8Array(this._frameBuffer, colorBytes, this.numOfPixels); // TODO: Change to float / uint16 / ...
		// Buffer for clearing.
		this._depthClear = new Uint8Array(this._frameBuffer, colorBytes + depthBytes, this.numOfPixels); // TODO: Change to float / uint16 / ...

		for (var i = 0; i < this.numOfPixels; i++) {
			this._depthClear[i] = 0;
		}


		this.testTriangles = [
			new Triangle(new Vector3(0.2, 0.1, 1.0), new Vector3(0.1, 0.4, 1.0), new Vector3(0.3, 0.3, 1.0)),
			new Triangle(new Vector3(0.5, 0.1, 1.0), new Vector3(0.4, 0.3, 1.0), new Vector3(0.6, 0.4, 1.0)),
			new Triangle(new Vector3(0.8, 0.1, 1.0), new Vector3(0.7, 0.4, 1.0), new Vector3(0.9, 0.4, 1.0)),
			new Triangle(new Vector3(0.1, 0.5, 1.0), new Vector3(0.1, 0.9, 1.0), new Vector3(0.3, 0.7, 1.0)),
			new Triangle(new Vector3(0.15, 0.5, 1.0), new Vector3(0.5, 0.55, 1.0), new Vector3(0.86, 0.5, 1.0)),
			new Triangle(new Vector3(0.7, 0.7, 1.0), new Vector3(0.9, 0.5, 1.0), new Vector3(0.9, 0.9, 1.0))
		];
	};

	/*
	* Clears the depth data
	*/
	SoftwareRenderer.prototype.clearDepthData = function () {

		this._depthData.set(this._depthClear);
	};

	SoftwareRenderer.prototype.render = function (renderList) {

		this.clearDepthData();
	
		if (Array.isArray(renderList)) {
			// TODO: Sort the renderlist back to front.
			//this.renderQueue.sort(renderList, camera);

			// Iterate over the view frustum culled entities.
			for ( var i = 0; i < renderList.length; i++) {
				
				var triangles = this.createTrianglesForEntity(renderList[i]);

				for (var t = 0; t < triangles.length; t++) {
					var triangle = triangles[t];
					if ( triangle ) {
						this.renderTriangle(triangle);
						//console.log(triangle.printVertexData());
					}
				}
			}
		} else {
			console.log("Render list not an array?");
		}

	};

	/*
	*	Creates an array of the visible {Triangle} for the entity
	*	@param {Entity} entity, the entity from which to create triangles.
	*	@return Triangle[]
	*/
	SoftwareRenderer.prototype.createTrianglesForEntity = function (entity) {


		var posArray = entity.meshDataComponent.meshData.attributeMap.POSITION.array;
		var vertIndexArray = entity.meshDataComponent.meshData.indexData.data;

		// Allocate the trianle array for the maximum case,
		// where all the triangles are visible.
		// This will raise a need for checking for undefined during the rendering of the triangles.
		var triangles = new Array(vertIndexArray.length / 3);

		// TODO : Test the speed to draw the triangle directly instead of creation step and render step.
		
	//	var cameraMVPMatrix = this.camera.getViewProjectionMatrix();
		var cameraViewMatrix = this.camera.getViewMatrix();
		var cameraProjectionMatrix = this.camera.getProjectionMatrix();
		var cameraNear = -this.camera.near;

		var timerStart = performance.now();
		for (var vertIndex = 0; vertIndex < vertIndexArray.length; vertIndex++ ) {
			
			// Create triangle , transform it , add it to the array of triangles to be drawn for the current entity.
			var posIndex = vertIndexArray[vertIndex] * 3;
			var v1 = new Vector4(posArray[posIndex], posArray[posIndex + 1], posArray[posIndex + 2], 1.0);

			posIndex = vertIndexArray[++vertIndex] * 3;
			var v2 = new Vector4(posArray[posIndex], posArray[posIndex + 1], posArray[posIndex + 2], 1.0);

			posIndex = vertIndexArray[++vertIndex] * 3;
			var v3 = new Vector4(posArray[posIndex], posArray[posIndex + 1], posArray[posIndex + 2], 1.0);

			var vertices = [v1, v2, v3];

			// Transform the vertices to world space with the entity's world transformation.
			
			var entitityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
			entitityWorldTransformMatrix.applyPost(v1);
			entitityWorldTransformMatrix.applyPost(v2);
			entitityWorldTransformMatrix.applyPost(v3);


			// Transform to camera view space.
			cameraViewMatrix.applyPost(v1);
			cameraViewMatrix.applyPost(v2);
			cameraViewMatrix.applyPost(v3);


			// Clip triangle to the near plane.

			// Outside incides are the vertices which are outside the view frustrum,
			// that is closer than the near plane in this case.
			// The inside indices are the ones on the inside.
			var outsideIndices = [];
			var insideIndices = [];
	
			for ( var i = 0; i < 3; i++ ) {
				
				if (vertices[i].z < cameraNear) {
					insideIndices.push(i);
				}
				else {
					outsideIndices.push(i);
				}
			}

			switch (outsideIndices.length) {
				case 0:
					// All indices are on the inside. Continue as usual.
					break;
				case 3:
					// All of the vertices are on the outside, skip to the next three vertices.
					continue;
					break;
				case 1:
					// Update the one vertex to its new position on the near plane and add a new vertex
					// on the other intersection with the plane.

					var origin = vertices[outsideIndices[0]];
					var target = vertices[insideIndices[0]];

					var ratio = this.calculateIntersectionRatio(origin, target);

					var newV1 = [
						origin.x + target.x * ratio,
						origin.y + target.y * ratio,
						origin.z + target.z * ratio,
						1.0
					];

					target = vertices[insideIndices[1]];

					ratio = this.calculateIntersectionRatio(origin, target);

					var newV2 = new Vector4(
					origin.x + target.x * ratio,
					origin.y + target.y * ratio,
					origin.z + target.z * ratio,
					1.0
					);

					vertices[outsideIndices[0]].set(newV1);
					vertices.push(newV2);

					break;
				case 2:
					// Update the two outside vertices to their new positions on the near plane.
					var origin = vertices[outsideIndices[0]];
					var target = vertices[insideIndices[0]];

					var ratio = this.calculateIntersectionRatio(origin, target, cameraNear);

					origin.x += ratio * target.x;
					origin.y += ratio * target.y;
					origin.z += ratio * target.z;

					origin = vertices[outsideIndices[1]];

					ratio = this.calculateIntersectionRatio(origin, target, cameraNear);

					origin.x += ratio * target.x;
					origin.y += ratio * target.y;
					origin.z += ratio * target.z;

					break;
			}

			// Projection and homogeneous division transformation
			for (var i = 0; i < vertices.length; i++) {
				var v = vertices[i];
				cameraProjectionMatrix.applyPost(v);
				v.mul(1.0 / v.w);
				//console.log(v.z);
			}

			// TODO: Check if this is the optimal place in the pipeline to do backface culling
			// 		 Assumed I had to do this here since the perspective transformed triangles'
			//		 visibility might differ from the world transformed.
			
			// Back-face culling.
			if (this.isBackFacing(v1,v2,v3)) {
				continue;
			}
			
			// Transform the vertices to screen space
			for (var i = 0; i < vertices.length; i++) {
				this.transformToScreenSpace(vertices[i]);
			}

			// Create the triangle(s)
			if (vertices.length ==  4) {
				// The vertex array has a length 4 only if one of the vertices were outside the near plane.
				// The "extra vertex" is at position 3 in the array.

				var triangle1 = new Triangle(vertices[outsideIndices[0]], vertices[insideIndices[0]], vertices[3]);
				var triangle2 = new Triangle(vertices[3], vertices[insideIndices[0]], vertices[insideIndices[1]]);

				triangles.push(triangle1);
				triangles.push(triangle2);

			} else {
				triangles.push(new Triangle(v1, v2, v3));
			}
		}

		var timerStop = performance.now();
		console.log("TriangleArray creation time :" , timerStop - timerStart, "ms");

		return triangles;
	};

	SoftwareRenderer.prototype.calculateIntersectionRatio = function(origin, target) {
			
		var direction = new Vector3(
				target.x - origin.x,
				target.y - origin.y,
				target.z - origin.z
			);

		//direction.normalize();


		// Dot product only simplified due to plane normal being [0,0,1];
		// Only need to account for the z-coordinates.
		
		// Ratio = - (origin dot planeNormal + planeConstant / (direction dot planeNormal))
		return -(origin.z + this.camera.near) / direction.z;

	};

	/*
	*	Transforms the vertex' x and y coordinates into pixel coordinates of the screen.
	*	@param {Vector} vertex, the vertex to be transformed.
	*/
	SoftwareRenderer.prototype.transformToScreenSpace = function (vertex) {

		// These calculations assume that the camera's viewPortRight and viewPortTop are 1, 
		// while the viewPortLeft and viewPortBottom are 0.
		vertex.x = (vertex.x + 1.0) * (this.width / 2);
		vertex.y = (vertex.y + 1.0) * (this.height / 2);
		// TODO: Revise how to transform the z value, if it at all should be transformed.
		// store.z = (store.z + 1) / 2;
		vertex.z = (vertex.z + 1) / 2;

	};

	/*
	*	Returns true if the (CCW) triangle created by the vertices v1, v2 and v3 is facing backwards.
	*	Otherwise false is returned.
	* 	@param {Vector4} v1, v2, v3
	*	@return {Boolean} true / false
	*/
	SoftwareRenderer.prototype.isBackFacing = function (v1, v2, v3) {

		// Calculate the dot product between the triangle's face normal and the camera's eye direction
		// to find out if the face is facing away or not.


		// Create edges for calculating the normal.
		//var e1 = new Vector3(v1.x - v2.x , v1.y - v2.y, v1.z - v2.z);
		//var e2 = new Vector3(v1.x - v3.x, v1.y - v3.y, v1.z - v3.z);

		// Doing the cross product since the built-in methods in Vector3 seems to do much error checking.
		// Also able to optimize away 66% of the computations, due to being in perspective space.
		//faceNormal.data[0] = e2.data[2] * e1.data[1] - e2.data[1] * e1.data[2];
		//faceNormal.data[1] = e2.data[0] * e1.data[2] - e2.data[2] * e1.data[0];

		//var faceNormalZ = e2.data[1] * e1.data[0] - e2.data[0] * e1.data[1];

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
		
		// Invert the comparison to remove the negation of facenormalZ.
		if ( faceNormalZ < 0.0 ) {
			return true;
		}

		return false;
	};

	SoftwareRenderer.prototype.renderTestTriangles = function () {

		for ( var i = 0; i < this.testTriangles.length; i++) {
			this.renderTriangle(this.testTriangles[i].toPixelSpace(this.width, this.height));
		}
	};

	/*
	*	Takes a triangle with coordinates in pixel space, and draws it.
	*	@param {Triangle} triangle the triangle to draw.
	*/
	SoftwareRenderer.prototype.renderTriangle = function (triangle) {

		// Original idea of triangle rasterization is taken from here : http://joshbeam.com/articles/triangle_rasterization/
		// The method is improved by using vertical coherence for each of the scanlines.

		//triangle.printVertexData();

		// Create edges
		// The edge contsructor stores the greatest y value in the second position.
		// It also rounds the vectors' coordinate values to the nearest pixel value. (Math.round).
		this.edges = [
			new Edge(triangle.v1, triangle.v2),
			new Edge(triangle.v2, triangle.v3), 
			new Edge(triangle.v3, triangle.v1)
		];
		
		var maxHeight = 0;
        var longEdge = 0;

        // Find edge with the greatest height in the Y axis, this is the long edge.
        for(var i = 0; i < 3; i++) {
            var height = this.edges[i].y1 - this.edges[i].y0;
            if(height > maxHeight) {
                    maxHeight = height;
                    longEdge = i;
            }
        }

        if (this.edges[longEdge].y1 < 0 || this.edges[longEdge].y0 > this.width ) {
        	console.log("Triangle is outside the view, skipping rendering it");
        	return;
        }
		
		// "Next, we get the indices of the shorter edges, using the modulo operator to make sure that we stay within the bounds of the array:"
        var shortEdge1 = (longEdge + 1) % 3;
        var shortEdge2 = (longEdge + 2) % 3;

        this.drawEdges(this.edges[longEdge], this.edges[shortEdge1]);
        this.drawEdges(this.edges[longEdge], this.edges[shortEdge2]);
	};

	/*
	*	Render the pixels between the long and the short edge of the triangle.
	*/
	SoftwareRenderer.prototype.drawEdges = function (longEdge, shortEdge) {

		// Early exit when the short edge doesnt have any height (y-axis).
		// -The edges' coordinates are stored as uint8, so compare with a SMI (SMall Integer, 31-bit signed integer) and not Double.

        var shortEdgeDeltaY = (shortEdge.y1 - shortEdge.y0);
        if(shortEdgeDeltaY <= 0) {
            return; // Nothing to draw here.
        }

		var longEdgeDeltaY = (longEdge.y1 - longEdge.y0);

		// Checking the long edge will probably be unneccessary, since if the short edge has no height, then the long edge must defenetly hasnt either?
		// Shouldn't be possible for the long edge to be of height 0 if any of the short edges has height. 
		
        var longEdgeDeltaX = longEdge.x1 - longEdge.x0;
        var shortEdgeDeltaX = shortEdge.x1 - shortEdge.x0;

        // Vertical coherence : 
        // The x-coordinates' increment for each step in y is constant, 
        // so the increments are pre-calculated and added to the coordinates
        // each scanline.


        // The scanline on which we start rendering on might be in the middle of the long edge,
        // the starting x-coordinate is therefore calculated.
        var longStartCoeff = (shortEdge.y0 - longEdge.y0) / longEdgeDeltaY;
        var longX = longEdge.x0 + longEdgeDeltaX * longStartCoeff;
        var longEdgeXincrement = longEdgeDeltaX / longEdgeDeltaY;

        var shortX = shortEdge.x0;
        var shortEdgeXincrement = shortEdgeDeltaX / shortEdgeDeltaY;

        // TODO:
        // Implement this idea of checking which edge is the leftmost.
        // 1. Check if they start off at different positions, save the result and draw as usual
        // 2. If not, draw the first line and check again after this , the edges should now differ in x-coordinates. 
        //    Save the result and draw the rest of the scanlines.

        var startIndex;
        var stopIndex;

        var startLine = shortEdge.y0;
        var stopLine = shortEdge.y1;

        // Vertical clipping
        if ( startLine < 0 ) {

        	// If the starting line is above the screen space,
        	// the starting x-coordinates has to be advanced to 
        	// the proper value.

        	// And the starting line is then assigned to 0.

        	longX += -startLine * longEdgeXincrement;
        	shortX += -startLine * shortEdgeXincrement;
        	startLine = 0;
        }

        if ( stopLine > this._clipY ) {
        	stopLine = this._clipY;
        }

        // Iterate in the span between the starting and stop lines.
        for (var y = startLine; y <= stopLine; y++) {

        	// Round to the nearest pixel.
        	startIndex = Math.round(longX);
        	stopIndex = Math.round(shortX);

        	// Draw the span of pixels.
     
    		this.fillPixels(startIndex, stopIndex, y);
        	
  			// Increase the edges' x-coordinates with the increments.
        	longX += longEdgeXincrement;
        	shortX += shortEdgeXincrement;
        }

	};

	SoftwareRenderer.prototype.fillPixels = function (startIndex, stopIndex, y) {

		// If the startindex is higher than the stopindex, they should be swapped.
		// TODO: This shall be optimized to be checked at an earlier stage. 
		if ( startIndex > stopIndex ) {
			var temp = startIndex;
			startIndex = stopIndex;
			stopIndex = temp;
		}

		// Horizontal clipping
	   	if ( startIndex < 0 ) {
    		startIndex = 0;
    	}

    	if ( stopIndex > this._clipX ) {
    		stopIndex = this._clipX;
    	}

		var row = y*this.width;

		for (var i = startIndex; i <= stopIndex; i++) {
			this._depthData[row + i] = 255;
		}
	};

	SoftwareRenderer.prototype.copyDepthToColor = function () {

		var colorIndex = 0;
		var depth;
		
		for( var i = 0; i < this._depthData.length; i++) {

			var depth = this._depthData[i];
			this._colorData[colorIndex] = depth;
			this._colorData[++colorIndex] = depth;
			this._colorData[++colorIndex] = depth;
			this._colorData[++colorIndex] = 255;
			colorIndex++;
		}
		

		/*
		// This was slower.
		
		var depthLine = new Uint8Array(this.width);
		var colorLine = new Uint8Array(this.width * 4);
		var start;
		var end;
		var width = this.width;
		for ( var scanline = 0; scanline < this.height; scanline++)
		{
			// fetch one line from the depthdata
			start = scanline * width;
			end = start+width;
			depthLine = this._depthData.subarray(start, end);
			
			// Convert the line to RGBA
			for (var i = 0; i < depthLine.length; i++) {
				depth = depthLine[i];
				colorLine.set([depth, depth, depth, 255], (i*4));
			}

			this._colorData.set(colorLine, start*4);
		}
		*/
	};

	
	SoftwareRenderer.prototype.getColorData = function () {
		return this._colorData;
	};

	SoftwareRenderer.prototype.getDepthData = function () {

		return this._depthData;
	};

	return SoftwareRenderer;

});