/**
 * @private
 */
function TgaLoader() {
	this.header = null;
	this.offset = 0;
	this.use_rle = false;
	this.use_pal = false;
	this.use_rgb = false;
	this.use_grey = false;
}

// TGA Constants
TgaLoader.TYPE_NO_DATA = 0;
TgaLoader.TYPE_INDEXED = 1;
TgaLoader.TYPE_RGB = 2;
TgaLoader.TYPE_GREY = 3;
TgaLoader.TYPE_RLE_INDEXED = 9;
TgaLoader.TYPE_RLE_RGB = 10;
TgaLoader.TYPE_RLE_GREY = 11;

TgaLoader.ORIGIN_MASK = 0x30;
TgaLoader.ORIGIN_SHIFT = 0x04;
TgaLoader.ORIGIN_BL = 0x00;
TgaLoader.ORIGIN_BR = 0x01;
TgaLoader.ORIGIN_UL = 0x02;
TgaLoader.ORIGIN_UR = 0x03;


/**
 * Load and parse a TGA file
 */
TgaLoader.prototype.load = function (buffer, tex/*, flipped, arrayByteOffset, arrayByteLength*/) {
	this.loadData(new Uint8Array(buffer));
	var imageData = this.getCanvas();
	tex.setImage(imageData, imageData.width, imageData.height);
	//imageData.isData = true;
	imageData.dataReady = true;
	tex.needsUpdate = true;
};

/**
 * Parse TGA data
 *
 * @param {Uint8Array} data - Binary data of the TGA file
 */
TgaLoader.prototype.loadData = function (data) {
	// Not enough data to contain header ?
	if (data.length < 19) {
		throw new Error('Targa::load() - Not enough data to contain header.');
	}

	// Read Header
	this.offset = 0;
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

	// Assume it's a valid Targa file.
	this.checkHeader();
	if (this.header.id_length + this.offset > data.length) {
		throw new Error('Targa::load() - No data ?');
	}

	// Skip not needed data
	this.offset += this.header.id_length;

	// Get some informations.
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

	this.parse(data);
};

/**
 * Check the header of TGA file to detect errors
 *
 * @throws Error
 */
TgaLoader.prototype.checkHeader = function () {
	switch (this.header.image_type) {
		// Check indexed type
		case TgaLoader.TYPE_INDEXED:
		case TgaLoader.TYPE_RLE_INDEXED:
			if (this.header.colormap_length > 256 || this.header.colormap_size !== 24 || this.header.colormap_type !== 1) {
				throw new Error("Targa::checkHeader() - Invalid type colormap data for indexed type");
			}
			break;

			// Check colormap type
		case TgaLoader.TYPE_RGB:
		case TgaLoader.TYPE_GREY:
		case TgaLoader.TYPE_RLE_RGB:
		case TgaLoader.TYPE_RLE_GREY:
			if (this.header.colormap_type) {
				throw new Error("Targa::checkHeader() - Invalid type colormap data for colormap type");
			}
			break;

			// What the need of a file without data ?
		case TgaLoader.TYPE_NO_DATA:
			throw new Error("Targa::checkHeader() - No data on this TGA file");

			// Invalid type ?
		default:
			throw new Error("Targa::checkHeader() - Invalid type '" + this.header.image_type + "'");
	}

	// Check image size
	if (this.header.width <= 0 || this.header.height <= 0) {
		throw new Error('Targa::checkHeader() - Invalid image size');
	}

	// Check pixel size
	if (this.header.pixel_size !== 8 && this.header.pixel_size !== 16 && this.header.pixel_size !== 24 && this.header.pixel_size !== 32) {
		throw new Error("Targa::checkHeader() - Invalid pixel size '" + this.header.pixel_size + "'");
	}
};

/**
 * Parse data from TGA file
 *
 * @param {Uint8Array} data - Binary data of the TGA file
 */
