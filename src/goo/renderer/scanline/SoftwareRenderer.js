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

		this._boundingBoxNeighbourIndices = this._generateBoundingBoxNeighbourIndices();
		console.log(this._boundingBoxNeighbourIndices);

		this.testTriangles = [
			new Triangle(new Vector3(0.2, 0.1, 1.0), new Vector3(0.1, 0.4, 1.0), new Vector3(0.3, 0.3, 1.0)),
			new Triangle(new Vector3(0.5, 0.1, 1.0), new Vector3(0.4, 0.3, 1.0), new Vector3(0.6, 0.4, 1.0)),
			new Triangle(new Vector3(0.8, 0.1, 1.0), new Vector3(0.7, 0.4, 1.0), new Vector3(0.9, 0.4, 1.0)),
			new Triangle(new Vector3(0.1, 0.5, 1.0), new Vector3(0.1, 0.9, 1.0), new Vector3(0.3, 0.7, 1.0)),
			new Triangle(new Vector3(0.15, 0.5, 1.0), new Vector3(0.5, 0.55, 1.0), new Vector3(0.86, 0.5, 1.0)),
			new Triangle(new Vector3(0.7, 0.7, 1.0), new Vector3(0.9, 0.5, 1.0), new Vector3(0.9, 0.9, 1.0))
		];
	}

	/**
	*	Returns the array of neighbours for a vertex index on a boundingbox
	*/
	SoftwareRenderer.prototype._generateBoundingBoxNeighbourIndices = function () {

		var neighbourArray = new Array(8);
		for (var i = 0; i < 8; i++) {
			var n1, n2, n3;
			switch (i) {
			case 0:
				n1 = 3;
				n2 = 1;
				n3 = 4;
				break;
			case 3:
				n1 = 2;
				n2 = 0;
				n3 = 7;
				break;
			case 4:
				n1 = 7;
				n2 = 5;
				n3 = 0;
				break;
			case 7:
				n1 = 6;
				n2 = 4;
				n3 = 3;
				break;
			default :
				n1 = (i + 7) % 8; // behind
				n2 = (i + 1) % 8; // in front
				n3 = (i + 4) % 8; // below or over
				break;
			}

			neighbourArray[i] = [n1, n2, n3];
		}

		return neighbourArray;
	};

	/**
	*	Clears the depth data.
	*/
	SoftwareRenderer.prototype._clearDepthData = function () {

		this._depthData.set(this._depthClear);
	};

	/**
	*	Renders z-buffer (w-buffer) from the given renderList of entities with OccuderComponents.
	*
	*	@param {Array.<Entity>} renderList The array of entities with attached OccluderComponents.
	*/
	SoftwareRenderer.prototype.render = function (renderList) {

		//console.time("clearTime");
		this._clearDepthData();
		//console.timeEnd("clearTime");

		// Iterates over the view frustum culled entities and draws them one entity at a time.
		for ( var i = 0; i < renderList.length; i++) {
			//console.time("triangleCreation");
			var triangles = this._createTrianglesForEntity(renderList[i]);
			//console.timeEnd("triangleCreation");

			//console.time("triangleRendering");
			for (var t = 0; t < triangles.length; t++) {
				var triangle = triangles[t];
				if ( triangle ) {
					this._renderTriangle(triangle);
				}
			}
			//console.timeEnd("triangleRendering");
		}
	};

	/**
	*	For each entity in the render list , a screen space axis aligned bounding box is created
	*	and the depthBuffer is queried at the bounds of this AABB for checking if the object is visible.
	*
	*	The entity is removed from the renderlist if it is not visible.
	*
	*	@param {Array.<Entity>} renderList The array of entities which are possible occludees.
	*/
	SoftwareRenderer.prototype.performOcclusionCulling = function (renderList) {

		var cameraViewMatrix = this.camera.getViewMatrix();
		var cameraProjectionMatrix = this.camera.getProjectionMatrix();
		var cameraNearZInWorld = -this.camera.near;

		for (var i = 0; i < renderList.length; i++) {
			var entity = renderList[i];
			if (entity.meshRendererComponent.cullMode === 'NeverOcclusionCull') {
				continue;
			}
			if (entity.meshDataComponent.modelBound instanceof BoundingSphere) {
				if (this._boundingSphereOcclusionCulling(entity, cameraViewMatrix, cameraProjectionMatrix, cameraNearZInWorld)) {
					// Removes the entity at the current index.
					renderList.splice(i, 1);
					i--; // Have to compensate the index for the loop.
				}
			} else if (entity.meshDataComponent.modelBound instanceof BoundingBox) {
				if (this._boundingBoxOcclusionCulling(entity, cameraViewMatrix, cameraProjectionMatrix)) {
					// Removes the entity at the current index.
					renderList.splice(i, 1);
					i--; // Have to compensate the index for the loop.
				}
			}
		}
	};

	SoftwareRenderer.prototype._boundingBoxOcclusionCulling = function (entity, cameraViewMatrix, cameraProjectionMatrix) {

		var entitityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;

		var combinedMatrix = Matrix4x4.combine(cameraViewMatrix, entitityWorldTransformMatrix);
		combinedMatrix = Matrix4x4.combine(cameraProjectionMatrix, combinedMatrix);

		var boundingBox = entity.meshDataComponent.modelBound;

		// Create the 8 vertices which create the bounding box.
		var x = boundingBox.xExtent;
		var y = boundingBox.yExtent;
		var z = boundingBox.zExtent;

		var v1 = new Vector4(-x, y, z, 1.0);
		var v2 = new Vector4(-x, y, -z, 1.0);
		var v3 = new Vector4(x, y, -z, 1.0);
		var v4 = new Vector4(x, y, z, 1.0);

		var v5 = new Vector4(-x, -y, z, 1.0);
		var v6 = new Vector4(-x, -y, -z, 1.0);
		var v7 = new Vector4(x, -y, -z, 1.0);
		var v8 = new Vector4(x, -y, z, 1.0);

		var vertices = [v1, v2, v3, v4, v5, v6, v7, v8];
		// TODO: Combine the transforms to pixel space.
		this._projectionTransform(vertices, combinedMatrix);
		this._transformToScreenSpace(vertices);

		var minmaxArray = [Infinity, -Infinity, Infinity, -Infinity, -Infinity];

		if (!this._clipBoundingBox(vertices, minmaxArray)) {
			return false;
		}

		/*
		// Find the max and min values of x and y respectively.
		// start with the first vertex' value as reference.
		var minX, maxX, minY, maxY, minDepth;
		if (vertices[0].w > this.camera.near) {
			// If any vertex of the bounding box is clipping the nearplane, regard the entity as beeing visible.
			return false;
		} else {
			minDepth = vertices[0].w;
		}
		minX = vertices[0].x;
		maxX = vertices[0].x;
		minY = vertices[0].y;
		maxY = vertices[0].y;

		for (var i = 1; i < 8; i++) {
			var vert = vertices[i];

			if (vert.w > this.camera.near) {
				return false;
			} else {
				if (vert.w > minDepth) {
					minDepth = vert.w;
				}
			}

			if (vert.x > maxX) {
				maxX = vert.x;
			} else if (vert.x < minX) {
				minX = vert.x;
			}

			if (vert.y > maxY) {
				maxY = vert.y;
			} else if (vert.y < minY) {
				minY = vert.y;
			}
		}

		// Round the vertices' pixel integer coordinates conservatively.
		minX = Math.floor(minX);
		maxX = Math.ceil(maxX);
		minY = Math.floor(minY);
		maxY = Math.ceil(maxY);

		*/

		// TODO : Revise clipping method, have to clamp values.

		// For some reason , the minX value doesnt seem to 
		if(minmaxArray[0] < 0) {
			minmaxArray[0] = 0;
		} else {
			minmaxArray[0] = Math.floor(minmaxArray[0]);
		}

		// Clamp max
		if (minmaxArray[1] > this._clipX){
			minmaxArray[1] = this._clipX;
		} else {
			minmaxArray[1] = Math.ceil(minmaxArray[1]);
		}

		if (minmaxArray[2] < 0) {
			minmaxArray[2] = 0;
		} else {
			minmaxArray[2] = Math.floor(minmaxArray[2]);
		}

		// Clamp.
		if (minmaxArray[3] > this._clipY){
			minmaxArray[3] = this._clipY;
		} else {
			minmaxArray[3] = Math.ceil(minmaxArray[3]);
		}

		return this._isBoundingBoxScanlineOccluded(minmaxArray);
	};

	/**
	*	Clips the BoundingBox to screen coordinates to later produce a correct screen space bounding box of the bounding box.
	*	// TODO: In case of clipping , the min / max values for either x or y could be known from here. This could be returned in
	*	some way.
	*/
	SoftwareRenderer.prototype._clipBoundingBox = function(vertices, minmaxArray) {

		var insideScreen = new Array(8);

		for (var i = 0; i < 8; i++) {
			insideScreen[i] = this._isCoordinateInsideScreen(vertices[i]);
			var cut = vertices[i].w < this.camera.near;
			if (cut && insideScreen[i]) {
				console.log("A vertex cut the near plane.");
				return false;
			} else if (cut && !insideScreen[i]) {
				console.log("cut near plane, but outside screen.");
				vertices[i].w = this.camera.near;
			} else {
			// invert the w value to be able to interpolate and compare depth at later stages of the clipping.
			vertices[i].w = 1.0 / vertices[i].w;
			}
		}

		for (var i = 0; i < 8; i++) {
			// Clip if not inside screen.
			if(!insideScreen[i]) {
				var currentVertex = vertices[i];
				var targetNeighbours = [];
				for (var j = 0; j < 3; j++) {
					var neighbourIndex = this._boundingBoxNeighbourIndices[i][j];
					if (insideScreen[neighbourIndex]) {
						targetNeighbours.push(vertices[neighbourIndex]);
					}
				}

				// Interpolate vertex along the edge to the taergetNeighbour. The amount shall be the axis which is most outside.
				// TODO : Somehow save the checks from the control if the vertex is inside or not to be able to know already which side
				//		is outside. Maybe create a new function for this, and return different integers which says which area the vertex
				//		is located in if it is outside the screen along with the amount.

				if (!targetNeighbours[0]) {
					// No neighbours inside the screen.
					continue;
				}


				var xDiff, yDiff;
				var underX = false;
				var underY = false;
				if (currentVertex.x < 0) {
					xDiff = -currentVertex.x;
					underX = true;
				} else {
					xDiff = currentVertex.x - this._clipX;
				}

				if (currentVertex.y < 0) {
					yDiff = -currentVertex.y;
					underY = true;
				} else {
					yDiff = currentVertex.y - this._clipY;
				}

				// Calculate the ratio by using the largest diff.
				var ratio;
				var a;
				var spanLength;
				if (xDiff > yDiff) {
					// Find the ratio which gives the closest depth,
					for (var n = 0; n < targetNeighbours.length; n++) {
						var neighbour = targetNeighbours[n];

						if (underX) {
							spanLength = neighbour.x + xDiff + 1;
						} else {
							spanLength = currentVertex.x - neighbour.x + 1;
						}

						ratio = xDiff / spanLength;
						a = 1.0 - ratio;
						var tempDepth = a * currentVertex.w + ratio * neighbour.w;

						// Interpolate to new Y , since we are outside on the X-side.
						var newY = currentVertex.y + ratio * (neighbour.y - currentVertex.y);

						if (tempDepth > minmaxArray[4]) {
							minmaxArray[4] = tempDepth;
						}

						if (underX) {
							minmaxArray[0] = 0;
						} else {
							minmaxArray[1] = this._clipX;
						}

						// Minmax Y
						if (newY > minmaxArray[3]) {
							minmaxArray[3] = newY;
						}
						if (newY < minmaxArray[2]) {
							minmaxArray[2] = newY;
						}
					}

				} else {
					// The current vertex is further outside on the Y axis.
					// Find the ratio which gives the closest depth,
					for (var n = 0; n < targetNeighbours.length; n++) {
						var neighbour = targetNeighbours[n];

						if (underY) {
							spanLength = neighbour.y + yDiff + 1;
						} else {
							spanLength = currentVertex.y - neighbour.y + 1;
						}

						ratio = yDiff / spanLength;
						a = 1.0 - ratio;
						var tempDepth = a * currentVertex.w + ratio * neighbour.w;

						// Interpolate to new X , since we are outside on the Yside.
						var newX = currentVertex.x + ratio * (neighbour.x - currentVertex.x);

						if (tempDepth > minmaxArray[4]) {
							minmaxArray[4] = tempDepth;
						}

						if (underY) {
							minmaxArray[2] = 0;
						} else {
							minmaxArray[3] = this._clipY;
						}

						// Minmax X
						if (newX > minmaxArray[1]) {
							minmaxArray[1] = newX;
						}
						if (newX < minmaxArray[0]) {
							minmaxArray[0] = newX;
						}
					}
				}
			} else {
				// If the vertex is inside the screen.
				// Check for min max values of the vertex.
				// Min Depth
				var vert = vertices[i];
				if (vert.w > minmaxArray[4]) {
					minmaxArray[4] = vert.w;
				}

				// Minmax X
				if (vert.x > minmaxArray[1]) {
					minmaxArray[1] = vert.x;
				}
				if (vert.x < minmaxArray[0]) {
					minmaxArray[0] = vert.x;
				}

				// Minmax Y
				if (vert.y > minmaxArray[3]) {
					minmaxArray[3] = vert.y;
				}
				if (vert.y < minmaxArray[2]) {
					minmaxArray[2] = vert.y;
				}
			}
		}
		return true;
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
	*	Return true if the object is occluded.
	*/
	SoftwareRenderer.prototype._boundingSphereOcclusionCulling = function (entity, cameraViewMatrix, cameraProjectionMatrix, cameraNearZInWorld) {

		var entitityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
		var combinedMatrix = Matrix4x4.combine(cameraViewMatrix, entitityWorldTransformMatrix);

		var boundingSphere = entity.meshDataComponent.modelBound;
		var origin = new Vector4(0,0,0,1.0);
		combinedMatrix.applyPost(origin);

		var scale = entity.transformComponent.transform.scale;
		var radius = Math.abs(boundingSphere._maxAxis(scale) * boundingSphere.radius);

		// Compensate for perspective distortion of the sphere.
		// http://article.gmane.org/gmane.games.devel.algorithms/21697/
		// http://www.gamasutra.com/view/feature/2942/the_mechanics_of_robust_stencil_.php?page=6
		// http://www.nickdarnell.com/2010/06/hierarchical-z-buffer-occlusion-culling/
		// Bounds.w == radius.
		// float fRadius = CameraSphereDistance * tan(asin(Bounds.w / CameraSphereDistance));
		var cameraToSphereDistance = Math.sqrt(origin.x * origin.x + origin.y * origin.y + origin.z * origin.z);

		// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/asin
		// The asin method returns a numeric value between -pi/2 and pi/2 radians for x between -1 and 1. If the value of number is outside this range, it returns NaN.
		if (cameraToSphereDistance <= radius ) {
			return false;
		}
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

		var red = [255, 0, 0];
		var green = [0, 255, 0];
		var blue = [0, 0, 255];
		var yellow = [255, 255, 0];
		var pink = [255, 0, 255];
		//var cyan = [0, 190, 190];

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

		return (this._isOccluded(topCoord, yellow, nearestDepth)
			&& this._isOccluded(leftCoord, blue, nearestDepth)
			&& this._isOccluded(rightCoord, green, nearestDepth)
			&& this._isOccluded(bottomCoord, yellow, nearestDepth)
			&& this._isOccluded(nearCoord, red, nearestDepth)
			&& this._isPythagorasCircleScanlineOccluded(topCoord, bottomCoord, rightCoord, leftCoord, nearestDepth, pink));

		//return this._isPythagorasCircleScanlineOccluded(topCoord, bottomCoord, rightCoord, leftCoord, nearestDepth, pink);
		//return this._isSSAABBScanlineOccluded(leftCoord, rightCoord, topCoord, bottomCoord, green, nearestDepth);
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

		//this._clampToScreen(leftX, rightX, lastScanline, firstScanline);

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
	*	Clamps the parameter coordinates to the screen's readable coordinates.
	*	// TODO : Have to use an object as parameter instead. The function is not usable cause the values aren't passed as reference.
	*
	*	@param {Number} minX
	*	@param {Number} maxX
	*	@param {Number} minY
	*	@param {Number} maxY
	*/
	SoftwareRenderer.prototype._clampToScreen = function (minX, maxX, minY, maxY) {
		if (minX < 0) {
			minX = 0;
		}

		if (maxX > this._clipX) {
			maxX = this._clipX;
		}

		if (minY < 0) {
			minY = 0;
		}

		if (maxY > this._clipY) {
			maxY = this._clipY;
		}
	};

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
		return coordinate.x >= 0 && coordinate.x <= this._clipX && coordinate.y <= this._clipY && coordinate.y >= 0;
	};


	/**
	*	Creates an array of the visible {Triangle} for the entity
	*	@param {Entity} entity, the entity from which to create triangles.
	*	@return {Array.<Triangle>} triangle array
	*/
	SoftwareRenderer.prototype._createTrianglesForEntity = function (entity) {

		var posArray = entity.occluderComponent.meshData.dataViews.POSITION;
		var vertIndexArray = entity.occluderComponent.meshData.indexData.data;

		// Allocate the trianle array for the maximum case,
		// where all the triangles are visible.
		// This will raise a need for checking for undefined during the rendering of the triangles.
		var triangles = new Array(vertIndexArray.length / 3);

		// TODO : Test the speed to draw the triangle directly instead of creation step and render step.

		var entitityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
		var cameraViewMatrix = this.camera.getViewMatrix();
		var cameraProjectionMatrix = this.camera.getProjectionMatrix();
		var cameraNearZInWorld = -this.camera.near;

		// Combine the entity world transform and camera view matrix, since nothing is calculated between these spaces
		var combinedMatrix = Matrix4x4.combine(cameraViewMatrix, entitityWorldTransformMatrix);

		for (var vertIndex = 0; vertIndex < vertIndexArray.length; vertIndex++ ) {

			// Create triangle , transform it , add it to the array of triangles to be drawn for the current entity.
			var posIndex = vertIndexArray[vertIndex] * 3;
			var v1 = new Vector4(posArray[posIndex], posArray[posIndex + 1], posArray[posIndex + 2], 1.0);

			posIndex = vertIndexArray[++vertIndex] * 3;
			var v2 = new Vector4(posArray[posIndex], posArray[posIndex + 1], posArray[posIndex + 2], 1.0);

			posIndex = vertIndexArray[++vertIndex] * 3;
			var v3 = new Vector4(posArray[posIndex], posArray[posIndex + 1], posArray[posIndex + 2], 1.0);

			var vertices = [v1, v2, v3];

			// Transform to camera view space.
			combinedMatrix.applyPost(v1);
			combinedMatrix.applyPost(v2);
			combinedMatrix.applyPost(v3);

			// Clip triangle to the near plane.

			// Outside incides are the vertices which are outside the view frustrum,
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
						origin.x + ratio * (target.x - origin.x),
						origin.y + ratio * (target.y - origin.y),
						origin.z + ratio * (target.z - origin.z)
					];

					target = vertices[insideIndices[1]];
					ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

					var newV2 = new Vector4(
						origin.x + ratio * (target.x - origin.x),
						origin.y + ratio * (target.y - origin.y),
						origin.z + ratio * (target.z - origin.z),
						1.0
					);

					vertices[outsideIndices[0]].set(newV1);
					vertices.push(newV2);

					break;
				case 2:
					// Update the two outside vertices to their new positions on the near plane.
					// First vertex update
					var origin = vertices[outsideIndices[0]];
					var target = vertices[insideIndices[0]];

					var ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

					origin.x += ratio * (target.x - origin.x);
					origin.y += ratio * (target.y - origin.y);
					origin.z += ratio * (target.z - origin.z);


					// Second vertex update
					origin = vertices[outsideIndices[1]];
					ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

					origin.x += ratio * (target.x - origin.x);
					origin.y += ratio * (target.y - origin.y);
					origin.z += ratio * (target.z - origin.z);

					break;
			}

			this._projectionTransform(vertices, cameraProjectionMatrix);

			// TODO: (Optimization) Maybe do backface culling before clipping the triangles. The method has to be revised for this.
			if (this._isBackFacing(v1, v2, v3)) {
				continue; // Skip loop to the next three vertices.
			}

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
		// therefore 'a' is caluclated as origin.z + near
		// var a = origin.z + near;
		// var b = -near - target.z;
		// var ratio = a/(a+b);

		// Simplified the ratio to :
		return (origin.z + near) / (origin.z - target.z);

	};

	/**
	*	Transforms the vertices' x and y coordinates into pixel coordinates of the screen.
	*	@param {Array.<Vector4>} vertexArray the vertices to be transformed.
	*/
	SoftwareRenderer.prototype._transformToScreenSpace = function (vertices) {

		for (var i = 0; i < vertices.length; i++) {

			var vertex = vertices[i];

			// These calculations assume that the camera's viewPortRight and viewPortTop are 1,
			// while the viewPortLeft and viewPortBottom are 0.
			// The x and y coordinates can still be outside the screen space here, but those will be clipped during rasterizing.
			// Transform to zerobasd interval of pixels instead of [0, width] which will be one pixel too much.
			// (Assuming the vertex values range from [-1, 1] when projected.)
			vertex.x = (vertex.x + 1.0) * (this._clipX / 2);
			vertex.y = (vertex.y + 1.0) * (this._clipY / 2);

			// http://www.altdevblogaday.com/2012/04/29/software-rasterizer-part-2/
			// The w-coordinate is the z-view at this point. Ranging from [0, cameraFar<].
			// During rendering, 1/w is used and saved as depth (float32). Values further than the far plane will render correctly.
			// vertex.z = vertex.w;
		}
	};

	/**
	*	Returns true if the (CCW) triangle created by the vertices v1, v2 and v3 is facing backwards.
	*	Otherwise false is returned.
	*	@param {Vector4} v1 Vertex #1
	*	@param {Vector4} v3 Vertex #2
	*	@param {Vector4} v3 Vertex #3
	*	@return {Boolean} true or false
	*/
	SoftwareRenderer.prototype._isBackFacing = function (v1, v2, v3) {

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
		return faceNormalZ < 0.0;
	};

	SoftwareRenderer.prototype._renderTestTriangles = function () {

		for ( var i = 0; i < this.testTriangles.length; i++) {
			this._renderTriangle(this.testTriangles[i].toPixelSpace(this.width, this.height));
		}
	};

	/**
	*	Takes a triangle with coordinates in pixel space, and draws it.
	*	@param {Triangle} triangle the triangle to draw.
	*/
	SoftwareRenderer.prototype._renderTriangle = function (triangle) {

		// Original idea of triangle rasterization is taken from here : http://joshbeam.com/articles/triangle_rasterization/
		// The method is improved by using vertical coherence for each of the scanlines.

		// Create edges
		// The edge contsructor stores the greatest y value in the second position.
		// It also rounds the vectors' coordinate values to the nearest pixel value. (Math.round).
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

        if (this._edges[longEdge].y1 < 0 || this._edges[longEdge].y0 > this.height) {
        // Triangle is outside the view, skipping rendering it;
        return;
        }

		// "Next, we get the indices of the shorter edges, using the modulo operator to make sure that we stay within the bounds of the array:"
        var shortEdge1 = (longEdge + 1) % 3;
        var shortEdge2 = (longEdge + 2) % 3;

        // TODO : Find out which edge is the left and which is the right side of the short edges.

        // TODO :
        //	Conservative edge rounding , which takes into repsect if a triangle is facing inwards our outwards , seen from the left edge.
        //	When rounding the values of the triangles vertices , compensate the depth as well.
        //	These good ideas are sponsored by Martin Vilcans.

        for (var i = 0; i < 3; i++) {
			// TODO: Do pre-calculations here which are now performed in drawEdges.
			this._edges[i].invertZ();
        }

        this._drawEdges(this._edges[longEdge], this._edges[shortEdge1]);
        this._drawEdges(this._edges[longEdge], this._edges[shortEdge2]);
	};

	/**
	*	Render the pixels between the long and the short edge of the triangle.
	*	@param {Edge} longEdge, shortEdge
	*/
	SoftwareRenderer.prototype._drawEdges = function (longEdge, shortEdge) {


		// TODO: Move a lot of these calculations and variables into the Edge class,
		// do the calculations once for the long edge instead of twices as it is done now.


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

        // TODO:
        // Implement this idea of checking which edge is the leftmost.
        // 1. Check if they start off at different positions, save the result and draw as usual
        // 2. If not, draw the first line and check again after this , the edges should now differ in x-coordinates.
        //    Save the result and draw the rest of the scanlines.

        var startLine = shortEdge.y0;
        var stopLine = shortEdge.y1;

        // Vertical clipping
        if (startLine < 0) {

			// If the starting line is above the screen space,
			// the starting x-coordinates has to be advanced to
			// the proper value.

			// And the starting line is then assigned to 0.

			startLine = -startLine;
			longX += startLine * longEdgeXincrement;
			shortX += startLine * shortEdgeXincrement;
			longZ += startLine * longEdgeZincrement;
			shortZ += startLine * shortEdgeZincrement;
			startLine = 0;
		}

        if (stopLine > this._clipY ) {
			stopLine = this._clipY;
        }

		var leftX;
		var rightX;

		// Fill pixels on every y-coordinate the short edge touches.
		for (var y = startLine; y <= stopLine; y++) {
			// Round to the nearest pixel.
			leftX = Math.round(longX);
			rightX = Math.round(shortX);

			// Draw the span of pixels.
			this._fillPixels(leftX, rightX, y, longZ, shortZ);

			// Increase the edges'
			// x-coordinates and z-values with the increments.
			longX += longEdgeXincrement;
			shortX += shortEdgeXincrement;

			longZ += longEdgeZincrement;
			shortZ += shortEdgeZincrement;
		}

	};

	/**
	*	Writes the span of pixels to the depthData. The pixels written are
	*	the closed interval of [leftX, rightX] on the y-coordinte y.
	*
	*/
	SoftwareRenderer.prototype._fillPixels = function (leftX, rightX, y, leftZ, rightZ) {

		// If the startindex is higher than the stopindex, they should be swapped.
		// TODO: This shall be optimized to be checked at an earlier stage.
		if (leftX > rightX) {
			var temp = leftX;
			leftX = rightX;
			rightX = temp;

			temp = leftZ;
			leftZ = rightZ;
			rightZ = temp;
		}

		if (rightX < 0 || leftX > this._clipX) {
			return; // Nothing to draw here.
		}

		// Horizontal clipping
		var t;
		// If the triangle's scanline is clipped, the bounding z-values have to be interpolated
		// to the new startpoints.
		if (leftX < 0) {
			t = -leftX / (rightX - leftX);
			leftZ = (1.0 - t) * leftZ + t * rightZ;
			leftX = 0;
		}

		var diff = rightX - this._clipX;
		if (diff > 0) {
			t = diff / (rightX - leftX);
			rightZ = (1.0 - t) * rightZ + t * leftZ;
			rightX = this._clipX;
		}

		var index = y * this.width + leftX;
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
		if ( Math.abs(lastDepth - rightZ) >= 0.0000000001 && rightX - leftX > 0) {
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