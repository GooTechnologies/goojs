define(['goo/renderer/scanline/Edge'], function (Edge) {
    'use strict';
    __touch(13489);
    function EdgeMap(edgeCount) {
        this._edges = new Array(edgeCount);
        __touch(13497);
        this._edgeCount = 0;
        __touch(13498);
        for (var e = 0; e < edgeCount; e++) {
            this._edges[e] = new Edge();
            __touch(13501);
        }
        this._map = {};
        __touch(13499);
        this.numberOfSharedEdges = 0;
        __touch(13500);
    }
    __touch(13490);
    EdgeMap.prototype.addEdge = function (i1, i2, vec1, vec2) {
        var key1 = this._indicesToKey(i1, i2);
        __touch(13502);
        if (!this._contains(key1)) {
            var key2 = this._indicesToKey(i2, i1);
            __touch(13503);
            var edgeIndex = this._edgeCount;
            __touch(13504);
            var edge = this._edges[edgeIndex];
            __touch(13505);
            edge.setData(vec1, vec2, i1, i2);
            __touch(13506);
            edge.computeDerivedData();
            __touch(13507);
            this._map[key1.toString()] = edgeIndex;
            __touch(13508);
            this._map[key2.toString()] = edgeIndex;
            __touch(13509);
            this._edgeCount++;
            __touch(13510);
        } else {
            var edgeIndex = this._map[key1];
            __touch(13511);
            this._edges[edgeIndex].betweenFaces = true;
            __touch(13512);
            this.numberOfSharedEdges++;
            __touch(13513);
        }
    };
    __touch(13491);
    EdgeMap.prototype._contains = function (mapIndex) {
        return this._map.hasOwnProperty(mapIndex);
        __touch(13514);
    };
    __touch(13492);
    EdgeMap.prototype.getEdge = function (i1, i2) {
        var index = this._indicesToKey(i1, i2);
        __touch(13515);
        var edgeIndex = this._map[index];
        __touch(13516);
        return this._edges[edgeIndex];
        __touch(13517);
    };
    __touch(13493);
    EdgeMap.prototype.clear = function () {
        this._map = {};
        __touch(13518);
        this._edgeCount = 0;
        __touch(13519);
        this.numberOfSharedEdges = 0;
        __touch(13520);
    };
    __touch(13494);
    EdgeMap.prototype._indicesToKey = function (i1, i2) {
        return (i1 << 8) + i2;
        __touch(13521);
    };
    __touch(13495);
    return EdgeMap;
    __touch(13496);
});
__touch(13488);