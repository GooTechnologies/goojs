define(function () {
    'use strict';
    __touch(8614);
    function DdsUtils() {
    }
    __touch(8615);
    DdsUtils.getDdsExtension = function (context) {
        var vendorPrefixes = [
            '',
            'WEBKIT_',
            'MOZ_'
        ];
        __touch(8629);
        for (var i = 0; i < vendorPrefixes.length; i++) {
            var ext = context.getExtension(vendorPrefixes[i] + 'WEBGL_compressed_texture_s3tc');
            __touch(8631);
            if (typeof ext !== 'undefined' && ext !== null) {
                return ext;
                __touch(8632);
            }
        }
        return null;
        __touch(8630);
    };
    __touch(8616);
    DdsUtils.isSupported = function (context) {
        return DdsUtils.getDdsExtension(context) !== null;
        __touch(8633);
    };
    __touch(8617);
    DdsUtils.shiftCount = function (mask) {
        if (mask === 0) {
            return 0;
            __touch(8637);
        }
        var i = 0;
        __touch(8634);
        while ((mask & 1) === 0) {
            mask = mask >> 1;
            __touch(8638);
            i++;
            __touch(8639);
            if (i > 32) {
                throw 'invalid mask!';
                __touch(8640);
            }
        }
        __touch(8635);
        return i;
        __touch(8636);
    };
    __touch(8618);
    DdsUtils.isSet = function (value, bitMask) {
        return (value & bitMask) === bitMask;
        __touch(8641);
    };
    __touch(8619);
    DdsUtils.getIntFromString = function (string) {
        var bytes = [];
        __touch(8642);
        for (var i = 0; i < string.length; i++) {
            bytes[i] = string.charCodeAt(i);
            __touch(8644);
        }
        return DdsUtils.getIntFromBytes(bytes);
        __touch(8643);
    };
    __touch(8620);
    DdsUtils.getIntFromBytes = function (bytes) {
        var rVal = 0;
        __touch(8645);
        rVal |= (bytes[0] & 255) << 0;
        __touch(8646);
        if (bytes.length > 1) {
            rVal |= (bytes[1] & 255) << 8;
            __touch(8648);
        }
        if (bytes.length > 2) {
            rVal |= (bytes[2] & 255) << 16;
            __touch(8649);
        }
        if (bytes.length > 3) {
            rVal |= (bytes[3] & 255) << 24;
            __touch(8650);
        }
        return rVal;
        __touch(8647);
    };
    __touch(8621);
    DdsUtils.getComponents = function (format) {
        switch (format) {
        case 'Alpha':
            return 1;
        case 'RGB':
            return 3;
        case 'RGBA':
            return 4;
        case 'Luminance':
            return 1;
        case 'LuminanceAlpha':
            return 2;
        case 'PrecompressedDXT1':
            return 1;
        case 'PrecompressedDXT1A':
            return 1;
        case 'PrecompressedDXT3':
            return 2;
        case 'PrecompressedDXT5':
            return 2;
        }
        __touch(8651);
        return 0;
        __touch(8652);
    };
    __touch(8622);
    DdsUtils.flipDXT = function (rawData, width, height, format) {
        var returnData = new Uint8Array(rawData.length);
        __touch(8653);
        var blocksPerColumn = width + 3 >> 2;
        __touch(8654);
        var blocksPerRow = height + 3 >> 2;
        __touch(8655);
        var bytesPerBlock = DdsUtils.getComponents(format) * 8;
        __touch(8656);
        for (var sourceRow = 0; sourceRow < blocksPerRow; sourceRow++) {
            var targetRow = blocksPerRow - sourceRow - 1;
            __touch(8658);
            for (var column = 0; column < blocksPerColumn; column++) {
                var target = (targetRow * blocksPerColumn + column) * bytesPerBlock;
                __touch(8659);
                var source = (sourceRow * blocksPerColumn + column) * bytesPerBlock;
                __touch(8660);
                switch (format) {
                case 'PrecompressedDXT1':
                case 'PrecompressedDXT1A':
                    returnData[target + 0] = rawData[source + 0];
                    returnData[target + 1] = rawData[source + 1];
                    returnData[target + 2] = rawData[source + 2];
                    returnData[target + 3] = rawData[source + 3];
                    returnData[target + 4] = rawData[source + 7];
                    returnData[target + 5] = rawData[source + 6];
                    returnData[target + 6] = rawData[source + 5];
                    returnData[target + 7] = rawData[source + 4];
                    break;
                case 'PrecompressedDXT3':
                    returnData[target + 0] = rawData[source + 6];
                    returnData[target + 1] = rawData[source + 7];
                    returnData[target + 2] = rawData[source + 4];
                    returnData[target + 3] = rawData[source + 5];
                    returnData[target + 4] = rawData[source + 2];
                    returnData[target + 5] = rawData[source + 3];
                    returnData[target + 6] = rawData[source + 0];
                    returnData[target + 7] = rawData[source + 1];
                    returnData[target + 8] = rawData[source + 8];
                    returnData[target + 9] = rawData[source + 9];
                    returnData[target + 10] = rawData[source + 10];
                    returnData[target + 11] = rawData[source + 11];
                    returnData[target + 12] = rawData[source + 15];
                    returnData[target + 13] = rawData[source + 14];
                    returnData[target + 14] = rawData[source + 13];
                    returnData[target + 15] = rawData[source + 12];
                    break;
                case 'PrecompressedDXT5':
                    returnData[target + 0] = rawData[source + 0];
                    returnData[target + 1] = rawData[source + 1];
                    DdsUtils.getBytesFromUInt24(returnData, target + 5, DdsUtils.flipUInt24(DdsUtils.getUInt24(rawData, source + 2)));
                    DdsUtils.getBytesFromUInt24(returnData, target + 2, DdsUtils.flipUInt24(DdsUtils.getUInt24(rawData, source + 5)));
                    returnData[target + 8] = rawData[source + 8];
                    returnData[target + 9] = rawData[source + 9];
                    returnData[target + 10] = rawData[source + 10];
                    returnData[target + 11] = rawData[source + 11];
                    returnData[target + 12] = rawData[source + 15];
                    returnData[target + 13] = rawData[source + 14];
                    returnData[target + 14] = rawData[source + 13];
                    returnData[target + 15] = rawData[source + 12];
                    break;
                }
                __touch(8661);
            }
        }
        return returnData;
        __touch(8657);
    };
    __touch(8623);
    DdsUtils.getUInt24 = function (input, offset) {
        var result = 0;
        __touch(8662);
        result |= (input[offset + 0] & 255) << 0;
        __touch(8663);
        result |= (input[offset + 1] & 255) << 8;
        __touch(8664);
        result |= (input[offset + 2] & 255) << 16;
        __touch(8665);
        return result;
        __touch(8666);
    };
    __touch(8624);
    DdsUtils.getBytesFromUInt24 = function (input, offset, uint24) {
        input[offset + 0] = uint24 & 255;
        __touch(8667);
        input[offset + 1] = (uint24 & 65280) >> 8;
        __touch(8668);
        input[offset + 2] = (uint24 & 16711680) >> 16;
        __touch(8669);
    };
    __touch(8625);
    DdsUtils.ThreeBitMask = 7;
    __touch(8626);
    DdsUtils.flipUInt24 = function (uint24) {
        var threeBits = [];
        __touch(8670);
        for (var i = 0; i < 2; i++) {
            threeBits.push([
                0,
                0,
                0,
                0
            ]);
            __touch(8696);
        }
        threeBits[0][0] = uint24 & DdsUtils.ThreeBitMask;
        __touch(8671);
        uint24 >>= 3;
        __touch(8672);
        threeBits[0][1] = uint24 & DdsUtils.ThreeBitMask;
        __touch(8673);
        uint24 >>= 3;
        __touch(8674);
        threeBits[0][2] = uint24 & DdsUtils.ThreeBitMask;
        __touch(8675);
        uint24 >>= 3;
        __touch(8676);
        threeBits[0][3] = uint24 & DdsUtils.ThreeBitMask;
        __touch(8677);
        uint24 >>= 3;
        __touch(8678);
        threeBits[1][0] = uint24 & DdsUtils.ThreeBitMask;
        __touch(8679);
        uint24 >>= 3;
        __touch(8680);
        threeBits[1][1] = uint24 & DdsUtils.ThreeBitMask;
        __touch(8681);
        uint24 >>= 3;
        __touch(8682);
        threeBits[1][2] = uint24 & DdsUtils.ThreeBitMask;
        __touch(8683);
        uint24 >>= 3;
        __touch(8684);
        threeBits[1][3] = uint24 & DdsUtils.ThreeBitMask;
        __touch(8685);
        var result = 0;
        __touch(8686);
        result = result | threeBits[1][0] << 0;
        __touch(8687);
        result = result | threeBits[1][1] << 3;
        __touch(8688);
        result = result | threeBits[1][2] << 6;
        __touch(8689);
        result = result | threeBits[1][3] << 9;
        __touch(8690);
        result = result | threeBits[0][0] << 12;
        __touch(8691);
        result = result | threeBits[0][1] << 15;
        __touch(8692);
        result = result | threeBits[0][2] << 18;
        __touch(8693);
        result = result | threeBits[0][3] << 21;
        __touch(8694);
        return result;
        __touch(8695);
    };
    __touch(8627);
    return DdsUtils;
    __touch(8628);
});
__touch(8613);