define(['goo/math/Vector3'], function (Vector3) {
    'use strict';
    __touch(16250);
    function RenderQueue() {
        this.opaqueSorter = function (a, b) {
            var m1 = a.meshRendererComponent.materials[0];
            __touch(16263);
            var m2 = b.meshRendererComponent.materials[0];
            __touch(16264);
            if (m1 === null || m2 === null) {
                return 0;
                __touch(16268);
            }
            if (m1 === m2) {
                var bound1 = a.meshRendererComponent.worldBound;
                __touch(16269);
                var bound2 = b.meshRendererComponent.worldBound;
                __touch(16270);
                if (bound1 === null || bound2 === null) {
                    return 0;
                    __touch(16274);
                }
                var dist1 = a.meshRendererComponent._renderDistance;
                __touch(16271);
                var dist2 = b.meshRendererComponent._renderDistance;
                __touch(16272);
                return dist1 - dist2;
                __touch(16273);
            }
            var shader1 = m1.shader;
            __touch(16265);
            var shader2 = m2.shader;
            __touch(16266);
            if (shader1 === null || shader2 === null) {
                return 0;
                __touch(16275);
            }
            if (shader1._id === shader2._id) {
                var bound1 = a.meshRendererComponent.worldBound;
                __touch(16276);
                var bound2 = b.meshRendererComponent.worldBound;
                __touch(16277);
                if (bound1 === null || bound2 === null) {
                    return 0;
                    __touch(16281);
                }
                var dist1 = a.meshRendererComponent._renderDistance;
                __touch(16278);
                var dist2 = b.meshRendererComponent._renderDistance;
                __touch(16279);
                return dist1 - dist2;
                __touch(16280);
            }
            return shader1._id - shader2._id;
            __touch(16267);
        };
        __touch(16260);
        this.transparentSorter = function (a, b) {
            var dist1 = a.meshRendererComponent._renderDistance;
            __touch(16282);
            var dist2 = b.meshRendererComponent._renderDistance;
            __touch(16283);
            return dist2 - dist1;
            __touch(16284);
        };
        __touch(16261);
        this.bucketSorter = function (a, b) {
            return a - b;
            __touch(16285);
        };
        __touch(16262);
    }
    __touch(16251);
    var bucketSortList = [];
    __touch(16252);
    var tmpVec = new Vector3();
    __touch(16253);
    RenderQueue.prototype.sort = function (renderList, camera) {
        var index = 0;
        __touch(16286);
        this.camera = camera;
        __touch(16287);
        var buckets = {};
        __touch(16288);
        bucketSortList.length = 0;
        __touch(16289);
        for (var i = 0; i < renderList.length; i++) {
            var renderable = renderList[i];
            __touch(16290);
            var meshRendererComponent = renderable.meshRendererComponent;
            __touch(16291);
            if (!meshRendererComponent || meshRendererComponent.materials.length === 0) {
                renderList[index] = renderable;
                __touch(16298);
                index++;
                __touch(16299);
                continue;
                __touch(16300);
            }
            var renderQueue = meshRendererComponent.materials[0].getRenderQueue();
            __touch(16292);
            var distance = 0;
            __touch(16293);
            var bound = meshRendererComponent.worldBound;
            __touch(16294);
            if (bound !== null) {
                distance = tmpVec.setv(camera.translation).subv(bound.center).lengthSquared();
                __touch(16301);
            } else if (renderable.transformComponent) {
                distance = tmpVec.setv(camera.translation).subv(renderable.transformComponent.worldTransform.translation).lengthSquared();
                __touch(16302);
            }
            meshRendererComponent._renderDistance = distance;
            __touch(16295);
            var bucket = buckets[renderQueue];
            __touch(16296);
            if (!bucket) {
                bucket = [];
                __touch(16303);
                buckets[renderQueue] = bucket;
                __touch(16304);
                bucketSortList.push(renderQueue);
                __touch(16305);
            }
            bucket.push(renderable);
            __touch(16297);
        }
        if (bucketSortList.length > 1) {
            bucketSortList.sort(this.bucketSorter);
            __touch(16306);
        }
        for (var bucketIndex = 0; bucketIndex < bucketSortList.length; bucketIndex++) {
            var key = bucketSortList[bucketIndex];
            __touch(16307);
            var bucket = buckets[key];
            __touch(16308);
            if (key >= 0) {
                if (key < RenderQueue.TRANSPARENT) {
                    bucket.sort(this.opaqueSorter);
                    __touch(16309);
                } else {
                    bucket.sort(this.transparentSorter);
                    __touch(16310);
                }
            }
            for (var i = 0; i < bucket.length; i++) {
                renderList[index] = bucket[i];
                __touch(16311);
                index++;
                __touch(16312);
            }
        }
    };
    __touch(16254);
    RenderQueue.BACKGROUND = 0;
    __touch(16255);
    RenderQueue.OPAQUE = 1000;
    __touch(16256);
    RenderQueue.TRANSPARENT = 2000;
    __touch(16257);
    RenderQueue.OVERLAY = 3000;
    __touch(16258);
    return RenderQueue;
    __touch(16259);
});
__touch(16249);