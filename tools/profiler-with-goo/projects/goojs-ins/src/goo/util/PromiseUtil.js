define(['goo/util/rsvp'], function (RSVP) {
    'use strict';
    __touch(22160);
    var nativePromise = !!window.Promise;
    __touch(22161);
    var PromiseUtil = {};
    __touch(22162);
    PromiseUtil.createPromise = function (fun) {
        var promise = new RSVP.Promise();
        __touch(22171);
        fun(function (value) {
            promise.resolve(value);
            __touch(22174);
        }, function (reason) {
            promise.reject(reason);
            __touch(22175);
        });
        __touch(22172);
        return promise;
        __touch(22173);
    };
    __touch(22163);
    PromiseUtil.resolve = function (value) {
        var promise = new RSVP.Promise();
        __touch(22176);
        promise.resolve(value);
        __touch(22177);
        return promise;
        __touch(22178);
    };
    __touch(22164);
    PromiseUtil.reject = function (reason) {
        var promise = new RSVP.Promise();
        __touch(22179);
        promise.reject(reason);
        __touch(22180);
        return promise;
        __touch(22181);
    };
    __touch(22165);
    var createDummyPromiseWarn = false;
    __touch(22166);
    PromiseUtil.createDummyPromise = function (arg, error) {
        if (!createDummyPromiseWarn) {
            createDummyPromiseWarn = true;
            __touch(22184);
            console.warn('PromiseUtil.createDummyPromise is deprecated; please consider using PromiseUtil.resolve/reject instead');
            __touch(22185);
        }
        var promise = new RSVP.Promise();
        __touch(22182);
        if (error) {
            promise.reject(error);
            __touch(22186);
        } else {
            promise.resolve(arg);
            __touch(22187);
        }
        return promise;
        __touch(22183);
    };
    __touch(22167);
    PromiseUtil.optimisticAll = function (promises) {
        var resolved = 0, len = promises.length, results = [], promise = new RSVP.Promise();
        __touch(22188);
        if (len > 0) {
            for (var i = 0; i < len; i++) {
                (function (i) {
                    promises[i].then(function (result) {
                        results[i] = result;
                        __touch(22192);
                        resolved++;
                        __touch(22193);
                        if (resolved === len) {
                            promise.resolve(results);
                            __touch(22194);
                        }
                    }, function (error) {
                        results[i] = error;
                        __touch(22195);
                        resolved++;
                        __touch(22196);
                        if (resolved === len) {
                            promise.resolve(results);
                            __touch(22197);
                        }
                    });
                    __touch(22191);
                }(i));
                __touch(22190);
            }
        } else {
            promise.resolve(results);
            __touch(22198);
        }
        return promise;
        __touch(22189);
    };
    __touch(22168);
    PromiseUtil.defer = function (delay, arg) {
        var p1, p2, promise;
        __touch(22199);
        promise = new RSVP.Promise();
        __touch(22200);
        if (arg.apply) {
            p1 = new RSVP.Promise();
            __touch(22202);
            p2 = p1.then(function () {
                return arg();
                __touch(22206);
            });
            __touch(22203);
            setTimeout(function () {
                p1.resolve();
                __touch(22207);
            }, delay);
            __touch(22204);
            return p2;
            __touch(22205);
        } else {
            setTimeout(function () {
                promise.resolve(arg);
                __touch(22209);
            }, delay);
            __touch(22208);
        }
        return promise;
        __touch(22201);
    };
    __touch(22169);
    return PromiseUtil;
    __touch(22170);
});
__touch(22159);