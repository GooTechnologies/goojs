define([
	'goo/math/Vector4',
	'goo/math/Matrix4x4',
	'goo/renderer/scanline/Edge',
	'goo/renderer/bounds/BoundingSphere',
	'goo/renderer/bounds/BoundingBox',
    'goo/renderer/scanline/EdgeData',
    'goo/renderer/scanline/BoundingBoxOcclusionModule',
    'goo/renderer/scanline/BoundingSphereOcclusionModule',
    'goo/renderer/scanline/OccluderTriangleData'
	],
	/** @lends */

	function (Vector4, Matrix4x4, Edge, BoundingSphere, BoundingBox, EdgeData,
              BoundingBoxOcclusionModule, BoundingSphereOcclusionModule, OccluderTriangleData) {
	    "use strict";

        // Variables used during creation of triangle data and rendering
        var indices = new Uint8Array(4);
        var vertexPositions = new Uint16Array(3);
        var v1 = new Vector4(0, 0, 0, 1);
        var v2 = new Vector4(0, 0, 0, 1);
        var v3 = new Vector4(0, 0, 0, 1);
        // Clipping vector is used for near clipping, thus the z component is -1.0.
        var clipVec = new Vector4(0, 0, -1.0, 1);
        var g_vertices = [v1, v2, v3];

        var outsideIndices = new Uint8Array(3);
        var insideIndices = new Uint8Array(3);

        // Store matrix4x4 to be re-used
        var cameraViewProjectionMatrix = new Matrix4x4();
        var combinedMatrix = new Matrix4x4();


        // EdgeData used during rendering.
        var edgeData = new EdgeData();

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
            this._halfClipX = this._clipX / 2;
            this._halfClipY = this._clipY / 2;

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

            //Initialize the clear buffer
            for (var i = 0; i < numOfPixels; i++) {
                this._depthClear[i] = 0.0;
            }

            this._triangleData = new OccluderTriangleData({'vertCount': parameters.maxVertCount, 'indexCount': parameters.maxIndexCount});
            // TODO : Rewrite so that the data is empty from the beginning.
            this._triangleData.clear();

            this.boundingBoxModule = new BoundingBoxOcclusionModule(this);
            this.boundingSphereModule = new BoundingSphereOcclusionModule(this);
        }

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

            var triCount;

            // Iterates over the view frustum culled entities and draws them one entity at a time.
            for ( var i = 0; i < renderList.length; i++) {
                this._createTrianglesForEntity(renderList[i], cameraViewMatrix, cameraProjectionMatrix);
                triCount = this._triangleData.indexCount;
                for (var tIndex = 0; tIndex < triCount; tIndex++) {
                    // Take 3 indices and render the triangle
                    indices[0] = this._triangleData.indices[tIndex];
                    indices[1] = this._triangleData.indices[++tIndex];
                    indices[2] = this._triangleData.indices[++tIndex];
                    this._renderTriangle(indices, this._triangleData.positions);
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
            Matrix4x4.combine(cameraProjectionMatrix, cameraViewMatrix, cameraViewProjectionMatrix);
            var cameraNearZInWorld = -this.camera.near;
            var visibleEntities = [];

            for (var i = 0; i < renderList.length; i++) {
                var entity = renderList[i];
                if (entity.meshRendererComponent.cullMode !== 'NeverOcclusionCull') {

                    var cull;

                    if (entity.meshDataComponent.modelBound instanceof BoundingSphere) {
                        cull = this.boundingSphereModule.occlusionCull(entity, cameraViewMatrix, cameraProjectionMatrix, cameraNearZInWorld);
                    } else if (entity.meshDataComponent.modelBound instanceof BoundingBox) {
                        cull = this.boundingBoxModule.occlusionCull(entity, cameraViewProjectionMatrix);
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
        *	Creates an array of the visible
        *	@param {Entity} entity, the entity from which to create triangles.
        *	@return {OccluderTriangleData} triangleData
        *   @param cameraProjectionMatrix
        *   @param cameraViewMatrix
        */
        SoftwareRenderer.prototype._createTrianglesForEntity = function (entity, cameraViewMatrix, cameraProjectionMatrix) {

            // Reset the global vectors' w-components to 1
            v1.data[3] = 1.0;
            v2.data[3] = 1.0;
            v3.data[3] = 1.0;

            var originalPositions = entity.occluderComponent.meshData.dataViews.POSITION;
            var originalIndexArray = entity.occluderComponent.meshData.indexData.data;
            var entitityWorldTransformMatrix = entity.transformComponent.worldTransform.matrix;
            // Combine the entity world transform and camera view matrix, since nothing is calculated between these spaces
            Matrix4x4.combine(cameraViewMatrix, entitityWorldTransformMatrix, combinedMatrix);

            // Initialize the triangleData to the current amount of vertices and indices.
            var vertCount = originalPositions.length / 3;
            this._triangleData.clear();
            this._triangleData.posCount = vertCount * 4;
            this._triangleData.largestIndex = vertCount - 1;

            // Transform vertices to camera view space beforehand to not transform several times on a vertex. ( up to three times ).
            // The homogeneous coordinate,w , will not be altered during this transformation. And remains 1.0.
            var maxPos = originalPositions.length;
            var offset = 0;
            for (var i = 0; i < maxPos; i++) {
                v1.data[0] = originalPositions[i];
                i++;
                v1.data[1] = originalPositions[i];
                i++;
                v1.data[2] = originalPositions[i];

                combinedMatrix.applyPost(v1);

                // Insert the homogeneous coordinate (x,y,z,w) to the triangleData's position array.
                this._triangleData.positions[offset] = v1.data[0];
                offset++;
                this._triangleData.positions[offset] = v1.data[1];
                offset++;
                this._triangleData.positions[offset] = v1.data[2];
                offset += 2;
            }

            var cameraNearZInWorld = -this.camera.near;
            var indexCount = originalIndexArray.length;

            for (var vertIndex = 0; vertIndex < indexCount; vertIndex++ ) {

                indices[0] = originalIndexArray[vertIndex];
                indices[1] = originalIndexArray[++vertIndex];
                indices[2] = originalIndexArray[++vertIndex];
                // The vertexpositions holds the index to the x-component in the triangleData's position array.
                vertexPositions[0] = indices[0] * 4;
                vertexPositions[1] = indices[1] * 4;
                vertexPositions[2] = indices[2] * 4;

                var vPos = vertexPositions[0];
                v1.data[0] = this._triangleData.positions[vPos];
                v1.data[1] = this._triangleData.positions[vPos + 1];
                v1.data[2] = this._triangleData.positions[vPos + 2];
                vPos = vertexPositions[1];
                v2.data[0] = this._triangleData.positions[vPos];
                v2.data[1] = this._triangleData.positions[vPos + 1];
                v2.data[2] = this._triangleData.positions[vPos + 2];
                vPos = vertexPositions[2];
                v3.data[0] = this._triangleData.positions[vPos];
                v3.data[1] = this._triangleData.positions[vPos + 1];
                v3.data[2] = this._triangleData.positions[vPos + 2];

                if (this._isBackFacingCameraViewSpace(v1, v2, v3)) {
                    continue; // Skip loop to the next three vertices.
                }

                // Clip triangle to the near plane.

                // Outside indices are the vertices which are outside the view frustum,
                // that is closer than the near plane in this case.
                // The inside indices are the ones on the inside.


                var outCount = this._categorizeVertices(cameraNearZInWorld);

                switch (outCount) {
                    case 0:
                        // All vertices are on the inside. Add them directly.
                        this._triangleData.addIndices(indices);
                        break;
                    case 3:
                        // All of the vertices are on the outside, dont add them.
                        break;
                    case 1:
                        /*
                            Update the one vertex to its new position on the near plane and add a new vertex
                            on the other intersection with the plane.
                        */

                        // TODO: optimization, calculations in the calculateIntersectionRatio could be moved out here,
                        // perhaps the entire function, in order to make use of them.
                        var outIndex = outsideIndices[0];
                        var origin = g_vertices[outIndex];
                        var origin_x = origin.data[0];
                        var origin_y = origin.data[1];

                        var target = g_vertices[insideIndices[0]];
                        var ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

                        // use the clipVec for storing the new vertex data, the w component is always 1.0 on this one.
                        clipVec.data[0] = origin_x + ratio * (target.data[0] - origin_x);
                        clipVec.data[1] = origin_y + ratio * (target.data[1] - origin_y);

                        // Overwrite the vertex index with the new vertex.
                        indices[outIndex] = this._triangleData.addVertex(clipVec.data);

                        target = g_vertices[insideIndices[1]];
                        ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

                        // Calculate the new vertex's position
                        clipVec.data[0] = origin_x + ratio * (target.data[0] - origin_x);
                        clipVec.data[1] = origin_y + ratio * (target.data[1] - origin_y);

                        // Add the new vertex and store the new vertex's index to be added at the last stage.
                        indices[3] = this._triangleData.addVertex(clipVec.data);

                        /*
                         The order of the indices ( CCW / CW ) are not relevant at this point, since
                         back face culling has been performed.

                         But to construct the right triangles, making use of the outside and inside indices is needed.
                         */

                        var insideIndex = insideIndices[0];
                        var extraIndex = indices[3];

                        this._triangleData.addIndices([indices[outIndex], indices[insideIndex], extraIndex]);
                        this._triangleData.addIndices([extraIndex, indices[insideIndex], indices[insideIndices[1]]]);

                        break;
                    case 2:
                        // Update the two outside vertices to their new positions on the near plane.
                        var target = g_vertices[insideIndices[0]];
                        var target_x = target.data[0];
                        var target_y = target.data[1];

                        // First new vertex.
                        var outIndex = outsideIndices[0];
                        var origin = g_vertices[outIndex];
                        var origin_x = origin.data[0];
                        var origin_y = origin.data[1];

                        vPos = vertexPositions[outIndex];
                        var ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

                        clipVec.data[0] = origin_x + ratio * (target_x - origin_x);
                        clipVec.data[1] = origin_y + ratio * (target_y - origin_y);

                        indices[outIndex] = this._triangleData.addVertex(clipVec.data);

                        // Second new vertex.
                        outIndex = outsideIndices[1];
                        origin = g_vertices[outIndex];
                        origin_x = origin.data[0];
                        origin_y = origin.data[1];

                        ratio = this._calculateIntersectionRatio(origin, target, this.camera.near);

                        clipVec.data[0] = origin_x + ratio * (target_x - origin_x);
                        clipVec.data[1] = origin_y + ratio * (target_y - origin_y);

                        indices[outIndex] = this._triangleData.addVertex(clipVec.data);

                        this._triangleData.addIndices(indices);

                        break;
                }
            }

            /*
                Transform the triangleData's vertices to screen space.

                The vector v1 will be used for this , since it is already allocated here.
                Re-using some other earlier allocated variables as well...

                // TODO :  Possible optimization? : Look at which vertices actually in need of beeing transformed?
                //          Recreate position array from those and then transform?

            */
            maxPos = this._triangleData.posCount;
            for (var p = 0; p < maxPos; p++) {
                // Copy the vertex data into the v1 vector from the triangleData's position array.
                var p2 = p + 1;
                var p3 = p + 2;
                var p4 = p + 3;
                v1.data[0] = this._triangleData.positions[p];
                v1.data[1] = this._triangleData.positions[p2];
                v1.data[2] = this._triangleData.positions[p3];
                // The w-component is still 1.0 here.
                v1.data[3] = 1.0;


                // TODO : Combine projection + screen space transformations into one matrix.
                // Projection transform
                cameraProjectionMatrix.applyPost(v1);

                // Homogeneous divide.
                var wComponent = v1.data[3];
                var homogeneousDivide =  1.0 / wComponent;
                v1.data[0] *= homogeneousDivide;
                v1.data[1] *= homogeneousDivide;

                // Screen space transform x and y coordinates, and write the transformed position data into the triangleData.
                this._triangleData.positions[p] = (v1.data[0] + 1.0) * this._halfClipX;
                // Have to round the y-coordinate , // TODO : look up the reason in the function for creating EdgeData.
                this._triangleData.positions[p2] = Math.round((v1.data[1] + 1.0) * this._halfClipY);
                // positionArray[p3] = v1.data[2]; z-componenet is not used any more.
                // Invert w component here, this to be able to interpolate the depth over the triangles.
                this._triangleData.positions[p4] = homogeneousDivide;

                // Step p forwards to the last position read.
                p = p4;
            }
        };

        /**
        *	Categorizes the vertices into outside and inside (of the view frustum).
        *	A vertex is categorized as being on the inside of the view frustum if it is located on the near plane.
        *	The outside- and insideIndices arrays are populated with the index to the vertex in question.
        *   @param cameraNear
         *   @returns {Number} outCount
        */
        SoftwareRenderer.prototype._categorizeVertices = function (cameraNear) {

            var outCount = 0;
            var inCount= 0;

            for ( var i = 0; i < 3; i++ ) {
                // The vertex shall be categorized as an inside vertex if it is on the near plane.
                if (g_vertices[i].data[2] <= cameraNear) {
                    insideIndices[inCount] = i;
                    inCount++;
                } else {
                    outsideIndices[outCount] = i;
                    outCount++;
                }
            }

            return outCount;
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
            var origin_z = origin.data[2];
            return (origin_z + near) / (origin_z - target.data[2]);

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


        SoftwareRenderer.prototype._isBackFacingCameraViewSpace = function (vert1, vert2, vert3) {

            // Calculate the dot product between the triangle's face normal and the camera's eye direction
            // to find out if the face is facing away or not.

            // Create edges for calculating the normal.
            var v1_x = vert1.data[0];
            var v1_y = vert1.data[1];
            var v1_z = vert1.data[2];

            var e1_x = vert2.data[0] - v1_x;
            var e1_y = vert2.data[1] - v1_y;
            var e1_z = vert2.data[2] - v1_z;

            var e2_x = vert3.data[0] - v1_x;
            var e2_y = vert3.data[1] - v1_y;
            var e2_z = vert3.data[2] - v1_z;

            // Doing the cross as well as dot product here since the built-in methods in Vector3 seems to do much error checking.
            var faceNormal_x = e2_z * e1_y - e2_y * e1_z;
            var faceNormal_y = e2_x * e1_z - e2_z * e1_x;
            var faceNormal_z = e2_y * e1_x - e2_x * e1_y;

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

            var dot = faceNormal_x * v1_x + faceNormal_y * v1_y + faceNormal_z * v1_z;
            return dot > 0.0;
        };

        /**
        *	Returns true if the (CCW) triangle created by the vertices v1, v2 and v3 is facing backwards.
        *	Otherwise false is returned. This method is for checking projected vertices.
        *
        *	@param {Vector} v1 Vertex #1
        *	@param {Vector} v2 Vertex #2
        *	@param {Vector} v3 Vertex #3
        *	@return {Boolean} true or false
        */
        SoftwareRenderer.prototype._isBackFacingProjected = function (v1, v2, v3) {

            // Create edges, only need x and y , since only the z component of the dot product is needed.
            var v1_x = v1.data[0];
            var v1_y = v1.data[1];

            var e1X = v2.data[0] - v1_x;
            var e1Y = v2.data[1] - v1_y;

            var e2X = v3.data[0] - v1_x;
            var e2Y = v3.data[1] - v1_y;

            var faceNormalZ = e2Y * e1X - e2X * e1Y;

            // The cameras eye direction will always be [0,0,-1] at this stage
            // (the vertices are transformed into the camera's view projection space,
            // thus the dot product can be simplified to only do multiplications on the z component.

            // var dotProduct = -faceNormal.z; // -1.0 * faceNormal.z;

            // The face is facing backwards if the dotproduct is positive.
            // Invert the comparison to remove the negation of facenormalZ.
            return faceNormalZ < 0.0;
        };

        /**
         *
         * @param indices
         * @param positions
         * @returns {Array}
         * @private
         */
        SoftwareRenderer.prototype._createEdgesForTriangle = function (indices, positions) {

            // Use (x,y,1/w), the w component is already inverted.
            // Reuse the global vectors for storing data to send as parameter to create Edges.
            var vPos = indices[0] * 4;
            v1.data[0] = positions[vPos];
            v1.data[1] = positions[vPos + 1];
            v1.data[2] = positions[vPos + 3];
            vPos = indices[1] * 4;
            v2.data[0] = positions[vPos];
            v2.data[1] = positions[vPos + 1];
            v2.data[2] = positions[vPos + 3];
            vPos = indices[2] * 4;
            v3.data[0] = positions[vPos];
            v3.data[1] = positions[vPos + 1];
            v3.data[2] = positions[vPos + 3];

            // The edges are created sorted in growing y-order.
            this._edges[0] = new Edge(v1, v2);
            this._edges[1] = new Edge(v2, v3);
            this._edges[2] = new Edge(v3, v1);

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
         * Returns an array containing if the triangle's long edge is on the right or left and if the triangle is leaning inwards or outwards
         * @param {EdgeData} edgeData
         * @param shortEdge
         * @param longEdge
         * @returns {Array}
         * @private
         */
        SoftwareRenderer.prototype._calculateOrientationData = function (edgeData, shortEdge, longEdge) {

            var shortX = edgeData.getShortX();
            var longX = edgeData.getLongX();

            // If the edges start at the same position (floating point comparison),
            // The edges will most probably contain an integer index to the vertex array in future optimizations.
            // the long edge can be determined by examining the slope sign.
            // Otherwise, just check which one is larger.

            // A triangle is leaning inwards, if the long edge's stop vertex is further away than the vertex to compare with of the short edge.
            // The depth values have been inverted, so the comparison has to be inverted as well.
            if (shortX === longX) {
                // The short edge is the upper one. The long and short edges originate from the same vertex.
                return [edgeData.getLongXIncrement() > edgeData.getShortXIncrement(), longEdge.z1 < shortEdge.z1];
            } else {
                // The short edge is the bottom one.
                return [longX > shortX, longEdge.z1 < shortEdge.z0];
            }
        };

        /**
        *	Returns true if the triangle is occluded.
        */
        SoftwareRenderer.prototype.isRenderedTriangleOccluded = function (indices, positions) {

            var edgeIndices = this._createEdgesForTriangle(indices, positions);

            var longEdge = this._edges[edgeIndices[0]];
            var s1 = edgeIndices[1];
            var s2 = edgeIndices[2];

            // Vertical culling
            if (this._verticalLongEdgeCull(longEdge)) {
                // Triangle is outside the view, skipping rendering it;
                return true;
            }

            // Round y-coordinates to expand the area.
            this._edges[0].roundOccludeeCoordinates();
            this._edges[1].roundOccludeeCoordinates();
            this._edges[2].roundOccludeeCoordinates();

            var shortEdge = this._edges[s1];
            // Find out the orientation of the triangle.
            // That is, if the long edge is on the right or the left side.
            var orientationData = null;
            if (this._createEdgeData(longEdge, shortEdge)) {
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
            if (this._createEdgeData(longEdge, shortEdge)) {
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
         *
         * @param {Uint8Array} indices
         * @param {Float32Array} positions
         * @private
         */
        SoftwareRenderer.prototype._renderTriangle = function (indices, positions) {

            // Original idea of triangle rasterization is taken from here : http://joshbeam.com/articles/triangle_rasterization/
            // The method is improved by using vertical coherence for each of the scanlines.

            var edgeIndices = this._createEdgesForTriangle(indices, positions);

            var longEdge = this._edges[edgeIndices[0]];
            var s1 = edgeIndices[1];
            var s2 = edgeIndices[2];

            // Vertical culling
            if (this._verticalLongEdgeCull(longEdge)) {
                // Triangle is outside the view, skipping rendering it;
                return;
            }

            var shortEdge = this._edges[s1];
            /*
            TODO : The long edge's data is calculated twice at the momnent. The only difference is if the values are to be
            interpolated to the proper y.
             */
            // Find out the orientation of the triangle.
            // That is, if the long edge is on the right or the left side.
            var orientationData = null;
            if (this._createEdgeData(longEdge, shortEdge)) {
                orientationData = this._calculateOrientationData(edgeData, shortEdge, longEdge);

                // Horizontal culling
                if (this._horizontalLongEdgeCull(longEdge, orientationData)) {
                    return;
                }

                // Draw first portion of the triangle
                this._drawEdges(edgeData, orientationData);
            }

            shortEdge = this._edges[s2];
            if (this._createEdgeData(longEdge, shortEdge)) {
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
        * @param orientationData
        * @param longEdge
        */
        SoftwareRenderer.prototype._horizontalLongEdgeCull = function (longEdge, orientationData) {
            if (orientationData[0]) {// long edge on right side
                return longEdge.x1 < 0 && longEdge.x0 < 0;
            } else {
                return longEdge.x1 > this._clipX && longEdge.x0 > this._clipX;
            }
        };

        SoftwareRenderer.prototype._isEdgeOccluded = function(edgeData, orientationData) {

            // Copypasted from _drawEdges.
            var startLine = edgeData.getStartLine();
            var stopLine = edgeData.getStopLine();

            var longXInc = edgeData.getLongXIncrement();
            var shortXInc = edgeData.getShortXIncrement();
            var longZInc = edgeData.getLongZIncrement();
            var shortZInc = edgeData.getShortZIncrement();

            // Checking if the triangle's long edge is on the right or the left side.
            if (orientationData[0]) { //RIGHT ORIENTED (long edge on right side)
                if (orientationData[1]) { //INWARDS TRIANGLE
                    for (var y = startLine; y <= stopLine; y++) {

                        var realLeftX = edgeData.getShortX();
                        var realRightX = edgeData.getLongX();
                        // Conservative rounding (will cause overdraw on connecting triangles)
                        var leftX = Math.floor(realLeftX);
                        var rightX = Math.ceil(realRightX);

                        var leftZ = edgeData.getShortZ();
                        var rightZ = edgeData.getLongZ();

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

                        // Update the edge data
                        edgeData.floatData[0] += longXInc;
                        edgeData.floatData[1] += shortXInc;
                        edgeData.floatData[2] += longZInc;
                        edgeData.floatData[3] += shortZInc;
                    }
                } else { // OUTWARDS TRIANGLE
                    for (var y = startLine; y <= stopLine; y++) {

                        var realLeftX = edgeData.getShortX();
                        var realRightX = edgeData.getLongX();
                        // Conservative rounding (will cause overdraw on connecting triangles)
                        var leftX = Math.floor(realLeftX);
                        var rightX = Math.ceil(realRightX);

                        var leftZ = edgeData.getShortZ();
                        var rightZ = edgeData.getLongZ();

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

                        // Update the edge data
                        edgeData.floatData[0] += longXInc;
                        edgeData.floatData[1] += shortXInc;
                        edgeData.floatData[2] += longZInc;
                        edgeData.floatData[3] += shortZInc;
                    }
                }
            } else { // LEFT ORIENTED
                if (orientationData[1]) { //INWARDS TRIANGLE
                    for (var y = startLine; y <= stopLine; y++) {

                        var realLeftX = edgeData.getLongX();
                        var realRightX = edgeData.getShortX();
                        // Conservative rounding (will cause overdraw on connecting triangles)
                        var leftX = Math.floor(realLeftX);
                        var rightX = Math.ceil(realRightX);

                        var leftZ = edgeData.getLongZ();
                        var rightZ = edgeData.getShortZ();

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

                        // Update the edge data
                        edgeData.floatData[0] += longXInc;
                        edgeData.floatData[1] += shortXInc;
                        edgeData.floatData[2] += longZInc;
                        edgeData.floatData[3] += shortZInc;
                    }
                } else { // OUTWARDS TRIANGLE
                    for (var y = startLine; y <= stopLine; y++) {

                        var realLeftX = edgeData.getLongX();
                        var realRightX = edgeData.getShortX();
                        // Conservative rounding (will cause overdraw on connecting triangles)
                        var leftX = Math.floor(realLeftX);
                        var rightX = Math.ceil(realRightX);

                        var leftZ = edgeData.getLongZ();
                        var rightZ = edgeData.getShortZ();

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

                        // Update the edge data
                        edgeData.floatData[0] += longXInc;
                        edgeData.floatData[1] += shortXInc;
                        edgeData.floatData[2] += longZInc;
                        edgeData.floatData[3] += shortZInc;
                    }
                }
            }

            return true;
        };

        /**
         * Render the pixels between the long and the short edge of the triangle.
         * @param {EdgeData} edgeData
         * @param orientationData
         * @private
         */
        SoftwareRenderer.prototype._drawEdges = function (edgeData, orientationData) {

            // The start and stop lines are already rounded y-coordinates.
            var startLine = edgeData.getStartLine();
            var stopLine = edgeData.getStopLine();

            var longXInc = edgeData.getLongXIncrement();
            var shortXInc = edgeData.getShortXIncrement();
            var longZInc = edgeData.getLongZIncrement();
            var shortZInc = edgeData.getShortZIncrement();

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

                        var realLeftX = edgeData.getShortX();
                        var realRightX = edgeData.getLongX();

                        var leftZ = edgeData.getShortZ();
                        var rightZ = edgeData.getLongZ();
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

                        // Update the edge data
                        edgeData.floatData[0] += longXInc;
                        edgeData.floatData[1] += shortXInc;
                        edgeData.floatData[2] += longZInc;
                        edgeData.floatData[3] += shortZInc;
                    }
                } else { // OUTWARDS TRIANGLE
                    for (var y = startLine; y <= stopLine; y++) {

                        var realLeftX = edgeData.getShortX();
                        var realRightX = edgeData.getLongX();

                        var leftZ = edgeData.getShortZ();
                        var rightZ = edgeData.getLongZ();
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

                        // Update the edge data
                        edgeData.floatData[0] += longXInc;
                        edgeData.floatData[1] += shortXInc;
                        edgeData.floatData[2] += longZInc;
                        edgeData.floatData[3] += shortZInc;
                    }
                }
            } else { // LONG EDGE IS ON THE LEFT SIDE
                if (orientationData[1]) { // INWARDS TRIANGLE
                    for (var y = startLine; y <= stopLine; y++) {

                        var realLeftX = edgeData.getLongX();
                        var realRightX = edgeData.getShortX();

                        var leftZ = edgeData.getLongZ();
                        var rightZ = edgeData.getShortZ();

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

                        // Update the edge data
                        edgeData.floatData[0] += longXInc;
                        edgeData.floatData[1] += shortXInc;
                        edgeData.floatData[2] += longZInc;
                        edgeData.floatData[3] += shortZInc;
                    }
                } else { // OUTWARDS TRIANGLE
                    for (var y = startLine; y <= stopLine; y++) {

                        var realLeftX = edgeData.getLongX();
                        var realRightX = edgeData.getShortX();

                        var leftZ = edgeData.getLongZ();
                        var rightZ = edgeData.getShortZ();

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

                        // Update the edge data
                        edgeData.floatData[0] += longXInc;
                        edgeData.floatData[1] += shortXInc;
                        edgeData.floatData[2] += longZInc;
                        edgeData.floatData[3] += shortZInc;
                    }
                }
            }
        };

        /**
         * Creates the EdgeData , used for rendering. False is returned if there is not anything to draw.
        *	@return {Boolean} drawable
        */
        SoftwareRenderer.prototype._createEdgeData = function (longEdge, shortEdge) {

            // TODO: Move a lot of these calculations and variables into the Edge class,
            // do the calculations once for the long edge instead of twices as it is done now.

            // Early exit when the short edge doesnt have any height (y-axis).
            // -The edges' coordinates are stored as uint8, so compare with a SMI (SMall Integer, 31-bit signed integer) and not Double.

            var shortEdgeDeltaY = (shortEdge.y1 - shortEdge.y0);
            if(shortEdgeDeltaY <= 0) {
                return false; // Nothing to draw here.
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

            edgeData.setData([startLine, stopLine, longX, shortX, longZ, shortZ, longEdgeXincrement, shortEdgeXincrement, longEdgeZincrement, shortEdgeZincrement]);
            return true;
        };

        /**
         * Returns true if the scanline of rasterized pixels are occluded. Early exits on visible pixels and returns false.
         * @param leftX
         * @param rightX
         * @param y
         * @param leftZ
         * @param rightZ
         * @returns {boolean}
         * @private
         */
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
            for (var i = 0; i < this._depthData.length; i++) {
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