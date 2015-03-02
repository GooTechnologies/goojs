define(['goo/math/Vector2'], function (Vector2) {
    'use strict';
    __touch(17689);
    function Texture(image, settings, width, height) {
        this.glTexture = null;
        __touch(17699);
        settings = settings || {};
        __touch(17700);
        this.wrapS = settings.wrapS || 'Repeat';
        __touch(17701);
        this.wrapT = settings.wrapT || 'Repeat';
        __touch(17702);
        this.magFilter = settings.magFilter || 'Bilinear';
        __touch(17703);
        this.minFilter = settings.minFilter || 'Trilinear';
        __touch(17704);
        this.anisotropy = settings.anisotropy !== undefined ? settings.anisotropy : 1;
        __touch(17705);
        this.format = settings.format || 'RGBA';
        __touch(17706);
        this.type = settings.type || 'UnsignedByte';
        __touch(17707);
        this.variant = '2D';
        __touch(17708);
        this.offset = new Vector2(settings.offset || [
            0,
            0
        ]);
        __touch(17709);
        this.repeat = new Vector2(settings.repeat || [
            1,
            1
        ]);
        __touch(17710);
        this.lodBias = 0;
        __touch(17711);
        this.generateMipmaps = settings.generateMipmaps !== undefined ? settings.generateMipmaps : true;
        __touch(17712);
        this.premultiplyAlpha = settings.premultiplyAlpha !== undefined ? settings.premultiplyAlpha : false;
        __touch(17713);
        this.unpackAlignment = settings.unpackAlignment !== undefined ? settings.unpackAlignment : 1;
        __touch(17714);
        this.flipY = settings.flipY !== undefined ? settings.flipY : true;
        __touch(17715);
        this.hasBorder = false;
        __touch(17716);
        this.needsUpdate = false;
        __touch(17717);
        this.updateCallback = null;
        __touch(17718);
        this.readyCallback = null;
        __touch(17719);
        if (image) {
            this.setImage(image, width, height, settings);
            __touch(17720);
        }
    }
    __touch(17690);
    Texture.prototype.checkDataReady = function () {
        return this.image && (this.image.dataReady || this.image instanceof HTMLImageElement) || this.readyCallback !== null && this.readyCallback();
        __touch(17721);
    };
    __touch(17691);
    Texture.prototype.checkNeedsUpdate = function () {
        return this.needsUpdate || this.updateCallback !== null && this.updateCallback();
        __touch(17722);
    };
    __touch(17692);
    Texture.prototype.setNeedsUpdate = function () {
        this.needsUpdate = true;
        __touch(17723);
    };
    __touch(17693);
    Texture.prototype.setImage = function (image, width, height, settings) {
        this.image = image;
        __touch(17724);
        var data = image instanceof Array ? image[0] : image;
        __touch(17725);
        if (data instanceof Uint8Array || data instanceof Uint8ClampedArray || data instanceof Uint16Array || data instanceof Float32Array) {
            width = width || image.width;
            __touch(17727);
            height = height || image.height;
            __touch(17728);
            if (width !== undefined && height !== undefined) {
                this.image = { data: image };
                __touch(17729);
                this.image.width = width;
                __touch(17730);
                this.image.height = height;
                __touch(17731);
                this.image.isData = true;
                __touch(17732);
                this.image.dataReady = true;
                __touch(17733);
                if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
                    this.type = 'UnsignedByte';
                    __touch(17734);
                } else if (data instanceof Uint16Array) {
                    this.type = 'UnsignedShort565';
                    __touch(17735);
                    this.format = settings.format || 'RGB';
                    __touch(17736);
                } else if (data instanceof Float32Array) {
                    this.type = 'Float';
                    __touch(17737);
                    this.format = settings.format || 'RGBA';
                    __touch(17738);
                }
            } else {
                throw 'Data textures need width and height';
                __touch(17739);
            }
        } else {
            if (image instanceof Array) {
                this.image = { data: image };
                __touch(17740);
            }
            if (data instanceof HTMLCanvasElement) {
                this.image.dataReady = true;
                __touch(17741);
            }
        }
        this.setNeedsUpdate();
        __touch(17726);
    };
    __touch(17694);
    Texture.prototype.destroy = function (context) {
        context.deleteTexture(this.glTexture);
        __touch(17742);
        this.glTexture = null;
        __touch(17743);
    };
    __touch(17695);
    Texture.prototype.getSizeInMemory = function () {
        var size;
        __touch(17744);
        var width = this.image.width || this.image.length;
        __touch(17745);
        var height = this.image.height || 1;
        __touch(17746);
        size = width * height;
        __touch(17747);
        if (this.format === 'Luminance' || this.format === 'Alpha') {
            size *= 1;
            __touch(17749);
        } else if (this.format === 'Lumin`anceAlpha') {
            size *= 2;
            __touch(17750);
        } else if (this.format === 'RGB') {
            size *= 3;
            __touch(17751);
        } else if (this.format === 'RGBA') {
            size *= 4;
            __touch(17752);
        } else if (this.format === 'PrecompressedDXT1') {
            size *= 4 / 8;
            __touch(17753);
        } else if (this.format === 'PrecompressedDXT1A') {
            size *= 4 / 6;
            __touch(17754);
        } else if (this.format === 'PrecompressedDXT3' || this.format === 'PrecompressedDXT5') {
            size *= 4 / 4;
            __touch(17755);
        }
        if (this.generateMipmaps) {
            size = Math.ceil(size * 4 / 3);
            __touch(17756);
        }
        return size;
        __touch(17748);
    };
    __touch(17696);
    Texture.CUBE_FACES = [
        'PositiveX',
        'NegativeX',
        'PositiveY',
        'NegativeY',
        'PositiveZ',
        'NegativeZ'
    ];
    __touch(17697);
    return Texture;
    __touch(17698);
});
__touch(17688);