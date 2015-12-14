define([
	'goo/math/Matrix4',
	'goo/math/Vector4'
], function (
	Matrix4,
	Vector4
) {
	'use strict';

	var tempVec = new Vector4(0, 0, 0, 1);
	var combinedMatrix = new Matrix4();

	/*
		Need to transform five homogeneous positions for a bounding sphere.

		will save the positions in the order :
		[near, left, right, top, bottom]
	*/
	var positionArray = new Float32Array(20);

	// DEBUG COLORS
	var green = [0, 255, 0];
	var cyan = [0, 190, 190];
	/*
	var red = [255, 0, 0];
	var blue = [0, 0, 255];
	var yellow = [255, 255, 0];
	var pink = [255, 0, 255];
	*/

	/**
	 *
	 * @param renderer
	 * @constructor
	 */
	function BoundingSphereOcclusionChecker (renderer) {
		this.renderer = renderer;
		this._clipY = renderer.height - 1;
		this._clipX = renderer.width - 1;
		this._halfClipX = this._clipX / 2;
		this._halfClipY = this._clipY / 2;
	}

	/**
	 * Return true if the object is occluded.
	 * @param entity
	 * @param cameraViewMatrix
	 * @param cameraProjectionMatrix
	 * @param cameraNearZInWorld
	 * @returns {Boolean} occluded or not occluded
	 */
	BoundingSphereOcclusionChecker.prototype.occlusionCull = function (entity, cameraViewMatrix, cameraProjectionMatrix, cameraNearZInWorld) {
		var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
		combinedMatrix.mul2(cameraViewMatrix, entityWorldTransformMatrix);

		var boundingSphere = entity.meshDataComponent.modelBound;

		// Set the tempVec to origin.
		tempVec.x = 0;
		tempVec.y = 0;
		tempVec.z = 0;
		tempVec.data[3] = 1.0;

		combinedMatrix.applyPost(tempVec);

		var scale = entity.transformComponent.transform.scale;

		var radius = scale.maxAxis() * boundingSphere.radius;

		/*
		Compensate for perspective distortion of the sphere.
		http://article.gmane.org/gmane.games.devel.algorithms/21697/
		http://www.gamasutra.com/view/feature/2942/the_mechanics_of_robust_stencil_.php?page=6
		http://www.nickdarnell.com/2010/06/hierarchical-z-buffer-occlusion-culling/
		Bounds.w == radius.
		float fRadius = CameraSphereDistance * tan(asin(Bounds.w / CameraSphereDistance));
		*/
		var originX = tempVec.x;
		var originY = tempVec.y;
		var originZ = tempVec.z;
		var cameraToSphereDistance = Math.sqrt(originX * originX + originY * originY + originZ * originZ);

		// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/asin
		// The asin method returns a numeric value between -pi/2 and pi/2 radians for x between -1 and 1. If the value of number is outside this range, it returns NaN.
		if (cameraToSphereDistance <= radius ) {
			return false;
		}
		var compensatedRadius = cameraToSphereDistance * Math.tan(Math.asin(radius / cameraToSphereDistance));

		// The coordinate which is closest to the near plane should be at one radius step closer to the camera.
		// w-component is always 1.0 at this point.

		var nearCut = originZ + compensatedRadius;
		if (nearCut > cameraNearZInWorld) {
			// The bounding sphere intersects the near plane, assuming to have to draw the entity by default.
			return false;
		}

		// Populate the positionarray. No need to write 1.0 to the w-component, it's not used at this point.
		// [near, left, right, top, bottom]

		// NEAR
		positionArray[0] = originX;
		positionArray[1] = originY;
		positionArray[2] = nearCut;

		// LEFT
		positionArray[4] = originX - compensatedRadius;
		positionArray[5] = originY;
		positionArray[6] = originZ;

		// RIGHT
		positionArray[8] = originX + compensatedRadius;
		positionArray[9] = originY;
		positionArray[10] = originZ;

		// TOP
		positionArray[12] = originX;
		positionArray[13] = originY + compensatedRadius;
		positionArray[14] = originZ;

		// BOTTOM
		positionArray[16] = originX;
		positionArray[17] = originY - compensatedRadius;
		positionArray[18] = originZ;

		/*
		var nearCoord = new Vector4(originX, originY, nearCut, 1.0);
		var leftCoord = new Vector4(originX - compensatedRadius, originY, originZ, 1.0);
		var rightCoord = new Vector4(originX + compensatedRadius, originY, originZ, 1.0);
		var topCoord = new Vector4(originX, originY + compensatedRadius, originZ, 1.0);
		var bottomCoord = new Vector4(originX , originY - compensatedRadius, originZ, 1.0);
		*/

		// Projection transform the positions.
		var i = 0;
		while (i < 20) {
			var i1 = i++;
			var i2 = i++;
			var i3 = i++;
			var i4 = i++;
			tempVec.x = positionArray[i1];
			tempVec.y = positionArray[i2];
			tempVec.z = positionArray[i3];
			tempVec.data[3] = 1.0;

			cameraProjectionMatrix.applyPost(tempVec);

			var div = 1.0 / tempVec.data[3];

			tempVec.x *= div;
			tempVec.y *= div;

			positionArray[i1] = (tempVec.x + 1.0) * (this._halfClipX);
			positionArray[i2] = (tempVec.y + 1.0) * (this._halfClipY);
			positionArray[i4] = div;
		}

		// Some conservative rounding of the coordinates to integer pixel coordinates.
		/*
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
		*/

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
		return this._isSSAABBScanlineOccluded();
	};

	/**
	 *	Creates a screen space axis aligned bounding box from the bounding sphere's
	 *	coordinates and performs scanline tests against the depthbuffer with the given nearest depth.
	 *
	 *	@returns {Boolean} occluded or not occluded.
	 */
	BoundingSphereOcclusionChecker.prototype._isSSAABBScanlineOccluded = function () {

		// [near, left, right, top, bottom]
		var nearestDepth = positionArray[3];

		var leftX = positionArray[4];
		var rightX = positionArray[8];

		// Fetch top and bottoms y-coordinates.
		var firstScanline = positionArray[13];
		var lastScanline = positionArray[17];

		// Round the values to create a conservative check.
		leftX = Math.floor(leftX);
		rightX = Math.ceil(rightX);
		firstScanline = Math.ceil(firstScanline);
		lastScanline = Math.floor(lastScanline);

		// Clip horizontally and vertically.
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
		var width = this.renderer.width;
		var sampleCoord;
		for (var y = firstScanline; y >= lastScanline; y--) {
			sampleCoord = y * width + leftX;
			// Check interval [leftX, rightX].
			for (var x = leftX; x <= rightX; x++) {
				// Debug, add color where scanline samples are taken.
				this.renderer._colorData.set(green, sampleCoord * 4);

				if (this.renderer._depthData[sampleCoord] < nearestDepth) {
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
	BoundingSphereOcclusionChecker.prototype._isPythagorasCircleScanlineOccluded = function (topCoordinate, bottomCoordinate, rightCoordinate, leftCoordinate, nearestDepth, color) {
		// Saving the number of rows minus one row. This is the value of use when calculating the tIncrements.
		var topRows = topCoordinate.y - rightCoordinate.y;
		var botRows = rightCoordinate.y - bottomCoordinate.y;

		var radius = rightCoordinate.x - topCoordinate.x;
		var r2 = radius * radius;
		var width = this.renderer.width;
		var ratio = width / this.renderer.height;

		// skip the top , since that will be the top coordinate , which has already been checked. Start at the next one.
		// y is the current scanline.
		var y = topCoordinate.y - 1;

		// TODO : The cases after the two first ones might not happen often enough to be of value. Tune these in the end.
		if ((topRows <= 1 && botRows <= 1) || topCoordinate.y <= 0 || bottomCoordinate.y >= this._clipY) {
			// Early exit when the number of rows are 1 or less than one, there is no height in the circle at this point.
			// This misses the middle line, might be too non-conservative !

			// DEBUGGGING Set the pixels to cyan so i know this is where it finished sampling.
			var sampleCoord;
			if (this._isCoordinateInsideScreen(topCoordinate)) {
				sampleCoord = topCoordinate.y * width + topCoordinate.x;
				this.renderer._colorData.set(cyan, sampleCoord * 4);
			}

			if (this._isCoordinateInsideScreen(bottomCoordinate)) {
				sampleCoord = bottomCoordinate.y * width + bottomCoordinate.x;
				this.renderer._colorData.set(cyan, sampleCoord * 4);
			}
			if (this._isCoordinateInsideScreen(leftCoordinate)) {
				sampleCoord = leftCoordinate.y * width + leftCoordinate.x;
				this.renderer._colorData.set(cyan, sampleCoord * 4);
			}
			if (this._isCoordinateInsideScreen(rightCoordinate)) {
				sampleCoord = rightCoordinate.y * width + rightCoordinate.x;
				this.renderer._colorData.set(cyan, sampleCoord * 4);
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
			var rightUnder = -(rightCoordinate.y + 1);
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

			for (var xindex = leftX; xindex <= rightX; xindex++) {
				this.renderer._colorData.set(color, sampleCoord * 4);
				if (this.renderer._depthData[sampleCoord] < nearestDepth) {
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

		if (topRows >= -1 && rightCoordinate.y <= this._clipY) {
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
				this.renderer._colorData.set(color, midCoord * 4);

				if (this.renderer._depthData[midCoord] < nearestDepth) {
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
		var botDiff = -(bottomCoordinate.y + 1);
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
			for (var xindex = leftX; xindex <= rightX; xindex++) {
				// Debug, add color where scanline samples are taken.
				this.renderer._colorData.set(color, sampleCoord * 4);

				if (this.renderer._depthData[sampleCoord] < nearestDepth) {
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
	 *	Check occlusion on a given coordinate.
	 *	If the coordinate is inside the screen pixel space, the given depth value is compared,
	 *	otherwise the coordinate is assumed to be occluded.
	 *
	 *	@param {Vector} coordinate The coordinate to look-up
	 *	@returns {Boolean} true or false, occluded or not occluded.
	 * @param nearestDepth
	 * @param color
	 */
	BoundingSphereOcclusionChecker.prototype._isOccluded = function (coordinate, color, nearestDepth) {
		if (this._isCoordinateInsideScreen(coordinate)) {
			var coordIndex = coordinate.y * this.renderer.width + coordinate.x;

			// Add color to the color daata (DEBUGGING PURPOSE)
			this.renderer._colorData.set(color, coordIndex * 4);

			// the sample contains 1/w depth. if the corresponding depth in the nearCoordinate is behind the sample, the entity is occluded.
			return nearestDepth < this.renderer._depthData[coordIndex];
		}
		// Assume that the object is occluded when the coordinate is outside the screen.
		// The scanline test will have to clip to the correct pixel for look-up.
		return true;
	};

	/**
	 *	Returns true if the coordinate is inside the screen pixel space. Otherwise it returns false.
	 *
	 *	@param {Vector} coordinate
	 *	@returns {Boolean} true/false
	 */
	BoundingSphereOcclusionChecker.prototype._isCoordinateInsideScreen = function (coordinate) {
		return coordinate.x >= 0 && coordinate.x <= this._clipX && coordinate.y <= this._clipY && coordinate.y >= 0;
	};

	return BoundingSphereOcclusionChecker;
});