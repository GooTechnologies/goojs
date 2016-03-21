var Matrix4 = require('../../math/Matrix4');
var Vector4 = require('../../math/Vector4');
var OccludeeTriangleData = require('./OccludeeTriangleData');

// Cohen-Sutherland area constants.
// (Clipping method for the bounding box)
/*jshint bitwise: false */
var INSIDE = 0x0;	// 0000
var LEFT = 0x1;     // 0001
var RIGHT = 0x2;	// 0010
var BELOW = 0x4;	// 0100
var ABOVE = 0x8;	// 1000
/*jshint bitwise: true */

var outCodes = new Uint8Array(8);

var positionArray = new Float32Array(8 * 4);

// The array contains the min and max x- and y-coordinates as well as the min depth.
// order: [minX, maxX, minY, maxY, minDepth]
var minMaxArray = new Float32Array(5);

var triangleIndices = new Uint8Array([
	0, 3, 4,
	3, 7, 4,
	0, 4, 5,
	0, 5, 1,
	2, 1, 5,
	2, 5, 6,
	3, 2, 6,
	3, 6, 7,
	0, 1, 2,
	0, 2, 3,
	5, 4, 6,
	7, 6, 4
]);

var edgeIndices = new Uint8Array([
	0, 1,
	1, 2,
	2, 3,
	3, 0,
	4, 5,
	5, 6,
	6, 7,
	7, 0,
	0, 4,
	1, 5,
	2, 6,
	3, 7
]);
// For a box, the number of vertices are 8 and the number of visible triangles from a view are 6. 6 * 3 indices.
// homogeneous vertices gives 32 position values.
var triangleData = new OccludeeTriangleData({'numberOfPositions': 32, 'numberOfIndices': 18 });

// Global vars for transforming data.
var v1 = new Vector4(0, 0, 0, 1);
var v2 = new Vector4(0, 0, 0, 1);
var v3 = new Vector4(0, 0, 0, 1);
var indices = new Uint8Array(3);

var combinedMatrix = new Matrix4();

/**
 * @param {SoftwareRenderer} renderer
 */
function BoundingBoxOcclusionChecker (renderer) {
	this.renderer = renderer;

	this._clipY = renderer.height - 1;
	this._clipX = renderer.width - 1;
	this._halfClipX = this._clipX / 2;
	this._halfClipY = this._clipY / 2;
}

/**
 * Occlusion culls the entity based on the entity's BoundingBox.
 * @param entity
 * @param cameraViewProjectionMatrix
 * @returns {Boolean} occluded or not occluded.
 */
BoundingBoxOcclusionChecker.prototype.occlusionCull = function (entity, cameraViewProjectionMatrix) {
	return this._doSSAABBOcclusionTest(entity, cameraViewProjectionMatrix);
	// return this._doRenderedBoundingBoxOcclusionTest(entity, cameraViewProjectionMatrix);
};

/**
 * Performs a rendered interpolated depth test for the triangles of the bounding box.
 * @param entity
 * @param cameraViewProjectionMatrix
 * @returns {Boolean} occluded or not
 * @private
 */
BoundingBoxOcclusionChecker.prototype._doRenderedBoundingBoxOcclusionTest = function (entity, cameraViewProjectionMatrix) {
	// writes data to the global variable positionArray.
	this._copyEntityVerticesToPositionArray(entity);

	// Triangles will be null on near plane clip.
	// Considering this case to be visible.
	if (!this._projectionTransformTriangleData(entity, cameraViewProjectionMatrix)) {
		return false;
	}
	this._addVisibleTrianglesToTriangleData();
	this._screenSpaceTransformTriangleData();

	var maxIndices = triangleData.indexCount;
	var tIndex = 0;
	while (tIndex < maxIndices) {
		indices[0] = triangleData.indices[tIndex++];
		indices[1] = triangleData.indices[tIndex++];
		indices[2] = triangleData.indices[tIndex++];
		if (!this.renderer.isRenderedTriangleOccluded(indices, triangleData.positions)) {
			return false;
		}
	}
	return true;
};

/**
 *  Performs a minimum depth for a screen space axis aligned bounding box created from the bounding box of the
 *  entity.
 * @param entity
 * @param cameraViewProjectionMatrix
 * @returns {Boolean} occluded or not
 * @private
 */
