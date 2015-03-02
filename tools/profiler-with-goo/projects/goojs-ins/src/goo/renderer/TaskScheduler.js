define(['goo/util/PromiseUtil'], function (PromiseUtil) {
    'use strict';
    __touch(17668);
    (function performanceShim() {
        window.performance = window.performance || {};
        __touch(17674);
        performance.now = function () {
            return performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
                return Date.now();
                __touch(17677);
            };
            __touch(17676);
        }();
        __touch(17675);
    }());
    __touch(17669);
    function TaskScheduler() {
    }
    __touch(17670);
    TaskScheduler.maxTimePerFrame = 50;
    __touch(17671);
    TaskScheduler.each = function (queue) {
        return PromiseUtil.createPromise(function (resolve, reject) {
            var i = 0;
            __touch(17679);
            function process() {
                var startTime = performance.now();
                __touch(17682);
                while (i < queue.length && performance.now() - startTime < TaskScheduler.maxTimePerFrame) {
                    queue[i]();
                    __touch(17684);
                    i++;
                    __touch(17685);
                }
                __touch(17683);
                if (i < queue.length) {
                    setTimeout(process, 4);
                    __touch(17686);
                } else {
                    resolve();
                    __touch(17687);
                }
            }
            __touch(17680);
            process();
            __touch(17681);
        });
        __touch(17678);
    };
    __touch(17672);
    return TaskScheduler;
    __touch(17673);
});
__touch(17667);