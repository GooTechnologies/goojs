define([
],
    /** @lends */
        function () {
        "use strict";

        /**
         *
         * @param dataArray [startLine, stopLine, longX, shortX, longZ, shortZ, longEdgeXincrement, shortEdgeXincrement, longEdgeZincrement, shortEdgeZincrement]
         * @constructor
         */
        function EdgeData (dataArray) {

            var integerElements = 2;
            var floatElements = 8;
            var integerBytes = integerElements * Int16Array.BYTES_PER_ELEMENT;
            var floatBytes = floatElements * Float64Array.BYTES_PER_ELEMENT;

            this._dataBuffer = new ArrayBuffer(integerBytes + floatBytes);
            this._floatData = new Float64Array(this._dataBuffer, 0, floatElements);
            this._integerData = new Int16Array(this._dataBuffer, floatBytes, integerElements);


            this._integerData.set([dataArray[0], dataArray[1]]);
            this._floatData.set([dataArray[2], dataArray[3], dataArray[4], dataArray[5], dataArray[6], dataArray[7],  dataArray[8],  dataArray[9]]);
        }

        EdgeData.prototype.getStartLine = function () {
            return this._integerData[0];
        };

        EdgeData.prototype.getStopLine = function () {
            return this._integerData[1];
        };

        EdgeData.prototype.getLongX = function () {
            return this._floatData[0];
        };

        EdgeData.prototype.getShortX = function () {
            return this._floatData[1];
        };

        EdgeData.prototype.getLongZ = function () {
            return this._floatData[2];
        };

        EdgeData.prototype.getShortZ = function () {
            return this._floatData[3];
        };

        EdgeData.prototype.getLongXIncrement = function () {
            return this._floatData[4];
        };

        EdgeData.prototype.getShortXIncrement = function () {
            return this._floatData[5];
        };

        EdgeData.prototype.getLongZIncrement = function () {
            return this._floatData[6];
        };

        EdgeData.prototype.getShortZIncrement = function () {
            return this._floatData[7];
        };

        EdgeData.prototype.updateXValues = function() {
            this._floatData[0] += this._floatData[4];
            this._floatData[1] += this._floatData[5];
            this._floatData[2] += this._floatData[6];
            this._floatData[3] += this._floatData[7];
        };

        return EdgeData;
    });