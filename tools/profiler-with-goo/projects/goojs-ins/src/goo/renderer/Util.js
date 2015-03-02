define(function () {
    'use strict';
    __touch(17843);
    function Util() {
    }
    __touch(17844);
    Util.getByteSize = function (type) {
        switch (type) {
        case 'Byte':
            return 1;
        case 'UnsignedByte':
            return 1;
        case 'Short':
            return 2;
        case 'UnsignedShort':
            return 2;
        case 'Int':
            return 4;
        case 'HalfFloat':
            return 2;
        case 'Float':
            return 4;
        case 'Double':
            return 8;
        default:
            throw 'Unknown type: ' + type;
        }
        __touch(17855);
    };
    __touch(17845);
    Util.checkGLError = function (gl) {
        var error = gl.getError();
        __touch(17856);
        var wasError = false;
        __touch(17857);
        while (error !== gl.NO_ERROR) {
            wasError = true;
            __touch(17859);
            if (error === gl.INVALID_ENUM) {
                console.error('An unacceptable value is specified for an enumerated argument. The offending command is ignored and has no other side effect than to set the error flag.');
                __touch(17861);
            } else if (error === gl.INVALID_VALUE) {
                console.error('A numeric argument is out of range. The offending command is ignored and has no other side effect than to set the error flag.');
                __touch(17862);
            } else if (error === gl.INVALID_OPERATION) {
                console.error('The specified operation is not allowed in the current state. The offending command is ignored and has no other side effect than to set the error flag.');
                __touch(17863);
            } else if (error === gl.FRAMEBUFFER_COMPLETE) {
                console.error('The command is trying to render to or read from the framebuffer while the currently bound framebuffer is not framebuffer complete (i.e. the return value from glCheckFramebufferStatus is not GL_FRAMEBUFFER_COMPLETE). The offending command is ignored and has no other side effect than to set the error flag.');
                __touch(17864);
            } else if (error === gl.OUT_OF_MEMORY) {
                throw 'There is not enough memory left to execute the command. The state of the GL is undefined, except for the state of the error flags, after this error is recorded.';
                __touch(17865);
            }
            error = gl.getError();
            __touch(17860);
        }
        __touch(17858);
        if (wasError) {
            throw 'Stopping due to error';
            __touch(17866);
        }
    };
    __touch(17846);
    Util.isPowerOfTwo = function (value) {
        return (value & value - 1) === 0;
        __touch(17867);
    };
    __touch(17847);
    Util.nearestPowerOfTwo = function (number) {
        return Math.pow(2, Math.ceil(Math.log(number) / Math.log(2)));
        __touch(17868);
    };
    __touch(17848);
    Util.clone = function (obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
            __touch(17870);
        }
        if (obj instanceof Uint8Array) {
            return obj;
            __touch(17871);
        }
        if (obj instanceof Date) {
            var copy = new Date();
            __touch(17872);
            copy.setTime(obj.getTime());
            __touch(17873);
            return copy;
            __touch(17874);
        }
        if (obj instanceof Array) {
            var copy = [];
            __touch(17875);
            for (var i = 0, len = obj.length; i < len; ++i) {
                copy[i] = Util.clone(obj[i]);
                __touch(17877);
            }
            return copy;
            __touch(17876);
        }
        if (obj instanceof Object) {
            var copy = {};
            __touch(17878);
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = Util.clone(obj[attr]);
                    __touch(17881);
                }
            }
            __touch(17879);
            return copy;
            __touch(17880);
        }
        throw new Error('Unable to copy obj! Its type isn\'t supported.');
        __touch(17869);
    };
    __touch(17849);
    Util._blankImages = {};
    __touch(17850);
    Util.getBlankImage = function (texture, color, width, height, maxSize, index) {
        var newWidth = Util.nearestPowerOfTwo(width);
        __touch(17882);
        var newHeight = Util.nearestPowerOfTwo(height);
        __touch(17883);
        newWidth = Math.min(newWidth, maxSize);
        __touch(17884);
        newHeight = Math.min(newHeight, maxSize);
        __touch(17885);
        var strColor = color.length === 4 ? 'rgba(' + Number(color[0] * 255).toFixed(0) + ',' + Number(color[1] * 255).toFixed(0) + ',' + Number(color[2] * 255).toFixed(0) + ',' + Number(color[3]).toFixed(2) + ')' : 'rgb(' + Number(color[0] * 255).toFixed(0) + ',' + Number(color[1] * 255).toFixed(0) + ',' + Number(color[2] * 255).toFixed(0) + ')';
        __touch(17886);
        var cacheKey = strColor + newWidth + 'x' + newHeight;
        __touch(17887);
        var canvas = Util._blankImages[cacheKey];
        __touch(17888);
        if (!canvas) {
            canvas = document.createElement('canvas');
            __touch(17889);
            canvas.width = newWidth;
            __touch(17890);
            canvas.height = newHeight;
            __touch(17891);
            var ctx = canvas.getContext('2d');
            __touch(17892);
            ctx.beginPath();
            __touch(17893);
            ctx.rect(0, 0, newWidth, newHeight);
            __touch(17894);
            ctx.fillStyle = strColor;
            __touch(17895);
            ctx.fill();
            __touch(17896);
            Util._blankImages[cacheKey] = canvas;
            __touch(17897);
        }
        if (index === undefined) {
            texture.image = canvas;
            __touch(17898);
        } else {
            texture.image.isData = false;
            __touch(17899);
            texture.image.data[index] = canvas;
            __touch(17900);
        }
    };
    __touch(17851);
    function getImage(data, width, height) {
        var canvas = document.createElement('canvas');
        __touch(17901);
        canvas.width = width;
        __touch(17902);
        canvas.height = height;
        __touch(17903);
        var context = canvas.getContext('2d');
        __touch(17904);
        var imageData = context.createImageData(width, height);
        __touch(17905);
        imageData.data.set(data);
        __touch(17906);
        context.putImageData(imageData, 0, 0);
        __touch(17907);
        return canvas;
        __touch(17908);
    }
    __touch(17852);
    Util.scaleImage = function (texture, image, width, height, maxSize, index) {
        var newWidth = Util.nearestPowerOfTwo(width);
        __touch(17909);
        var newHeight = Util.nearestPowerOfTwo(height);
        __touch(17910);
        newWidth = Math.min(newWidth, maxSize);
        __touch(17911);
        newHeight = Math.min(newHeight, maxSize);
        __touch(17912);
        if (image.width !== newWidth || image.height !== newHeight) {
            var canvas = document.createElement('canvas');
            __touch(17913);
            canvas.width = newWidth;
            __touch(17914);
            canvas.height = newHeight;
            __touch(17915);
            if (image.getAttribute) {
                canvas.setAttribute('data-ref', image.getAttribute('data-ref'));
                __touch(17921);
            }
            var ctx = canvas.getContext('2d');
            __touch(17916);
            if (image.data) {
                ctx.drawImage(getImage(image.data, image.width, image.height), 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);
                __touch(17922);
            } else {
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);
                __touch(17923);
            }
            canvas.dataReady = true;
            __touch(17917);
            canvas.src = image.src;
            __touch(17918);
            canvas.originalWidth = width;
            __touch(17919);
            canvas.originalHeight = height;
            __touch(17920);
            if (index === undefined) {
                texture.image = canvas;
                __touch(17924);
            } else {
                texture.image.data[index] = canvas;
                __touch(17925);
            }
        }
    };
    __touch(17853);
    return Util;
    __touch(17854);
});
__touch(17842);