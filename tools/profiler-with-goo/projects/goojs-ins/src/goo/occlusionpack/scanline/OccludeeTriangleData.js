define([], function () {
    'use strict';
    __touch(13523);
    function OccludeeTriangleData(parameters) {
        var numberOfPositions = parameters.numberOfPositions;
        __touch(13528);
        var numberOfIndices = parameters.numberOfIndices;
        __touch(13529);
        this.indexCount = 0;
        __touch(13530);
        var vertBytes = numberOfPositions * Float32Array.BYTES_PER_ELEMENT;
        __touch(13531);
        var indexBytes = numberOfIndices * Uint8Array.BYTES_PER_ELEMENT;
        __touch(13532);
        this._dataBuffer = new ArrayBuffer(vertBytes + indexBytes);
        __touch(13533);
        this.positions = new Float32Array(this._dataBuffer, 0, numberOfPositions);
        __touch(13534);
        this.indices = new Uint8Array(this._dataBuffer, vertBytes, numberOfIndices);
        __touch(13535);
    }
    __touch(13524);
    OccludeeTriangleData.prototype.addIndices = function (triangleIndices) {
        var index = this.indexCount;
        __touch(13536);
        this.indices[index] = triangleIndices[0];
        __touch(13537);
        index++;
        __touch(13538);
        this.indices[index] = triangleIndices[1];
        __touch(13539);
        index++;
        __touch(13540);
        this.indices[index] = triangleIndices[2];
        __touch(13541);
        index++;
        __touch(13542);
        this.indexCount = index;
        __touch(13543);
    };
    __touch(13525);
    OccludeeTriangleData.prototype.clear = function () {
        this.indexCount = 0;
        __touch(13544);
    };
    __touch(13526);
    return OccludeeTriangleData;
    __touch(13527);
});
__touch(13522);