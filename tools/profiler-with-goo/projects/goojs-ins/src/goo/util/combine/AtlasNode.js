define(['goo/util/combine/Rectangle'], function (Rectangle) {
    'use strict';
    __touch(22640);
    function AtlasNode(w, h) {
        this.isLeaf = true;
        __touch(22647);
        this.isSet = false;
        __touch(22648);
        this.children = [];
        __touch(22649);
        if (w !== undefined && h !== undefined) {
            this.localRectangle = new Rectangle(0, 0, w, h);
            __touch(22650);
        } else {
            this.localRectangle = null;
            __touch(22651);
        }
    }
    __touch(22641);
    AtlasNode.prototype.getRectangles = function () {
        var rectangles = [];
        __touch(22652);
        this._getRectangles(rectangles);
        __touch(22653);
        return rectangles;
        __touch(22654);
    };
    __touch(22642);
    AtlasNode.prototype._getRectangles = function (list) {
        if (this.isSet) {
            list.push(this.localRectangle);
            __touch(22655);
        }
        if (!this.isLeaf) {
            this.children[0]._getRectangles(list);
            __touch(22656);
            this.children[1]._getRectangles(list);
            __touch(22657);
        }
    };
    __touch(22643);
    AtlasNode.prototype.insert = function (w, h) {
        return this._insert(new Rectangle(0, 0, w, h));
        __touch(22658);
    };
    __touch(22644);
    AtlasNode.prototype._insert = function (rectangle) {
        if (!this.isLeaf) {
            var newNode = this.children[0]._insert(rectangle);
            __touch(22659);
            if (newNode !== null) {
                return newNode;
                __touch(22661);
            }
            return this.children[1]._insert(rectangle);
            __touch(22660);
        } else {
            if (this.isSet) {
                return null;
                __touch(22668);
            }
            if (rectangle.w > this.localRectangle.w || rectangle.h > this.localRectangle.h) {
                return null;
                __touch(22669);
            }
            if (rectangle.w === this.localRectangle.w && rectangle.h === this.localRectangle.h) {
                this.isSet = true;
                __touch(22670);
                return this;
                __touch(22671);
            }
            this.isLeaf = false;
            __touch(22662);
            this.children[0] = new AtlasNode();
            __touch(22663);
            this.children[1] = new AtlasNode();
            __touch(22664);
            var dw = this.localRectangle.w - rectangle.w;
            __touch(22665);
            var dh = this.localRectangle.h - rectangle.h;
            __touch(22666);
            if (dw > dh) {
                this.children[0].localRectangle = new Rectangle(this.localRectangle.x, this.localRectangle.y, rectangle.w, this.localRectangle.h);
                __touch(22672);
                this.children[1].localRectangle = new Rectangle(this.localRectangle.x + rectangle.w, this.localRectangle.y, dw, this.localRectangle.h);
                __touch(22673);
            } else {
                this.children[0].localRectangle = new Rectangle(this.localRectangle.x, this.localRectangle.y, this.localRectangle.w, rectangle.h);
                __touch(22674);
                this.children[1].localRectangle = new Rectangle(this.localRectangle.x, this.localRectangle.y + rectangle.h, this.localRectangle.w, dh);
                __touch(22675);
            }
            return this.children[0]._insert(rectangle);
            __touch(22667);
        }
    };
    __touch(22645);
    return AtlasNode;
    __touch(22646);
});
__touch(22639);