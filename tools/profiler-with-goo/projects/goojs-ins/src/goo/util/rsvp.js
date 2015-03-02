define(['exports'], function (__exports__) {
    'use strict';
    __touch(23283);
    var config = {};
    __touch(23284);
    var browserGlobal = typeof window !== 'undefined' ? window : {};
    __touch(23285);
    var MutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    __touch(23286);
    var process = window.process;
    __touch(23287);
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        config.async = function (callback, binding) {
            process.nextTick(function () {
                callback.call(binding);
                __touch(23308);
            });
            __touch(23307);
        };
        __touch(23306);
    } else if (MutationObserver) {
        var queue = [];
        __touch(23309);
        var observer = new MutationObserver(function () {
            var toProcess = queue.slice();
            __touch(23315);
            queue = [];
            __touch(23316);
            toProcess.forEach(function (tuple) {
                var callback = tuple[0], binding = tuple[1];
                __touch(23318);
                callback.call(binding);
                __touch(23319);
            });
            __touch(23317);
        });
        __touch(23310);
        var element = document.createElement('div');
        __touch(23311);
        observer.observe(element, { attributes: true });
        __touch(23312);
        window.addEventListener('unload', function () {
            observer.disconnect();
            __touch(23320);
            observer = null;
            __touch(23321);
        });
        __touch(23313);
        config.async = function (callback, binding) {
            queue.push([
                callback,
                binding
            ]);
            __touch(23322);
            element.setAttribute('drainQueue', 'drainQueue');
            __touch(23323);
        };
        __touch(23314);
    } else {
        config.async = function (callback, binding) {
            setTimeout(function () {
                callback.call(binding);
                __touch(23326);
            }, 1);
            __touch(23325);
        };
        __touch(23324);
    }
    var Event = function (type, options) {
        this.type = type;
        __touch(23327);
        for (var option in options) {
            if (!options.hasOwnProperty(option)) {
                continue;
                __touch(23330);
            }
            this[option] = options[option];
            __touch(23329);
        }
        __touch(23328);
    };
    __touch(23288);
    var indexOf = function (callbacks, callback) {
        for (var i = 0, l = callbacks.length; i < l; i++) {
            if (callbacks[i][0] === callback) {
                return i;
                __touch(23332);
            }
        }
        return -1;
        __touch(23331);
    };
    __touch(23289);
    var callbacksFor = function (object) {
        var callbacks = object._promiseCallbacks;
        __touch(23333);
        if (!callbacks) {
            callbacks = object._promiseCallbacks = {};
            __touch(23335);
        }
        return callbacks;
        __touch(23334);
    };
    __touch(23290);
    var EventTarget = {
        mixin: function (object) {
            object.on = this.on;
            __touch(23336);
            object.off = this.off;
            __touch(23337);
            object.trigger = this.trigger;
            __touch(23338);
            return object;
            __touch(23339);
        },
        on: function (eventNames, callback, binding) {
            var allCallbacks = callbacksFor(this), callbacks, eventName;
            __touch(23340);
            eventNames = eventNames.split(/\s+/);
            __touch(23341);
            binding = binding || this;
            __touch(23342);
            while (eventName = eventNames.shift()) {
                callbacks = allCallbacks[eventName];
                __touch(23344);
                if (!callbacks) {
                    callbacks = allCallbacks[eventName] = [];
                    __touch(23345);
                }
                if (indexOf(callbacks, callback) === -1) {
                    callbacks.push([
                        callback,
                        binding
                    ]);
                    __touch(23346);
                }
            }
            __touch(23343);
        },
        off: function (eventNames, callback) {
            var allCallbacks = callbacksFor(this), callbacks, eventName, index;
            __touch(23347);
            eventNames = eventNames.split(/\s+/);
            __touch(23348);
            while (eventName = eventNames.shift()) {
                if (!callback) {
                    allCallbacks[eventName] = [];
                    __touch(23352);
                    continue;
                    __touch(23353);
                }
                callbacks = allCallbacks[eventName];
                __touch(23350);
                index = indexOf(callbacks, callback);
                __touch(23351);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                    __touch(23354);
                }
            }
            __touch(23349);
        },
        trigger: function (eventName, options) {
            var allCallbacks = callbacksFor(this), callbacks, callbackTuple, callback, binding, event;
            __touch(23355);
            if (callbacks = allCallbacks[eventName]) {
                for (var i = 0, l = callbacks.length; i < l; i++) {
                    callbackTuple = callbacks[i];
                    __touch(23356);
                    callback = callbackTuple[0];
                    __touch(23357);
                    binding = callbackTuple[1];
                    __touch(23358);
                    if (typeof options !== 'object') {
                        options = { detail: options };
                        __touch(23361);
                    }
                    event = new Event(eventName, options);
                    __touch(23359);
                    callback.call(binding, event);
                    __touch(23360);
                }
            }
        }
    };
    __touch(23291);
    var Promise = function () {
        this.on('promise:resolved', function (event) {
            this.trigger('success', { detail: event.detail });
            __touch(23364);
        }, this);
        __touch(23362);
        this.on('promise:failed', function (event) {
            this.trigger('error', { detail: event.detail });
            __touch(23365);
        }, this);
        __touch(23363);
    };
    __touch(23292);
    var noop = function () {
    };
    __touch(23293);
    var invokeCallback = function (type, promise, callback, event) {
        var hasCallback = typeof callback === 'function', value, error, succeeded, failed;
        __touch(23366);
        if (hasCallback) {
            try {
                value = callback(event.detail);
                __touch(23368);
                succeeded = true;
                __touch(23369);
            } catch (e) {
                failed = true;
                __touch(23370);
                error = e;
                __touch(23371);
            }
            __touch(23367);
        } else {
            value = event.detail;
            __touch(23372);
            succeeded = true;
            __touch(23373);
        }
        if (value && typeof value.then === 'function') {
            value.then(function (value) {
                promise.resolve(value);
                __touch(23375);
            }, function (error) {
                promise.reject(error);
                __touch(23376);
            });
            __touch(23374);
        } else if (hasCallback && succeeded) {
            promise.resolve(value);
            __touch(23377);
        } else if (failed) {
            promise.reject(error);
            __touch(23378);
        } else {
            promise[type](value);
            __touch(23379);
        }
    };
    __touch(23294);
    Promise.prototype = {
        then: function (done, fail) {
            var thenPromise = new Promise();
            __touch(23380);
            if (this.isResolved) {
                config.async(function () {
                    invokeCallback('resolve', thenPromise, done, { detail: this.resolvedValue });
                    __touch(23385);
                }, this);
                __touch(23384);
            }
            if (this.isRejected) {
                config.async(function () {
                    invokeCallback('reject', thenPromise, fail, { detail: this.rejectedValue });
                    __touch(23387);
                }, this);
                __touch(23386);
            }
            this.on('promise:resolved', function (event) {
                invokeCallback('resolve', thenPromise, done, event);
                __touch(23388);
            });
            __touch(23381);
            this.on('promise:failed', function (event) {
                invokeCallback('reject', thenPromise, fail, event);
                __touch(23389);
            });
            __touch(23382);
            return thenPromise;
            __touch(23383);
        },
        resolve: function (value) {
            resolve(this, value);
            __touch(23390);
            this.resolve = noop;
            __touch(23391);
            this.reject = noop;
            __touch(23392);
        },
        reject: function (value) {
            reject(this, value);
            __touch(23393);
            this.resolve = noop;
            __touch(23394);
            this.reject = noop;
            __touch(23395);
        }
    };
    __touch(23295);
    function resolve(promise, value) {
        config.async(function () {
            promise.trigger('promise:resolved', { detail: value });
            __touch(23397);
            promise.isResolved = true;
            __touch(23398);
            promise.resolvedValue = value;
            __touch(23399);
        });
        __touch(23396);
    }
    __touch(23296);
    function reject(promise, value) {
        config.async(function () {
            promise.trigger('promise:failed', { detail: value });
            __touch(23401);
            promise.isRejected = true;
            __touch(23402);
            promise.rejectedValue = value;
            __touch(23403);
        });
        __touch(23400);
    }
    __touch(23297);
    function all(promises) {
        var i, results = [];
        __touch(23404);
        var allPromise = new Promise();
        __touch(23405);
        var remaining = promises.length;
        __touch(23406);
        if (remaining === 0) {
            allPromise.resolve([]);
            __touch(23411);
        }
        var resolve = function (index, value) {
            results[index] = value;
            __touch(23412);
            if (--remaining === 0) {
                allPromise.resolve(results);
                __touch(23413);
            }
        };
        __touch(23407);
        var resolver = function (index) {
            return function (value) {
                resolve(index, value);
                __touch(23415);
            };
            __touch(23414);
        };
        __touch(23408);
        var reject = function (error) {
            allPromise.reject(error);
            __touch(23416);
        };
        __touch(23409);
        for (i = 0; i < remaining; i++) {
            promises[i].then(resolver(i), reject);
            __touch(23417);
        }
        return allPromise;
        __touch(23410);
    }
    __touch(23298);
    EventTarget.mixin(Promise.prototype);
    __touch(23299);
    function configure(name, value) {
        config[name] = value;
        __touch(23418);
    }
    __touch(23300);
    __exports__.Promise = Promise;
    __touch(23301);
    __exports__.Event = Event;
    __touch(23302);
    __exports__.EventTarget = EventTarget;
    __touch(23303);
    __exports__.all = all;
    __touch(23304);
    __exports__.configure = configure;
    __touch(23305);
});
__touch(23282);