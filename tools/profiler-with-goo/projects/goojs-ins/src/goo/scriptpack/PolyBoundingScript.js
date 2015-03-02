define([], function () {
    'use strict';
    __touch(19794);
    function PolyBoundingScript(collidables) {
        this.collidables = collidables || [];
        __touch(19801);
    }
    __touch(19795);
    PolyBoundingScript.prototype.addCollidable = function (collidable) {
        this.collidables.push(collidable);
        __touch(19802);
    };
    __touch(19796);
    PolyBoundingScript.prototype.removeAllAt = function (x, y, z) {
        this.collidables = this.collidables.filter(function (collidable) {
            if (collidable.bottom <= z && collidable.top >= z) {
                return !window.PolyK.ContainsPoint(collidable.poly, x, y);
                __touch(19804);
            }
        });
        __touch(19803);
    };
    __touch(19797);
    PolyBoundingScript.prototype.inside = function (x, y, z) {
        for (var i = 0; i < this.collidables.length; i++) {
            var collidable = this.collidables[i];
            __touch(19805);
            if (collidable.bottom <= y && collidable.top >= y) {
                if (window.PolyK.ContainsPoint(collidable.poly, x, z)) {
                    return window.PolyK.ClosestEdge(collidable.poly, x, z);
                    __touch(19806);
                }
            }
        }
    };
    __touch(19798);
    PolyBoundingScript.prototype.run = function (entity) {
        var transformComponent = entity.transformComponent;
        __touch(19807);
        var translation = transformComponent.transform.translation;
        __touch(19808);
        for (var i = 0; i < this.collidables.length; i++) {
            var collidable = this.collidables[i];
            __touch(19809);
            if (collidable.bottom <= translation.data[1] && collidable.top >= translation.data[1]) {
                if (window.PolyK.ContainsPoint(collidable.poly, translation.data[0], translation.data[2])) {
                    var pointOutside = window.PolyK.ClosestEdge(collidable.poly, translation.data[0], translation.data[2]);
                    __touch(19810);
                    translation.data[0] = pointOutside.point.x;
                    __touch(19811);
                    translation.data[2] = pointOutside.point.y;
                    __touch(19812);
                    transformComponent.setUpdated();
                    __touch(19813);
                    return;
                    __touch(19814);
                }
            }
        }
    };
    __touch(19799);
    return PolyBoundingScript;
    __touch(19800);
});
__touch(19793);