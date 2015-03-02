define([
    'goo/renderer/Texture',
    'goo/renderer/Util',
    'goo/loaders/handlers/TextureHandler',
    'goo/util/Ajax',
    'goo/util/StringUtil',
    'goo/util/PromiseUtil',
    'goo/util/rsvp'
], function (Texture, Util, TextureHandler, Ajax, StringUtil, PromiseUtil, RSVP) {
    'use strict';
    __touch(17758);
    function TextureCreator() {
        var ajax = this.ajax = new Ajax();
        __touch(17774);
        this.textureHandler = new TextureHandler({}, function (ref, options) {
            return ajax.load(ref, options ? options.noCache : false);
            __touch(17776);
        }, function () {
        }, function (ref, options) {
            return ajax.load(ref, options ? options.noCache : false);
            __touch(17777);
        });
        __touch(17775);
    }
    __touch(17759);
    TextureCreator.UNSUPPORTED_FALLBACK = '.png';
    __touch(17760);
    TextureCreator.clearCache = function () {
    };
    __touch(17761);
    TextureCreator.prototype.clear = function () {
        this.ajax.clear();
        __touch(17778);
        this.textureHandler.clear();
        __touch(17779);
    };
    __touch(17762);
    TextureCreator.prototype.loadTexture2D = function (imageURL, settings, callback) {
        var id = StringUtil.createUniqueId('texture');
        __touch(17780);
        settings = settings || {};
        __touch(17781);
        settings.imageRef = imageURL;
        __touch(17782);
        var texture = this.textureHandler._objects[id] = this.textureHandler._create();
        __touch(17783);
        this.textureHandler.update(id, settings).then(function () {
            if (callback) {
                callback(texture);
                __touch(17786);
            }
        });
        __touch(17784);
        return texture;
        __touch(17785);
    };
    __touch(17763);
    TextureCreator.prototype.loadTextureVideo = function (videoURL, loop, settings, errorCallback) {
        var id = StringUtil.createUniqueId('texture');
        __touch(17787);
        settings = settings || {};
        __touch(17788);
        settings.imageRef = videoURL;
        __touch(17789);
        settings.loop = loop;
        __touch(17790);
        settings.wrapS = 'EdgeClamp';
        __touch(17791);
        settings.wrapT = 'EdgeClamp';
        __touch(17792);
        settings.autoPlay = true;
        __touch(17793);
        var texture = this.textureHandler._objects[id] = this.textureHandler._create();
        __touch(17794);
        this.textureHandler.update(id, settings, { texture: { dontwait: true } }).then(null, function (err) {
            errorCallback(err);
            __touch(17797);
        });
        __touch(17795);
        return texture;
        __touch(17796);
    };
    __touch(17764);
    TextureCreator.prototype.loadTextureWebCam = function () {
        var video = document.createElement('video');
        __touch(17798);
        video.autoplay = true;
        __touch(17799);
        video.loop = true;
        __touch(17800);
        var texture = new Texture(video, {
            wrapS: 'EdgeClamp',
            wrapT: 'EdgeClamp'
        });
        __touch(17801);
        texture.readyCallback = function () {
            if (video.readyState >= 3) {
                console.log('WebCam video ready: ' + video.videoWidth + ', ' + video.videoHeight);
                __touch(17808);
                video.width = video.videoWidth;
                __touch(17809);
                video.height = video.videoHeight;
                __touch(17810);
                if (Util.isPowerOfTwo(video.width) === false || Util.isPowerOfTwo(video.height) === false) {
                    texture.generateMipmaps = false;
                    __touch(17813);
                    texture.minFilter = 'BilinearNoMipMaps';
                    __touch(17814);
                }
                video.dataReady = true;
                __touch(17811);
                return true;
                __touch(17812);
            }
            return false;
            __touch(17807);
        };
        __touch(17802);
        texture.updateCallback = function () {
            return !video.paused;
            __touch(17815);
        };
        __touch(17803);
        window.URL = window.URL || window.webkitURL;
        __touch(17804);
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        __touch(17805);
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ video: true }, function (stream) {
                video.src = window.URL.createObjectURL(stream);
                __touch(17817);
            }, function (e) {
                console.warn('Unable to capture WebCam. Please reload the page.', e);
                __touch(17818);
            });
            __touch(17816);
        } else {
            console.warn('No support for WebCam getUserMedia found!');
            __touch(17819);
        }
        return texture;
        __touch(17806);
    };
    __touch(17765);
    TextureCreator.prototype.loadTextureCube = function (imageDataArray, settings, callback) {
        var texture = new Texture(null, settings);
        __touch(17820);
        texture.variant = 'CUBE';
        __touch(17821);
        var promises = imageDataArray.map(function (queryImage) {
            return PromiseUtil.createPromise(function (resolve, reject) {
                if (typeof queryImage === 'string') {
                    this.ajax._loadImage(queryImage).then(resolve);
                    __touch(17826);
                } else {
                    resolve(queryImage);
                    __touch(17827);
                }
            }.bind(this));
            __touch(17825);
        }.bind(this));
        __touch(17822);
        RSVP.all(promises).then(function (images) {
            var width = images[0].width;
            __touch(17828);
            var height = images[0].height;
            __touch(17829);
            for (var i = 0; i < 6; i++) {
                var image = images[i];
                __touch(17834);
                if (width !== image.width || height !== image.height) {
                    texture.generateMipmaps = false;
                    __touch(17835);
                    texture.minFilter = 'BilinearNoMipMaps';
                    __touch(17836);
                    console.error('Images not all the same size!');
                    __touch(17837);
                }
            }
            texture.setImage(images);
            __touch(17830);
            texture.image.dataReady = true;
            __touch(17831);
            texture.image.width = width;
            __touch(17832);
            texture.image.height = height;
            __touch(17833);
            if (callback) {
                callback();
                __touch(17838);
            }
        });
        __touch(17823);
        return texture;
        __touch(17824);
    };
    __touch(17766);
    TextureCreator._globalCallback = null;
    __touch(17767);
    TextureCreator._finishedLoading = function (image) {
        if (TextureCreator._globalCallback) {
            try {
                TextureCreator._globalCallback(image);
                __touch(17840);
            } catch (e) {
                console.error('Error in texture callback:', e);
                __touch(17841);
            }
            __touch(17839);
        }
    };
    __touch(17768);
    var colorInfo = new Uint8Array([
        255,
        255,
        255,
        255
    ]);
    __touch(17769);
    TextureCreator.DEFAULT_TEXTURE_2D = new Texture(colorInfo, null, 1, 1);
    __touch(17770);
    TextureCreator.DEFAULT_TEXTURE_CUBE = new Texture([
        colorInfo,
        colorInfo,
        colorInfo,
        colorInfo,
        colorInfo,
        colorInfo
    ], null, 1, 1);
    __touch(17771);
    TextureCreator.DEFAULT_TEXTURE_CUBE.variant = 'CUBE';
    __touch(17772);
    return TextureCreator;
    __touch(17773);
});
__touch(17757);