TgaLoader.prototype.parse = function (data) {
	var _header,
		pixel_data,
		pixel_size,
		pixel_total;

	_header = this.header;
	// numAlphaBits = _header.flags & 0xf;
	pixel_size = _header.pixel_size >> 3;
	pixel_total = _header.width * _header.height * pixel_size;

	// Read palettes
	if (this.use_pal) {
		this.palettes = data.subarray(
			this.offset,
			this.offset += _header.colormap_length * pixel_size);
	}

	// Read LRE
	if (this.use_rle) {
		pixel_data = new Uint8Array(pixel_total);

		var c, count, i;
		var offset = 0;
		var pixels = new Uint8Array(pixel_size);

		while (offset < pixel_total) {
			c = data[this.offset++];
			count = (c & 0x7f) + 1;

			// RLE pixels.
			if (c & 0x80) {
				// Bind pixel tmp array
				for (i = 0; i < pixel_size; ++i) {
					pixels[i] = data[this.offset++];
				}

				// Copy pixel array
				for (i = 0; i < count; ++i) {
					pixel_data.set(pixels, offset + i * pixel_size);
				}

				offset += pixel_size * count;
			}

			// Raw pixels.
			else {
				count *= pixel_size;
				for (i = 0; i < count; ++i) {
					pixel_data[offset + i] = data[this.offset++];
				}
				offset += count;
			}
		}
	}

	// RAW Pixels
	else {
		pixel_data = data.subarray(
			this.offset,
			this.offset += (
			this.use_pal ? _header.width * _header.height : pixel_total));
	}

	this.image = pixel_data;
};

/**
 * Return a ImageData object from a TGA file
 *
 * @param {imageData} imageData - Optional ImageData to work with
 * @returns {imageData}
 */
TgaLoader.prototype.getImageData = function (imageData) {
	var width = this.header.width,
		height = this.header.height,
		x_start,
		y_start,
		x_step,
		y_step,
		y_end,
		x_end,
		func,
		data;

	data =
	// sent as argument
	imageData ||

	{
		width: width,
		height: height,
		data: new Uint8Array(width * height * 4)
	};

	// Check how we should write the pixels
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

	// TODO: use this.header.origin[0-1] ?
	// x_start += this.header.origin[0];
	// y_start += this.header.origin[1];

	// Load the specify method
	func = 'getImageData' + (this.use_grey ? 'Grey' : '') + (this.header.pixel_size) + 'bits';
	this[func](data.data, y_start, y_step, y_end, x_start, x_step, x_end);
	return data;
};

/**
 * Return a canvas with the TGA render on it
 *
 * @returns {canvas}
 */
TgaLoader.prototype.getCanvas = function () {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var imageData = ctx.createImageData(this.header.width, this.header.height);
	canvas.width = this.header.width;
	canvas.height = this.header.height;
	ctx.putImageData(this.getImageData(imageData), 0, 0);
	return canvas;
};

/**
 * Return a dataURI of the TGA file
 *
 * @param {string} type - Optional image content-type to output (default: image/png)
 * @returns {canvas}
 */
TgaLoader.prototype.getDataURL = function (type) {
	return this.getCanvas().toDataURL(type || "image/png");
};

/**
 * Return a ImageData object from a TGA file (8bits)
 *
 * @param {imageData} imageData - ImageData to bind
 * @param {int} y_start - start at y pixel.
 * @param {int} x_start - start at x pixel.
 * @param {int} y_step  - increment y pixel each time.
 * @param {int} y_end   - stop at pixel y.
 * @param {int} x_step  - increment x pixel each time.
 * @param {int} x_end   - stop at pixel x.
 * @returns {imageData}
 */
TgaLoader.prototype.getImageData8bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
	var image = this.image,
		colormap = this.palettes;
	var width = this.header.width;
	var color, i = 0,
		x, y;

	for (y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i++) {
			color = image[i];
			imageData[(x + width * y) * 4 + 3] = 255;
			imageData[(x + width * y) * 4 + 2] = colormap[(color * 3) + 0];
			imageData[(x + width * y) * 4 + 1] = colormap[(color * 3) + 1];
			imageData[(x + width * y) * 4 + 0] = colormap[(color * 3) + 2];
		}
	}

	return imageData;
};

/**
 * Return a ImageData object from a TGA file (16bits)
 *
 * @param {imageData} imageData - ImageData to bind
 * @param {int} y_start - start at y pixel.
 * @param {int} x_start - start at x pixel.
 * @param {int} y_step  - increment y pixel each time.
 * @param {int} y_end   - stop at pixel y.
 * @param {int} x_step  - increment x pixel each time.
 * @param {int} x_end   - stop at pixel x.
 * @returns {imageData}
 */
