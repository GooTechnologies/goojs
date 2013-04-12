define([
],
    /** @lends */

    function () {

        function OccluderTriangleData (parameters) {
            var vertCount = parameters.vertCount;
            var indexCount = parameters.indexCount;

            /*
                The position array will contain 4 values per vertex. (x,y,z,w).

                The maximum amount of extra vertices are 2 per triangle, thus 2*4 extra positions per triangle

                The maximum amount of extra indices are 3 per triangle. (The triangle can be split up in two triangles)
                This assuming that all triangles are front facing, which probably isn't the case.
            */
            var triangleCount = indexCount / 3;
            var originalCount = vertCount * 4;
            var compensatedPositionCount = originalCount + triangleCount * 8;
            var compensatedIndexCount = indexCount * 2; // + triangleCount * 3;

            /*
                Initialize the number of positions to the known original. Since it will be initialized to the copied and
                transformed values anyway.

                This number gives the next index in the array to write to.
            */
            this.posCount = originalCount;

            /*
                Storing the highest possible vertex index to acess.
                This is initialized to vertCount - 1 , since the indices are zero-based.
            */
            this.largestIndex = vertCount - 1;
            /*
                Initialize the index count to zero. This will be filled up after hand. The only indices wanted are the
                ones which create front facing triangles.
            */
            this.indexCount = 0;

            var vertBytes = compensatedPositionCount * Float32Array.BYTES_PER_ELEMENT;
            /*
                Using 8bit unsigned integers implies a maximum of 256 vertices. This will most likely be the case for
                the low detailed occluder geometries.
            */
            var indexBytes = compensatedIndexCount * Uint8Array.BYTES_PER_ELEMENT;

            this._dataBuffer = new ArrayBuffer(vertBytes + indexBytes);
            this.positions = new Float32Array(this._dataBuffer, 0, compensatedPositionCount);
            this.indices = new Uint8Array(this._dataBuffer, vertBytes, compensatedIndexCount);
        }

        /**
         * Adds the array of vertex data to the position array and returns the new vertex's index to the position.
          * @param {Float32Array} array [x,y,z,w]
         * @returns {Number} the added position's vertex index
         */
        OccluderTriangleData.prototype.addVertex = function (array) {
            this.positions.set(array, this.posCount);
            this.posCount += 4;
            this.largestIndex++;
            return this.largestIndex;
        };

        /**
         * Empties the data.
         */
        OccluderTriangleData.prototype.clear = function () {
            this.posCount = 0;
            this.indexCount = 0;
            this.largestIndex = 0;
        };

        /**
         * Adds 3 indices to the index array.
         * @param {Uint8Array} triangleIndices
         */
        OccluderTriangleData.prototype.addIndices = function (triangleIndices) {
            this.indices.set(triangleIndices, this.indexCount);
            this.indexCount += 3;
        };

        return OccluderTriangleData;
    });