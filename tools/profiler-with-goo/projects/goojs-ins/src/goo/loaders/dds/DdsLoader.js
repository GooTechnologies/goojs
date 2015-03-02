define(['goo/loaders/dds/DdsUtils'], function (DdsUtils) {
    'use strict';
    __touch(8393);
    function DdsPixelFormat() {
        this.dwSize = 0;
        __touch(8436);
        this.dwFlags = 0;
        __touch(8437);
        this.dwFourCC = 0;
        __touch(8438);
        this.dwRGBBitCount = 0;
        __touch(8439);
        this.dwRBitMask = 0;
        __touch(8440);
        this.dwGBitMask = 0;
        __touch(8441);
        this.dwBBitMask = 0;
        __touch(8442);
        this.dwABitMask = 0;
        __touch(8443);
    }
    __touch(8394);
    DdsPixelFormat.HEADER_OFFSET = 19;
    __touch(8395);
    DdsPixelFormat.DDPF_ALPHAPIXELS = 1;
    __touch(8396);
    DdsPixelFormat.DDPF_ALPHA = 2;
    __touch(8397);
    DdsPixelFormat.DDPF_FOURCC = 4;
    __touch(8398);
    DdsPixelFormat.DDPF_RGB = 64;
    __touch(8399);
    DdsPixelFormat.DDPF_YUV = 512;
    __touch(8400);
    DdsPixelFormat.DDPF_LUMINANCE = 131072;
    __touch(8401);
    DdsPixelFormat.read = function (data) {
        var format = new DdsPixelFormat();
        __touch(8444);
        format.dwSize = data[DdsPixelFormat.HEADER_OFFSET + 0];
        __touch(8445);
        if (format.dwSize !== 32) {
            throw 'invalid pixel format size: ' + format.dwSize;
            __touch(8454);
        }
        format.dwFlags = data[DdsPixelFormat.HEADER_OFFSET + 1];
        __touch(8446);
        format.dwFourCC = data[DdsPixelFormat.HEADER_OFFSET + 2];
        __touch(8447);
        format.dwRGBBitCount = data[DdsPixelFormat.HEADER_OFFSET + 3];
        __touch(8448);
        format.dwRBitMask = data[DdsPixelFormat.HEADER_OFFSET + 4];
        __touch(8449);
        format.dwGBitMask = data[DdsPixelFormat.HEADER_OFFSET + 5];
        __touch(8450);
        format.dwBBitMask = data[DdsPixelFormat.HEADER_OFFSET + 6];
        __touch(8451);
        format.dwABitMask = data[DdsPixelFormat.HEADER_OFFSET + 7];
        __touch(8452);
        return format;
        __touch(8453);
    };
    __touch(8402);
    function DdsHeader() {
        this.dwSize = 0;
        __touch(8455);
        this.dwFlags = 0;
        __touch(8456);
        this.dwHeight = 0;
        __touch(8457);
        this.dwWidth = 0;
        __touch(8458);
        this.dwLinearSize = 0;
        __touch(8459);
        this.dwDepth = 0;
        __touch(8460);
        this.dwMipMapCount = 0;
        __touch(8461);
        this.dwAlphaBitDepth = 0;
        __touch(8462);
        this.dwReserved1 = [];
        __touch(8463);
        this.ddpf = null;
        __touch(8464);
        this.dwCaps = 0;
        __touch(8465);
        this.dwCaps2 = 0;
        __touch(8466);
        this.dwCaps3 = 0;
        __touch(8467);
        this.dwCaps4 = 0;
        __touch(8468);
        this.dwTextureStage = 0;
        __touch(8469);
    }
    __touch(8403);
    DdsHeader.DDSD_CAPS = 1;
    __touch(8404);
    DdsHeader.DDSD_HEIGHT = 2;
    __touch(8405);
    DdsHeader.DDSD_WIDTH = 4;
    __touch(8406);
    DdsHeader.DDSD_PITCH = 8;
    __touch(8407);
    DdsHeader.DDSD_PIXELFORMAT = 4096;
    __touch(8408);
    DdsHeader.DDSD_MIPMAPCOUNT = 131072;
    __touch(8409);
    DdsHeader.DDSD_LINEARSIZE = 524288;
    __touch(8410);
    DdsHeader.DDSD_DEPTH = 8388608;
    __touch(8411);
    DdsHeader.DDSCAPS_COMPLEX = 8;
    __touch(8412);
    DdsHeader.DDSCAPS_MIPMAP = 4194304;
    __touch(8413);
    DdsHeader.DDSCAPS_TEXTURE = 4096;
    __touch(8414);
    DdsHeader.DDSCAPS2_CUBEMAP = 512;
    __touch(8415);
    DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEX = 1024;
    __touch(8416);
    DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEX = 2048;
    __touch(8417);
    DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEY = 4096;
    __touch(8418);
    DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEY = 8192;
    __touch(8419);
    DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEZ = 16384;
    __touch(8420);
    DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEZ = 32768;
    __touch(8421);
    DdsHeader.DDSCAPS2_VOLUME = 2097152;
    __touch(8422);
    DdsHeader.read = function (data) {
        var header = new DdsHeader();
        __touch(8470);
        header.dwSize = data[1];
        __touch(8471);
        if (header.dwSize !== 124) {
            throw 'invalid dds header size: ' + header.dwSize;
            __touch(8487);
        }
        header.dwFlags = data[2];
        __touch(8472);
        header.dwHeight = data[3];
        __touch(8473);
        header.dwWidth = data[4];
        __touch(8474);
        header.dwLinearSize = data[5];
        __touch(8475);
        header.dwDepth = data[6];
        __touch(8476);
        header.dwMipMapCount = data[7];
        __touch(8477);
        header.dwAlphaBitDepth = data[8];
        __touch(8478);
        for (var i = 0; i < header.dwReserved1.length; i++) {
            header.dwReserved1[i] = data[9 + i];
            __touch(8488);
        }
        header.ddpf = DdsPixelFormat.read(data);
        __touch(8479);
        header.dwCaps = data[27];
        __touch(8480);
        header.dwCaps2 = data[28];
        __touch(8481);
        header.dwCaps3 = data[29];
        __touch(8482);
        header.dwCaps4 = data[30];
        __touch(8483);
        header.dwTextureStage = data[31];
        __touch(8484);
        var expectedMipmaps = 1 + Math.ceil(Math.log(Math.max(header.dwHeight, header.dwWidth)) / Math.log(2));
        __touch(8485);
        if (DdsUtils.isSet(header.dwCaps, DdsHeader.DDSCAPS_MIPMAP)) {
            if (!DdsUtils.isSet(header.dwFlags, DdsHeader.DDSD_MIPMAPCOUNT)) {
                header.dwMipMapCount = expectedMipmaps;
                __touch(8489);
            } else if (header.dwMipMapCount !== expectedMipmaps) {
                console.warn('Got ' + header.dwMipMapCount + ' mipmaps, expected ' + expectedMipmaps);
                __touch(8490);
            }
        } else {
            header.dwMipMapCount = 1;
            __touch(8491);
        }
        return header;
        __touch(8486);
    };
    __touch(8423);
    function DdsImageInfo() {
        this.flipVertically = false;
        __touch(8492);
        this.bpp = 0;
        __touch(8493);
        this.header = null;
        __touch(8494);
        this.headerDX10 = null;
        __touch(8495);
        this.mipmapByteSizes = [];
        __touch(8496);
    }
    __touch(8424);
    DdsImageInfo.prototype.calcMipmapSizes = function (compressed) {
        var width = this.header.dwWidth;
        __touch(8497);
        var height = this.header.dwHeight;
        __touch(8498);
        var size = 0;
        __touch(8499);
        for (var i = 0; i < this.header.dwMipMapCount; i++) {
            size = compressed ? ~~((width + 3) / 4) * ~~((height + 3) / 4) * this.bpp * 2 : ~~(width * height * this.bpp / 8);
            __touch(8500);
            this.mipmapByteSizes.push(~~((size + 3) / 4) * 4);
            __touch(8501);
            width = ~~(width / 2) > 1 ? ~~(width / 2) : 1;
            __touch(8502);
            height = ~~(height / 2) > 1 ? ~~(height / 2) : 1;
            __touch(8503);
        }
    };
    __touch(8425);
    function DdsLoader() {
    }
    __touch(8426);
    DdsLoader.updateDepth = function (image, info) {
        if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP)) {
            var depth = 0;
            __touch(8504);
            if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEX)) {
                depth++;
                __touch(8506);
            }
            if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEX)) {
                depth++;
                __touch(8507);
            }
            if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEY)) {
                depth++;
                __touch(8508);
            }
            if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEY)) {
                depth++;
                __touch(8509);
            }
            if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEZ)) {
                depth++;
                __touch(8510);
            }
            if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEZ)) {
                depth++;
                __touch(8511);
            }
            if (depth !== 6) {
                throw new Error('Cubemaps without all faces defined are not currently supported.');
                __touch(8512);
            }
            image.depth = depth;
            __touch(8505);
        } else {
            image.depth = info.header.dwDepth > 0 ? info.header.dwDepth : 1;
            __touch(8513);
        }
    };
    __touch(8427);
    DdsLoader.readDXT = function (imgData, totalSize, info, texture) {
        texture.image.isCompressed = true;
        __touch(8514);
        if (!info.flipVertically) {
            return new Uint8Array(imgData.buffer, imgData.byteOffset + 0, totalSize);
            __touch(8520);
        }
        var mipWidth = info.header.dwWidth;
        __touch(8515);
        var mipHeight = info.header.dwHeight;
        __touch(8516);
        var rVal = new Uint8Array(totalSize);
        __touch(8517);
        var offset = 0;
        __touch(8518);
        for (var mip = 0; mip < info.header.dwMipMapCount; mip++) {
            var data = imgData.subarray(offset, offset + info.mipmapByteSizes[mip]);
            __touch(8521);
            var flipped = DdsUtils.flipDXT(data, mipWidth, mipHeight, texture.format);
            __touch(8522);
            rVal.set(flipped, offset);
            __touch(8523);
            offset += flipped.length;
            __touch(8524);
            mipWidth = ~~(mipWidth / 2) > 1 ? ~~(mipWidth / 2) : 1;
            __touch(8525);
            mipHeight = ~~(mipHeight / 2) > 1 ? ~~(mipHeight / 2) : 1;
            __touch(8526);
        }
        return rVal;
        __touch(8519);
    };
    __touch(8428);
    DdsLoader.readUncompressed = function (imgData, totalSize, useRgb, useLum, useAlpha, useAlphaPixels, info, texture) {
        var redLumShift = DdsUtils.shiftCount(info.header.ddpf.dwRBitMask);
        __touch(8527);
        var greenShift = DdsUtils.shiftCount(info.header.ddpf.dwGBitMask);
        __touch(8528);
        var blueShift = DdsUtils.shiftCount(info.header.ddpf.dwBBitMask);
        __touch(8529);
        var alphaShift = DdsUtils.shiftCount(info.header.ddpf.dwABitMask);
        __touch(8530);
        var sourcebytesPP = ~~(info.header.ddpf.dwRGBBitCount / 8);
        __touch(8531);
        var targetBytesPP = DdsUtils.getComponents(texture.format) * 1;
        __touch(8532);
        var rVal = new Uint8Array(totalSize);
        __touch(8533);
        var mipWidth = info.header.dwWidth;
        __touch(8534);
        var mipHeight = info.header.dwHeight;
        __touch(8535);
        var dstOffset = 0, srcOffset = 0;
        __touch(8536);
        var i = 0;
        __touch(8537);
        var b = [];
        __touch(8538);
        for (i = 0; i < sourcebytesPP; i++) {
            b.push(0);
            __touch(8540);
        }
        for (var mip = 0; mip < info.header.dwMipMapCount; mip++) {
            for (var y = 0; y < mipHeight; y++) {
                for (var x = 0; x < mipWidth; x++) {
                    for (i = 0; i < sourcebytesPP; i++) {
                        b[i] = imgData[srcOffset++];
                        __touch(8549);
                    }
                    i = DdsUtils.getIntFromBytes(b);
                    __touch(8544);
                    var redLum = (i & info.header.ddpf.dwRBitMask) >> redLumShift;
                    __touch(8545);
                    var green = (i & info.header.ddpf.dwGBitMask) >> greenShift;
                    __touch(8546);
                    var blue = (i & info.header.ddpf.dwBBitMask) >> blueShift;
                    __touch(8547);
                    var alpha = (i & info.header.ddpf.dwABitMask) >> alphaShift;
                    __touch(8548);
                    if (useAlpha) {
                        rVal[dstOffset++] = alpha;
                        __touch(8550);
                    } else if (useLum) {
                        rVal[dstOffset++] = redLum;
                        __touch(8551);
                        if (useAlphaPixels) {
                            rVal[dstOffset++] = alpha;
                            __touch(8552);
                        }
                    } else if (useRgb) {
                        rVal[dstOffset++] = redLum;
                        __touch(8553);
                        rVal[dstOffset++] = green;
                        __touch(8554);
                        rVal[dstOffset++] = blue;
                        __touch(8555);
                        if (useAlphaPixels) {
                            rVal[dstOffset++] = alpha;
                            __touch(8556);
                        }
                    }
                }
            }
            dstOffset += mipWidth * mipHeight * targetBytesPP;
            __touch(8541);
            mipWidth = ~~(mipWidth / 2) > 1 ? ~~(mipWidth / 2) : 1;
            __touch(8542);
            mipHeight = ~~(mipHeight / 2) > 1 ? ~~(mipHeight / 2) : 1;
            __touch(8543);
        }
        return rVal;
        __touch(8539);
    };
    __touch(8429);
    DdsLoader.populate = function (texture, info, data) {
        var flags = info.header.ddpf.dwFlags;
        __touch(8557);
        var compressedFormat = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_FOURCC);
        __touch(8558);
        var rgb = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_RGB);
        __touch(8559);
        var alphaPixels = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_ALPHAPIXELS);
        __touch(8560);
        var lum = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_LUMINANCE);
        __touch(8561);
        var alpha = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_ALPHA);
        __touch(8562);
        texture.type = 'UnsignedByte';
        __touch(8563);
        if (compressedFormat) {
            var fourCC = info.header.ddpf.dwFourCC;
            __touch(8570);
            if (fourCC === DdsUtils.getIntFromString('DXT1')) {
                info.bpp = 4;
                __touch(8571);
                texture.format = 'PrecompressedDXT1A';
                __touch(8572);
            } else if (fourCC === DdsUtils.getIntFromString('DXT3')) {
                info.bpp = 8;
                __touch(8573);
                texture.format = 'PrecompressedDXT3';
                __touch(8574);
            } else if (fourCC === DdsUtils.getIntFromString('DXT5')) {
                info.bpp = 8;
                __touch(8575);
                texture.format = 'PrecompressedDXT5';
                __touch(8576);
            } else if (fourCC === DdsUtils.getIntFromString('DX10')) {
                throw new Error('dxt10 LATC formats not supported currently: ' + info.headerDX10.dxgiFormat);
                __touch(8577);
            } else if (fourCC === DdsUtils.getIntFromString('DXT2')) {
                throw 'DXT2 is not supported.';
                __touch(8578);
            } else if (fourCC === DdsUtils.getIntFromString('DXT4')) {
                throw 'DXT4 is not supported.';
                __touch(8579);
            } else {
                throw 'unsupported compressed dds format found (' + fourCC + ')';
                __touch(8580);
            }
        } else {
            info.bpp = info.header.ddpf.dwRGBBitCount;
            __touch(8581);
            if (rgb) {
                if (alphaPixels) {
                    texture.format = 'RGBA';
                    __touch(8582);
                } else {
                    texture.format = 'RGB';
                    __touch(8583);
                }
            } else if (lum || alphaPixels) {
                if (lum && alphaPixels) {
                    texture.format = 'LuminanceAlpha';
                    __touch(8584);
                } else if (lum) {
                    texture.format = 'Luminance';
                    __touch(8585);
                } else if (alpha) {
                    texture.format = 'Alpha';
                    __touch(8586);
                }
            } else {
                throw new Error('unsupported uncompressed dds format found.');
                __touch(8587);
            }
        }
        info.calcMipmapSizes(compressedFormat);
        __touch(8564);
        texture.image.mipmapSizes = info.mipmapByteSizes;
        __touch(8565);
        var totalSize = 0;
        __touch(8566);
        for (var i = 0; i < info.mipmapByteSizes.length; i++) {
            totalSize += info.mipmapByteSizes[i];
            __touch(8588);
        }
        var imageData = [];
        __touch(8567);
        for (var i = 0; i < texture.image.depth; i++) {
            if (compressedFormat) {
                imageData.push(DdsLoader.readDXT(data, totalSize, info, texture));
                __touch(8589);
            } else if (rgb || lum || alpha) {
                imageData.push(DdsLoader.readUncompressed(data, totalSize, rgb, lum, alpha, alphaPixels, info, texture));
                __touch(8590);
            }
        }
        texture.image.data = texture.image.depth === 1 ? imageData[0] : imageData;
        __touch(8568);
        texture.image.useArrays = true;
        __touch(8569);
    };
    __touch(8430);
    DdsLoader.prototype.load = function (buffer, tex, flipped, arrayByteOffset, arrayByteLength) {
        var header = new Int32Array(buffer, arrayByteOffset + 0, 32);
        __touch(8591);
        var dwMagic = header[0];
        __touch(8592);
        if (dwMagic !== DdsUtils.getIntFromString('DDS ')) {
            throw 'Not a dds file.';
            __touch(8607);
        }
        var info = new DdsImageInfo();
        __touch(8593);
        info.flipVertically = flipped;
        __touch(8594);
        info.header = DdsHeader.read(header);
        __touch(8595);
        info.headerDX10 = info.header.ddpf.dwFourCC === DdsUtils.getIntFromString('DX10') ? DdsHeader.read(Int32Array.create(buffer, arrayByteOffset + 128, 5)) : null;
        __touch(8596);
        var image = tex.image;
        __touch(8597);
        if (typeof image === 'undefined' || image === null) {
            image = {};
            __touch(8608);
            tex.image = image;
            __touch(8609);
        }
        image.width = info.header.dwWidth;
        __touch(8598);
        image.height = info.header.dwHeight;
        __touch(8599);
        DdsLoader.updateDepth(image, info);
        __touch(8600);
        var contentOffset = 128 + (info.headerDX10 ? 20 : 0);
        __touch(8601);
        DdsLoader.populate(tex, info, new Uint8Array(buffer, arrayByteOffset + contentOffset, arrayByteLength - contentOffset));
        __touch(8602);
        if (!info.mipmapByteSizes || info.mipmapByteSizes.length < 2) {
            tex.minFilter = 'BilinearNoMipMaps';
            __touch(8610);
        }
        image.bpp = info.bpp;
        __touch(8603);
        image.dataReady = true;
        __touch(8604);
        image.isData = true;
        __touch(8605);
        tex.needsUpdate = true;
        __touch(8606);
    };
    __touch(8431);
    DdsLoader.SUPPORTS_DDS = false;
    __touch(8432);
    DdsLoader.prototype.isSupported = function () {
        return DdsLoader.SUPPORTS_DDS;
        __touch(8611);
    };
    __touch(8433);
    DdsLoader.prototype.toString = function () {
        return 'DdsLoader';
        __touch(8612);
    };
    __touch(8434);
    return DdsLoader;
    __touch(8435);
});
__touch(8392);