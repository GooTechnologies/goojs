define([
    'goo/loaders/handlers/ConfigHandler',
    'goo/renderer/Texture',
    'goo/loaders/dds/DdsLoader',
    'goo/loaders/crunch/CrunchLoader',
    'goo/loaders/tga/TgaLoader',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/renderer/Util',
    'goo/util/ObjectUtil',
    'goo/util/CanvasUtils',
    'goo/util/StringUtil'
], function (ConfigHandler, Texture, DdsLoader, CrunchLoader, TgaLoader, RSVP, PromiseUtil, Util, _, CanvasUtils, StringUtil) {
    'use strict';
    __touch(9563);
    function TextureHandler() {
        ConfigHandler.apply(this, arguments);
        __touch(9579);
    }
    __touch(9564);
    TextureHandler.prototype = Object.create(ConfigHandler.prototype);
    __touch(9565);
    TextureHandler.prototype.constructor = TextureHandler;
    __touch(9566);
    ConfigHandler._registerClass('texture', TextureHandler);
    __touch(9567);
    TextureHandler.minFilters = [
        'NearestNeighborNoMipMaps',
        'NearestNeighborNearestMipMap',
        'NearestNeighborLinearMipMap',
        'BilinearNoMipMaps',
        'BilinearNearestMipMap',
        'Trilinear'
    ];
    __touch(9568);
    TextureHandler.magFilters = [
        'NearestNeighbor',
        'Bilinear'
    ];
    __touch(9569);
    TextureHandler.loaders = {
        dds: DdsLoader,
        crn: CrunchLoader,
        tga: TgaLoader
    };
    __touch(9570);
    TextureHandler.WHITE = new Uint8Array([
        255,
        255,
        255,
        255
    ]);
    __touch(9571);
    TextureHandler.BLACK = new Uint8Array([
        0,
        0,
        0,
        255
    ]);
    __touch(9572);
    TextureHandler.prototype._prepare = function (config) {
        _.defaults(config, {
            wrapS: 'Repeat',
            wrapT: 'Repeat',
            magFilter: 'Bilinear',
            minFilter: 'Trilinear',
            anisotropy: 1,
            offset: [
                0,
                0
            ],
            repeat: [
                1,
                1
            ],
            flipY: true,
            lodBias: 0,
            loop: true
        });
        __touch(9580);
    };
    __touch(9573);
    TextureHandler.prototype._remove = function (ref) {
        if (this._objects[ref] && this._objects[ref].destroy && this.world.gooRunner) {
            this._objects[ref].destroy(this.world.gooRunner.renderer.context);
            __touch(9582);
        }
        delete this._objects[ref];
        __touch(9581);
    };
    __touch(9574);
    TextureHandler.prototype._create = function () {
        return new Texture();
        __touch(9583);
    };
    __touch(9575);
    TextureHandler.prototype._update = function (ref, config, options) {
        var that = this;
        __touch(9584);
        return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (texture) {
            if (!texture) {
                return;
                __touch(9595);
            }
            var ret;
            __touch(9586);
            texture.wrapS = config.wrapS;
            __touch(9587);
            texture.wrapT = config.wrapT;
            __touch(9588);
            if (TextureHandler.magFilters.indexOf(config.magFilter) !== -1) {
                texture.magFilter = config.magFilter;
                __touch(9596);
            }
            if (TextureHandler.minFilters.indexOf(config.minFilter) !== -1) {
                texture.minFilter = config.minFilter;
                __touch(9597);
            }
            texture.anisotropy = Math.max(config.anisotropy, 1);
            __touch(9589);
            texture.offset.set(config.offset);
            __touch(9590);
            texture.repeat.set(config.repeat);
            __touch(9591);
            texture.lodBias = config.lodBias;
            __touch(9592);
            if (texture.flipY !== config.flipY) {
                texture.flipY = config.flipY;
                __touch(9598);
                texture.setNeedsUpdate();
                __touch(9599);
            }
            if (texture.generateMipmaps !== config.generateMipmaps) {
                texture.generateMipmaps = config.generateMipmaps !== false;
                __touch(9600);
                texture.setNeedsUpdate();
                __touch(9601);
            }
            texture.updateCallback = null;
            __touch(9593);
            var imageRef = config.imageRef;
            __touch(9594);
            if (imageRef) {
                var path = StringUtil.parseURL(imageRef).path;
                __touch(9602);
                var type = path.substr(path.lastIndexOf('.') + 1).toLowerCase();
                __touch(9603);
                var Loader = TextureHandler.loaders[type];
                __touch(9604);
                if (Loader) {
                    texture.a = imageRef;
                    __touch(9605);
                    ret = that.loadObject(imageRef).then(function (data) {
                        if (data && data.preloaded) {
                            _.extend(texture.image, data.image);
                            __touch(9610);
                            texture.format = data.format;
                            __touch(9611);
                            texture.setNeedsUpdate();
                            __touch(9612);
                            return texture;
                            __touch(9613);
                        }
                        var loader = new Loader();
                        __touch(9607);
                        loader.load(data, texture, config.flipY, 0, data.byteLength);
                        __touch(9608);
                        return texture;
                        __touch(9609);
                    });
                    __touch(9606);
                } else if ([
                        'jpg',
                        'jpeg',
                        'png',
                        'gif'
                    ].indexOf(type) !== -1) {
                    ret = that.loadObject(imageRef, options).then(function (image) {
                        if (texture.image !== image) {
                            texture.setImage(image);
                            __touch(9616);
                        }
                        return texture;
                        __touch(9615);
                    });
                    __touch(9614);
                } else if ([
                        'mp4',
                        'ogv',
                        'webm'
                    ].indexOf(type) !== -1) {
                    ret = that.loadObject(imageRef, options).then(function (video) {
                        video.width = video.videoWidth;
                        __touch(9618);
                        video.height = video.videoHeight;
                        __touch(9619);
                        video.loop = config.loop !== undefined ? config.loop : true;
                        __touch(9620);
                        if (Util.isPowerOfTwo(video.width) === false || Util.isPowerOfTwo(video.height) === false) {
                            texture.generateMipmaps = false;
                            __touch(9624);
                            texture.minFilter = 'BilinearNoMipMaps';
                            __touch(9625);
                        }
                        texture.setImage(video);
                        __touch(9621);
                        texture.updateCallback = function () {
                            return !video.paused;
                            __touch(9626);
                        };
                        __touch(9622);
                        if (config.autoPlay === undefined || config.autoPlay) {
                            video.play();
                            __touch(9627);
                        }
                        return texture;
                        __touch(9623);
                    });
                    __touch(9617);
                } else {
                    throw new Error('Unknown texture type');
                    __touch(9628);
                }
            } else if (config.svgData) {
                ret = PromiseUtil.createPromise(function (resolve, reject) {
                    CanvasUtils.renderSvgToCanvas(config.svgData, {}, function (canvas) {
                        if (canvas) {
                            texture.setImage(canvas);
                            __touch(9631);
                            resolve(texture);
                            __touch(9632);
                        } else {
                            reject('could not render svg to canvas');
                            __touch(9633);
                        }
                    });
                    __touch(9630);
                });
                __touch(9629);
            } else {
                ret = texture;
                __touch(9634);
            }
            if (options && options.texture && options.texture.dontwait) {
                return texture;
                __touch(9635);
            } else {
                return ret;
                __touch(9636);
            }
        });
        __touch(9585);
    };
    __touch(9576);
    TextureHandler.prototype._remove = function (ref) {
        if (this._objects[ref] && this._objects[ref].destroy && this.world.gooRunner) {
            this._objects[ref].destroy(this.world.gooRunner.renderer.context);
            __touch(9638);
        }
        delete this._objects[ref];
        __touch(9637);
    };
    __touch(9577);
    return TextureHandler;
    __touch(9578);
});
__touch(9562);