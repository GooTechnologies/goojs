define(function () {
    'use strict';
    __touch(15390);
    function BufferData(data, target) {
        this.data = data;
        __touch(15396);
        this.target = target;
        __touch(15397);
        this.glBuffer = null;
        __touch(15398);
        this._dataUsage = 'StaticDraw';
        __touch(15399);
        this._dataNeedsRefresh = false;
        __touch(15400);
    }
    __touch(15391);
    BufferData.prototype.setDataUsage = function (dataUsage) {
        this._dataUsage = dataUsage;
        __touch(15401);
    };
    __touch(15392);
    BufferData.prototype.setDataNeedsRefresh = function () {
        this._dataNeedsRefresh = true;
        __touch(15402);
    };
    __touch(15393);
    BufferData.prototype.destroy = function (context) {
        context.deleteBuffer(this.glBuffer);
        __touch(15403);
        this.glBuffer = null;
        __touch(15404);
    };
    __touch(15394);
    return BufferData;
    __touch(15395);
});
__touch(15389);