TgaLoader.prototype.getImageData16bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
	var image = this.image;
	var width = this.header.width;
	var color, i = 0,
		x, y;

	for (y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i += 2) {
			color = image[i + 0] + (image[i + 1] << 8); // Inversed ?
			imageData[(x + width * y) * 4 + 0] = (color & 0x7C00) >> 7;
			imageData[(x + width * y) * 4 + 1] = (color & 0x03E0) >> 2;
			imageData[(x + width * y) * 4 + 2] = (color & 0x001F) >> 3;
			imageData[(x + width * y) * 4 + 3] = (color & 0x8000) ? 0 : 255;
		}
	}

	return imageData;
};

/**
 * Return a ImageData object from a TGA file (24bits)
 *
 * @param {imageData} imageData - ImageData to bind
 * @param {int} y_start - start at y pixel.
 * @param {int} x_start - start at x pixel.
 * @param {int} y_step  - increment y pixel each time.
 * @param {int} y_end   - stop at pixel y.
 * @param {int} x_step  - increment x pixel each time.
 * @param {int} x_end   - stop at pixel x.
 * @returns {imageData}
 */
TgaLoader.prototype.getImageData24bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
	var image = this.image;
	var width = this.header.width;
	var i = 0,
		x, y;

	for (y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i += 3) {
			imageData[(x + width * y) * 4 + 3] = 255;
			imageData[(x + width * y) * 4 + 2] = image[i + 0];
			imageData[(x + width * y) * 4 + 1] = image[i + 1];
			imageData[(x + width * y) * 4 + 0] = image[i + 2];
		}
	}

	return imageData;
};

/**
 * Return a ImageData object from a TGA file (32bits)
 *
 * @param {imageData} imageData - ImageData to bind
 * @param {int} y_start - start at y pixel.
 * @param {int} x_start - start at x pixel.
 * @param {int} y_step  - increment y pixel each time.
 * @param {int} y_end   - stop at pixel y.
 * @param {int} x_step  - increment x pixel each time.
 * @param {int} x_end   - stop at pixel x.
 * @returns {imageData}
 */
TgaLoader.prototype.getImageData32bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
	var image = this.image;
	var width = this.header.width;
	var i = 0,
		x, y;

	for (y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i += 4) {
			imageData[(x + width * y) * 4 + 2] = image[i + 0];
			imageData[(x + width * y) * 4 + 1] = image[i + 1];
			imageData[(x + width * y) * 4 + 0] = image[i + 2];
			imageData[(x + width * y) * 4 + 3] = image[i + 3];
		}
	}

	return imageData;
};

/**
 * Return a ImageData object from a TGA file (8bits grey)
 *
 * @param {imageData} imageData - ImageData to bind
 * @param {int} y_start - start at y pixel.
 * @param {int} x_start - start at x pixel.
 * @param {int} y_step  - increment y pixel each time.
 * @param {int} y_end   - stop at pixel y.
 * @param {int} x_step  - increment x pixel each time.
 * @param {int} x_end   - stop at pixel x.
 * @returns {imageData}
 */
TgaLoader.prototype.getImageDataGrey8bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
	var image = this.image;
	var width = this.header.width;
	var color, i = 0,
		x, y;

	for (y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i++) {
			color = image[i];
			imageData[(x + width * y) * 4 + 0] = color;
			imageData[(x + width * y) * 4 + 1] = color;
			imageData[(x + width * y) * 4 + 2] = color;
			imageData[(x + width * y) * 4 + 3] = 255;
		}
	}

	return imageData;
};

/**
 * Return a ImageData object from a TGA file (16bits grey)
 *
 * @param {imageData} imageData - ImageData to bind
 * @param {int} y_start - start at y pixel.
 * @param {int} x_start - start at x pixel.
 * @param {int} y_step  - increment y pixel each time.
 * @param {int} y_end   - stop at pixel y.
 * @param {int} x_step  - increment x pixel each time.
 * @param {int} x_end   - stop at pixel x.
 * @returns {imageData}
 */
TgaLoader.prototype.getImageDataGrey16bits = function (imageData, y_start, y_step, y_end, x_start, x_step, x_end) {
	var image = this.image;
	var width = this.header.width;
	var i = 0,
		x, y;

	for (y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i += 2) {
			imageData[(x + width * y) * 4 + 0] = image[i + 0];
			imageData[(x + width * y) * 4 + 1] = image[i + 0];
			imageData[(x + width * y) * 4 + 2] = image[i + 0];
			imageData[(x + width * y) * 4 + 3] = image[i + 1];
		}
	}

	return imageData;
};

TgaLoader.prototype.isSupported = function () {
	return true;
};

TgaLoader.prototype.toString = function () {
	return "TgaLoader";
};

module.exports = TgaLoader;