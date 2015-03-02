define([], function () {
    'use strict';
    __touch(13399);
    function Edge() {
        this.x0 = 0;
        __touch(13405);
        this.x1 = 0;
        __touch(13406);
        this.y0 = 0;
        __touch(13407);
        this.y1 = 0;
        __touch(13408);
        this.z0 = 0;
        __touch(13409);
        this.z1 = 0;
        __touch(13410);
        this.dx = 0;
        __touch(13411);
        this.dy = 0;
        __touch(13412);
        this.dz = 0;
        __touch(13413);
        this.xIncrement = 0;
        __touch(13414);
        this.zIncrement = 0;
        __touch(13415);
        this.betweenFaces = false;
        __touch(13416);
    }
    __touch(13400);
    Edge.prototype.setData = function (vec1, vec2) {
        var v1_y = vec1.data[1];
        __touch(13417);
        var v2_y = vec2.data[1];
        __touch(13418);
        if (v1_y < v2_y) {
            this.x0 = vec1.data[0];
            __touch(13420);
            this.x1 = vec2.data[0];
            __touch(13421);
            this.y0 = v1_y;
            __touch(13422);
            this.y1 = v2_y;
            __touch(13423);
            this.z0 = vec1.data[2];
            __touch(13424);
            this.z1 = vec2.data[2];
            __touch(13425);
        } else {
            this.x0 = vec2.data[0];
            __touch(13426);
            this.x1 = vec1.data[0];
            __touch(13427);
            this.y0 = v2_y;
            __touch(13428);
            this.y1 = v1_y;
            __touch(13429);
            this.z0 = vec2.data[2];
            __touch(13430);
            this.z1 = vec1.data[2];
            __touch(13431);
        }
        this.betweenFaces = false;
        __touch(13419);
    };
    __touch(13401);
    Edge.prototype.computeDerivedData = function () {
        var dx = this.x1 - this.x0;
        __touch(13432);
        var dy = this.y1 - this.y0;
        __touch(13433);
        var dz = this.z1 - this.z0;
        __touch(13434);
        this.dy = dy;
        __touch(13435);
        this.dx = dx;
        __touch(13436);
        this.dz = dz;
        __touch(13437);
        this.xIncrement = dx / dy;
        __touch(13438);
        this.zIncrement = dz / dy;
        __touch(13439);
    };
    __touch(13402);
    Edge.prototype.roundOccludeeCoordinates = function () {
        this.y0 = Math.round(this.y0);
        __touch(13440);
        this.y1 = Math.round(this.y1);
        __touch(13441);
    };
    __touch(13403);
    return Edge;
    __touch(13404);
});
__touch(13398);