define([], function () {
    'use strict';
    __touch(13443);
    function EdgeData() {
        var integerElements = 2;
        __touch(13459);
        var floatElements = 8;
        __touch(13460);
        var integerBytes = integerElements * Int16Array.BYTES_PER_ELEMENT;
        __touch(13461);
        var floatBytes = floatElements * Float32Array.BYTES_PER_ELEMENT;
        __touch(13462);
        this._dataBuffer = new ArrayBuffer(integerBytes + floatBytes);
        __touch(13463);
        this.floatData = new Float32Array(this._dataBuffer, 0, floatElements);
        __touch(13464);
        this.integerData = new Int16Array(this._dataBuffer, floatBytes, integerElements);
        __touch(13465);
    }
    __touch(13444);
    EdgeData.prototype.setData = function (dataArray) {
        this.integerData[0] = dataArray[0];
        __touch(13466);
        this.integerData[1] = dataArray[1];
        __touch(13467);
        this.floatData[0] = dataArray[2];
        __touch(13468);
        this.floatData[1] = dataArray[3];
        __touch(13469);
        this.floatData[2] = dataArray[4];
        __touch(13470);
        this.floatData[3] = dataArray[5];
        __touch(13471);
        this.floatData[4] = dataArray[6];
        __touch(13472);
        this.floatData[5] = dataArray[7];
        __touch(13473);
        this.floatData[6] = dataArray[8];
        __touch(13474);
        this.floatData[7] = dataArray[9];
        __touch(13475);
    };
    __touch(13445);
    EdgeData.prototype.getStartLine = function () {
        return this.integerData[0];
        __touch(13476);
    };
    __touch(13446);
    EdgeData.prototype.getStopLine = function () {
        return this.integerData[1];
        __touch(13477);
    };
    __touch(13447);
    EdgeData.prototype.getLongX = function () {
        return this.floatData[0];
        __touch(13478);
    };
    __touch(13448);
    EdgeData.prototype.setLongX = function (value) {
        this.floatData[0] = value;
        __touch(13479);
    };
    __touch(13449);
    EdgeData.prototype.getShortX = function () {
        return this.floatData[1];
        __touch(13480);
    };
    __touch(13450);
    EdgeData.prototype.setShortX = function (value) {
        this.floatData[1] = value;
        __touch(13481);
    };
    __touch(13451);
    EdgeData.prototype.getLongZ = function () {
        return this.floatData[2];
        __touch(13482);
    };
    __touch(13452);
    EdgeData.prototype.getShortZ = function () {
        return this.floatData[3];
        __touch(13483);
    };
    __touch(13453);
    EdgeData.prototype.getLongXIncrement = function () {
        return this.floatData[4];
        __touch(13484);
    };
    __touch(13454);
    EdgeData.prototype.getShortXIncrement = function () {
        return this.floatData[5];
        __touch(13485);
    };
    __touch(13455);
    EdgeData.prototype.getLongZIncrement = function () {
        return this.floatData[6];
        __touch(13486);
    };
    __touch(13456);
    EdgeData.prototype.getShortZIncrement = function () {
        return this.floatData[7];
        __touch(13487);
    };
    __touch(13457);
    return EdgeData;
    __touch(13458);
});
__touch(13442);