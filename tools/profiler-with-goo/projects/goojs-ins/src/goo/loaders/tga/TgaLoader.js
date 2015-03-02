define([], function () {
    'use strict';
    __touch(9688);
    function TgaLoader() {
        this.header = null;
        __touch(9719);
        this.offset = 0;
        __touch(9720);
        this.use_rle = false;
        __touch(9721);
        this.use_pal = false;
        __touch(9722);
        this.use_rgb = false;
        __touch(9723);
        this.use_grey = false;
        __touch(9724);
    }
    __touch(9689);
    TgaLoader.TYPE_NO_DATA = 0;
    __touch(9690);
    TgaLoader.TYPE_INDEXED = 1;
    __touch(9691);
    TgaLoader.TYPE_RGB = 2;
    __touch(9692);
    TgaLoader.TYPE_GREY = 3;
    __touch(9693);
    TgaLoader.TYPE_RLE_INDEXED = 9;
    __touch(9694);
    TgaLoader.TYPE_RLE_RGB = 10;
    __touch(9695);
    TgaLoader.TYPE_RLE_GREY = 11;
    __touch(9696);
    TgaLoader.ORIGIN_MASK = 48;
    __touch(9697);
    TgaLoader.ORIGIN_SHIFT = 4;
    __touch(9698);
    TgaLoader.ORIGIN_BL = 0;
    __touch(9699);
    TgaLoader.ORIGIN_BR = 1;
    __touch(9700);
    TgaLoader.ORIGIN_UL = 2;
    __touch(9701);
    TgaLoader.ORIGIN_UR = 3;
    __touch(9702);
    TgaLoader.prototype.load = function (buffer, tex) {
        this.loadData(new Uint8Array(buffer));
        __touch(9725);
        var imageData = this.getCanvas();
        __touch(9726);
        tex.setImage(imageData, imageData.width, imageData.height);
        __touch(9727);
        imageData.dataReady = true;
        __touch(9728);
        tex.needsUpdate = true;
        __touch(9729);
    };
    __touch(9703);
    TgaLoader.prototype.loadData = function (data) {
        if (data.length < 19) {
            throw new Error('Targa::load() - Not enough data to contain header.');
            __touch(9736);
        }
        this.offset = 0;
        __touch(9730);
        this.header = {
            id_length: data[this.offset++],
            colormap_type: data[this.offset++],
            image_type: data[this.offset++],
            colormap_index: data[this.offset++] | data[this.offset++] << 8,
            colormap_length: data[this.offset++] | data[this.offset++] << 8,
            colormap_size: data[this.offset++],
            origin: [
                data[this.offset++] | data[this.offset++] << 8,
                data[this.offset++] | data[this.offset++] << 8
            ],
            width: data[this.offset++] | data[this.offset++] << 8,
            height: data[this.offset++] | data[this.offset++] << 8,
            pixel_size: data[this.offset++],
            flags: data[this.offset++]
        };
        __touch(9731);
        this.checkHeader();
        __touch(9732);
        if (this.header.id_length + this.offset > data.length) {
            throw new Error('Targa::load() - No data ?');
            __touch(9737);
        }
        this.offset += this.header.id_length;
        __touch(9733);
        switch (this.header.image_type) {
        case TgaLoader.TYPE_RLE_INDEXED:
            this.use_rle = true;
            break;
        case TgaLoader.TYPE_INDEXED:
            this.use_pal = true;
            break;
        case TgaLoader.TYPE_RLE_RGB:
            this.use_rle = true;
            break;
        case TgaLoader.TYPE_RGB:
            this.use_rgb = true;
            break;
        case TgaLoader.TYPE_RLE_GREY:
            this.use_rle = true;
            break;
        case TgaLoader.TYPE_GREY:
            this.use_grey = true;
            break;
        }
        __touch(9734);
        this.parse(data);
        __touch(9735);
    };
    __touch(9704);
    TgaLoader.prototype.checkHeader = function () {
        switch (this.header.image_type) {
        case TgaLoader.TYPE_INDEXED:
        case TgaLoader.TYPE_RLE_INDEXED:
            if (this.header.colormap_length > 256 || this.header.colormap_size !== 24 || this.header.colormap_type !== 1) {
                throw new Error('Targa::checkHeader() - Invalid type colormap data for indexed type');
                __touch(9739);
            }
            break;
        case TgaLoader.TYPE_RGB:
        case TgaLoader.TYPE_GREY:
        case TgaLoader.TYPE_RLE_RGB:
        case TgaLoader.TYPE_RLE_GREY:
            if (this.header.colormap_type) {
                throw new Error('Targa::checkHeader() - Invalid type colormap data for colormap type');
                __touch(9740);
            }
            break;
        case TgaLoader.TYPE_NO_DATA:
            throw new Error('Targa::checkHeader() - No data on this TGA file');
        default:
            throw new Error('Targa::checkHeader() - Invalid type \'' + this.header.image_type + '\'');
        }
        __touch(9738);
        if (this.header.width <= 0 || this.header.height <= 0) {
            throw new Error('Targa::checkHeader() - Invalid image size');
            __touch(9741);
        }
        if (this.header.pixel_size !== 8 && this.header.pixel_size !== 16 && this.header.pixel_size !== 24 && this.header.pixel_size !== 32) {
            throw new Error('Targa::checkHeader() - Invalid pixel size \'' + this.header.pixel_size + '\'');
            __touch(9742);
        }
    };
    __touch(9705);
    TgaLoader.prototype.parse = function (data) {
        var _header, numAlphaBits, pixel_data, pixel_size, pixel_total;
        __touch(9743);
        _header = this.header;
        __touch(9744);
        numAlphaBits = _header.flags & 15;
        __touch(9745);
        pixel_size = _header.pixel_size >> 3;
        __touch(9746);
        pixel_total = _header.width * _header.height * pixel_size;
        __touch(9747);
        if (this.use_pal) {
            this.palettes = data.subarray(this.offset, this.offset += _header.colormap_length * pixel_size);
            __touch(9749);
        }
        if (this.use_rle) {
            pixel_data = new Uint8Array(pixel_total);
            __touch(9750);
            var c, count, i;
            __touch(9751);
            var offset = 0;
            __touch(9752);
            var pixels = new Uint8Array(pixel_size);
            __touch(9753);
            while (offset < pixel_total) {
                c = data[this.offset++];
                __touch(9755);
                count = (c & 127) + 1;
                __touch(9756);
                if (c & 128) {
                    for (i = 0; i < pixel_size; ++i) {
                        pixels[i] = data[this.offset++];
                        __touch(9758);
                    }
                    for (i = 0; i < count; ++i) {
                        pixel_data.set(pixels, offset + i * pixel_size);
                        __touch(9759);
                    }
                    offset += pixel_size * count;
                    __touch(9757);
                } else {
                    count *= pixel_size;
                    __touch(9760);
                    for (i = 0; i < count; ++i) {
                        pixel_data[offset + i] = data[this.offset++];
                        __touch(9762);
                    }
                    offset += count;
                    __touch(9761);
                }
            }
            __touch(9754);
        } else {
            pixel_data = data.subarray(this.offset, this.offset += this.use_pal ? _header.width * _header.height : pixel_total);
            __touch(9763);
        }
        this.image = pixel_data;
        __touch(9748);
    };
    __touch(9706);
    TgaLoader.prototype.getImageData = function (imageData) {
        var width = this.header.width, height = this.header.height, x_start, y_start, x_step, y_step, y_end, x_end, func, data;
        __touch(9764);
        data = imageData || {
            width: width,
            height: height,
            data: new Uint8Array(width * height * 4)
        };
        __touch(9765);
        switch ((this.header.flags & TgaLoader.ORIGIN_MASK) >> TgaLoader.ORIGIN_SHIFT) {
        default:
        case TgaLoader.ORIGIN_UL:
            x_start = 0;
            x_step = 1;
            x_end = width;
            y_start = 0;
            y_step = 1;
            y_end = height;
            break;
        case TgaLoader.ORIGIN_BL:
            x_start = 0;
            x_step = 1;
            x_end = width;
            y_start = height - 1;
            y_step = -1;
            y_end = -1;
            break;
        case TgaLoader.ORIGIN_UR:
            x_start = width - 1;
            x_step = -1;
            x_end = -1;
            y_start = 0;
            y_step = 1;
            y_end = height;
            break;
        case TgaLoader.ORIGIN_BR:
            x_start = width - 1;
            x_step = -1;
            x_end = -1;
            y_start = height - 1;
            y_step = -1;
            y_end = -1;
            break;
        }
        __touch(9766);
        func = 'getImageData' + (this.use_grey ? 'Grey' : '') + this.header.pixel_size + 'bits';
        __touch(9767);
        this[func](data.data, y_start, y_step, y_end, x_start, x_step, x_end);
        __touch(9768);
        return data;
        __touch(9769);
    };
    __touch(9707);
    TgaLoader.prototype.getCanvas = function () {
        var canvas = document.createElement('canvas');
        __touch(9770);
        var ctx = canvas.getContext('2d');
        __touch(9771);
        var imageData = ctx.createImageData(this.header.width, this.header.height);
        __touch(9772);
        canvas.width = this.header.width;
        __touch(9773);
        canvas.height = this.header.height;
        __touch(9774);
        ctx.putImageData(this.getImageData(imageData), 0, 0);
        __touch(9775);
        return canvas;
        __touch(9776);
    };
    __touch(9708);
    TgaLoader.prototype.getDataURL = function (type) {
        return this.getCanvas().toDataURL(type || 'image/png');
        __touch(9777);
    };
    __touch(9709);
    TgaLoader.prototype.getImageData8bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
        var image = this.image, colormap = this.palettes;
        __touch(9778);
        var width = this.header.width;
        __touch(9779);
        var color, i = 0, x, y;
        __touch(9780);
        for (y = y_start; y !== y_end; y += y_step) {
            for (x = x_start; x !== x_end; x += x_step, i++) {
                color = image[i];
                __touch(9782);
                imageData[(x + width * y) * 4 + 3] = 255;
                __touch(9783);
                imageData[(x + width * y) * 4 + 2] = colormap[color * 3 + 0];
                __touch(9784);
                imageData[(x + width * y) * 4 + 1] = colormap[color * 3 + 1];
                __touch(9785);
                imageData[(x + width * y) * 4 + 0] = colormap[color * 3 + 2];
                __touch(9786);
            }
        }
        return imageData;
        __touch(9781);
    };
    __touch(9710);
    TgaLoader.prototype.getImageData16bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
        var image = this.image;
        __touch(9787);
        var width = this.header.width;
        __touch(9788);
        var color, i = 0, x, y;
        __touch(9789);
        for (y = y_start; y !== y_end; y += y_step) {
            for (x = x_start; x !== x_end; x += x_step, i += 2) {
                color = image[i + 0] + (image[i + 1] << 8);
                __touch(9791);
                imageData[(x + width * y) * 4 + 0] = (color & 31744) >> 7;
                __touch(9792);
                imageData[(x + width * y) * 4 + 1] = (color & 992) >> 2;
                __touch(9793);
                imageData[(x + width * y) * 4 + 2] = (color & 31) >> 3;
                __touch(9794);
                imageData[(x + width * y) * 4 + 3] = color & 32768 ? 0 : 255;
                __touch(9795);
            }
        }
        return imageData;
        __touch(9790);
    };
    __touch(9711);
    TgaLoader.prototype.getImageData24bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
        var image = this.image;
        __touch(9796);
        var width = this.header.width;
        __touch(9797);
        var i = 0, x, y;
        __touch(9798);
        for (y = y_start; y !== y_end; y += y_step) {
            for (x = x_start; x !== x_end; x += x_step, i += 3) {
                imageData[(x + width * y) * 4 + 3] = 255;
                __touch(9800);
                imageData[(x + width * y) * 4 + 2] = image[i + 0];
                __touch(9801);
                imageData[(x + width * y) * 4 + 1] = image[i + 1];
                __touch(9802);
                imageData[(x + width * y) * 4 + 0] = image[i + 2];
                __touch(9803);
            }
        }
        return imageData;
        __touch(9799);
    };
    __touch(9712);
    TgaLoader.prototype.getImageData32bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
        var image = this.image;
        __touch(9804);
        var width = this.header.width;
        __touch(9805);
        var i = 0, x, y;
        __touch(9806);
        for (y = y_start; y !== y_end; y += y_step) {
            for (x = x_start; x !== x_end; x += x_step, i += 4) {
                imageData[(x + width * y) * 4 + 2] = image[i + 0];
                __touch(9808);
                imageData[(x + width * y) * 4 + 1] = image[i + 1];
                __touch(9809);
                imageData[(x + width * y) * 4 + 0] = image[i + 2];
                __touch(9810);
                imageData[(x + width * y) * 4 + 3] = image[i + 3];
                __touch(9811);
            }
        }
        return imageData;
        __touch(9807);
    };
    __touch(9713);
    TgaLoader.prototype.getImageDataGrey8bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
        var image = this.image;
        __touch(9812);
        var width = this.header.width;
        __touch(9813);
        var color, i = 0, x, y;
        __touch(9814);
        for (y = y_start; y !== y_end; y += y_step) {
            for (x = x_start; x !== x_end; x += x_step, i++) {
                color = image[i];
                __touch(9816);
                imageData[(x + width * y) * 4 + 0] = color;
                __touch(9817);
                imageData[(x + width * y) * 4 + 1] = color;
                __touch(9818);
                imageData[(x + width * y) * 4 + 2] = color;
                __touch(9819);
                imageData[(x + width * y) * 4 + 3] = 255;
                __touch(9820);
            }
        }
        return imageData;
        __touch(9815);
    };
    __touch(9714);
    TgaLoader.prototype.getImageDataGrey16bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
        var image = this.image;
        __touch(9821);
        var width = this.header.width;
        __touch(9822);
        var i = 0, x, y;
        __touch(9823);
        for (y = y_start; y !== y_end; y += y_step) {
            for (x = x_start; x !== x_end; x += x_step, i += 2) {
                imageData[(x + width * y) * 4 + 0] = image[i + 0];
                __touch(9825);
                imageData[(x + width * y) * 4 + 1] = image[i + 0];
                __touch(9826);
                imageData[(x + width * y) * 4 + 2] = image[i + 0];
                __touch(9827);
                imageData[(x + width * y) * 4 + 3] = image[i + 1];
                __touch(9828);
            }
        }
        return imageData;
        __touch(9824);
    };
    __touch(9715);
    TgaLoader.prototype.isSupported = function () {
        return true;
        __touch(9829);
    };
    __touch(9716);
    TgaLoader.prototype.toString = function () {
        return 'TgaLoader';
        __touch(9830);
    };
    __touch(9717);
    return TgaLoader;
    __touch(9718);
});
__touch(9687);