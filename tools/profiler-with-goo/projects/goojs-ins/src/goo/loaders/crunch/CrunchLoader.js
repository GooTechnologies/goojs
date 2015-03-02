define([
    'goo/loaders/dds/DdsLoader',
    'goo/loaders/dds/DdsUtils'
], function (DdsLoader, DdsUtils) {
    'use strict';
    __touch(8294);
    function CrunchLoader() {
    }
    __touch(8295);
    CrunchLoader.cCRNFmtDXT1 = 0;
    __touch(8296);
    CrunchLoader.cCRNFmtDXT3 = 1;
    __touch(8297);
    CrunchLoader.cCRNFmtDXT5 = 2;
    __touch(8298);
    CrunchLoader.prototype.arrayBufferCopy = function (src, dst, dstByteOffset, numBytes) {
        var dst32Offset = dstByteOffset / 4, tail = numBytes % 4, src32 = new Uint32Array(src.buffer, 0, (numBytes - tail) / 4), dst32 = new Uint32Array(dst.buffer), i;
        __touch(8305);
        for (i = 0; i < src32.length; i++) {
            dst32[dst32Offset + i] = src32[i];
            __touch(8306);
        }
        for (i = numBytes - tail; i < numBytes; i++) {
            dst[dstByteOffset + i] = src[i];
            __touch(8307);
        }
    };
    __touch(8299);
    CrunchLoader.prototype.load = function (arrayBuffer, texture, flipped) {
        if (typeof window.CrunchModule === 'undefined') {
            console.warn('Crunch library not loaded! Include a script tag pointing to lib/crunch/crunch.js in your html-file.');
            __touch(8335);
            return;
            __touch(8336);
        }
        var CrunchModule = window.CrunchModule;
        __touch(8308);
        var bytes = new Uint8Array(arrayBuffer), srcSize = arrayBuffer.byteLength, src = CrunchModule._malloc(srcSize), format, dst, dstSize, width, height, levels, dxtData, i;
        __touch(8309);
        this.arrayBufferCopy(bytes, CrunchModule.HEAPU8, src, srcSize);
        __touch(8310);
        format = CrunchModule._crn_get_dxt_format(src, srcSize);
        __touch(8311);
        var bpp;
        __touch(8312);
        switch (format) {
        case CrunchLoader.cCRNFmtDXT1:
            texture.format = 'PrecompressedDXT1A';
            bpp = 4;
            break;
        case CrunchLoader.cCRNFmtDXT3:
            texture.format = 'PrecompressedDXT3';
            bpp = 8;
            break;
        case CrunchLoader.cCRNFmtDXT5:
            texture.format = 'PrecompressedDXT5';
            bpp = 8;
            break;
        default:
            console.error('Unsupported image format');
            return 0;
        }
        __touch(8313);
        width = CrunchModule._crn_get_width(src, srcSize);
        __touch(8314);
        height = CrunchModule._crn_get_height(src, srcSize);
        __touch(8315);
        levels = CrunchModule._crn_get_levels(src, srcSize);
        __touch(8316);
        dstSize = CrunchModule._crn_get_uncompressed_size(src, srcSize, 0);
        __touch(8317);
        dst = CrunchModule._malloc(dstSize);
        __touch(8318);
        var image = texture.image;
        __touch(8319);
        if (typeof image === 'undefined' || image === null) {
            image = {};
            __touch(8337);
            texture.image = image;
            __touch(8338);
        }
        image.width = width;
        __touch(8320);
        image.height = height;
        __touch(8321);
        image.depth = 1;
        __touch(8322);
        var imageData = [];
        __touch(8323);
        texture.image.mipmapSizes = [];
        __touch(8324);
        for (i = 0; i < levels; ++i) {
            if (i) {
                dstSize = CrunchModule._crn_get_uncompressed_size(src, srcSize, i);
                __touch(8345);
            }
            CrunchModule._crn_decompress(src, srcSize, dst, dstSize, i);
            __touch(8339);
            dxtData = new Uint8Array(CrunchModule.HEAPU8.buffer, dst, dstSize);
            __touch(8340);
            if (flipped) {
                dxtData = DdsUtils.flipDXT(dxtData, width, height, texture.format);
                __touch(8346);
            }
            imageData.push(dxtData);
            __touch(8341);
            texture.image.mipmapSizes.push(dstSize);
            __touch(8342);
            width *= 0.5;
            __touch(8343);
            height *= 0.5;
            __touch(8344);
        }
        texture.image.data = imageData;
        __touch(8325);
        texture.image.useArrays = true;
        __touch(8326);
        texture.type = 'UnsignedByte';
        __touch(8327);
        texture.image.isCompressed = true;
        __touch(8328);
        if (levels <= 1) {
            texture.minFilter = 'BilinearNoMipMaps';
            __touch(8347);
        }
        image.bpp = bpp;
        __touch(8329);
        image.dataReady = true;
        __touch(8330);
        image.isData = true;
        __touch(8331);
        texture.needsUpdate = true;
        __touch(8332);
        CrunchModule._free(src);
        __touch(8333);
        CrunchModule._free(dst);
        __touch(8334);
    };
    __touch(8300);
    CrunchLoader.prototype.dxtToRgb565 = function (src, src16Offset, width, height) {
        var c = new Uint16Array(4);
        __touch(8348);
        var dst = new Uint16Array(width * height);
        __touch(8349);
        var m = 0;
        __touch(8350);
        var dstI = 0;
        __touch(8351);
        var i = 0;
        __touch(8352);
        var r0 = 0, g0 = 0, b0 = 0, r1 = 0, g1 = 0, b1 = 0;
        __touch(8353);
        var blockWidth = width / 4;
        __touch(8354);
        var blockHeight = height / 4;
        __touch(8355);
        for (var blockY = 0; blockY < blockHeight; blockY++) {
            for (var blockX = 0; blockX < blockWidth; blockX++) {
                i = src16Offset + 4 * (blockY * blockWidth + blockX);
                __touch(8357);
                c[0] = src[i];
                __touch(8358);
                c[1] = src[i + 1];
                __touch(8359);
                r0 = c[0] & 31;
                __touch(8360);
                g0 = c[0] & 2016;
                __touch(8361);
                b0 = c[0] & 63488;
                __touch(8362);
                r1 = c[1] & 31;
                __touch(8363);
                g1 = c[1] & 2016;
                __touch(8364);
                b1 = c[1] & 63488;
                __touch(8365);
                c[2] = 5 * r0 + 3 * r1 >> 3 | 5 * g0 + 3 * g1 >> 3 & 2016 | 5 * b0 + 3 * b1 >> 3 & 63488;
                __touch(8366);
                c[3] = 5 * r1 + 3 * r0 >> 3 | 5 * g1 + 3 * g0 >> 3 & 2016 | 5 * b1 + 3 * b0 >> 3 & 63488;
                __touch(8367);
                m = src[i + 2];
                __touch(8368);
                dstI = blockY * 4 * width + blockX * 4;
                __touch(8369);
                dst[dstI] = c[m & 3];
                __touch(8370);
                dst[dstI + 1] = c[m >> 2 & 3];
                __touch(8371);
                dst[dstI + 2] = c[m >> 4 & 3];
                __touch(8372);
                dst[dstI + 3] = c[m >> 6 & 3];
                __touch(8373);
                dstI += width;
                __touch(8374);
                dst[dstI] = c[m >> 8 & 3];
                __touch(8375);
                dst[dstI + 1] = c[m >> 10 & 3];
                __touch(8376);
                dst[dstI + 2] = c[m >> 12 & 3];
                __touch(8377);
                dst[dstI + 3] = c[m >> 14];
                __touch(8378);
                m = src[i + 3];
                __touch(8379);
                dstI += width;
                __touch(8380);
                dst[dstI] = c[m & 3];
                __touch(8381);
                dst[dstI + 1] = c[m >> 2 & 3];
                __touch(8382);
                dst[dstI + 2] = c[m >> 4 & 3];
                __touch(8383);
                dst[dstI + 3] = c[m >> 6 & 3];
                __touch(8384);
                dstI += width;
                __touch(8385);
                dst[dstI] = c[m >> 8 & 3];
                __touch(8386);
                dst[dstI + 1] = c[m >> 10 & 3];
                __touch(8387);
                dst[dstI + 2] = c[m >> 12 & 3];
                __touch(8388);
                dst[dstI + 3] = c[m >> 14];
                __touch(8389);
            }
        }
        return dst;
        __touch(8356);
    };
    __touch(8301);
    CrunchLoader.prototype.isSupported = function () {
        return DdsLoader.SUPPORTS_DDS;
        __touch(8390);
    };
    __touch(8302);
    CrunchLoader.prototype.toString = function () {
        return 'CrunchLoader';
        __touch(8391);
    };
    __touch(8303);
    return CrunchLoader;
    __touch(8304);
});
__touch(8293);