BoundingBoxOcclusionChecker.prototype._doSSAABBOcclusionTest = function (entity, cameraViewProjectionMatrix) {
	// writes data to the global variable positionArray.
	this._copyEntityVerticesToPositionArray(entity);

	var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
	combinedMatrix.mul2(cameraViewProjectionMatrix, entityWorldTransformMatrix);
	// TODO: Combine the transforms to pixel space.
	// Projection transform + homogeneous divide. 32 values, due to 8 vertices.
	var p = 0;
	while (p < 32) {
		var p1 = p++;
		var p2 = p++;
		var p3 = p++;
		var p4 = p++;
		v1.x = positionArray[p1];
		v1.y = positionArray[p2];
		v1.z = positionArray[p3];
		v1.data[3] = positionArray[p4];

		combinedMatrix.applyPost(v1);

		var wComponent = v1.data[3];
		if (wComponent < this.renderer.camera.near) {
			// Near plane clipped.
			// console.log("Occlusion test : early exit on near plane clipped.");
			return false;
		}

		var div = 1.0 / wComponent;
		v1.x *= div;
		v1.y *= div;

		// Screen space transform x and y coordinates, and write the transformed position data into the positionArray.
		positionArray[p1] = (v1.x + 1.0) * this._halfClipX;
		positionArray[p2] = (v1.y + 1.0) * this._halfClipY;
		// positionArray[p3] = v.z;
		// Invert w component here, this to be able to interpolate the depth over the triangles.
		positionArray[p4] = div;
	}

	this._clipBox(positionArray);

	// Round values from the clipping conservatively to integer pixel coordinates.
	minMaxArray[0] = Math.floor(minMaxArray[0]);
	minMaxArray[1] = Math.ceil(minMaxArray[1]);
	minMaxArray[2] = Math.floor(minMaxArray[2]);
	minMaxArray[3] = Math.ceil(minMaxArray[3]);

	return this._isBoundingBoxScanlineOccluded(minMaxArray);
};

/**
 *	Generates a array of homogeneous vertices for a entity's bounding box.
 */
BoundingBoxOcclusionChecker.prototype._copyEntityVerticesToPositionArray = function (entity) {
	positionArray.set(entity.occludeeComponent.positionArray);
};

/**
 *	Clips the bounding box's screen space transformed vertices and outputs the minimum and maximum x- and y-coordinates as well as the minimum depth.
 *	This is a implementation of the Cohen-Sutherland clipping algorithm. The x- and y-coordinates are only valid for comparing as min or max coordinate
 *	if the coordinate is inside the clipping window. The depth is always taken into consideration, which will be overly conservative at some cases, but without doing this,
 *	it will be non-conservative in some cases.
 *
 *  The new values are stored in the global minMaxArray.
 *
 *	@param {Float32Array} positions Array of screen space transformed vertices.
 */
