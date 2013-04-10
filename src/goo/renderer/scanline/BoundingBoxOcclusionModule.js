define([
    'goo/math/Matrix4x4',
    'goo/math/Vector4',
    'goo/math/Vector2',
    'goo/renderer/scanline/Triangle'
    ],
    /** @lends */
        function (Matrix4x4, Vector4, Vector2, Triangle) {
        "use strict";

        // Cohen-Sutherland area constants.
        // (Clipping method for the bounding box)
        /*jshint bitwise: false */
        var INSIDE = 0x0;	// 0000
        var LEFT = 0x1;     // 0001
        var RIGHT = 0x2;	// 0010
        var BELOW = 0x4;	// 0100
        var ABOVE = 0x8;	// 1000
        /*jshint bitwise: true */

        /**
         *  @param {SoftwareRenderer} renderer
         *  @constructor
         */
        function BoundingBoxOcclusionModule (renderer) {

            this.renderer = renderer;

            this._clipY = renderer.height - 1;
            this._clipX = renderer.width - 1;

            this._edgeIndices = this._generateEdgeIndices();

            this._triangleIndices = new Uint8Array(12 * 3);

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

            this._triangleIndices.set(triIndices, 0);
        }

        /**
         * Occlusion culls the entity based on the entity's BoundingBox.
         * @param entity
         * @param cameraViewProjectionMatrix
         * @returns {Boolean} occluder or not occluded.
         */
        BoundingBoxOcclusionModule.prototype.occlusionCull = function (entity, cameraViewProjectionMatrix) {
            return this._boundingBoxOcclusionCulling(entity, cameraViewProjectionMatrix);
            // return this._renderedBoundingBoxOcclusionTest(entity, cameraViewProjectionMatrix);
        };

        /**
         * Performs a interpolated depth test for the triangles of the bounding box.
         * @param entity
         * @param cameraViewProjectionMatrix
         * @returns {Boolean} occluded or not
         * @private
         */
        BoundingBoxOcclusionModule.prototype._renderedBoundingBoxOcclusionTest = function (entity, cameraViewProjectionMatrix) {

            var triangles = this._createProjectedTrianglesForBoundingBox(entity, cameraViewProjectionMatrix);

            // Triangles will be null on near plane clip.
            // Considering this case to be visible.
            if (triangles === null) {
                return false;
            }

            var triCount = triangles.length;
            for (var t = 0; t < triCount; t++) {
                if (!this.renderer.isRenderedTriangleOccluded(triangles[t])){
                    return false;
                }
            }

            return true;
        };

        /**
         *  Performs a minimum depth for a screen space axis aligned bounding box created from the boudning box of the
         *  entity.
         * @param entity
         * @param cameraViewProjectionMatrix
         * @returns {Boolean} occluded or not
         * @private
         */
        BoundingBoxOcclusionModule.prototype._boundingBoxOcclusionCulling = function (entity, cameraViewProjectionMatrix) {

            var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;

            var combinedMatrix = Matrix4x4.combine(cameraViewProjectionMatrix, entityWorldTransformMatrix);

            var vertices = this._generateBoundingBoxVertices(entity);

            // TODO: Combine the transforms to pixel space.
            // Projection transform + homogeneous divide
            for (var i = 0; i < vertices.length; i++) {
                var v = vertices[i];

                combinedMatrix.applyPost(v);

                if (v.data[3] < this.renderer.camera.near) {
                    // Near plane clipped.
                    console.log("Early exit on near plane clipped.");
                    return false;
                }

                var div = 1.0 / v.data[3];
                v.data[0] *= div;
                v.data[1] *= div;

                // For interpolating in screen space, in the clipping method.
                v.data[3] = 1.0 / v.data[3];
            }

            this.renderer._transformToScreenSpace(vertices);

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
         * Creates an array containing the 12 edges which a box is made up of. The edges are used in the Cohen-Sutherland
         * clipping algorithm.
         * @returns {Array}
         * @private
         */
        BoundingBoxOcclusionModule.prototype._generateEdgeIndices = function () {
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
         *	Generates a array of homogeneous vertices for a entity's bounding box.
         *	// TODO : These vertices should probably be saved as a typed array for each object which
         *	need to have occludee possibilities.
         *
         *
         *	@return {Array.<Vector4>} vertex array
         */
        BoundingBoxOcclusionModule.prototype._generateBoundingBoxVertices = function (entity) {
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
         *	Clips the bounding box's screen space transformed vertices and outputs the minimum and maximum x- and y-coordinates as well as the minimum depth.
         *	This is a implementation of the Cohen-Sutherland clipping algorithm. The x- and y-coordinates are only valid for comparing as min or max coordinate
         *	if the coordinate is inside the clipping window. The depth is always taken into consideration, which will be overly conservative at some cases, but without doing this,
         *	it will be non-conservative in some cases.
         *
         *	@param {Array.<Vector>} vertices Array of screen space transformed vertices.
         *	@returns {Array.<Number>} minmaxArray Array to which the minimum and maximum values are written.
         */
        BoundingBoxOcclusionModule.prototype._cohenSutherlandClipBox = function (vertices) {
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

                var edgePair = this._edgeIndices[edgeIndex];
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
         * Calculates outcode for a coordinate in screen pixel space used by the Coher-Sutherland clipping algorithm.
         *	The number returned is possibly a combination of the five different bit-coded areas used in the clipping algorithm.
         * @param coordinate
         * @returns {number}
         * @private
         */
        BoundingBoxOcclusionModule.prototype._calculateOutCode = function (coordinate) {

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
         *   @param {Array.<Number>} minmaxArray  [minX, maxX, minY, maxY, minDepth]
         */
        BoundingBoxOcclusionModule.prototype._isBoundingBoxScanlineOccluded = function (minmaxArray) {

            // Run the scanline test for each row [maxY, minY] , [minX, maxX]
            var minX = minmaxArray[0];
            var maxX = minmaxArray[1];
            var minY = minmaxArray[2];
            var maxY = minmaxArray[3];
            var minDepth = minmaxArray[4];
            var debugColor = [0, 0, 255];
            var width = this.renderer.width;

            for (var y = maxY; y >= minY; y--) {
                var sampleCoordinate = y * width + minX;
                for (var x = minX; x <= maxX; x++) {
                    // TODO : Remove setting color when not in development.
                    this.renderer._colorData.set(debugColor, sampleCoordinate * 4);
                    if (this.renderer._depthData[sampleCoordinate] < minDepth) {
                        return false;
                    }
                    sampleCoordinate++;
                }
            }

            return true;
        };

        /**
         * Creates an array of triangles and transforms them to projection space. Null is returned if any of the vertices
         * cut the near plane.
         * @param entity
         * @param cameraViewProjectionMatrix
         * @returns {Array.<Triangle>} triangles or null if early exit is found.
         * @private
         */
        BoundingBoxOcclusionModule.prototype._createProjectedTrianglesForBoundingBox = function (entity, cameraViewProjectionMatrix) {

            var entityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;

            // Combine the entity world transform and camera view matrix, since nothing is calculated between these spaces
            var combinedMatrix = Matrix4x4.combine(cameraViewProjectionMatrix, entityWorldTransformMatrix);

            var vertices = this._generateBoundingBoxVertices(entity);
            // Projection transform + homogeneous divide for every vertex.
            // Early exit on near plane clip.
            for (var j = 0; j < vertices.length; j++) {
                var v = vertices[j];

                combinedMatrix.applyPost(v);

                if (v.data[3] < this.renderer.camera.near) {
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
            for (var i = 0; i < this._triangleIndices.length; i++) {

                var v1 = new Vector4();
                var v2 = new Vector4();
                var v3 = new Vector4();

                v1.data.set(vertices[this._triangleIndices[i]].data);
                i++;
                v2.data.set(vertices[this._triangleIndices[i]].data);
                i++;
                v3.data.set(vertices[this._triangleIndices[i]].data);

                var projectedVertices = [v1, v2, v3];

                if (this.renderer._isBackFacingProjected(v1, v2, v3)) {
                    continue;
                }

                this.renderer._transformToScreenSpace(projectedVertices);

                triangles.push(new Triangle(projectedVertices[0], projectedVertices[1], projectedVertices[2]));
            }

            return triangles;
        };

        return BoundingBoxOcclusionModule;
    });