define(['goo/math/Vector3'], function (Vector3) {
    'use strict';
    __touch(18326);
    function BoundingVolume(center) {
        this.center = new Vector3();
        __touch(18332);
        if (center) {
            this.center.setv(center);
            __touch(18335);
        }
        this.min = new Vector3(Infinity, Infinity, Infinity);
        __touch(18333);
        this.max = new Vector3(-Infinity, -Infinity, -Infinity);
        __touch(18334);
    }
    __touch(18327);
    BoundingVolume.Outside = 0;
    __touch(18328);
    BoundingVolume.Inside = 1;
    __touch(18329);
    BoundingVolume.Intersects = 2;
    __touch(18330);
    return BoundingVolume;
    __touch(18331);
});
__touch(18325);