define([
    'goo/loaders/handlers/TextureHandler',
    'goo/sound/AudioContext',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil',
    'goo/util/StringUtil',
    'goo/util/rsvp'
], function (TextureHandler, AudioContext, PromiseUtil, _, StringUtil, RSVP) {
    'use strict';
    __touch(21512);
    function Ajax(rootPath, options) {
        if (rootPath) {
            this._rootPath = rootPath;
            __touch(21531);
            if (rootPath.slice(-1) !== '/') {
                this._rootPath += '/';
                __touch(21532);
            }
        }
        this.options = options || {};
        __touch(21529);
        this._cache = {};
        __touch(21530);
    }
    __touch(21513);
    Ajax.prototype.prefill = function (bundle, clear) {
        if (clear) {
            this._cache = bundle;
            __touch(21533);
        } else {
            _.extend(this._cache, bundle);
            __touch(21534);
        }
    };
    __touch(21514);
    Ajax.prototype.clear = function () {
        this._cache = {};
        __touch(21535);
    };
    __touch(21515);
    Ajax.prototype.get = function (options) {
        options = options || {};
        __touch(21536);
        var url = options.url || '';
        __touch(21537);
        var method = 'GET';
        __touch(21538);
        var request = new XMLHttpRequest();
        __touch(21539);
        request.open(method, url, true);
        __touch(21540);
        if (options.responseType) {
            request.responseType = options.responseType;
            __touch(21542);
        }
        return PromiseUtil.createPromise(function (resolve, reject) {
            var handleStateChange = function () {
                if (request.readyState === 4) {
                    if (request.status >= 200 && request.status <= 299) {
                        request.removeEventListener('readystatechange', handleStateChange);
                        __touch(21546);
                        resolve(request);
                        __touch(21547);
                    } else {
                        request.removeEventListener('readystatechange', handleStateChange);
                        __touch(21548);
                        reject(request.statusText);
                        __touch(21549);
                    }
                }
            };
            __touch(21543);
            request.addEventListener('readystatechange', handleStateChange);
            __touch(21544);
            request.send();
            __touch(21545);
        });
        __touch(21541);
    };
    __touch(21516);
    Ajax.ARRAY_BUFFER = 'arraybuffer';
    __touch(21517);
    Ajax.crossOrigin = false;
    __touch(21518);
    Ajax.prototype.load = function (path, reload) {
        var that = this;
        __touch(21550);
        var path2 = StringUtil.parseURL(path).path;
        __touch(21551);
        var type = path2.substr(path2.lastIndexOf('.') + 1).toLowerCase();
        __touch(21552);
        function typeInGroup(type, group) {
            return type && Ajax.types[group] && Ajax.types[group][type];
            __touch(21557);
        }
        __touch(21553);
        if (!path) {
            PromiseUtil.reject('Path was undefined');
            __touch(21558);
        }
        if (path.indexOf(Ajax.ENGINE_SHADER_PREFIX) === 0) {
            return PromiseUtil.resolve();
            __touch(21559);
        }
        if (this._cache[path] && !reload) {
            if (typeInGroup(type, 'bundle')) {
                this.prefill(this._cache[path], reload);
                __touch(21560);
            }
            if (this._cache[path] instanceof RSVP.Promise) {
                return this._cache[path];
                __touch(21561);
            } else {
                return PromiseUtil.resolve(this._cache[path]);
                __touch(21562);
            }
        }
        var url = this._rootPath ? this._rootPath + path : path;
        __touch(21554);
        if (typeInGroup(type, 'image')) {
            return this._cache[path] = this._loadImage(url);
            __touch(21563);
        } else if (typeInGroup(type, 'video')) {
            var mimeTypes = {
                mp4: 'video/mp4',
                ogv: 'video/ogg',
                webm: 'video/webm'
            };
            __touch(21564);
            return this._cache[path] = this._loadVideo(url, mimeTypes[type]);
            __touch(21565);
        } else if (typeInGroup(type, 'audio')) {
            return this._cache[path] = this._loadAudio(url);
            __touch(21566);
        }
        var ajaxProperties = { url: url };
        __touch(21555);
        if (typeInGroup(type, 'binary')) {
            ajaxProperties.responseType = Ajax.ARRAY_BUFFER;
            __touch(21567);
        }
        return this._cache[path] = this.get(ajaxProperties).then(function (request) {
            if (typeInGroup(type, 'bundle')) {
                var bundle = JSON.parse(request.response);
                __touch(21569);
                that.prefill(bundle, reload);
                __touch(21570);
                return bundle;
                __touch(21571);
            }
            if (typeInGroup(type, 'json')) {
                return JSON.parse(request.response);
                __touch(21572);
            }
            return request.response;
            __touch(21568);
        }).then(null, function (err) {
            throw new Error('Could not load data from ' + path + ', ' + err);
            __touch(21573);
        });
        __touch(21556);
    };
    __touch(21519);
    Ajax.prototype.update = function (path, config) {
        this._cache[path] = config;
        __touch(21574);
        return PromiseUtil.resolve(config);
        __touch(21575);
    };
    __touch(21520);
    Ajax.prototype._loadImage = function (url) {
        window.URL = window.URL || window.webkitURL;
        __touch(21576);
        var image = new Image();
        __touch(21577);
        if (Ajax.crossOrigin) {
            image.crossOrigin = 'anonymous';
            __touch(21579);
        }
        return PromiseUtil.createPromise(function (resolve, reject) {
            var onLoad = function loadHandler() {
                image.dataReady = true;
                __touch(21585);
                if (window.URL && window.URL.revokeObjectURL !== undefined) {
                    window.URL.revokeObjectURL(image.src);
                    __touch(21589);
                }
                image.removeEventListener('load', onLoad);
                __touch(21586);
                image.removeEventListener('error', onError);
                __touch(21587);
                resolve(image);
                __touch(21588);
            };
            __touch(21580);
            var onError = function errorHandler(e) {
                image.removeEventListener('load', onLoad);
                __touch(21590);
                image.removeEventListener('error', onError);
                __touch(21591);
                reject('Could not load image from ' + url + ', ' + e);
                __touch(21592);
            };
            __touch(21581);
            image.addEventListener('load', onLoad, false);
            __touch(21582);
            image.addEventListener('error', onError, false);
            __touch(21583);
            image.src = url;
            __touch(21584);
        });
        __touch(21578);
    };
    __touch(21521);
    Ajax.prototype._loadVideo = function (url, mimeType) {
        var video = document.createElement('video');
        __touch(21593);
        if (Ajax.crossOrigin) {
            video.crossOrigin = 'anonymous';
            __touch(21598);
        }
        var promise = PromiseUtil.createPromise(function (resolve, reject) {
            video.addEventListener('canplay', function () {
                video.dataReady = true;
                __touch(21601);
                resolve(video);
                __touch(21602);
            }, false);
            __touch(21599);
            video.addEventListener('error', function (e) {
                reject('Could not load video from ' + url + ', ' + e);
                __touch(21603);
            }, false);
            __touch(21600);
        });
        __touch(21594);
        var ajaxProperties = {
            url: url,
            responseType: Ajax.ARRAY_BUFFER
        };
        __touch(21595);
        this.get(ajaxProperties).then(function (request) {
            var blob = new Blob([request.response], { type: mimeType });
            __touch(21604);
            var url = window.URL.createObjectURL(blob);
            __touch(21605);
            video.src = url;
            __touch(21606);
        });
        __touch(21596);
        return promise;
        __touch(21597);
    };
    __touch(21522);
    Ajax.prototype._loadAudio = function (url) {
        var ajaxProperties = {
            url: url,
            responseType: Ajax.ARRAY_BUFFER
        };
        __touch(21607);
        return this.get(ajaxProperties).then(function (request) {
            return request.response;
            __touch(21609);
        }).then(null, function (err) {
            throw new Error('Could not load data from ' + url + ', ' + err);
            __touch(21610);
        });
        __touch(21608);
    };
    __touch(21523);
    Ajax.ENGINE_SHADER_PREFIX = 'GOO_ENGINE_SHADERS/';
    __touch(21524);
    function addKeys(obj, keys) {
        for (var i = 0; i < keys.length; i++) {
            obj[keys[i]] = true;
            __touch(21612);
        }
        return obj;
        __touch(21611);
    }
    __touch(21525);
    Ajax.types = {
        text: {
            vert: true,
            frag: true
        },
        json: {
            shader: true,
            script: true,
            entity: true,
            material: true,
            scene: true,
            mesh: true,
            texture: true,
            skeleton: true,
            animation: true,
            clip: true,
            bundle: true,
            project: true,
            machine: true,
            posteffects: true,
            animstate: true,
            sound: true,
            environment: true,
            skybox: true
        },
        image: {
            jpg: true,
            jpeg: true,
            png: true,
            gif: true
        },
        video: {
            mp4: true,
            ogv: true,
            webm: true
        },
        binary: addKeys({
            dat: true,
            bin: true
        }, Object.keys(TextureHandler.loaders)),
        audio: {
            mp3: true,
            wav: true,
            ogg: true
        },
        bundle: { bundle: true }
    };
    __touch(21526);
    Ajax.types.asset = addKeys({}, Object.keys(Ajax.types.image).concat(Object.keys(Ajax.types.binary)));
    __touch(21527);
    return Ajax;
    __touch(21528);
});
__touch(21511);