BoundingBoxOcclusionChecker.prototype._clipBox = function (positions) {
	/*
	 *	http://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland
	 *	https://www.cs.drexel.edu/~david/Classes/CS430/Lectures/L-03_XPM_2DTransformations.6.pdf
	 *	http://www.cse.buffalo.edu/faculty/walters/cs480/NewLect9.pdf
	 *	https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Bitwise_Operators
	 */

	var minX, maxX, minY, maxY, minDepth;
	minX = Infinity;
	maxX = -Infinity;
	minY = Infinity;
	maxY = -Infinity;
	// NOTE: The depth is inversed at this point, (1 / w), the minimum depth is the largest.
	minDepth = -Infinity;
	/*jshint bitwise: false */

	var vPos;
	for (var i = 0; i < 8; i++) {
		vPos = i * 4;
		v1.x = positions[vPos];
		v1.y = positions[vPos + 1];
		v1.data[3] = positions[vPos + 3];
		var code = this._calculateOutCode(v1);
		outCodes[i] = code;
		if (code === INSIDE) {
			// this vertex is inside the screen and shall be used to find minimum and maximum values.

			// Check min depth (Inverted)
			minDepth = Math.max(minDepth, v1.data[3]);

			// Minimum and maximum X
			var xValue = v1.x;
			minX = Math.min(minX, xValue);
			maxX = Math.max(maxX, xValue);

			// Minimum and maximum Y
			var yValue = v1.y;
			minY = Math.min(minY, yValue);
			maxY = Math.max(maxY, yValue);
		}
	}

	var outcode1, outcode2;
	var vertIndex;
	// Go through the edges of the bounding box to clip them if needed.
	for (var edgeIndex = 0; edgeIndex < 24; edgeIndex++) {
		vertIndex = edgeIndices[edgeIndex];
		vPos = vertIndex * 4;
		v1.x = positions[vPos];
		v1.y = positions[vPos + 1];
		v1.data[3] = positions[vPos + 3];
		outcode1 = outCodes[vertIndex];

		edgeIndex++;
		vertIndex = edgeIndices[edgeIndex];
		vPos = vertIndex * 4;
		v2.x = positions[vPos];
		v2.y = positions[vPos + 1];
		v2.data[3] = positions[vPos + 3];
		outcode2 = outCodes[vertIndex];

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
				ratio = ((this._clipY - v1.y) / (v2.y - v1.y));
				v3.x = v1.x + (v2.x - v1.x) * ratio;
				v3.y = this._clipY;

				// Only check for minmax x and y if the new coordinate is inside.
				// [minX, maxX, minY, maxY, minDepth];
				nextCode = this._calculateOutCode(v3);
				if (nextCode === INSIDE) {
					maxY = this._clipY;
					// Minmax X
					var xValue = v3.x;
					minX = Math.min(minX, xValue);
					maxX = Math.max(maxX, xValue);
				}
			} else if (outsideCode & BELOW) {
				ratio = (-v1.y / (v2.y - v1.y));
				v3.x = v1.x + (v2.x - v1.x) * ratio;
				v3.y = 0;

				// Only check for minmax x and y if the new coordinate is inside.
				nextCode = this._calculateOutCode(v3);
				if (nextCode === INSIDE) {
					minY = 0;
					// Minmax X
					var xValue = v3.x;
					minX = Math.min(minX, xValue);
					maxX = Math.max(maxX, xValue);
				}
			} else if (outsideCode & RIGHT) {
				ratio = ((this._clipX - v1.x) / (v2.x - v1.x));
				v3.y = v1.y + (v2.y - v1.y) * ratio;
				v3.x = this._clipX;

				nextCode = this._calculateOutCode(v3);
				if (nextCode === INSIDE) {
					maxX = this._clipX;
					// Minimum and maximum Y
					var yValue = v3.y;
					minY = Math.min(minY, yValue);
					maxY = Math.max(maxY, yValue);
				}
			} else if (outsideCode & LEFT) {
				ratio = (-v1.x / (v2.x - v1.x));
				v3.y = v1.y + (v2.y - v1.y) * ratio;
				v3.x = 0;

				nextCode = this._calculateOutCode(v3);
				if (nextCode === INSIDE) {
					minX = 0;
					// Minimum and maximum Y
					var yValue = v3.y;
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
	minMaxArray[0] = minX;
	minMaxArray[1] = maxX;
	minMaxArray[2] = minY;
	minMaxArray[3] = maxY;
	minMaxArray[4] = minDepth;
};

/**
 * Calculates outcode for a coordinate in screen pixel space used by the Coher-Sutherland clipping algorithm.
 *	The number returned is possibly a combination of the five different bit-coded areas used in the clipping algorithm.
 * @param coordinate
 * @returns {number}
 * @private
 */
BoundingBoxOcclusionChecker.prototype._calculateOutCode = function (coordinate) {
	// Regard the coordinate as being inside the clip window initially.
	var outcode = INSIDE;
	/*jshint bitwise: false */
	if (coordinate.x < 0) {
		outcode |= LEFT;
	} else if (coordinate.x > this._clipX) {
		outcode |= RIGHT;
	}

	if (coordinate.y < 0) {
		outcode |= BELOW;
	} else if (coordinate.y > this._clipY) {
		outcode |= ABOVE;
	}
	/* jshint bitwise: true */
	return outcode;
};

/**
 *	Creates a screen space axis aligned box from the min and max values.
 *	The depth buffer is checked for each pixel the box covers against the nearest depth of the Bounding Box.
 *	@returns {Boolean} occluded or not occluded.
 *   @param {Float32Array} minmaxArray  [minX, maxX, minY, maxY, minDepth]
 */
BoundingBoxOcclusionChecker.prototype._isBoundingBoxScanlineOccluded = function (minmaxArray) {
	// Run the scanline test for each row [maxY, minY] , [minX, maxX]
	var minX = minmaxArray[0];
	var maxX = minmaxArray[1];
	var minY = minmaxArray[2];
	var maxY = minmaxArray[3];
	var minDepth = minmaxArray[4];
	// var debugColor = [0, 0, 255];
	var width = this.renderer.width;

	for (var y = maxY; y >= minY; y--) {
		var sampleCoordinate = y * width + minX;
		for (var x = minX; x <= maxX; x++) {
			// TODO : Remove setting color when not in development.
			// this.renderer._colorData.set(debugColor, sampleCoordinate * 4);
			if (this.renderer._depthData[sampleCoordinate] < minDepth) {
				return false;
			}
			sampleCoordinate++;
		}
	}

	return true;
};

/**
 *  Returns false if the entity has clipped the near plane.
 * @param entity
 * @param cameraViewProjectionMatrix
 * @returns {Boolean}
 * @private
 */
BoundingBoxOcclusionChecker.prototype._projectionTransformTriangleData = function (entity, cameraViewProjectionMatrix) {
	// first empty the triangleData.
	triangleData.clear();

	// Combine the entity world transform and camera view matrix, since nothing is calculated between these spaces
	var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
	combinedMatrix.mul2(cameraViewProjectionMatrix, entityWorldTransformMatrix);

	var maxPos = positionArray.length;
	// Projection transform + homogeneous divide for every vertex.
	// Early exit on near plane clip.
	var p2, p3, p4, wComponent, div;
	for (var p = 0; p < maxPos; p++) {
		p2 = p + 1;
		p3 = p + 2;
		p4 = p + 3;
		v1.x = positionArray[p];
		v1.y = positionArray[p2];
		v1.z = positionArray[p3];
		// w-component will always be 1.0 here.
		v1.data[3] = 1.0;

		combinedMatrix.applyPost(v1);
		wComponent = v1.data[3];
		if (wComponent < this.renderer.camera.near) {
			// Near plane clipped.
			//console.log("Rendered Occlusion Test : Early exit on near plane clipped.");
			return false;
		}

		div = 1.0 / wComponent;
		v1.x *= div;
		v1.y *= div;

		// Copy the projected position data to the triangleData object.
		triangleData.positions[p] = v1.x;
		triangleData.positions[p2] = v1.y;
		// z-component not used.
		//triangleData.positions[p3] =  v1.z;
		// store (1/w)
		triangleData.positions[p4] = div;

		p = p4;
	}

	return true;
};

BoundingBoxOcclusionChecker.prototype._addVisibleTrianglesToTriangleData = function () {
	var vPos;
	for (var i = 0; i < triangleIndices.length; i++) {
		indices = [triangleIndices[i], triangleIndices[++i], triangleIndices[++i]];

		vPos = indices[0] * 4;
		v1.x = triangleData.positions[vPos];
		v1.y = triangleData.positions[vPos + 1];
		vPos = indices[1] * 4;
		v2.x = triangleData.positions[vPos];
		v2.y = triangleData.positions[vPos + 1];
		vPos = indices[2] * 4;
		v3.x = triangleData.positions[vPos];
		v3.y = triangleData.positions[vPos + 1];

		if (!this.renderer._isBackFacingProjected(v1, v2, v3)) {
			triangleData.addIndices(indices);
		}
	}
};

BoundingBoxOcclusionChecker.prototype._screenSpaceTransformTriangleData = function () {
	// TODO : Transform only the positions going to be rendered.
	var maxPos = triangleData.positions.length;
	for (var i = 0; i < maxPos; i += 4) {
		triangleData.positions[i] = (triangleData.positions[i] + 1.0) * this._halfClipX;
		var yIndex = i + 1;
		triangleData.positions[yIndex] = (triangleData.positions[yIndex] + 1.0) * this._halfClipY;
	}
};

module.exports = BoundingBoxOcclusionChecker;
